# .gitignore

```
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
.aider*
.aider*
.aider/*
.vite*
```

# .vite\deps\_metadata.json

```json
{
  "hash": "20971ed6",
  "configHash": "8aadbb3c",
  "lockfileHash": "62d80b9d",
  "browserHash": "55478782",
  "optimized": {},
  "chunks": {}
}
```

# .vite\deps\package.json

```json
{
  "type": "module"
}

```

# .vscode\settings.json

```json
{
    "python.analysis.extraPaths": [
        "c:\\Users\\opj\\.vscode\\extensions\\continue.continue-0.0.412-win32-x64"
    ],
    "python.autoComplete.extraPaths": [
        "c:\\Users\\opj\\.vscode\\extensions\\continue.continue-0.0.412-win32-x64"
    ]
}
```

# eslint.config.js

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]

```

# index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>

```

# package.json

```json
{
  "name": "songwriter-helfer-de",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "hyphen": "^1.10.6",
    "lodash.debounce": "^4.0.8",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.21.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.21.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^15.15.0",
    "vite": "^6.2.0"
  }
}

```

# public\cadence.svg

This is a file of the type: SVG Image

# public\vite.svg

This is a file of the type: SVG Image

# README.md

```md
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

```

# src\App.jsx

```jsx
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
```

# src\assets\react.svg

This is a file of the type: SVG Image

# src\index.css

