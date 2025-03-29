import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableVisualizer, SyllableVisualizerPluginKey } from './SyllableVisualizer';
import { processTextLogic } from './utils/syllableProcessor'; // <-- TIER 1 CHANGE: Import extracted logic
import debounce from 'lodash.debounce';

const DEBUG_APP = false; // Keep false for production

function App() {
  const [lineCounts, setLineCounts] = useState([]);
  const [gutterData, setGutterData] = useState([]);
  const [activeLinePos, setActiveLinePos] = useState(null);
  const editorWrapperRef = useRef(null);
  const editorRef = useRef(null);

  // --- TIER 1 & 2 CHANGES: Add state for loading and errors ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingErrors, setProcessingErrors] = useState([]); // Store words that failed hyphenation
  const [gutterErrors, setGutterErrors] = useState(false); // Flag for gutter positioning errors

  // --- Callbacks Definition ---
  // processText now calls the extracted logic
  const processText = useCallback(() => {
    if (!editorRef.current) {
      if (DEBUG_APP) console.log("[ProcessText Callback] Skipping: Editor ref not current.");
      // If we skip here, ensure processing state is false
      // (though it should be false already unless debounce is immediate)
      setIsProcessing(false);
      return;
    }
    // Call the extracted async logic (no await needed here, runs in background)
    processTextLogic(
        editorRef.current,
        setLineCounts,
        setIsProcessing,
        setProcessingErrors, // Pass setter for processing errors
        DEBUG_APP
    );
  }, [setLineCounts, setIsProcessing, setProcessingErrors]); // Add setters to dependency array

  const debouncedProcessText = useRef(debounce(processText, 500)).current;

  const handleSelectionUpdate = useCallback(({ editor: updatedEditor }) => {
    const { state } = updatedEditor;
    const { selection } = state;
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
  }, [setActiveLinePos]);

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
       // Use rAF + setTimeout for initial processing after mount
       requestAnimationFrame(() => setTimeout(processText, 50));
       handleSelectionUpdate({ editor: createdEditor });
     },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      if (DEBUG_APP) console.log("[Editor onUpdate] Triggering debouncedProcessText.");
      debouncedProcessText();
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


  // --- Gutter Alignment Logic ---
  useEffect(() => {
    const editorInstance = editor;
    const wrapper = editorWrapperRef.current;

    // Reset gutter error flag at the start of calculation
    setGutterErrors(false); // <-- TIER 2 CHANGE

    if (!editorInstance || !editorInstance.view || !wrapper || lineCounts.length === 0) {
      setGutterData([]);
      return;
    }

    const view = editorInstance.view;
    const newGutterData = [];
    const wrapperRect = wrapper.getBoundingClientRect();
    let foundGutterError = false; // Track errors within this run

    lineCounts.forEach((line, index) => { // Added index for fallback positioning
      try {
        const nodePos = line.nodePos - 1;
        if (nodePos < 0) throw new Error("Invalid nodePos");

        const node = view.nodeDOM(nodePos);

        if (node instanceof HTMLElement) {
          const nodeRect = node.getBoundingClientRect();
          const top = nodeRect.top - wrapperRect.top; // Relative to wrapper top
          newGutterData.push({ ...line, top, error: false }); // Add error: false flag
        } else {
           if (DEBUG_APP) console.warn(`[Gutter Position] Could not find DOM node for pos ${nodePos}`);
           // <-- TIER 2 CHANGE: Handle missing node -->
           newGutterData.push({ ...line, top: index * 20, error: true }); // Fallback top, mark error
           foundGutterError = true;
        }
      } catch (error) {
        if (DEBUG_APP) console.warn(`[Gutter Position] Error getting node DOM/position for pos ${line.nodePos - 1}:`, error);
        // <-- TIER 2 CHANGE: Handle exception -->
        newGutterData.push({ ...line, top: index * 20, error: true }); // Fallback top, mark error
        foundGutterError = true;
      }
    });

    if (DEBUG_APP) console.log("[Gutter Position] Calculated gutter data:", newGutterData);
    setGutterData(newGutterData);
    setGutterErrors(foundGutterError); // Update global gutter error state

  // Add setGutterErrors to dependency array
  }, [lineCounts, editor?.state?.doc?.version, editor, setGutterErrors]);


  // --- Render ---
  return (
    <div className="app-container">
       <div className="app-header">
         <img src="/cadence.svg" alt="Cadence Logo" className="app-logo" />
          {/* TIER 1 CHANGE: Added loading indicator */}
         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <h1>Cadence</h1>
             {isProcessing && <span className="processing-indicator" aria-label="Verarbeite...">⚙️</span>}
         </div>
       </div>

       <p className="hinweis">
         Dein Assistent für Songtexte. Silben und Zeilenzahlen helfen dir, den perfekten Rhythmus zu finden.
       </p>
       {DEBUG_APP && <p style={{color: 'orange', textAlign: 'center'}}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}

        {/* TIER 2 CHANGE: Display Processing Errors */}
       {processingErrors.length > 0 && (
         <div className="error-message" role="alert">
           Warnung: Konnte Silben für folgende Wörter nicht verarbeiten: {processingErrors.slice(0, 5).join(', ')}{processingErrors.length > 5 ? '...' : ''}
         </div>
       )}
       {/* TIER 2 CHANGE: Display Gutter Errors */}
       {gutterErrors && (
         <div className="error-message" role="alert">
             Warnung: Positionierung der Zeilenzahlen ungenau.
         </div>
        )}

       <div className="editor-layout-tiptap">
         <div className="editor-gutter">
           {gutterData.map((line, index) => ( // Added index for aria-label and fallback key
             <span
               // Use nodePos for key if available and unique, fallback to index if error prevents nodePos accuracy
               key={line.error ? `error-${index}` : line.nodePos}
               className={`gutter-line-count ${line.nodePos === activeLinePos ? 'active-count' : ''} ${line.error ? 'error-count' : ''}`} // TIER 2: Error class
               style={{ top: `${line.top}px` }} // Position based on calculated top offset
               // TIER 2 CHANGES: aria-label and conditional content
               aria-label={line.error ? `Fehler bei Zeile ${index + 1}` : `Zeile ${index + 1}, ${line.count} Silben`}
             >
               {line.error ? '[?]' : `[${line.count}]`}
             </span>
           ))}
         </div>

         <div className="editor-content-wrapper" ref={editorWrapperRef}>
             <EditorContent editor={editor} />
         </div>
       </div>
    </div>
  );
}

export default App;