// src/App.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import Fragment if you need it elsewhere, handlePaste doesn't need it now
import { Slice, Fragment } from '@tiptap/pm/model';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer } from './SyllableVisualizer';
import { LyricStructure } from './LyricStructure';
import { processTextLogic } from './utils/syllableProcessor';
import debounce from 'lodash.debounce';

const DEBUG_APP = false;

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
       if (DEBUG_APP) console.log("[ProcessText Callback] Skipping: Editor ref not current or destroyed.");
       setIsProcessing(false);
       return;
     }
      if (DEBUG_APP) console.log("[ProcessText Callback] Running processTextLogic...");
     processTextLogic(
      editorRef.current,
      setLineCounts,
      setGutterData,
      setIsProcessing,
      setProcessingErrors,
      DEBUG_APP
     );
   }, [setLineCounts, setIsProcessing, setProcessingErrors]);

   const debouncedProcessText = useRef(debounce(processText, 500)).current;

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


  // --- Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
          history: true,
          gapcursor: true,
      }),
      SyllableVisualizer.configure(),
      LyricStructure, // This plugin now handles header/chord/comment styling AND header spacing via appendTransaction
    ],
    // --- Reverted handlePaste to simpler version ---
    editorProps: {
        handlePaste: (view, event, slice) => {
          // Let Tiptap/ProseMirror handle pasted images or complex content first
          let isPlainText = true;
          slice.content.forEach(node => {
              if (!node.isText && node.type.name !== 'paragraph') {
                  isPlainText = false;
              } else if (node.type.name === 'paragraph') {
                 node.content.forEach(child => {
                      if (!child.isText) { isPlainText = false; }
                  });
              }
          });


          if (!isPlainText) {
              if (DEBUG_APP) console.log("[handlePaste] Paste contains non-text/complex nodes, using default handler.");
              return false; // Use default paste handler for complex content
          }

          // Optional: You could still keep the multi-line splitting logic
          // from *before* we added the spacing logic into it, if you preferred
          // how that handled line breaks vs the default Tiptap/Prosemirror paste.
          // But for now, let's rely on the default + LyricStructure plugin.

          if (DEBUG_APP) console.log("[handlePaste] Plain text paste, using default Tiptap handler.");
          return false; // Use default paste handler for plain text
        },
    },
    // --- End reverted editorProps ---
    content: '[Hook]\nSchnipp, schnapp, Samenleiter ab!\nSie sagt: "Ich will Kinder!", er sagt: "Babe, der Zug ist ab!"\n\n[Verse 1]\n...',
    onCreate: ({ editor: createdEditor }) => {
       editorRef.current = createdEditor;
       if (DEBUG_APP) console.log("[Editor onCreate] Editor instance stored. Scheduling initial processText.");
       requestAnimationFrame(() => setTimeout(processText, 100)); // Slightly longer delay for initial render
       handleSelectionUpdate({ editor: createdEditor });
    },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      // Rely on debounce for all updates now
      if (DEBUG_APP) console.log("[Editor onUpdate] Triggering debouncedProcessText.");
      debouncedProcessText();
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onDestroy: () => {
       if (DEBUG_APP) console.log("[Editor onDestroy] Cancelling debounced calls.");
       debouncedProcessText.cancel();
       editorRef.current = null;
    }
  });

  // --- Gutter Alignment Logic (Keep as is from previous correction with ESLint disable) ---
  useEffect(() => {
    const editorInstance = editor;
    const wrapper = editorWrapperRef.current;

    if (!editorInstance?.view || editorInstance.isDestroyed || !editorInstance.state || !wrapper || lineCounts.length === 0) {
      if (DEBUG_APP && editorInstance?.isDestroyed) console.log("[Gutter Position Effect] Skipping: Editor destroyed.");
      if (gutterData.length > 0) setGutterData([]);
      if (gutterErrors) setGutterErrors(false);
      return;
    }

    let animationFrameId = null;

    const calculateGutterPositions = () => {
        if (!editorInstance?.view || !editorInstance.state || !wrapper) {
            if (DEBUG_APP) console.log("[Gutter Position RAF] Editor view, state, or wrapper missing.");
            setGutterData([]);
            setGutterErrors(false);
            return;
        }

        const view = editorInstance.view;
        const newGutterData = [];
        const wrapperRect = wrapper.getBoundingClientRect();
        let foundGutterError = false;
        const currentDoc = view.state.doc;

        lineCounts.forEach((line, index) => {
        try {
            const nodePosForDOM = line.nodePos - 1;
             if (nodePosForDOM < 0 || nodePosForDOM >= currentDoc.content.size) {
                throw new Error(`Invalid nodePosForDOM: ${nodePosForDOM} (Doc size: ${currentDoc.content.size})`);
            }
            const nodeCheck = currentDoc.nodeAt(nodePosForDOM);
             if (!nodeCheck || nodeCheck.type.name !== 'paragraph') {
                if (DEBUG_APP) console.warn(`[Gutter Calc] No paragraph node found at adjusted position ${nodePosForDOM}. Found:`, nodeCheck?.type.name);
                 throw new Error(`No paragraph node found at adjusted position ${nodePosForDOM}`);
            }

            const nodeElement = view.nodeDOM(nodePosForDOM);

            if (nodeElement instanceof HTMLElement) {
                const nodeRect = nodeElement.getBoundingClientRect();
                const top = Math.max(0, nodeRect.top - wrapperRect.top);
                newGutterData.push({ ...line, top, error: false, nodePos: line.nodePos });
             } else {
                 if (DEBUG_APP) console.warn(`[Gutter Calc] Could not find HTMLElement DOM node for pos ${nodePosForDOM}. Original line.nodePos:`, line.nodePos);
                 newGutterData.push({ ...line, top: index * 20, error: true, nodePos: line.nodePos });
                 foundGutterError = true;
             }
         } catch (error) {
             if (DEBUG_APP) console.warn(`[Gutter Calc] Error getting node DOM/position for line.nodePos ${line.nodePos} (trying at pos ${line.nodePos - 1}):`, error);
             newGutterData.push({ ...line, top: index * 20, error: true, nodePos: line.nodePos });
             foundGutterError = true;
         }
        });
        setGutterData(newGutterData);
        setGutterErrors(foundGutterError);
    };

    animationFrameId = requestAnimationFrame(calculateGutterPositions);
    if (DEBUG_APP) console.log("[Gutter Position Effect] Scheduled RAF ID:", animationFrameId, "triggered by change in deps:", { lineCountsLen: lineCounts.length, editor: !!editor, wrapper: !!editorWrapperRef.current, activeLinePos });

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        if (DEBUG_APP) console.log("[Gutter Position Effect Cleanup] Canceled RAF ID:", animationFrameId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineCounts, editor, editorWrapperRef, activeLinePos]);


  // --- Render (Keep as is) ---
  return (
     <div className="app-container">
        {/* ... header, hinweis, error messages ... */}
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