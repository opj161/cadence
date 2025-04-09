import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import necessary ProseMirror/Tiptap modules
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer } from './SyllableVisualizer';
import { processTextLogic } from './utils/syllableProcessor';
import debounce from 'lodash.debounce';

// Debug mode can be toggled during development
let DEBUG_APP = false; // Default to false for production

function App() {
  const [lineCounts, setLineCounts] = useState([]);
  const [gutterData, setGutterData] = useState([]);
  const [activeLinePos, setActiveLinePos] = useState(null);
  const editorWrapperRef = useRef(null);
  const editorRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingErrors, setProcessingErrors] = useState([]);
  const [gutterErrors, setGutterErrors] = useState(false);
  const [debugMode, setDebugMode] = useState(DEBUG_APP);

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
          // Configure paragraph handling
          paragraph: {
            HTMLAttributes: { class: 'paragraph-node' },
          },
          // Ensure proper handling of hard breaks (newlines)
          hardBreak: {
            HTMLAttributes: { class: 'hard-break' },
          }
      }),
      SyllableVisualizer.configure(),
    ],
    // Custom paste handler to preserve original formatting
    editorProps: {
      handlePaste: (view, event) => {
        try {
          // Get plain text from clipboard
          const text = event.clipboardData?.getData('text/plain');

          // If there's no text or no newlines, let Tiptap handle it
          if (!text || !text.includes('\n')) {
            if (DEBUG_APP) console.log("[handlePaste] Simple content, using default handler.");
            return false;
          }

          // For text with newlines, we need to preserve the original formatting
          if (DEBUG_APP) console.log("[handlePaste] Multi-line text detected, preserving original formatting.");

          // Prevent default paste behavior
          event.preventDefault();

          // Process the text to preserve formatting
          // - Double newlines (\n\n) become paragraph breaks
          // - Single newlines (\n) become hard breaks
          const paragraphs = text.split(/\n\s*\n/);

          const { state, dispatch } = view;
          const { schema } = state;
          let { tr } = state;
          const { from, to } = state.selection;

          // Replace the current selection with the processed content
          let insertPos = from;

          // Process each paragraph
          paragraphs.forEach((paragraph, pIndex) => {
            // Split paragraph into lines
            const lines = paragraph.split('\n');

            // Create text nodes with hard breaks between lines
            const paraContent = [];

            // Add each line with hard breaks between them
            lines.forEach((line, lIndex) => {
              // Add the line text
              if (line.length > 0) {
                paraContent.push(schema.text(line));
              }

              // Add hard break between lines (but not after the last line)
              if (lIndex < lines.length - 1) {
                paraContent.push(schema.nodes.hardBreak.create());
              }
            });

            // Create paragraph with the content
            const paraNode = schema.nodes.paragraph.create(null, paraContent);

            // Replace selection for first paragraph or insert for subsequent ones
            if (pIndex === 0) {
              tr = tr.replaceWith(from, to, paraNode);
              insertPos = from + paraNode.nodeSize;
            } else {
              tr = tr.insert(insertPos, paraNode);
              insertPos += paraNode.nodeSize;
            }
          });

          // Move cursor to the end of the pasted content
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(insertPos)));
          dispatch(tr);

          // Process syllables after paste
          setTimeout(() => {
            if (typeof processText === 'function') processText();
          }, 50);

          return true; // We've handled the paste
        } catch (error) {
          console.error("[handlePaste] Error in paste handler:", error);
          // Fall back to default handler
          return false;
        }
      }
    },
    // Configure how Tiptap parses content
    parseOptions: {
      // This preserves whitespace in pasted content
      preserveWhitespace: 'full',
    },
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

        // Add a small delay to ensure the DOM has been updated
        // This is especially important after adding line breaks
        setTimeout(() => {
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

              // Try to find the DOM node for this position
              let node = null;
              let lineElement = null;

              try {
                // First, check if this is a line within a paragraph (with hard breaks)
                if (line.paragraphPos !== undefined) {
                  // This is a line within a paragraph
                  // First get the paragraph node
                  const paragraphNode = view.nodeDOM(line.paragraphPos);

                  if (paragraphNode instanceof HTMLElement) {
                    // Now we need to find the specific line within this paragraph
                    // For lines separated by hard breaks, we need to count <br> elements

                    // Get all text nodes and <br> elements in the paragraph
                    const textAndBreakNodes = [];
                    const collectNodes = (element) => {
                      if (element.nodeType === Node.TEXT_NODE) {
                        textAndBreakNodes.push({ type: 'text', node: element });
                      } else if (element.nodeName === 'BR') {
                        textAndBreakNodes.push({ type: 'break', node: element });
                      } else if (element.childNodes) {
                        Array.from(element.childNodes).forEach(collectNodes);
                      }
                    };

                    collectNodes(paragraphNode);

                    // Find the line based on breaks
                    // We need to calculate the vertical position of each line within the paragraph

                    // For the first line (lineIndex 0), use the paragraph start
                    if (line.lineIndex === 0) {
                      lineElement = paragraphNode;
                    } else {
                      // For subsequent lines, we need to find the <br> elements and calculate positions
                      const breakElements = [];
                      const findBreakElements = (element) => {
                        if (element.nodeName === 'BR') {
                          breakElements.push(element);
                        } else if (element.childNodes && element.childNodes.length > 0) {
                          Array.from(element.childNodes).forEach(findBreakElements);
                        }
                      };

                      findBreakElements(paragraphNode);

                      if (DEBUG_APP) {
                        console.log(`[Gutter Position] Line ${i} has lineIndex ${line.lineIndex}, found ${breakElements.length} break elements`);
                      }

                      // For the first line in a paragraph, we use the paragraph start
                      if (line.lineIndex === 0) {
                        lineElement = paragraphNode;
                      }
                      // For subsequent lines, we need to find the <br> elements
                      else if (breakElements.length > 0) {
                        // Calculate line position based on line index
                        // If we have fewer break elements than the line index, use the last one
                        const breakIndex = Math.min(line.lineIndex - 1, breakElements.length - 1);
                        const breakElement = breakElements[breakIndex];

                        if (breakElement) {
                          // Create a virtual element for positioning
                          lineElement = document.createElement('span');
                          const breakRect = breakElement.getBoundingClientRect();
                          const paraRect = paragraphNode.getBoundingClientRect();

                          // Calculate the top position relative to the paragraph
                          // Add a small offset to position below the break
                          const relativeTop = breakRect.bottom - paraRect.top + 2;

                          // Get line height from the paragraph's computed style
                          const computedStyle = window.getComputedStyle(paragraphNode);
                          const lineHeight = parseInt(computedStyle.lineHeight) || 20; // Default to 20px if not set

                          // Set a custom property to use for positioning
                          lineElement.getBoundingClientRect = () => ({
                            top: paraRect.top + relativeTop,
                            bottom: paraRect.top + relativeTop + lineHeight,
                            left: paraRect.left,
                            right: paraRect.right,
                            width: paraRect.width,
                            height: lineHeight,
                          });

                          if (DEBUG_APP) {
                            console.log(`[Gutter Position] Line ${i} (index ${line.lineIndex}) positioned at ${relativeTop}px from paragraph top`);
                          }
                        }
                      }

                      // If we couldn't find the right break element, fall back to paragraph
                      if (!lineElement) {
                        lineElement = paragraphNode;
                      }
                    }
                  }
                } else {
                  // This is a regular paragraph node
                  node = view.nodeDOM(nodePos);
                }
              } catch {
                // Ignore the error
                // Ignore the error and try alternative method
                // If direct lookup fails, try to resolve the position
                try {
                  const resolvedPos = view.state.doc.resolve(nodePos);
                  const $pos = resolvedPos;
                  // Try to get the node at the current depth
                  if ($pos.parent && $pos.parent.type.name === 'paragraph') {
                    // Try to find this node in the DOM
                    const start = $pos.start();
                    node = view.nodeDOM(start);
                  }
                } catch (innerError) {
                  if (DEBUG_APP) console.warn(`[Gutter Position] Error resolving position: ${innerError.message}`);
                }
              }

              // Use the line element if found, otherwise fall back to the paragraph node
              node = lineElement || node;

              if (node instanceof HTMLElement) {
                const nodeRect = node.getBoundingClientRect();
                const top = Math.max(0, nodeRect.top - wrapperRect.top);
                newGutterData.push({ ...line, top, error: false });
              } else {
                // Improved fallback calculation based on line height and position
                // Try to get a reasonable line height from the editor
                let lineHeight = 20; // Default fallback

                try {
                  // Try to get the line height from the editor's computed style
                  const editorElement = document.querySelector('.ProseMirror');
                  if (editorElement) {
                    const computedStyle = window.getComputedStyle(editorElement);
                    const computedLineHeight = parseInt(computedStyle.lineHeight);
                    if (!isNaN(computedLineHeight) && computedLineHeight > 0) {
                      lineHeight = computedLineHeight;
                    }
                  }
                } catch (e) {
                  // Ignore errors and use default
                }

                // Use previous line's position if available
                const previousLine = i > 0 ? newGutterData[i - 1] : null;

                // If this is a line within a paragraph with a known paragraph position
                if (line.paragraphPos !== undefined && line.lineIndex !== undefined) {
                  // Find the paragraph's position if we have it
                  const paragraphLine = newGutterData.find(l =>
                    l.paragraphPos === line.paragraphPos && l.lineIndex === 0 && !l.error);

                  if (paragraphLine) {
                    // Calculate based on paragraph position and line index
                    const estimatedTop = paragraphLine.top + (line.lineIndex * lineHeight);
                    if (DEBUG_APP) console.warn(`[Gutter Position] Using paragraph-based estimation for line ${i} (index ${line.lineIndex}).`);
                    newGutterData.push({ ...line, top: estimatedTop, error: true });
                  } else {
                    // Fall back to previous line
                    const estimatedTop = previousLine
                      ? previousLine.top + lineHeight
                      : i * lineHeight;
                    if (DEBUG_APP) console.warn(`[Gutter Position] Could not find DOM node for pos ${nodePos}. Using estimated position.`);
                    newGutterData.push({ ...line, top: estimatedTop, error: true });
                  }
                } else {
                  // Standard fallback
                  const estimatedTop = previousLine
                    ? previousLine.top + lineHeight
                    : i * lineHeight;
                  if (DEBUG_APP) console.warn(`[Gutter Position] Could not find DOM node for pos ${nodePos}. Using estimated position.`);
                  newGutterData.push({ ...line, top: estimatedTop, error: true });
                }

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
        }, 50); // 50ms delay to ensure DOM is updated
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
       {debugMode && (
         <div style={{marginBottom: '10px'}}>
           <p style={{color: 'orange', textAlign: 'center', marginBottom: '5px'}}>
             <b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.
           </p>
           <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
             <button
               onClick={() => {
                 // Toggle debug CSS for paragraphs
                 const styleSheet = document.styleSheets[0];
                 const paragraphRule = Array.from(styleSheet.cssRules).find(rule =>
                   rule.selectorText === '.paragraph-node' && rule.style.border === '');
                 if (paragraphRule) {
                   paragraphRule.style.border = '1px dashed rgba(0, 0, 255, 0.2)';
                   paragraphRule.style.margin = '2px 0';
                   paragraphRule.style.padding = '2px';
                 } else {
                   // If not found, add a new rule
                   styleSheet.insertRule('.paragraph-node { border: 1px dashed rgba(0, 0, 255, 0.2); margin: 2px 0; padding: 2px; }', 0);
                 }
               }}
               style={{padding: '3px 8px', fontSize: '12px'}}
             >
               Zeige Absätze
             </button>
             <button
               onClick={() => {
                 // Toggle debug mode
                 const newDebugMode = !debugMode;
                 setDebugMode(newDebugMode);
                 DEBUG_APP = newDebugMode;
                 // Force reprocess text
                 processText();
               }}
               style={{padding: '3px 8px', fontSize: '12px'}}
             >
               Debug {debugMode ? 'Aus' : 'An'}
             </button>
           </div>
         </div>
       )}
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