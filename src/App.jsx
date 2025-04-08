import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import necessary ProseMirror/Tiptap modules
import { Slice, Fragment } from '@tiptap/pm/model'; // <-- Add this import
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer, SyllableVisualizerPluginKey } from './SyllableVisualizer';
import { processTextLogic } from './utils/syllableProcessor';
import debounce from 'lodash.debounce';

const DEBUG_APP = false; // Keep false for production

function App() {
  const [lineCounts, setLineCounts] = useState([]);
  const [gutterData, setGutterData] = useState([]);
  const [activeLinePos, setActiveLinePos] = useState(null);
  const editorWrapperRef = useRef(null);
  const editorRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingErrors, setProcessingErrors] = useState([]);
  const [gutterErrors, setGutterErrors] = useState(false);

  const processText = useCallback(() => {
    // ... (processText logic remains the same)
     if (!editorRef.current) {
       if (DEBUG_APP) console.log("[ProcessText Callback] Skipping: Editor ref not current.");
       setIsProcessing(false);
       return;
     }
     processTextLogic(
      editorRef.current,
      setLineCounts,
      setGutterData,      // Matches 3rd arg
      setIsProcessing,    // Matches 4th arg
      setProcessingErrors,// Matches 5th arg
      DEBUG_APP           // Matches 6th arg
     );
  }, [setLineCounts, setIsProcessing, setProcessingErrors]);

  const debouncedProcessText = useRef(debounce(processText, 500)).current;

  const handleSelectionUpdate = useCallback(({ editor: updatedEditor }) => {
    // ... (handleSelectionUpdate logic remains the same)
    const { state } = updatedEditor;
    const { selection } = state;
    if (state.doc.content.size > 0) {
        const resolvedPos = state.doc.resolve(selection.head);
        let currentDepth = resolvedPos.depth;
        let currentActivePos = null;
        while(currentDepth >= 0) {
            const node = resolvedPos.node(currentDepth);
            if (node.type.name === 'paragraph') {
                currentActivePos = resolvedPos.start(currentDepth) + 1;
                break;
            }
            if (node.type.name === 'doc') break;
            currentDepth--;
        }
        setActiveLinePos(currentActivePos);
    } else {
        setActiveLinePos(null);
    }
  }, [setActiveLinePos]);

  // --- Editor Setup (WITH PASTE HANDLING FIX) ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          history: true,
          gapcursor: true,
          // Ensure paragraph is the default block node if needed elsewhere
          // paragraph: {
          //   HTMLAttributes: { class: 'paragraph-class' }, // Example attribute
          // }
      }),
      SyllableVisualizer.configure(),
    ],
    // --- Add editorProps for paste handling ---
    editorProps: {
      handlePaste: (view, event, slice) => {
          // Let Tiptap/ProseMirror handle pasted images or complex content first
          // Check if the pasted content is primarily text
          let isPlainText = true;
          slice.content.forEach(node => {
              if (!node.isText && node.type.name !== 'paragraph' && node.textContent.length > 0) {
                  // Allow paragraphs with text, but block if other complex nodes exist
                  if (node.type.name !== 'paragraph' || node.content.size === 0 || !node.content.firstChild?.isText) {
                      isPlainText = false;
                  }
              } else if (!node.isText && node.type.name === 'paragraph' && node.content.size > 0 && !node.content.firstChild?.isText) {
                 // Handle case where paragraph contains non-text nodes initially
                 isPlainText = false;
              }
          });

          if (!isPlainText) {
              if (DEBUG_APP) console.log("[handlePaste] Paste contains non-text/complex nodes, using default handler.");
              return false; // Use default paste handler for complex content
          }

          const text = event.clipboardData?.getData('text/plain');

          // Check if the text contains newline characters, indicating multi-line paste
          if (text && text.includes('\n')) {
            if (DEBUG_APP) console.log("[handlePaste] Multi-line text paste detected. Applying custom paragraph splitting.");
            event.preventDefault(); // Prevent the default paste behavior

            const lines = text.split('\n').filter(line => line.trim() !== '' || line === ''); // Keep empty lines resulting from double newlines
            const { state, dispatch } = view;
            const { schema } = state;
            let { tr } = state;
            const { from, to } = state.selection;

            // Replace the current selection with the first line directly
            if (lines.length > 0) {
                tr = tr.replaceWith(from, to, schema.text(lines[0]));

                // Insert subsequent lines as new paragraphs
                let insertPos = tr.mapping.map(to) // Start inserting after the first line content
                // Adjust insertPos based on replacing selection with first line
                insertPos = tr.selection.from + lines[0].length;


                for (let i = 1; i < lines.length; i++) {
                    const lineNode = schema.nodes.paragraph.create(null, lines[i] ? schema.text(lines[i]) : null);
                    tr = tr.insert(insertPos, lineNode);
                    insertPos += lineNode.nodeSize; // Move insert position past the newly inserted paragraph
                }

                // Move cursor to the end of the pasted content
                tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(insertPos)));
                dispatch(tr);
                return true; // Indicate that we've handled the paste
            }
          }

          if (DEBUG_APP) console.log("[handlePaste] Single-line text or no newline chars, using default handler.");
          return false; // Use default paste handler for single lines or non-text
      },
      // Optional: Handle dropped text similarly if needed
      // handleDrop: (view, event, slice, moved) => {
      //   // Similar logic for dropped text files or text snippets
      //   return false; // Default behavior
      // }
    },
    // --- End of editorProps ---
    content: '<p>Willkommen bei Cadence!</p><p>Tippe deinen Songtext ein. Silben werden visuell getrennt und die Anzahl pro Zeile (Absatz) für den perfekten Flow angezeigt.</p><p>Experimentiere mit verschiedenen Zeilenlängen.</p>',
    onCreate: ({ editor: createdEditor }) => {
      // ... (onCreate logic remains the same)
       editorRef.current = createdEditor;
       if (DEBUG_APP) console.log("[Editor onCreate] Editor instance stored. Scheduling initial processText.");
       requestAnimationFrame(() => setTimeout(processText, 50));
       handleSelectionUpdate({ editor: createdEditor });
    },
    onUpdate: ({ editor: updatedEditor }) => {
      // ... (onUpdate logic remains the same)
      editorRef.current = updatedEditor;
      if (DEBUG_APP) console.log("[Editor onUpdate] Triggering debouncedProcessText.");
      debouncedProcessText();
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      // ... (onSelectionUpdate logic remains the same)
      editorRef.current = updatedEditor;
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onDestroy: () => {
      // ... (onDestroy logic remains the same)
       if (DEBUG_APP) console.log("[Editor onDestroy] Cancelling debounced calls.");
       debouncedProcessText.cancel();
       editorRef.current = null;
    }
  });

  // --- Gutter Alignment Logic (No changes needed here) ---
  useEffect(() => {
    // ... (useEffect logic remains the same as the previous fix)
    const editorInstance = editor;
    const wrapper = editorWrapperRef.current;

    if (!editorInstance?.view || !editorInstance.state || !wrapper || lineCounts.length === 0) {
      setGutterData([]);
      setGutterErrors(false);
      return;
    }

    let animationFrameId = null;

    const calculateGutterPositions = () => {
      if (!editorInstance?.view || !editorInstance.state || !wrapper) {
         if (DEBUG_APP) console.log("[Gutter Position RAF] Editor view, state, or wrapper missing in RAF callback.");
         setGutterData([]);
         setGutterErrors(false);
         return;
      }

      const view = editorInstance.view;
      const newGutterData = [];
      const wrapperRect = wrapper.getBoundingClientRect();
      let foundGutterError = false;

      lineCounts.forEach((line, index) => {
        try {
          const nodePos = line.nodePos - 1;
          if (nodePos < 0 || nodePos >= view.state.doc.content.size) {
              throw new Error(`Invalid nodePos: ${nodePos} (Doc size: ${view.state.doc.content.size})`);
          }
          const node = view.nodeDOM(nodePos);
          if (node instanceof HTMLElement) {
            const nodeRect = node.getBoundingClientRect();
            const top = nodeRect.top - wrapperRect.top;
            newGutterData.push({ ...line, top, error: false });
          } else {
            if (DEBUG_APP) console.warn(`[Gutter Position RAF] Could not find HTMLElement DOM node for pos ${nodePos}. Found:`, node);
            newGutterData.push({ ...line, top: index * 20, error: true });
            foundGutterError = true;
          }
        } catch (error) {
          if (DEBUG_APP) console.warn(`[Gutter Position RAF] Error getting node DOM/position for line.nodePos ${line.nodePos} (trying at pos ${line.nodePos - 1}):`, error);
          newGutterData.push({ ...line, top: index * 20, error: true });
          foundGutterError = true;
        }
      });

      if (DEBUG_APP) console.log("[Gutter Position RAF] Calculated gutter data:", newGutterData);
      setGutterData(newGutterData);
      setGutterErrors(foundGutterError);
    };

    animationFrameId = requestAnimationFrame(calculateGutterPositions);
    if (DEBUG_APP) console.log("[Gutter Position Effect] Scheduled RAF ID:", animationFrameId);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        if (DEBUG_APP) console.log("[Gutter Position Effect Cleanup] Canceled RAF ID:", animationFrameId);
      }
    };
  }, [lineCounts, editor, editorWrapperRef, setGutterErrors]);


  // --- Render (No changes needed here) ---
  return (
    // ... (JSX structure remains the same)
     <div className="app-container">
       <div className="app-header">
         <img src="/cadence.svg" alt="Cadence Logo" className="app-logo" />
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <h1>Cadence</h1>
             {isProcessing && <span className="processing-indicator" aria-label="Verarbeite...">⚙️</span>}
         </div>
       </div>
       <p className="hinweis">
         Dein Assistent für Songtexte. Silben und Zeilenzahlen helfen dir, den perfekten Rhythmus zu finden.
       </p>
       {DEBUG_APP && <p style={{color: 'orange', textAlign: 'center'}}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}
       {processingErrors.length > 0 && (
         <div className="error-message" role="alert">
           Warnung: Konnte Silben für folgende Wörter nicht verarbeiten: {processingErrors.slice(0, 5).join(', ')}{processingErrors.length > 5 ? '...' : ''}
         </div>
       )}
       {gutterErrors && (
         <div className="error-message" role="alert">
             Warnung: Positionierung der Zeilenzahlen eventuell ungenau. Überprüfen Sie die Konsole im Debug-Modus.
         </div>
        )}
       <div className="editor-layout-tiptap">
         <div className="editor-gutter">
           {gutterData.map((line, index) => (
             <span
               key={line.error ? `error-${index}` : line.nodePos}
               className={`gutter-line-count ${line.nodePos === activeLinePos ? 'active-count' : ''} ${line.error ? 'error-count' : ''}`}
               style={{ top: `${line.top}px` }}
               aria-label={line.error ? `Fehler bei Zeile ${index + 1}` : `Zeile ${index + 1}, ${line.count} Silben`}
             >
               {line.error ? '[?]' : `[${line.count}]`}
             </span>
           ))}
         </div>
         <div className="editor-content-wrapper" ref={editorWrapperRef}>
             {editor && <EditorContent editor={editor} />}
         </div>
       </div>
    </div>
  );
}

export default App;