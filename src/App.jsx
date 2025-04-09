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
          try {
              // First, check if we have plain text in the clipboard
              const text = event.clipboardData?.getData('text/plain');

              // If no text is available, let the default handler manage it
              if (!text) {
                  if (DEBUG_APP) console.log("[handlePaste] No text in clipboard, using default handler.");
                  return false;
              }

              // Simplified check for complex content - only handle plain text
              // Let Tiptap handle any complex content with its default handler
              if (slice.content.childCount > 1 ||
                  (slice.content.firstChild &&
                   !slice.content.firstChild.isText &&
                   slice.content.firstChild.type.name !== 'paragraph')) {
                  if (DEBUG_APP) console.log("[handlePaste] Complex content detected, using default handler.");
                  return false;
              }

              // Check if the text contains newline characters, indicating multi-line paste
              if (text.includes('\n')) {
                  if (DEBUG_APP) console.log("[handlePaste] Multi-line text paste detected.");
                  event.preventDefault(); // Prevent the default paste behavior

                  // Split text into lines, preserving empty lines
                  const lines = text.split('\n');
                  if (lines.length === 0) return false;

                  const { state, dispatch } = view;
                  const { schema } = state;
                  let { tr } = state;
                  const { from, to } = state.selection;

                  // Replace the current selection with the first line
                  tr = tr.replaceWith(from, to, schema.text(lines[0] || ''));

                  // Calculate the position after the first line
                  let insertPos = from + (lines[0] ? lines[0].length : 0);

                  // Insert subsequent lines as new paragraphs
                  for (let i = 1; i < lines.length; i++) {
                      const lineNode = schema.nodes.paragraph.create(null, lines[i] ? schema.text(lines[i]) : null);
                      tr = tr.insert(insertPos, lineNode);
                      insertPos += lineNode.nodeSize;
                  }

                  // Move cursor to the end of the pasted content
                  tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(insertPos)));
                  dispatch(tr);

                  // Trigger syllable processing after paste
                  setTimeout(() => {
                      if (typeof processText === 'function') processText();
                  }, 10);

                  return true; // Indicate that we've handled the paste
              }

              // For single-line text, let the default handler manage it
              if (DEBUG_APP) console.log("[handlePaste] Single-line text, using default handler.");
              return false;

          } catch (error) {
              // If anything goes wrong, fall back to the default handler
              console.error("[handlePaste] Error in paste handler:", error);
              return false;
          }
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

  // --- Improved Gutter Alignment Logic ---
  useEffect(() => {
    const editorInstance = editor;
    const wrapper = editorWrapperRef.current;

    // Early return if dependencies aren't ready
    if (!editorInstance?.view || !editorInstance.state || !wrapper || lineCounts.length === 0) {
      setGutterData([]);
      setGutterErrors(false);
      return;
    }

    let animationFrameId = null;
    let isCalculating = false;
    let needsRecalculation = false;

    // Throttled calculation function to prevent too many updates
    const calculateGutterPositions = () => {
      if (isCalculating) {
        // If we're already calculating, mark that we need another calculation
        // and it will run after the current one finishes
        needsRecalculation = true;
        return;
      }

      isCalculating = true;

      try {
        if (!editorInstance?.view || !editorInstance.state || !wrapper) {
          if (DEBUG_APP) console.log("[Gutter Position] Editor view, state, or wrapper missing.");
          setGutterData([]);
          setGutterErrors(false);
          return;
        }

        const view = editorInstance.view;
        const newGutterData = [];
        const wrapperRect = wrapper.getBoundingClientRect();
        let foundGutterError = false;

        // Process in batches to avoid blocking the main thread for too long
        const batchSize = 20; // Process 20 lines at a time
        const totalBatches = Math.ceil(lineCounts.length / batchSize);

        // Function to process a batch of lines
        const processBatch = (batchIndex) => {
          if (batchIndex >= totalBatches) {
            // All batches processed, update state
            if (DEBUG_APP) console.log("[Gutter Position] Calculated gutter data for", newGutterData.length, "lines");
            setGutterData(newGutterData);
            setGutterErrors(foundGutterError);

            isCalculating = false;

            // If a recalculation was requested during this calculation, run it now
            if (needsRecalculation) {
              needsRecalculation = false;
              animationFrameId = requestAnimationFrame(calculateGutterPositions);
            }
            return;
          }

          const startIndex = batchIndex * batchSize;
          const endIndex = Math.min(startIndex + batchSize, lineCounts.length);

          // Process this batch
          for (let i = startIndex; i < endIndex; i++) {
            const line = lineCounts[i];
            try {
              // More robust position calculation
              const nodePos = Math.max(0, line.nodePos - 1);
              if (nodePos >= view.state.doc.content.size) {
                throw new Error(`Invalid nodePos: ${nodePos} (Doc size: ${view.state.doc.content.size})`);
              }

              const node = view.nodeDOM(nodePos);
              if (node instanceof HTMLElement) {
                const nodeRect = node.getBoundingClientRect();
                const top = Math.max(0, nodeRect.top - wrapperRect.top);
                newGutterData.push({ ...line, top, error: false });
              } else {
                // Improved fallback calculation based on line height and position
                const lineHeight = 20; // Default line height
                const estimatedTop = i * lineHeight;
                if (DEBUG_APP) console.warn(`[Gutter Position] Could not find DOM node for pos ${nodePos}. Using estimated position.`);
                newGutterData.push({ ...line, top: estimatedTop, error: true });
                foundGutterError = true;
              }
            } catch (error) {
              // Better fallback with more consistent spacing
              const previousLine = newGutterData[i - 1];
              const lineHeight = 20; // Default line height
              const estimatedTop = previousLine ? previousLine.top + lineHeight : i * lineHeight;

              if (DEBUG_APP) console.warn(`[Gutter Position] Error calculating position for line ${i}:`, error);
              newGutterData.push({ ...line, top: estimatedTop, error: true });
              foundGutterError = true;
            }
          }

          // Schedule the next batch
          setTimeout(() => processBatch(batchIndex + 1), 0);
        };

        // Start processing the first batch
        processBatch(0);
      } catch (error) {
        console.error("[Gutter Position] Unexpected error:", error);
        setGutterErrors(true);
        isCalculating = false;
      }
    };

    // Handle scroll events to update gutter positions
    const handleScroll = debounce(() => {
      if (!isCalculating) {
        animationFrameId = requestAnimationFrame(calculateGutterPositions);
      } else {
        needsRecalculation = true;
      }
    }, 100);

    // Initial calculation
    animationFrameId = requestAnimationFrame(calculateGutterPositions);

    // Add scroll event listener
    wrapper.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    if (DEBUG_APP) console.log("[Gutter Position] Initialized gutter position calculation");

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      wrapper.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (DEBUG_APP) console.log("[Gutter Position] Cleanup complete");
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