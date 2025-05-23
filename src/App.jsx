// src/App.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import Fragment from prosemirror-model
import { Fragment } from '@tiptap/pm/model'; // Ensure Fragment is imported
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer } from './SyllableVisualizer';
import { LyricStructure } from './LyricStructure';
import { processTextLogic } from './utils/syllableProcessor';
import debounce from 'lodash.debounce';

const DEBUG_APP = false; // Enable debug logging

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
    if (!editorRef.current || editorRef.current.isDestroyed) {
      if (DEBUG_APP) console.log("%c[ProcessText Callback] Skipping: Editor ref not current or destroyed.", "color: orange");
      setIsProcessing(false);
      return;
    }
    if (DEBUG_APP) console.log("%c[ProcessText Callback] Running processTextLogic...", "color: green");
    processTextLogic(
      editorRef.current,
      setLineCounts,
      setGutterData,
      setIsProcessing,
      setProcessingErrors,
      DEBUG_APP
    );
  }, [setLineCounts, setIsProcessing, setProcessingErrors]);

  const debouncedProcessText = useRef(debounce(processText, 800)).current; // Increased debounce delay

  // --- handleSelectionUpdate remains the same ---
  const handleSelectionUpdate = useCallback(({ editor: updatedEditor }) => {
    const { state } = updatedEditor;
    const { selection } = state;
    if (state.doc.content.size > 0 && selection.empty) {
      const resolvedPos = state.doc.resolve(selection.head);
      let currentDepth = resolvedPos.depth;
      let currentActivePos = null;
      while (currentDepth >= 0) {
        const node = resolvedPos.node(currentDepth);
        if (node.type.name === 'paragraph') {
          currentActivePos = resolvedPos.start(currentDepth);
          break;
        }
        if (node.type.name === 'doc') break;
        currentDepth--;
      }
      setActiveLinePos(currentActivePos !== null ? currentActivePos + 1 : null);
    } else {
      setActiveLinePos(null);
    }
  }, [setActiveLinePos]);

  // Add this function within the App component
  const updateEmptyParagraphClasses = useCallback(() => {
    if (!editorRef.current || !editorRef.current.view) return;

    requestAnimationFrame(() => {
      const editorDOM = document.querySelector('.ProseMirror');
      if (!editorDOM) return;

      const paragraphs = editorDOM.querySelectorAll('p');
      for (let i = 0; i < paragraphs.length - 1; i++) {
        const current = paragraphs[i];
        const next = paragraphs[i + 1];

        // Add class if next paragraph is empty
        if (next.textContent.trim() === '') {
          current.classList.add('before-empty-paragraph');
        } else {
          current.classList.remove('before-empty-paragraph');
        }
      }
    });
  }, []);

  // --- Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        gapcursor: true,
        // Disable default blockquote shortcuts if LyricStructure uses similar logic
        // blockquote: false,
      }),
      SyllableVisualizer.configure(),
      LyricStructure,
    ],
    editorProps: {
      // *** Revised handlePaste ***
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');

        // Prioritize multi-line plain text handling
        if (text && text.includes('\n')) {
          if (DEBUG_APP) console.log("[handlePaste] Multi-line plain text detected in clipboard. Forcing custom handler.");
          event.preventDefault(); // Prevent default paste

          const lines = text.split('\n');
          const { state, dispatch } = view;
          const { schema } = state;
          let { tr } = state;
          const { from, to } = state.selection;

          // Replace selection with the first line
          const firstLineText = lines[0];
          const firstLineNode = firstLineText ? schema.text(firstLineText) : Fragment.empty;
          tr = tr.replaceWith(from, to, firstLineNode);

          // Calculate insert position AFTER the first line's content
          let currentInsertPos = from + firstLineNode.nodeSize;

          // Insert subsequent lines as new paragraphs
          for (let i = 1; i < lines.length; i++) {
            const currentLineText = lines[i];

            // Create and insert the actual current line node
            const lineContentNode = currentLineText ? schema.text(currentLineText) : null;
            const lineNode = schema.nodes.paragraph.create(null, lineContentNode);

            // *** Insert the node and update position ***
            tr.insert(currentInsertPos, lineNode);
            currentInsertPos += lineNode.nodeSize;
            // *** Log removed for clarity here ***
          }

          // Set selection at the end of pasted content
          const finalPos = Math.min(currentInsertPos, tr.doc.content.size);
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(finalPos)));
          dispatch(tr);

          // Trigger processing after a delay to allow DOM update
          if (lines.length > 50) {
            setTimeout(() => {
              if (DEBUG_APP) console.log("%c[handlePaste] Triggering delayed processText after large paste dispatch.", "color: blue");
              processText(); // Non-debounced call
            }, 200); // Longer delay for large pastes
          } else {
            setTimeout(() => {
              if (DEBUG_APP) console.log("%c[handlePaste] Triggering delayed processText after custom multi-line paste dispatch.", "color: blue");
              processText(); // Non-debounced call
            }, 100); // Standard delay
          }

          setTimeout(updateEmptyParagraphClasses, 100); // Call updateEmptyParagraphClasses after paste

          return true; // Paste handled by custom logic
        }

        // If not multi-line plain text, let Tiptap's default handler manage it
        if (DEBUG_APP) console.log("[handlePaste] Not multi-line plain text, using default Tiptap paste handler.");
        return false;
      }, // End handlePaste
    }, // End editorProps
    // --- Content and Lifecycle Hooks remain the same ---
    content: `[Hook]
Schnipp, schnapp, Samenleiter ab!
Sie sagt: "Ich will Kinder!", er sagt: "Babe, der Zug ist ab!"

[Verse 1]
Copy & Paste Text here...
# This is a comment line
This line has a [G] chord and an [Am] chord.

[Outro]
The end.`, // Example content
    onCreate: ({ editor: createdEditor }) => {
      editorRef.current = createdEditor;
      if (DEBUG_APP) console.log("%c[Editor onCreate] Editor instance stored. Scheduling initial processText.", "color: purple");
      requestAnimationFrame(() => setTimeout(processText, 150)); // Slightly increased initial delay maybe
      handleSelectionUpdate({ editor: createdEditor });
    },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      if (DEBUG_APP) console.log("%c[Editor onUpdate] Triggering debouncedProcessText.", "color: gray");
      debouncedProcessText();
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onDestroy: () => {
      if (DEBUG_APP) console.log("%c[Editor onDestroy] Cancelling debounced calls.", "color: red");
      debouncedProcessText.cancel();
      editorRef.current = null;
    }
  });

  // --- Gutter Alignment Logic (Keep as is from previous correction with ESLint disable) ---
  useEffect(() => {
    const editorInstance = editor;
    const wrapper = editorWrapperRef.current;

    if (!editorInstance?.view || editorInstance.isDestroyed || !editorInstance.state || !wrapper || lineCounts.length === 0) {
      // if (DEBUG_APP && editorInstance?.isDestroyed) console.log("%c[Gutter Effect] Skipping: Editor destroyed or no line counts.", "color: orange");
      if (gutterData.length > 0) setGutterData([]); // Clear if editor is gone but data exists
      if (gutterErrors) setGutterErrors(false); // Clear errors if effect shouldn't run
      return;
    }

    let animationFrameId = null;

    const calculateGutterPositions = () => {
      if (!editorInstance?.view || !editorInstance.state || !wrapper) {
        if (DEBUG_APP) console.log("%c[Gutter Calc] Skipping: Editor/view/state/wrapper missing in RAF.", "color: red");
        setGutterData([]);
        setGutterErrors(false);
        return;
      }

      const view = editorInstance.view;
      const newGutterData = [];
      const wrapperRect = wrapper.getBoundingClientRect();
      let foundGutterError = false;
      const currentDoc = view.state.doc;

      if (DEBUG_APP) console.log(`%c[Gutter Calc] Running calculation for ${lineCounts.length} lines. Active line pos: ${activeLinePos}`, "color: magenta");

      // Defensive Check: Log mismatch between lineCounts and actual paragraphs
      let actualParagraphCount = 0;
      currentDoc.descendants((node) => { if (node.type.name === 'paragraph') actualParagraphCount++; });
      if (lineCounts.length !== actualParagraphCount && DEBUG_APP) {
        console.warn(`%c[Gutter Calc] Mismatch Warning: lineCounts has ${lineCounts.length} items, but found ${actualParagraphCount} paragraphs in document.`, "color: orange");
      }
      // --- End Defensive Check ---

      lineCounts.forEach((line, index) => {
        // --- ADJUSTMENT: Use line.nodePos directly ---
        const nodePosForDOM = line.nodePos; // Use the stored position directly
        let nodeElement = null;
        try {
          // --- ADJUSTMENT: Check against currentDoc.content.size directly ---
          if (nodePosForDOM < 0 || nodePosForDOM >= currentDoc.content.size) {
            // It's possible for a node near the end to have pos === content.size, but nodeAt would fail
            throw new Error(`Invalid nodePosForDOM: ${nodePosForDOM} (Doc size: ${currentDoc.content.size})`);
          }
          // --- ADJUSTMENT: Check node directly at nodePosForDOM ---
          const nodeCheck = currentDoc.nodeAt(nodePosForDOM);
          if (!nodeCheck || nodeCheck.type.name !== 'paragraph') {
            // Add more info to the error
            throw new Error(`No paragraph node found at position ${nodePosForDOM}. Found: ${nodeCheck?.type.name || 'null/out of bounds'}`);
          }

          // --- ADJUSTMENT: Use nodePosForDOM directly with nodeDOM ---
          nodeElement = view.nodeDOM(nodePosForDOM);

          if (nodeElement instanceof HTMLElement) {
            const nodeRect = nodeElement.getBoundingClientRect();
            const top = Math.max(0, nodeRect.top - wrapperRect.top);
            // Ensure nodePos is pushed correctly
            newGutterData.push({ ...line, top, error: false, nodePos: line.nodePos });
          } else {
            // More specific error
            throw new Error(`view.nodeDOM(${nodePosForDOM}) did not return an HTMLElement (returned ${typeof nodeElement}). Node type: ${nodeCheck?.type.name}`);
          }
        } catch (error) {
          // Keep detailed logging
          if (DEBUG_APP) console.warn(`%c[Gutter Calc] Error line ${index + 1}: NodePos ${line.nodePos}. Error: ${error.message}. nodeDOM result:`, "color: red", nodeElement);
          // Push error state, ensuring nodePos is included
          newGutterData.push({ ...line, top: index * 20, error: true, nodePos: line.nodePos });
          foundGutterError = true;
        }
      });
      setGutterData(newGutterData);
      setGutterErrors(foundGutterError);
      if (DEBUG_APP) console.log(`%c[Gutter Calc] Finished calculation. Errors found: ${foundGutterError}`, "color: magenta");
    };

    animationFrameId = requestAnimationFrame(calculateGutterPositions);
    // if (DEBUG_APP) console.log("%c[Gutter Effect] Scheduled RAF ID:", "color: cyan", animationFrameId);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        // if (DEBUG_APP) console.log("%c[Gutter Effect Cleanup] Canceled RAF ID:", "color: cyan", animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineCounts, editor, editorWrapperRef, activeLinePos]);

  // Call this function after editor updates
  useEffect(() => {
    if (editor) {
      updateEmptyParagraphClasses();
    }
  }, [editor, updateEmptyParagraphClasses, gutterData]); // Add gutterData as a dependency to trigger after content changes

  // --- Render (Keep as is) ---
  return (
    <div className="app-container">
      <div className="app-header">
        <img src="/cadence.svg" alt="Cadence Logo" className="app-logo" />
      </div>
      <p className="hinweis">
        Dein Assistent für Songtexte. Silben und Zeilenzahlen helfen dir, den perfekten Rhythmus zu finden.
      </p>
      {DEBUG_APP && <p style={{ color: 'orange', textAlign: 'center' }}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}
      {processingErrors.length > 0 && (
        <div className="error-message" role="alert">
          Warnung: Konnte Silben für folgende Wörter nicht verarbeiten: {processingErrors.slice(0, 5).join(', ')}{processingErrors.length > 5 ? '...' : ''}
        </div>
      )}
      {gutterErrors && (
        <div className="error-message" role="alert">
          Warnung: Positionierung der Zeilenzahlen ungenau. (Siehe Konsole für Details im Debug-Modus).
        </div>
      )}
      <div className="editor-layout-tiptap">
        <div className="editor-gutter">
          {gutterData.map((line, index) => (
            <span
              key={line.error ? `error-${index}-${Math.random()}` : line.nodePos}
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