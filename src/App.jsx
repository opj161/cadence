// src/App.jsx

import React, { useState, useCallback, useRef } from 'react';
// Import Fragment from prosemirror-model
import { Fragment } from '@tiptap/pm/model'; // Ensure Fragment is imported
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CadenceExtension } from './extensions/CadenceExtension';
import { LyricStructure } from './LyricStructure';

const DEBUG_APP = false; // Enable debug logging

function App() {
  const [activeLinePos, setActiveLinePos] = useState(null);
  const editorWrapperRef = useRef(null);
  const editorRef = useRef(null);

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
        paragraph: false, // Disable the default paragraph extension
        blockquote: false, // Disable blockquote which may reference paragraph
        bulletList: false, // Disable lists which may reference paragraph
        orderedList: false, // Disable lists which may reference paragraph
        listItem: false, // Disable list items which may reference paragraph
      }),
      // Use our new custom paragraph extension
      CadenceExtension.configure({
        HTMLAttributes: { class: 'paragraph-node' },
      }),
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
            const lineNode = schema.nodes.cadenceParagraph.create(null, lineContentNode);

            // *** Insert the node and update position ***
            tr.insert(currentInsertPos, lineNode);
            currentInsertPos += lineNode.nodeSize;
            // *** Log removed for clarity here ***
          }

          // Set selection at the end of pasted content
          const finalPos = Math.min(currentInsertPos, tr.doc.content.size);
          tr = tr.setSelection(state.selection.constructor.near(tr.doc.resolve(finalPos)));
          dispatch(tr);

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
      handleSelectionUpdate({ editor: createdEditor });
    },
    onUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onSelectionUpdate: ({ editor: updatedEditor }) => {
      editorRef.current = updatedEditor;
      handleSelectionUpdate({ editor: updatedEditor });
    },
    onDestroy: () => {
      editorRef.current = null;
    }
  });

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
      {editor && editor.storage.cadenceParagraph?.errors.length > 0 && (
        <div className="error-message" role="alert">
          Warnung: Konnte Silben für folgende Wörter nicht verarbeiten: {editor.storage.cadenceParagraph.errors.slice(0, 5).join(', ')}{editor.storage.cadenceParagraph.errors.length > 5 ? '...' : ''}
        </div>
      )}
      <div className="editor-content-wrapper" ref={editorWrapperRef}>
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
}

export default App;