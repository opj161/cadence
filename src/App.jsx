// src/App.jsx

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CadenceExtension } from './extensions/CadenceExtension';
import { CustomListItem } from './extensions/CustomListItem';

const DEBUG_APP = false; // Enable debug logging

function App() {
  // --- Editor Setup ---
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
        gapcursor: true,
        paragraph: false, // Disable the default paragraph extension
        listItem: false, // Disable the default listItem extension
      }),
  CadenceExtension,
      // Use our custom list item extension that depends on cadenceParagraph
      CustomListItem,
    ],
    content: `[Hook]
Schnipp, schnapp, Samenleiter ab!
Sie sagt: "Ich will Kinder!", er sagt: "Babe, der Zug ist ab!"

[Verse 1]
Copy & Paste Text here...
# This is a comment line
This line has a [G] chord and an [Am] chord.

[Outro]
The end.`, // Example content
  });

  // Expose editor for debugging in the browser console
  if (typeof window !== 'undefined') window.__cadenceEditor = editor;

  // The processing indicator is now also handled inside the extension storage!
  const isProcessing = editor?.storage.cadenceParagraph.isProcessing || false;

  // --- Render (Keep as is) ---
  return (
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
      {DEBUG_APP && <p style={{ color: 'orange', textAlign: 'center' }}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}
      {editor?.storage.cadenceParagraph?.errors.length > 0 && (
        <div className="error-message" role="alert">
          Warnung: Konnte Silben für folgende Wörter nicht verarbeiten: {editor.storage.cadenceParagraph.errors.slice(0, 5).join(', ')}{editor.storage.cadenceParagraph.errors.length > 5 ? '...' : ''}
        </div>
      )}
      <div className="editor-content-wrapper">
        {editor && <EditorContent editor={editor} />}
      </div>
    </div>
  );
}

export default App;