```css
/* src/index.css */

/* --- CSS Variablen für Light & Dark Mode --- */
:root {
  /* Light Mode (Standard) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-editor: #ffffff;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-accent: #0d6efd;        /* Blau als Akzent */
  --text-accent-hover: #0b5ed7;  /* Dunkleres Blau für Hover */
  --border-color: #dee2e6;
  --border-color-subtle: #e9ecef;
  --shadow-color-rgb: 0, 0, 0;
  --focus-ring-color: rgba(13, 110, 253, 0.25);
  /* Define the color for the visible hyphen */
  --syllable-hyphen-color:rgb(255, 217, 0);
  --scrollbar-thumb: #ced4da;
  --scrollbar-track: var(--bg-secondary);
  --gutter-active-color: var(--text-accent); /* Farbe für aktive Gutter-Zahl */
  --error-color: #dc3545; /* Bootstrap danger color for errors */
  --warning-color: #ffc107; /* Bootstrap warning color */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark Mode */
    --bg-primary: #282c34;          /* Etwas helleres Dunkelgrau */
    --bg-secondary: #212529;        /* Noch dunkler für Body/Gutter */
    --bg-editor: #2e3238;           /* Editor etwas heller als Primary */
    --text-primary: #dfe1e4;        /* Helleres Grau statt fast weiß */
    --text-secondary: #9ea4ac;      /* Subtileres Sekundärgrau */
    --text-accent: #61afef;         /* Helleres, leicht entsättigtes Blau */
    --text-accent-hover: #84c0f7;   /* Heller für Hover */
    --border-color: #4b5159;        /* Angepasste Rahmenfarbe */
    --border-color-subtle: #3b4046; /* Subtiler */
    --shadow-color-rgb: 200, 200, 200; /* Heller Schatten RGB */
    --focus-ring-color: rgba(97, 175, 239, 0.3);
    /* Update dark mode hyphen color if needed */
    --syllable-hyphen-color:rgb(255, 183, 0);
    --scrollbar-thumb: #525861;
    --scrollbar-track: var(--bg-secondary);
    --gutter-active-color: var(--text-accent);
    --error-color: #f8d7da; /* Lighter red for dark mode */
    --warning-color: #fff3cd; /* Lighter yellow for dark mode */
  }
}

/* --- Globale Styles & Typografie --- */
body {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  padding: 20px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.65;
  transition: background-color 0.2s ease, color 0.2s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  max-width: 900px;
  margin: 40px auto;
  background-color: var(--bg-primary);
  padding: 40px 50px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(var(--shadow-color-rgb), 0.08);
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

/* --- Header mit Logo --- */
.app-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.app-logo {
  height: 50px;
  width: auto;
  margin-bottom: 15px;
}

h1 {
  text-align: center;
  color: var(--text-primary);
  margin: 0;
  font-weight: 700;
  font-size: 2rem;
  letter-spacing: -0.5px;
}
/* --- Ende Header --- */


.hinweis {
  text-align: center;
  font-size: 0.9em;
  color: var(--text-secondary);
  margin-top: 8px;
  margin-bottom: 40px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

/* --- Tiptap Editor Layout --- */
.editor-layout-tiptap {
  position: relative;
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: border-color 0.2s ease;
}

/* Editor Content Wrapper */
.editor-content-wrapper {
  flex-grow: 1;
  background-color: var(--bg-editor);
  border-top-right-radius: 9px;
  border-bottom-right-radius: 9px;
  transition: background-color 0.2s ease;
  /* Height grows naturally */
}

/* --- Tiptap/ProseMirror Editor Styling --- */
.ProseMirror {
  padding: 15px 25px;
  min-height: 350px;
  outline: none;
  line-height: 1.65;
  color: var(--text-primary);
  word-wrap: break-word;
  white-space: pre-wrap;
  -webkit-font-variant-ligatures: none;
  font-variant-ligatures: none;
  font-feature-settings: "liga" 0;
  position: relative;
  caret-color: var(--text-accent);
  transition: color 0.2s ease;
}

.ProseMirror p {
  margin: 0 0 1em 0;
  position: relative;
}

.ProseMirror p:last-child {
  margin-bottom: 0;
}

/* Gutter Container */
.editor-gutter {
  flex-shrink: 0;
  width: 45px;
  position: relative;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color-subtle);
  border-top-left-radius: 9px;
  border-bottom-left-radius: 9px;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  padding-top: 15px;
  box-sizing: border-box;
}

/* Individual Gutter Count Element */
.gutter-line-count {
  position: absolute;
  right: 5px;
  width: 35px;
  text-align: right;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.6;
  user-select: none;
  /* pointer-events: none; */ /* REMOVED for Tier 2 Accessibility */
  line-height: 1.65;
  transition: opacity 0.2s ease, color 0.2s ease, font-weight 0.2s ease;
}

.gutter-line-count.active-count {
  color: var(--gutter-active-color);
  font-weight: 600;
  opacity: 1;
}

/* TIER 2: Gutter Error State */
.gutter-line-count.error-count {
  color: var(--warning-color); /* Use warning color for uncertainty */
  font-weight: bold;
  opacity: 0.8;
}

/* --- Syllable Hyphen Styling (VISIBLE) --- */
.syllable-hyphen {
  /* The span itself is now empty and non-interactive */
  user-select: none;
  pointer-events: none;
  /* position: relative; */ /* Not needed for static ::after */
}

.syllable-hyphen::after {
  content: '-'; /* Ensure this is the character you want */
  position: static !important; /* Keep it in the text flow */
  color: var(--syllable-hyphen-color);
  opacity: 0.5; /* Or 1.0 for testing */
  pointer-events: none;
  user-select: none;
  /* Add minor adjustments if needed for visual alignment */
  /* display: inline-block; */ /* Might help stabilize layout */
  /* vertical-align: baseline; */ /* Or middle, etc. */
}
/* --- End Syllable Hyphen Styling --- */


/* Tiptap Focus State */
.ProseMirror:focus-visible {
  outline: none;
}
.ProseMirror:focus {
  outline: none;
}
.editor-layout-tiptap:has(.ProseMirror:focus) {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
  border-color: var(--text-accent);
}

/* --- TIER 1: Loading Indicator Style --- */
.processing-indicator {
  font-size: 0.8em;
  opacity: 0.7;
  animation: spin 1.5s linear infinite;
  display: inline-block; /* Needed for transform */
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* --- TIER 2: Error Message Style --- */
.error-message {
  color: var(--error-color);
  background-color: rgba(var(--shadow-color-rgb), 0.05); /* Subtle background */
  border: 1px solid var(--error-color);
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 0.85em;
  margin-bottom: 15px;
  text-align: center;
}
/* Slightly different warning color for processing errors */
.error-message:first-of-type { /* Assuming processing errors appear first */
   color: var(--warning-color);
   border-color: var(--warning-color);
}


/* --- Custom Scrollbar Styling (Webkit only) --- */
/* Apply to body or html if desired, removed from editor-content-wrapper */
body::-webkit-scrollbar {
  width: 10px;
}
body::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}
body::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 5px;
  border: 2px solid var(--scrollbar-track);
}
body::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-secondary);
}


/* --- Responsiveness --- */
@media (max-width: 768px) {
  body { padding: 15px; }
  .app-container { padding: 30px; margin: 20px auto; border-radius: 10px;}
  h1 { font-size: 1.8rem; }
  .app-logo { height: 45px; }
}

@media (max-width: 600px) {
  body { padding: 10px; }
  .app-container { padding: 20px; margin: 10px; border-radius: 8px; }
  .app-header { margin-bottom: 10px; }
  .app-logo { height: 40px; margin-bottom: 10px;}
  h1 { font-size: 1.6rem; }
  .hinweis { font-size: 0.85em; margin-bottom: 25px;}
  .editor-layout-tiptap {
     border-radius: 6px;
  }
  .editor-gutter {
    width: 35px;
    padding-top: 10px;
  }
  .gutter-line-count {
    width: 30px;
    right: 2px;
    font-size: 10px;
  }
  .ProseMirror {
    padding: 10px 15px;
    min-height: 40vh;
  }
  .editor-content-wrapper {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
}
```

