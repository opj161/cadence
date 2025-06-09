import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SyllableCounterExtension } from './SyllableCounterExtension';
import { CustomHardBreak } from './CustomHardBreak';
import './new-index.css';

function NewApp() {
  const [debugMode, setDebugMode] = useState(false);
  const editorContainerRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        hardBreak: false // Disable the default hard break to use our custom one
      }),
      CustomHardBreak,
      SyllableCounterExtension.configure({
        debug: debugMode // Pass debugMode to the extension
      })
    ],
    content: '<p>Welcome to the syllable counter!</p><p>Type or paste text here to count syllables.</p><p>Press Enter to create a new paragraph.</p><p>Press Shift+Enter to create a line break within a paragraph.</p>',
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => {
      if (debugMode) {
        const doc = editor.state.doc;
        const syllableCountsData = [];
        doc.descendants((node, pos) => {
          if (node.isBlock) {
            syllableCountsData.push({
              pos,
              text: node.textContent,
              type: node.type.name
            });
          }
        });
        setDebugInfo({
          syllableCounts: syllableCountsData,
          docSize: doc.content.size
        });
      }
    },
    editorProps: {
      handlePaste: (view, event) => {
        try {
          const text = event.clipboardData?.getData('text/plain');

          if (!text || !text.includes('\n')) {
            if (debugMode) console.log("[handlePaste] Simple content or no text, using default Tiptap handler.");
            return false; // Let Tiptap handle non-plain-text or simple text
          }

          if (debugMode) console.log("[handlePaste] Multi-line plain text detected, applying custom logic.");
          event.preventDefault();

          const { state, dispatch } = view;
          const { schema } = state;
          let { tr } = state;
          const { from, to } = state.selection;

          // Replace the current selection with the processed content
          let insertPos = from;

          const paragraphs = text.split(/\n\s*\n/); // Split by one or more empty lines

          paragraphs.forEach((paragraphText, pIndex) => {
            const lines = paragraphText.split('\n');
            const paraContent = [];

            lines.forEach((lineText, lIndex) => {
              if (lineText.length > 0) {
                paraContent.push(schema.text(lineText));
              }
              if (lIndex < lines.length - 1) { // Add hard break if not the last line of the paragraph
                if (schema.nodes.hardBreak) {
                  paraContent.push(schema.nodes.hardBreak.create());
                } else if (debugMode) {
                  console.warn("[handlePaste] HardBreak node not available in schema.");
                }
              }
            });

            // Ensure paragraph is not empty if it only contained hard breaks
            const paragraphNode = schema.nodes.paragraph.create(null, paraContent.length > 0 ? paraContent : null);

            if (pIndex === 0 && insertPos === from) { // First paragraph, replace selection
              tr = tr.replaceWith(from, to, paragraphNode);
              insertPos = from + paragraphNode.nodeSize;
            } else { // Subsequent paragraphs, insert after previous
              // Adjust insertPos if it's the very beginning of the document and first paragraph was empty
              if (pIndex > 0 && insertPos === from && from === 0 && paragraphs[0].trim() === '') {
                  // This case is tricky, usually means multiple newlines at start of paste.
                  // Defaulting to append after the initial (potentially empty) paragraph from selection.
              }
              tr = tr.insert(insertPos, paragraphNode);
              insertPos += paragraphNode.nodeSize;
            }
             // Add a space node if needed to separate paragraphs, Tiptap usually handles this.
             // For explicit control: if (pIndex < paragraphs.length - 1) { tr = tr.insert(insertPos, schema.text(' ')); insertPos +=1; }

          });

          // Move cursor to the end of the pasted content
          // Ensure insertPos is valid within the document created by the transaction
          const finalInsertPos = Math.min(insertPos, tr.doc.content.size);
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(finalInsertPos)));

          dispatch(tr);

          if (debugMode) console.log("[handlePaste] Custom paste handling complete.");
          return true; // We've handled the paste

        } catch (error) {
          console.error("[handlePaste] Error in custom paste handler:", error);
          if (debugMode) console.error("[handlePaste] Falling back to default Tiptap paste handler due to error.");
          return false; // Fall back to default Tiptap handler in case of error
        }
      }
    },
    parseOptions: {
      preserveWhitespace: 'full',
    }
  });
  
  useEffect(() => {
    if (editorContainerRef.current) {
      if (debugMode) {
        editorContainerRef.current.classList.add('debug-mode');
      } else {
        editorContainerRef.current.classList.remove('debug-mode');
      }
    }
  }, [debugMode, editor]); // Added editor to dependencies if SyllableCounterExtension debug relies on it

  // Update SyllableCounterExtension's debug option when debugMode changes
  useEffect(() => {
    if (editor && editor.extensionManager.extensions.find(ext => ext.name === 'syllableCounter')) {
      editor.chain().focus().setMeta('reconfigure_syllableCounter', { debug: debugMode }).run();
       if (debugMode) console.log("[NewApp useEffect] Updated SyllableCounterExtension debug mode to:", debugMode);
    }
  }, [debugMode, editor]);


  return (
    <div className="app">
      <div className="toolbar">
        <button 
          className={debugMode ? "debug" : ""} 
          onClick={() => setDebugMode(!debugMode)}
        >
          {debugMode ? 'Disable Debug' : 'Enable Debug'}
        </button>
      </div>
      
      <div className="editor-container" ref={editorContainerRef}>
        <EditorContent editor={editor} className="editor" />
      </div>
      
      {debugMode && debugInfo && (
        <div className="debug-panel">
          <h3>Debug Information</h3>
          <div className="debug-panel-content">
            <p>Document size: {debugInfo.docSize}</p>
            {debugInfo.syllableCounts && <p>Blocks: {debugInfo.syllableCounts.length}</p>}
            {debugInfo.syllableCounts && <ul>
              {debugInfo.syllableCounts.map((item, index) => (
                <li key={index}>
                  {item.type} at pos {item.pos}: "{item.text.substring(0, 50)}..."
                </li>
              ))}
            </ul>}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewApp;

[end of src/NewApp.jsx]
