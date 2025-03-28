import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer, SyllableVisualizerPluginKey } from './SyllableVisualizer';
import { hyphenateSync } from 'hyphen/de';
import debounce from 'lodash.debounce';
import './App.css';

const DEBUG_APP = false; // Keep false for production

function App() {
  const [lineCounts, setLineCounts] = useState([]);
  const [gutterPositions, setGutterPositions] = useState({});
  const [activeLinePos, setActiveLinePos] = useState(null); // State for active paragraph position
  const editorWrapperRef = useRef(null);
  const processingCounter = useRef(0);
  const editorRef = useRef(null);

  const processText = useCallback(() => {
    const editorInstance = editorRef.current;
    if (!editorInstance || !editorInstance.state || !editorInstance.isEditable) {
      if (DEBUG_APP) console.log("[ProcessText] Skipping: Editor not ready or not editable.");
      return;
    }
    processingCounter.current += 1;
    const currentRun = processingCounter.current;
    if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Starting processing...`);
    const { state } = editorInstance;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    let pointErrors = 0;

    doc.descendants((node, pos) => {
      if (node.type.name === 'paragraph') {
        let paragraphSyllableCount = 0;
        let paragraphText = node.textContent;
        const paragraphNodePos = pos;
        const words = paragraphText.trim().split(/\s+/);
        words.forEach(word => {
          if (!word) return;
          const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
          const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;
          if (!cleanWord) return;
          try {
            const hyphenated = hyphenateSync(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
            const count = (hyphenated.match(/\u00AD/g) || []).length + 1;
            paragraphSyllableCount += count;
          } catch (_e) { // eslint-disable-line no-unused-vars
            console.warn(`[ProcessText Run #${currentRun}] Hyphenation/count error on word "${cleanWord}" in paragraph at pos ${paragraphNodePos}:`, _e);
            paragraphSyllableCount += 1;
          }
        });
        newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount });
      }
      if (node.isText && node.text) {
        const nodeStartPos = pos + 1;
        let currentWordStartIndex = 0;
        node.text.split(/(\s+)/).forEach((segment) => {
          if (!segment || /^\s+$/.test(segment)) {
            currentWordStartIndex += segment.length;
            return;
          }
          const word = segment;
          const wordStartPosInNode = currentWordStartIndex;
          try {
            const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
            const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;
            if (cleanWord && cleanWord.length >= 3) {
              const hyphenated = hyphenateSync(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
              let localOffset = 0;
              for (let i = 0; i < hyphenated.length; i++) {
                if (hyphenated[i] === '\u00AD') {
                  const absolutePos = nodeStartPos + wordStartPosInNode + localOffset;
                  if (absolutePos <= 0 || absolutePos > doc.content.size) {
                    pointErrors++;
                  } else {
                    newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                  }
                } else {
                  localOffset++;
                }
              }
            }
          } catch (_e) { // eslint-disable-line no-unused-vars
            pointErrors++;
          }
          currentWordStartIndex += segment.length;
        });
      }
    });

    if (DEBUG_APP) {
      console.log(`[ProcessText Run #${currentRun}] Finished processing. Found ${newLineCounts.length} paragraphs, ${newDecorationPoints.length} decoration points. Calculation errors: ${pointErrors}.`);
    }
    setLineCounts(newLineCounts);
    if (editorInstance && !editorInstance.isDestroyed) {
      if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Dispatching transaction with ${newDecorationPoints.length} points.`);
      const tr = editorInstance.state.tr;
      tr.setMeta(SyllableVisualizerPluginKey, newDecorationPoints);
      if (editorInstance.view && !editorInstance.view.isDestroyed) {
        editorInstance.view.dispatch(tr);
      }
    } else {
      if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Editor not available for dispatching transaction.`);
    }
  }, []);

  const debouncedProcessText = useRef(debounce(processText, 500)).current;

  // --- Callback for Selection Update ---
  const handleSelectionUpdate = useCallback(({ editor: updatedEditor }) => {
    const { state } = updatedEditor;
    const { selection } = state;
    // Find the node at the cursor position (head of selection)
    const resolvedPos = state.doc.resolve(selection.head);
    // Go up the node tree until we find a paragraph (or the doc root)
    let currentDepth = resolvedPos.depth;
    let activePos = null;
    while(currentDepth >= 0) {
        const node = resolvedPos.node(currentDepth);
        if (node.type.name === 'paragraph') {
            // Get the position *inside* the paragraph (+1 after start tag)
            activePos = resolvedPos.start(currentDepth) + 1;
            break;
        }
        // If we reached the doc node without finding a paragraph, stop
        if (node.type.name === 'doc') break;
        currentDepth--;
    }
    // if (DEBUG_APP) console.log("[Selection Update] Active Paragraph Pos:", activePos);
    setActiveLinePos(activePos); // Update state for highlighting the gutter count
  }, []);

  const debouncedSelectionUpdate = useRef(debounce(handleSelectionUpdate, 150)).current; // Faster debounce for selection

  // --- Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: true, gapcursor: true }),
      SyllableVisualizer.configure(),
    ],
    content: '<p>Willkommen bei Cadence!</p><p>Tippe deinen Songtext ein. Silben werden visuell getrennt und die Anzahl pro Zeile (Absatz) für den perfekten Flow angezeigt.</p><p>Experimentiere mit verschiedenen Zeilenlängen.</p>',
    onCreate: ({ editor: createdEditor }) => {
       editorRef.current = createdEditor;
       if (DEBUG_APP) console.log("[Editor onCreate] Editor instance stored. Scheduling initial processText.");
       setTimeout(processText, 100);
       // Initial selection check
       handleSelectionUpdate({ editor: createdEditor });
     },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      if (DEBUG_APP) console.log("[Editor onUpdate] Triggering debouncedProcessText.");
      debouncedProcessText();
    },
    // --- Add Selection Update Handler ---
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor; // Ensure ref is current
      debouncedSelectionUpdate({ editor: updatedEditor });
    },
     onDestroy: () => {
       if (DEBUG_APP) console.log("[Editor onDestroy] Cancelling debounced calls.");
       debouncedProcessText.cancel();
       debouncedSelectionUpdate.cancel(); // Cancel selection debounce too
       editorRef.current = null;
     }
  });

 // --- Gutter Alignment Logic ---
 useEffect(() => {
     const calculateGutterPositions = () => {
         const editorInstance = editorRef.current;
         const wrapperElement = editorWrapperRef.current;
         if (!editorInstance?.view?.dom || !wrapperElement) {
             if (DEBUG_APP) console.log("[Gutter Calc] Skipping: Editor/View/Wrapper not ready.");
             return;
         }
         if (DEBUG_APP) console.log("[Gutter Calc] Recalculating positions using DOM query...");
         const newPositions = {};
         const editorWrapperRect = wrapperElement.getBoundingClientRect();
         const editorView = editorInstance.view;
         const paragraphDOMElements = wrapperElement.querySelectorAll('.ProseMirror > p');

         if (DEBUG_APP) console.log(`[Gutter Calc] Found ${paragraphDOMElements.length} <p> elements in DOM.`);

         paragraphDOMElements.forEach((pElement) => {
            let pos = -1;
            try {
                 pos = editorView.posAtDOM(pElement, 0);
            } catch (err) {
                 console.error(`[Gutter Calc] Error getting posAtDOM for element:`, pElement, err);
                 return;
            }
            if (pos !== -1) {
                 const lineData = lineCounts.find(lc => lc.nodePos === pos);
                 if (lineData) {
                     const nodeRect = pElement.getBoundingClientRect();
                     // Calculate top relative to the wrapper, adding scroll offset if the wrapper scrolls
                     const scrollTop = wrapperElement.scrollTop;
                     const relativeTop = (nodeRect.top - editorWrapperRect.top) + scrollTop;
                     newPositions[lineData.nodePos] = relativeTop;
                 } else {
                      if (DEBUG_APP) console.log(`  - Gutter pos: No lineCount data found for node at DOM-derived pos ${pos}.`);
                 }
            }
         });
         setGutterPositions(newPositions);
         if (DEBUG_APP) console.log("[Gutter Calc] Positions updated based on DOM query:", Object.keys(newPositions).length > 0 ? newPositions : '{}');
     };

     const debouncedCalculatePositions = debounce(calculateGutterPositions, 100);
     calculateGutterPositions();
     // Listen also on scroll *within* the editor wrapper if it's the scrolling element
     const scrollableElement = editorWrapperRef.current;
     if (scrollableElement) {
         scrollableElement.addEventListener('scroll', debouncedCalculatePositions);
     }
     window.addEventListener('resize', debouncedCalculatePositions);

     return () => {
        if (DEBUG_APP) console.log("[Gutter Calc] Cleaning up listeners.");
        debouncedCalculatePositions.cancel();
        if (scrollableElement) {
            scrollableElement.removeEventListener('scroll', debouncedCalculatePositions);
        }
        window.removeEventListener('resize', debouncedCalculatePositions);
     };
     // Rerun when lineCounts change or editor ref becomes available
 }, [lineCounts, editorRef.current]); // Depend on editorRef.current to ensure editor is ready


  return (
    <div className="app-container">
       <div className="app-header">
         <img src="/cadence.svg" alt="Cadence Logo" className="app-logo" />
         <h1>Cadence</h1>
       </div>

       <p className="hinweis">
         Dein Assistent für Songtexte. Silben und Zeilenzahlen helfen dir, den perfekten Rhythmus zu finden.
       </p>
       {DEBUG_APP && <p style={{color: 'orange', textAlign: 'center'}}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}

       <div className="editor-layout-tiptap">
         <div className="gutter">
            {lineCounts.map(line => {
               // Determine if this line count corresponds to the active paragraph
               const isActive = line.nodePos === activeLinePos;
               const className = `gutter-count ${isActive ? 'active-count' : ''}`;

               return gutterPositions[line.nodePos] !== undefined && (
                 <div
                     key={`count-${line.nodePos}`}
                     className={className} // Apply conditional class
                     style={{ top: `${gutterPositions[line.nodePos]}px` }}
                 >
                     [{line.count}]
                 </div>
               );
             })}
         </div>
         {/* IMPORTANT: The ref goes on the scrollable container */}
         <div className="editor-content-wrapper" ref={editorWrapperRef}>
             <EditorContent editor={editor} />
         </div>
       </div>
    </div>
  );
}

export default App;