# src\main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

# src\SyllableVisualizer.js

```js
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// --- Debugging Flag ---
const DEBUG_SYLLABLE_VISUALIZER = false; // Set to true for console logs from plugin
// --------------------

export const SyllableVisualizerPluginKey = new PluginKey('syllableVisualizer');

// Helper to create hyphen decorations
const createHyphenDecorations = (doc, points) => {
    const decorations = points.map(point => {
        if (point.type === 'hyphen') {
            if (DEBUG_SYLLABLE_VISUALIZER && (point.pos <= 0 || point.pos > doc.content.size)) {
                console.warn('[Hyphen Decorator] Invalid decoration position:', point.pos, 'Doc size:', doc.content.size);
                return null;
            }
            const validPos = Math.max(1, Math.min(point.pos, doc.content.size));
            return Decoration.widget(
                validPos,
                () => {
                    const span = document.createElement('span');
                    span.className = 'syllable-hyphen';
                    span.setAttribute('data-syllable-hyphen', 'true');
                    // Span is empty, visual rendering done via CSS ::after
                    span.textContent = '';
                    return span;
                },
                // --- CHANGE HERE: Use side 0 (default) or remove side option ---
                // { side: -1, marks: [], ignoreSelection: true } // Old value
                { side: 0, marks: [], ignoreSelection: true } // side: 0 is the default
                // Or explicitly: { side: 0, marks: [], ignoreSelection: true }
                // --- END CHANGE ---
            );
        }
        return null;
    }).filter(d => d !== null);
    return DecorationSet.create(doc, decorations);
};


/**
 * Custom Tiptap Extension to visually display syllable hyphens.
 */
export const SyllableVisualizer = Extension.create({
  name: 'syllableVisualizer',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SyllableVisualizerPluginKey,
        state: {
            init: (_, state) => {
                if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Init State.');
                return {
                    hyphenDecorations: DecorationSet.empty,
                    docVersion: state.doc.version,
                    hyphenPoints: [],
                };
            },
            apply: (tr, currentPluginState, oldEditorState, newEditorState) => {
                const meta = tr.getMeta(SyllableVisualizerPluginKey);
                let newState = { ...currentPluginState };
                let needsHyphenUpdate = false;

                if (meta && meta.points !== undefined) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.points.length} hyphen points via meta.`);
                    newState.hyphenPoints = meta.points;
                    needsHyphenUpdate = true;
                }

                if (needsHyphenUpdate) {
                    newState.hyphenDecorations = createHyphenDecorations(newEditorState.doc, newState.hyphenPoints || []);
                }
                else if (tr.docChanged) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, mapping old hyphen decorations.');
                    newState.hyphenDecorations = currentPluginState.hyphenDecorations.map(tr.mapping, newEditorState.doc);
                }

                newState.docVersion = newEditorState.doc.version;

                return newState;
            }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            if (!pluginState) {
              return null;
            }
            if (DEBUG_SYLLABLE_VISUALIZER && pluginState.hyphenDecorations.find().length > 0) {
              // console.log(`[SyllableVisualizer Plugin] Decorations func: Returning Set with ${pluginState.hyphenDecorations.find().length} hyphen decorations.`);
            }
            return pluginState.hyphenDecorations;
          },
        },
      }),
    ];
  },
});

