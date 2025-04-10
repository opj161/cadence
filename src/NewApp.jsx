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
        debug: debugMode
      })
    ],
    content: '<p>Welcome to the syllable counter!</p><p>Type or paste text here to count syllables.</p><p>Press Enter to create a new paragraph.</p><p>Press Shift+Enter to create a line break within a paragraph.</p>',
    autofocus: true,
    editable: true,
    onUpdate: ({ editor }) => {
      // Update debug info if needed
      if (debugMode) {
        const doc = editor.state.doc;
        const syllableCounts = [];
        
        doc.descendants((node, pos) => {
          if (node.isBlock) {
            syllableCounts.push({
              pos,
              text: node.textContent,
              type: node.type.name
            });
          }
        });
        
        setDebugInfo({
          syllableCounts,
          docSize: doc.content.size
        });
      }
    }
  });
  
  // Add debug class to editor container when debug mode is enabled
  useEffect(() => {
    if (editorContainerRef.current) {
      if (debugMode) {
        editorContainerRef.current.classList.add('debug-mode');
      } else {
        editorContainerRef.current.classList.remove('debug-mode');
      }
    }
  }, [debugMode]);

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
            <p>Blocks: {debugInfo.syllableCounts.length}</p>
            <ul>
              {debugInfo.syllableCounts.map((item, index) => (
                <li key={index}>
                  {item.type} at pos {item.pos}: "{item.text}"
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default NewApp;
