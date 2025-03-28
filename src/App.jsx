import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer, SyllableVisualizerPluginKey } from './SyllableVisualizer';
import { hyphenateSync } from 'hyphen/de';
import debounce from 'lodash.debounce';
// Removed App.css import

const DEBUG_APP = false; // Keep false for production

function App() {
  const [lineCounts, setLineCounts] = useState([]); // State for counts [{ nodePos: number, count: number }]
  const [gutterData, setGutterData] = useState([]); // State for counts with positions [{ nodePos: number, count: number, top: number }]
  const [activeLinePos, setActiveLinePos] = useState(null); // State for active line start position
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
    const wordCache = new Map(); // Cache for hyphenation results { cleanWord: { positions: [], count: X } }

    // --- Pass 1: Hyphenate unique words, build cache, and calculate decoration points ---
    doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const nodeStartPos = pos + 1; // Position after the node's opening tag
        let currentWordStartIndex = 0;

        // Split by whitespace but keep delimiters to maintain original spacing offsets
        node.text.split(/(\s+)/).forEach((segment) => {
          if (!segment || /^\s+$/.test(segment)) {
            // It's whitespace, just advance the index
            currentWordStartIndex += segment.length;
            return;
          }

          const word = segment;
          const wordStartPosInNode = currentWordStartIndex; // Start index of the word within this text node

          // Basic punctuation cleaning (adjust regex as needed)
          const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
          const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

          if (cleanWord && cleanWord.length >= 3) { // Only process words of sufficient length
            let hyphenationResult = wordCache.get(cleanWord);

            if (!hyphenationResult) {
              // Word not in cache, hyphenate it
              try {
                const hyphenated = hyphenateSync(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
                const hyphenPositions = [];
                let charIndex = 0;
                for (let i = 0; i < hyphenated.length; i++) {
                  if (hyphenated[i] === '\u00AD') {
                    hyphenPositions.push(charIndex); // Store position relative to start of clean word
                  } else {
                    charIndex++;
                  }
                }
                const syllableCount = hyphenPositions.length + 1;
                hyphenationResult = { positions: hyphenPositions, count: syllableCount };
                wordCache.set(cleanWord, hyphenationResult);
                if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Cached '${cleanWord}': ${syllableCount} syllables, positions: ${hyphenPositions.join(',')}`);
              } catch (e) {
                console.warn(`[ProcessText Run #${currentRun}] Hyphenation error on word "${cleanWord}":`, e);
                hyphenationResult = { positions: [], count: 1 }; // Treat as 1 syllable on error
                wordCache.set(cleanWord, hyphenationResult); // Cache error result too
                pointErrors++;
              }
            }

            // Add decoration points based on cached/calculated positions
            hyphenationResult.positions.forEach(relativePos => {
              const absolutePos = nodeStartPos + wordStartPosInNode + relativePos;
              if (absolutePos <= 0 || absolutePos > doc.content.size) {
                 if (DEBUG_APP) console.warn(`[ProcessText Run #${currentRun}] Invalid absolutePos calculated: ${absolutePos} for word '${cleanWord}' at nodePos ${nodeStartPos}, wordStart ${wordStartPosInNode}, relativePos ${relativePos}`);
                pointErrors++;
              } else {
                newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
              }
            });
          }
          // Advance index for the next segment
          currentWordStartIndex += segment.length;
        });
      }
    });
    if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Point errors: ${pointErrors}`);

    // --- Pass 2: Calculate paragraph syllable counts using the cache ---
    doc.descendants((node, pos) => {
      if (node.type.name === 'paragraph') {
        let paragraphSyllableCount = 0;
        const paragraphNodePos = pos; // Position of the paragraph node itself

        node.textContent.trim().split(/\s+/).forEach(word => {
          if (!word) return;
          const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
          const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

          if (cleanWord) {
            const cachedResult = wordCache.get(cleanWord);
            paragraphSyllableCount += cachedResult ? cachedResult.count : 1; // Add cached count or 1 if not found/too short
          }
        });
        newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount }); // Use pos+1 for content start
      }
    });
    if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);


    if (DEBUG_APP) {
      console.log(`[ProcessText Run #${currentRun}] Finished processing. Found ${newLineCounts.length} paragraphs, ${newDecorationPoints.length} decoration points. Calculation errors: ${pointErrors}.`);
    }

    // --- Update State and Plugin ---
    setLineCounts(newLineCounts); // Update React state for gutter rendering

    if (editorInstance && !editorInstance.isDestroyed) {
      if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Dispatching transaction with ${newDecorationPoints.length} points.`);
      const tr = editorInstance.state.tr;
      // ONLY send points to the plugin
      tr.setMeta(SyllableVisualizerPluginKey, { points: newDecorationPoints });
      if (editorInstance.view && !editorInstance.view.isDestroyed) {
        editorInstance.view.dispatch(tr);
      }
    } else {
      if (DEBUG_APP) console.log(`[ProcessText Run #${currentRun}] Editor not available for dispatching transaction.`);
    }
  }, []); // Keep useCallback dependencies empty for now

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
    // if (DEBUG_APP) console.log("[Selection Update] Active Paragraph Pos:", currentActivePos);

    // Update React state
    setActiveLinePos(currentActivePos);

    // NO LONGER sending activePos via meta to the plugin
    /*
    if (updatedEditor && !updatedEditor.isDestroyed) {
        const tr = updatedEditor.state.tr;
        tr.setMeta(SyllableVisualizerPluginKey, { activePos: currentActivePos });
        if (updatedEditor.view && !updatedEditor.view.isDestroyed) {
            updatedEditor.view.dispatch(tr);
        }
    }
    */
  }, []); // Keep dependency array empty

  // --- Gutter Alignment Logic ---
  useEffect(() => {
    const editorInstance = editorRef.current;
    const wrapper = editorWrapperRef.current;
    if (!editorInstance || !editorInstance.view || !wrapper || lineCounts.length === 0) {
      setGutterData([]); // Clear data if editor/counts not ready
      return;
    }

    const view = editorInstance.view;
    const newGutterData = [];
    const wrapperRect = wrapper.getBoundingClientRect(); // Get wrapper position once

    lineCounts.forEach(line => {
      try {
        // nodePos is the start of the content (pos + 1)
        // We need the node's start position (pos) to get the DOM node
        const nodePos = line.nodePos - 1;
        if (nodePos < 0) throw new Error("Invalid nodePos");

        const node = view.nodeDOM(nodePos);
        if (node instanceof HTMLElement) {
          const nodeRect = node.getBoundingClientRect();
          // Calculate top relative to the wrapper, considering scroll position
          const top = nodeRect.top - wrapperRect.top + wrapper.scrollTop;
          newGutterData.push({ ...line, top });
        } else {
           if (DEBUG_APP) console.warn(`[Gutter Position] Could not find DOM node for pos ${nodePos}`);
        }
      } catch (error) {
        // This can happen if the node is not currently rendered (e.g., due to virtualization or error)
        if (DEBUG_APP) console.warn(`[Gutter Position] Error getting node DOM/position for pos ${line.nodePos - 1}:`, error);
      }
    });

    if (DEBUG_APP) console.log("[Gutter Position] Calculated gutter data:", newGutterData);
    setGutterData(newGutterData);

  // Rerun when line counts change OR when the editor content potentially reflows (doc version)
  // Note: Depending solely on doc version might be too frequent.
  // A more optimized approach might involve debouncing this effect or using ResizeObserver
  // on the editor wrapper, but this is a simpler starting point.
  }, [lineCounts, editor?.state.doc.version]); // Dependency on editor is now safe

  // --- Editor Setup --- (MOVED UP)
  const editor = useEditor({ // Now editor is initialized before the useEffect above
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
    // --- Add Selection Update Handler (Direct Call) ---
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor; // Ensure ref is current
      // Directly call the handler without debounce
      handleSelectionUpdate({ editor: updatedEditor });
    },
     onDestroy: () => {
       if (DEBUG_APP) console.log("[Editor onDestroy] Cancelling debounced calls.");
       debouncedProcessText.cancel();
       // No longer need to cancel debouncedSelectionUpdate
       editorRef.current = null;
     }
  });


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
         {/* NEW: Dedicated Gutter Div */}
         <div className="editor-gutter">
           {gutterData.map((line) => (
             <span
               key={line.nodePos}
               className={`gutter-line-count ${line.nodePos === activeLinePos ? 'active-count' : ''}`}
               style={{ top: `${line.top}px` }} // Position based on calculated top offset
             >
               [{line.count}]
             </span>
           ))}
         </div>

         {/* Editor Content Wrapper */}
         <div className="editor-content-wrapper" ref={editorWrapperRef}>
             <EditorContent editor={editor} />
         </div>
       </div>
    </div>
  );
}

export default App;