export default SyllableVisualizer;
```

# src\utils\syllableProcessor.js

```js
import { hyphenate } from 'hyphen/de';
import { SyllableVisualizerPluginKey } from '../SyllableVisualizer';

// Ensure parameter order matches the call site in App.jsx
export const processTextLogic = async (
    editor,               // 1st arg
    setLineCounts,        // 2nd arg
    setGutterData,        // 3rd arg
    setIsProcessing,      // 4th arg
    setProcessingErrors,  // 5th arg
    DEBUG_MODE = false    // 6th arg
) => {
  // Check if editor is valid BEFORE trying to use state setters
  if (!editor || !editor.state || !editor.isEditable) {
    if (DEBUG_MODE) console.log("[ProcessTextLogic] Skipping: Editor not ready or not editable.");
    if(typeof setIsProcessing === 'function') setIsProcessing(false);
    return;
  }

  // Check if setters are functions *before* calling them
  if (typeof setIsProcessing !== 'function' || typeof setGutterData !== 'function' || typeof setProcessingErrors !== 'function') {
      console.error("[ProcessTextLogic] ERROR: One or more state setters are not functions!", {
          setIsProcessing: typeof setIsProcessing,
          setGutterData: typeof setGutterData,
          setProcessingErrors: typeof setProcessingErrors,
      });
      if(typeof setIsProcessing === 'function') setIsProcessing(false);
      return;
  }

  // Now it's safe to call the setters
  setIsProcessing(true);
  setGutterData([]);
  setProcessingErrors([]);

  const failedWords = [];
  let pointErrors = 0;
  const timestamp = Date.now();
  if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Starting async processing...`);

  try {
    const { state } = editor;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    const wordCache = new Map();

    // --- Pass 1: Hyphenate unique words, build cache, calculate decoration points ---
    const textNodes = [];
    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            textNodes.push({ node, pos });
        }
    });

    for (const { node, pos } of textNodes) {
        const nodeStartPos = pos + 1; // ProseMirror positions are often 1-based after node start
        let currentSegmentStartIndex = 0;
        const segments = node.text.split(/(\s+)/); // Split by whitespace, keeping delimiters

        for (const segment of segments) {
            const segmentLength = segment.length;
            if (!segment || /^\s+$/.test(segment)) {
                currentSegmentStartIndex += segmentLength; // Advance past whitespace
                continue;
            }

            // --- FIX: Robust Word Extraction and Indexing ---
            // Match the core word characters (\w includes letters, numbers, underscore)
            // and capture its start index within the current segment.
            // This regex handles leading/trailing non-word chars.
            const wordMatch = segment.match(/^(\W*)(\w+)(\W*)$/);

            if (wordMatch) {
                const leadingChars = wordMatch[1] || '';
                const coreWord = wordMatch[2]; // This is the word to hyphenate
                //const trailingChars = wordMatch[3] || ''; // We don't need trailing chars for positioning
                const coreWordStartIndexInSegment = leadingChars.length; // Index where core word starts in the segment

                if (coreWord && coreWord.length >= 3) { // Only process words of sufficient length
                    let hyphenationResult = wordCache.get(coreWord);

                    if (!hyphenationResult) {
                        try {
                            const hyphenated = await hyphenate(coreWord, { hyphenChar: '\u00AD', minWordLength: 3 });
                            const hyphenPositions = [];
                            let charIndex = 0;
                            for (let i = 0; i < hyphenated.length; i++) {
                              if (hyphenated[i] === '\u00AD') {
                                hyphenPositions.push(charIndex);
                              } else {
                                charIndex++;
                              }
                            }
                            const syllableCount = hyphenPositions.length + 1;
                            hyphenationResult = { positions: hyphenPositions, count: syllableCount };
                            wordCache.set(coreWord, hyphenationResult);
                        } catch (e) {
                            console.warn(`[ProcessTextLogic Run ${timestamp}] Hyphenation error on word "${coreWord}":`, e.message);
                            hyphenationResult = { positions: [], count: 1 };
                            wordCache.set(coreWord, hyphenationResult);
                            failedWords.push(coreWord);
                        }
                    }

                    // --- FIX: Correct Absolute Position Calculation ---
                    hyphenationResult.positions.forEach(relativePos => {
                        // absolutePos = start of node + start of segment in node + start of core word in segment + relative position in core word
                        const absolutePos = nodeStartPos + currentSegmentStartIndex + coreWordStartIndexInSegment + relativePos;

                        if (absolutePos > 0 && absolutePos <= doc.content.size) {
                            newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                        } else {
                            if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Invalid absolutePos calculated: ${absolutePos} for word '${coreWord}', relativePos ${relativePos}. Doc size: ${doc.content.size}`);
                            pointErrors++;
                        }
                    });
                }
            }
            // --- End of Fix ---

            // Advance index for the next segment
            currentSegmentStartIndex += segmentLength;
        } // End loop through segments
    } // End loop through textNodes
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Hyphenation errors: ${failedWords.length}, Point errors: ${pointErrors}`);


    // --- Pass 2: Calculate paragraph syllable counts ---
    doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
            let paragraphSyllableCount = 0;
            const paragraphNodePos = pos;

            // Iterate through actual words more reliably
            node.forEach(childNode => {
                if(childNode.isText && childNode.text) {
                    // Match words within this text node
                     const words = childNode.text.match(/\b\w+\b/g) || []; // Use \w+ to match word characters
                     words.forEach(word => {
                         if(word.length >= 3) { // Check length again for consistency
                            const cachedResult = wordCache.get(word);
                            paragraphSyllableCount += cachedResult ? cachedResult.count : 1;
                         } else if (word.length > 0) {
                             paragraphSyllableCount += 1; // Count short words as 1 syllable
                         }
                    });
                }
            });

            newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount });
        }
    });
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);


    // --- Update State and Plugin ---
     if (typeof setLineCounts === 'function') setLineCounts(newLineCounts);
     if (typeof setProcessingErrors === 'function') setProcessingErrors(failedWords);

    if (editor && !editor.isDestroyed) {
        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Dispatching transaction with ${newDecorationPoints.length} points.`);
        const tr = editor.state.tr;
        // Send potentially empty points array if no hyphens found
        tr.setMeta(SyllableVisualizerPluginKey, { points: newDecorationPoints });
        if (editor.view && !editor.view.isDestroyed) {
            editor.view.dispatch(tr);
        } else {
            if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Editor view destroyed before dispatch.`);
        }
    } else {
        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Editor destroyed before dispatching transaction.`);
    }

  } catch (error) {
      console.error(`[ProcessTextLogic Run ${timestamp}] Unexpected error during processing:`, error);
      if (typeof setProcessingErrors === 'function') setProcessingErrors(["General processing error"]);
      if (typeof setLineCounts === 'function') setLineCounts([]);
      if (typeof setGutterData === 'function') setGutterData([]);
  } finally {
    if (typeof setIsProcessing === 'function') setIsProcessing(false);
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Setting isProcessing = false (in finally)`);
  }
};
```

# vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

```

