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
  "homepage": "https://opj161.github.io/cadence/",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "dependencies": {
    "@tiptap/react": "^2.11.5",
    "@tiptap/starter-kit": "^2.11.5",
    "hyphen": "^1.10.6",
    "lodash.debounce": "^4.0.8",
    "prosemirror-state": "^1.4.3",  
    "prosemirror-view": "^1.39.1",   
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
    "gh-pages": "^6.1.1",
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

const DEBUG_APP = true; // Enable debug logging

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

   const debouncedProcessText = useRef(debounce(processText, 500)).current;

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
               if (DEBUG_APP) console.warn(`%c[Gutter Calc] Error line ${index+1}: NodePos ${line.nodePos}. Error: ${error.message}. nodeDOM result:`, "color: red", nodeElement);
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
       {DEBUG_APP && <p style={{color: 'orange', textAlign: 'center'}}><b>[Debug-Modus Aktiv]</b> - Überprüfen Sie die Browser-Konsole für Details.</p>}
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
```

# src\assets\react.svg

This is a file of the type: SVG Image

# src\index.css

```css
/* src/index.css */

/* ==========================================================================
   Variables (Light & Dark Mode)
   ========================================================================== */

   :root {
    /* Light Mode (Standard) */
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --bg-editor: #ffffff;
    --text-primary: #212529;
    --text-secondary: #6c757d;
    --text-accent: #0d6efd;        /* Blue accent */
    --text-accent-hover: #0b5ed7;  /* Darker blue for hover */
    --border-color: #dee2e6;
    --border-color-subtle: #e9ecef;
    --shadow-color-rgb: 0, 0, 0;
    --focus-ring-color: rgba(13, 110, 253, 0.25);
    --syllable-hyphen-color: rgb(255, 217, 0); /* Yellowish */
    --scrollbar-thumb: #ced4da;
    --scrollbar-track: var(--bg-secondary);
    --gutter-active-color: var(--text-accent); /* Active gutter number color */
    --error-color: #dc3545; /* Bootstrap danger red */
    --warning-color: #ffc107; /* Bootstrap warning yellow */
  }
  
  @media (prefers-color-scheme: dark) {
    :root {
      /* Dark Mode */
      --bg-primary: #282c34;
      --bg-secondary: #212529;
      --bg-editor: #2e3238;
      --text-primary: #dfe1e4;
      --text-secondary: #9ea4ac;
      --text-accent: #61afef;        /* Lighter blue accent */
      --text-accent-hover: #84c0f7;
      --border-color: #4b5159;
      --border-color-subtle: #3b4046;
      --shadow-color-rgb: 200, 200, 200;
      --focus-ring-color: rgba(97, 175, 239, 0.3);
      --syllable-hyphen-color: rgb(255, 183, 0); /* Orangey-yellow */
      --scrollbar-thumb: #525861;
      --scrollbar-track: var(--bg-secondary);
      --gutter-active-color: var(--text-accent);
      --error-color: #f8d7da; /* Lighter red for dark mode */
      --warning-color: #fff3cd; /* Lighter yellow for dark mode */
    }
  }
  
  /* ==========================================================================
     Global Styles & Typography
     ========================================================================== */
  
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
  
  /* ==========================================================================
     Header & Intro Text
     ========================================================================== */
  
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
  
  /* ==========================================================================
     Editor Layout (Tiptap)
     ========================================================================== */
  
  .editor-layout-tiptap {
    position: relative;
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    transition: border-color 0.2s ease;
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
    padding-top: 15px; /* Align roughly with editor padding */
    box-sizing: border-box;
  }
  
  /* Editor Content Wrapper */
  .editor-content-wrapper {
    flex-grow: 1;
    background-color: var(--bg-editor);
    border-top-right-radius: 9px;
    border-bottom-right-radius: 9px;
    transition: background-color 0.2s ease;
  }
  
  /* ==========================================================================
     ProseMirror Editor Core Styles
     ========================================================================== */
  
  .ProseMirror {
    padding: 15px 25px;
    min-height: 350px;
    outline: none;
    line-height: 1.65; /* Match body/gutter line-height */
    color: var(--text-primary);
    word-wrap: break-word;
    white-space: pre-wrap;
    -webkit-font-variant-ligatures: none;
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0; /* Prevent ligatures from interfering with spacing/measurement */
    position: relative; /* Needed for absolute positioning within if required */
    caret-color: var(--text-accent);
    transition: color 0.2s ease;
  }
  
  /* Default Paragraph Spacing */
  .ProseMirror p {
    margin: 0 0 1em 0; /* Add space below paragraphs */
    position: relative; /* For potential absolute children later */
  }
  
  /* Remove margin from the very last paragraph */
  .ProseMirror p:last-child {
    margin-bottom: 0;
  }
  
  /* ** FIX: Remove bottom margin from empty paragraphs to prevent excessive spacing ** */
  .ProseMirror p:empty {
    margin: 0;
    padding: 0;
    height: 0.5em; /* Reduce from default line-height */
    min-height: 0.5em; /* Ensure consistent height */
  }
  
  /* Editor Focus Ring */
  .ProseMirror:focus-visible {
    outline: none; /* Disable default browser outline */
  }
  .ProseMirror:focus {
    outline: none; /* Fallback for browsers not supporting :focus-visible */
  }
  .editor-layout-tiptap:has(.ProseMirror:focus) {
    outline: 2px solid var(--focus-ring-color);
    outline-offset: 2px;
    border-color: var(--text-accent);
  }
  
  /* ==========================================================================
     Gutter Line Numbers
     ========================================================================== */
  
  .gutter-line-count {
    position: absolute;
    right: 5px;
    width: 35px; /* Ensure enough space for numbers like [100] */
    text-align: right;
    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.6;
    user-select: none; /* Prevent selection */
    line-height: 1.65; /* Match editor line-height for alignment */
    transition: opacity 0.2s ease, color 0.2s ease, font-weight 0.2s ease, transform 0.1s ease;
    padding-top: 0; /* Adjust if paragraph has top padding */
    box-sizing: border-box;
    transform-origin: top right; /* Scale from top right */
  }
  
  /* Active Line Highlight */
  .gutter-line-count.active-count {
    color: var(--gutter-active-color);
    font-weight: 600;
    opacity: 1;
    transform: scale(1.1); /* Slightly larger when active */
  }
  
  /* Error State (e.g., position calculation failed) */
  .gutter-line-count.error-count {
    color: var(--warning-color); /* Use warning color for uncertainty */
    font-weight: bold;
    opacity: 0.8;
  }
  
  /* ==========================================================================
     Syllable Hyphen Visualization
     ========================================================================== */
  
  .syllable-hyphen {
    /* The span itself is now just an inline marker */
    display: inline;
    user-select: none;
    pointer-events: none;
  }
  
  .syllable-hyphen::after {
    content: '-'; /* The visual hyphen */
    position: static !important; /* Ensure it stays in text flow */
    display: inline;
    color: var(--syllable-hyphen-color);
    opacity: 0.6; /* Make it slightly subtle */
    pointer-events: none;
    user-select: none;
    /* Optional: Adjust vertical alignment slightly if needed */
    /* vertical-align: middle; */
  }
  
  /* ==========================================================================
     Lyric Structure Formatting (Headers, Chords, Comments)
     ========================================================================== */
  
  /* Header Styling ([Verse 1], [Hook], etc.) */
  .ProseMirror p.lyric-header,
  .ProseMirror .lyric-header > p /* Handle potential nesting if schema changes */
  {
    font-weight: bold;
    color: var(--text-accent);
    margin-top: 1em; /* Space above headers */
    margin-bottom: 0.5em; /* Slightly less space below headers */
    margin-left: 0 !important; /* Override potential indentation */
  }
  
  /* Add a small top margin to headers that follow non-empty paragraphs */
  .ProseMirror p:not(:empty) + p.lyric-header {
    margin-top: 0.5em;
  }
  
  /* Chord Styling ([G], [Am], etc.) */
  .ProseMirror .lyric-chord {
    /* Use accent colors, slightly muted */
    color: var(--text-accent-hover);
    font-weight: 500;
    font-family: 'Courier New', Courier, monospace;
    background-color: rgba(var(--text-accent), 0.1); /* Subtle background using alpha */
    padding: 0.05em 0.2em;
    border-radius: 3px;
    font-size: 0.9em;
  }
  
  /* Comment Styling (# This is a comment) */
  .ProseMirror p.lyric-comment {
    color: var(--text-secondary);
    font-style: italic;
    opacity: 0.75;
    margin-left: 0 !important; /* Override potential indentation */
  }
  
  /* ==========================================================================
     UI Indicators (Loading, Errors)
     ========================================================================== */
  
  /* Loading Indicator (Spinning Gear) */
  .processing-indicator {
    font-size: 0.8em;
    opacity: 0.7;
    animation: spin 1.5s linear infinite;
    display: inline-block; /* Needed for transform/animation */
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  /* Error Message Box Styles */
  .error-message {
    border: 1px solid var(--error-color); /* Default to error color */
    color: var(--error-color);
    background-color: rgba(var(--shadow-color-rgb), 0.05); /* Subtle background */
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 0.85em;
    margin-bottom: 15px;
    text-align: center;
  }
  
  /* Specific style for the *first* error message (assumed to be processing warnings) */
  .error-message:first-of-type {
     color: var(--warning-color);
     border-color: var(--warning-color);
  }
  
  /* ==========================================================================
     Custom Scrollbar (Webkit only)
     ========================================================================== */
  
  body::-webkit-scrollbar {
    width: 10px;
  }
  body::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }
  body::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: 5px;
    border: 2px solid var(--scrollbar-track); /* Creates padding around thumb */
  }
  body::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-secondary); /* Darken thumb on hover */
  }
  
  /* ==========================================================================
     Responsiveness
     ========================================================================== */
  
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
      width: 35px; /* Reduce gutter width */
      padding-top: 10px; /* Match reduced editor padding */
    }
    .gutter-line-count {
      width: 30px; /* Adjust count width */
      right: 2px;  /* Adjust position */
      font-size: 10px; /* Slightly smaller font */
    }
    .ProseMirror {
      padding: 10px 15px; /* Reduce editor padding */
      min-height: 40vh; /* Use viewport height for min height */
    }
    .editor-content-wrapper {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
  }
```

# src\LyricStructure.js

```js
// src/LyricStructure.js
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const LyricStructurePluginKey = new PluginKey('lyricStructureDecorations');
const SpacingCheckNeededKey = new PluginKey('lyricStructureSpacingCheck');

const headerRegex = /^\[([^\]]+)\]$/;
const chordRegex = /(\[[A-Ga-g][#b]?(?:maj|min|m|M|dim|aug|sus|add|m7|maj7|7|9|11|13)?(?:\/[A-Ga-g][#b]?)?\])/g;
const commentRegex = /^(#|\/\/).*$/;

const DEBUG_LYRIC_STRUCTURE = true; // Keep debug logs for now

// findDecorations remains the same...
function findDecorations(doc) {
    const decorations = [];
    const processedParagraphs = new Set();

    doc.descendants((node, pos) => {
        if (node.isBlock && !processedParagraphs.has(pos)) {
            const paragraphText = node.textContent;
            const currentBlockPos = pos;
            if (headerRegex.test(paragraphText.trim())) {
                decorations.push(Decoration.node(currentBlockPos, currentBlockPos + node.nodeSize, { class: 'lyric-header' }));
                processedParagraphs.add(currentBlockPos);
                 // if (DEBUG_LYRIC_STRUCTURE) console.log(`[LyricStructure Decorator] Found Header at ${currentBlockPos}: "${paragraphText.substring(0,20)}..."`);
            } else if (commentRegex.test(paragraphText.trim())) {
                decorations.push(Decoration.node(currentBlockPos, currentBlockPos + node.nodeSize, { class: 'lyric-comment' }));
                processedParagraphs.add(currentBlockPos);
            }
        }

        if (node.isText) {
             const resolvedTextPos = doc.resolve(pos);
             let parentBlockPos = pos;
             for (let d = resolvedTextPos.depth; d > 0; d--) {
                const ancestorNode = resolvedTextPos.node(d);
                if(ancestorNode.isBlock) {
                    parentBlockPos = resolvedTextPos.start(d);
                    break;
                }
             }

             if (!processedParagraphs.has(parentBlockPos)) {
                const text = node.text;
                let match;
                while ((match = chordRegex.exec(text)) !== null) {
                    const start = pos + match.index;
                    const end = start + match[0].length;
                    if (start >= pos && end <= pos + node.nodeSize) {
                        decorations.push(Decoration.inline(start, end, { class: 'lyric-chord' }));
                    } else {
                       if (DEBUG_LYRIC_STRUCTURE) console.warn(`[LyricStructure Decorator] Invalid chord decoration range: ${start}-${end} for text node at ${pos}`);
                    }
                }
             }
        }
    });
    // if (DEBUG_LYRIC_STRUCTURE && decorations.length > 0) console.log(`[LyricStructure Decorator] Created ${decorations.length} decorations.`);
    return DecorationSet.create(doc, decorations);
}


export const LyricStructure = Extension.create({
    name: 'lyricStructure',

    addProseMirrorPlugins() {
        if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure] Adding ProseMirror plugins...");
        return [
            // Plugin for Decorations & Signaling Spacing Check
            new Plugin({
                key: LyricStructurePluginKey,
                state: {
                    init(_, { doc }) {
                         if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Init]");
                        return findDecorations(doc);
                    },
                    apply(tr, oldSet, oldState, newState) {
                         if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply Start]", { docChanged: tr.docChanged, selectionSet: tr.selectionSet });

                        if (tr.docChanged) {
                            if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] Document changed. Checking for headers...");
                            // --- MODIFICATION: Collect all affected header positions ---
                            const headersToCheck = new Set();
                            tr.steps.forEach((step) => {
                                // if (DEBUG_LYRIC_STRUCTURE) console.log(`[LyricStructure Plugin 1: Apply] Processing Step ${stepIndex}`);
                                step.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
                                    // if (DEBUG_LYRIC_STRUCTURE) console.log(`[LyricStructure Plugin 1: Apply] Step Map: ${oldStart},${oldEnd} -> ${newStart},${newEnd}`);
                                    newState.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                                        // if (DEBUG_LYRIC_STRUCTURE && node.isBlock) console.log(`[LyricStructure Plugin 1: Apply] Checking node at ${pos}: ${node.type.name}, text: "${node.textContent.substring(0,20)}..."`);
                                        if (node.isBlock && headerRegex.test(node.textContent.trim())) {
                                            // Store the position of the header block itself
                                            headersToCheck.add(pos);
                                            if (DEBUG_LYRIC_STRUCTURE) console.log(`%c[LyricStructure Plugin 1: Apply] Found potential header to check at pos: ${pos}`, "color: blue; font-weight: bold;");
                                            return false; // Stop searching deeper in this branch
                                        }
                                    });
                                });
                            });

                            // --- MODIFICATION: Set metadata if any headers were found ---
                            if (headersToCheck.size > 0) {
                                 const positionsArray = Array.from(headersToCheck);
                                 if (DEBUG_LYRIC_STRUCTURE) console.log(`%c[LyricStructure Plugin 1: Apply] Setting SpacingCheckNeededKey metadata for positions: ${positionsArray.join(', ')}`, "color: green; font-weight: bold;");
                                tr.setMeta(SpacingCheckNeededKey, { checkPositions: positionsArray }); // Pass array
                            } else {
                                 if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] No relevant header found in changes.");
                            }
                            // --- END MODIFICATIONS ---

                            if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] Recalculating decorations due to doc change.");
                            return findDecorations(newState.doc);
                        }

                        if (tr.mapping && oldSet && !tr.docChanged) {
                            if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] Mapping old decorations.");
                           return oldSet.map(tr.mapping, tr.doc);
                        }

                        if (tr.selectionSet && !tr.docChanged) {
                             if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] Selection changed, returning old decorations.");
                            return oldSet;
                        }

                        if (DEBUG_LYRIC_STRUCTURE) console.log("[LyricStructure Plugin 1: Apply] No relevant change, returning old decorations.");
                        return oldSet;
                    },
                },
                props: {
                    decorations(state) {
                         const decorationSet = this.getState(state);
                         // if (DEBUG_LYRIC_STRUCTURE && decorationSet?.find().length) console.log(`[LyricStructure Plugin 1: Props] Providing ${decorationSet.find().length} decorations.`);
                         return decorationSet;
                    },
                },
            }),

            // Separate Plugin logic (via appendTransaction) for Spacing Checks
            new Plugin({
                key: SpacingCheckNeededKey,
                appendTransaction: (transactions, oldState, newState) => {
                     if (DEBUG_LYRIC_STRUCTURE) console.log(`[Spacing Check: appendTransaction] Running for ${transactions.length} transaction(s).`);
                    let spacingTr = null; // Hold potential transaction for spacing changes

                    transactions.forEach((tr, index) => {
                         if (DEBUG_LYRIC_STRUCTURE) console.log(`[Spacing Check: appendTransaction] Examining transaction ${index}`);
                        // --- MODIFICATION: Check for checkPositions array ---
                        const meta = tr.getMeta(SpacingCheckNeededKey);
                         if (DEBUG_LYRIC_STRUCTURE) console.log(`[Spacing Check: appendTransaction] Meta for transaction ${index}:`, meta);

                        if (meta && meta.checkPositions && Array.isArray(meta.checkPositions)) {
                             if (DEBUG_LYRIC_STRUCTURE) console.log(`%c[Spacing Check: appendTransaction] Found checkPositions in meta: ${meta.checkPositions.join(', ')}`, "color: orange; font-weight: bold;");

                            // --- MODIFICATION: Iterate through each position ---
                            // Sort positions descending to avoid position shifts from insertions affecting later checks in the same transaction
                            const sortedPositions = meta.checkPositions.slice().sort((a, b) => b - a);

                            sortedPositions.forEach(pos => {
                                if (DEBUG_LYRIC_STRUCTURE) console.log(`[Spacing Check: appendTransaction] --- Checking position ${pos} ---`);

                                // Use the *current* state of the document *within this potential spacing transaction*
                                // If spacingTr is null, use newState.doc, otherwise use spacingTr.doc
                                const currentDoc = spacingTr ? spacingTr.doc : newState.doc;
                                const currentMapping = spacingTr ? spacingTr.mapping : null; // Need mapping if transaction exists

                                // Map the original position 'pos' if a spacing transaction already exists
                                const mappedPos = currentMapping ? currentMapping.map(pos) : pos;

                                // Safety Check on the potentially mapped position
                                if (mappedPos < 0 || mappedPos > currentDoc.content.size) {
                                    console.warn(`[Spacing Check: appendTransaction] Ignoring out-of-bounds position check: ${pos} (mapped to ${mappedPos}), document size: ${currentDoc.content.size}`);
                                    return; // Skip this position
                                }

                                // Resolve using the potentially mapped position and current document state
                                const resolvedPos = currentDoc.resolve(mappedPos);
                                const nodeBefore = resolvedPos.nodeBefore;

                                // Add more detailed logging for nodeBefore
                                if (DEBUG_LYRIC_STRUCTURE) {
                                    console.log('[Spacing Check: appendTransaction] Resolved Pos:', resolvedPos);
                                    if(nodeBefore) {
                                        console.log('[Spacing Check: appendTransaction] Node Before Type:', nodeBefore.type.name);
                                        console.log('[Spacing Check: appendTransaction] Node Before isTextblock:', nodeBefore.isTextblock);
                                        console.log('[Spacing Check: appendTransaction] Node Before Text Content:', `"${nodeBefore.textContent}"`);
                                        console.log('[Spacing Check: appendTransaction] Node Before Trimmed Text:', `"${nodeBefore.textContent.trim()}"`);
                                    } else {
                                         console.log('[Spacing Check: appendTransaction] Node Before: null (Likely start of document)');
                                    }
                                }

                                // Condition: Insert if not at start, nodeBefore exists, AND nodeBefore is NOT an empty paragraph
                                const shouldInsert = mappedPos > 0 && nodeBefore && (!nodeBefore.isTextblock || nodeBefore.textContent.trim() !== '');
                                 if (DEBUG_LYRIC_STRUCTURE) console.log('[Spacing Check: appendTransaction] Should insert condition met:', shouldInsert);

                                if (shouldInsert) {
                                    const emptyPara = currentDoc.type.schema.nodes.paragraph.createAndFill(); // Use currentDoc's schema
                                    if (emptyPara) {
                                        // Lazily create the spacing transaction only if needed
                                        if (!spacingTr) {
                                            // Start based on newState, as this is the first modification
                                            spacingTr = newState.tr;
                                             if (DEBUG_LYRIC_STRUCTURE) console.log('[Spacing Check: appendTransaction] Created new spacing transaction.');
                                        }
                                         if (DEBUG_LYRIC_STRUCTURE) console.log(`%c[Spacing Check: appendTransaction] Inserting empty paragraph at mapped pos ${mappedPos}`, "color: purple; font-weight: bold;");
                                        // Insert at the potentially mapped position
                                        spacingTr.insert(mappedPos, emptyPara);
                                    } else {
                                         if (DEBUG_LYRIC_STRUCTURE) console.warn('[Spacing Check: appendTransaction] Failed to create empty paragraph node!');
                                    }
                                }
                                 if (DEBUG_LYRIC_STRUCTURE) console.log(`[Spacing Check: appendTransaction] --- Finished checking position ${pos} ---`);
                            });
                            // --- END Iteration ---
                        } else {
                             if (DEBUG_LYRIC_STRUCTURE && !(meta && meta.checkPositions === undefined)) { // Log only if meta exists but no checkPositions
                                console.log(`[Spacing Check: appendTransaction] No checkPositions array found in meta for transaction ${index}.`);
                             } else if (DEBUG_LYRIC_STRUCTURE && meta === undefined){
                                 // console.log(`[Spacing Check: appendTransaction] No meta found for transaction ${index}.`); // Less verbose
                             }
                        }
                    }); // End loop through transactions

                    if (DEBUG_LYRIC_STRUCTURE && spacingTr) console.log('%c[Spacing Check: appendTransaction] Returning spacing transaction.', "color: green;");
                    else if (DEBUG_LYRIC_STRUCTURE && !spacingTr) console.log('[Spacing Check: appendTransaction] No spacing transaction needed/created.');

                    return spacingTr; // Return the transaction with spacing changes, or null
                }
            })
        ];
    },
});

export default LyricStructure;
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
            // Ensure position is valid within the document boundaries
            const validPos = Math.max(1, Math.min(point.pos, doc.content.size));

            return Decoration.widget(
                validPos,
                () => {
                    const span = document.createElement('span');
                    span.className = 'syllable-hyphen';
                    span.setAttribute('data-syllable-hyphen', 'true');
                    // The span itself is empty; the visual hyphen comes from CSS ::after
                    span.textContent = '';
                    return span;
                },
                 // Use side: 0 (default) or remove side option.
                 // This places the widget *after* the character at validPos,
                 // which often works better for inter-character elements than side: -1.
                { marks: [], ignoreSelection: true }
                // Explicitly: { side: 0, marks: [], ignoreSelection: true }
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
                // Initial calculation can be done here if needed, or rely on first update
                const initialPoints = []; // Or calculate initial points if desired
                return {
                    hyphenDecorations: createHyphenDecorations(state.doc, initialPoints),
                    docVersion: state.doc.version,
                    hyphenPoints: initialPoints, // Store initial points
                };
            },
            apply: (tr, currentPluginState, oldEditorState, newEditorState) => {
                const meta = tr.getMeta(SyllableVisualizerPluginKey);
                let newState = { ...currentPluginState }; // Clone state
                let needsHyphenUpdate = false;

                 // Check if points were passed via metadata
                if (meta && meta.points !== undefined) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.points.length} points via meta.`);
                     // Basic check if points actually changed to avoid unnecessary updates
                     if (JSON.stringify(meta.points) !== JSON.stringify(newState.hyphenPoints)) {
                         newState.hyphenPoints = meta.points;
                         needsHyphenUpdate = true;
                     }
                } else if (tr.docChanged) {
                    // If doc changed but no new points, map existing decorations
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, mapping old hyphen decorations.');
                    newState.hyphenDecorations = currentPluginState.hyphenDecorations.map(tr.mapping, newEditorState.doc);
                    // Also map the stored points if needed for comparison later
                    newState.hyphenPoints = currentPluginState.hyphenPoints
                        .map(point => ({ ...point, pos: tr.mapping.map(point.pos) }))
                        .filter(point => point.pos <= newEditorState.doc.content.size); // Filter out points outside the new doc
                }


                // If new points were received, recalculate decorations
                if (needsHyphenUpdate) {
                     if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Recalculating decorations for ${newState.hyphenPoints.length} points.`);
                    newState.hyphenDecorations = createHyphenDecorations(newEditorState.doc, newState.hyphenPoints);
                }

                 // Always update doc version
                newState.docVersion = newEditorState.doc.version;

                // Only return newState if something actually changed to avoid unnecessary re-renders
                if (needsHyphenUpdate || tr.docChanged || newState.docVersion !== currentPluginState.docVersion) {
                    return newState;
                }

                // If nothing changed relevant to this plugin, return the old state
                return currentPluginState;

            }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            if (!pluginState) {
              return DecorationSet.empty; // Return empty set instead of null
            }
            // if (DEBUG_SYLLABLE_VISUALIZER && pluginState.hyphenDecorations.find().length > 0) {
            //    console.log(`[SyllableVisualizer Plugin] Decorations func: Returning Set with ${pluginState.hyphenDecorations.find().length} hyphen decorations.`);
            // }
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

// Regex for headers (used to skip hyphenation)
const headerRegex = /^\[([^\]]+)\]$/;

// Ensure parameter order matches the call site in App.jsx
export const processTextLogic = async (
    editor,               // 1st arg
    setLineCounts,        // 2nd arg
    setGutterData,        // 3rd arg
    setIsProcessing,      // 4th arg
    setProcessingErrors,  // 5th arg
    DEBUG_MODE = false    // 6th arg
) => {
  // ... (initial checks remain the same) ...

  setIsProcessing(true);
  setGutterData([]); // Clear gutter data
  setProcessingErrors([]); // Clear processing errors

  const failedWords = [];
  let pointErrors = 0;
  const timestamp = Date.now();
  if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Starting async processing... Setting isProcessing = true, Cleared Data`);

  try {
    const { state } = editor;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    const wordCache = new Map();

    // --- Pass 1: Hyphenate unique words, build cache, calculate decoration points ---
    const textNodes = [];
    doc.descendants((node, pos) => {
        // *** ADD CHECK FOR HEADER PARENT ***
        const parent = node.isText ? doc.resolve(pos).parent : null;
        const parentIsHeader = parent && parent.type.name === 'paragraph' && headerRegex.test(parent.textContent.trim());

        // Only process text nodes that are NOT inside a header paragraph
        if (node.isText && node.text && !parentIsHeader) {
            textNodes.push({ node, pos });
        } else if (node.isText && node.text && parentIsHeader) {
             if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Skipping hyphenation for header line: "${parent.textContent}"`);
        }
    });


    for (const { node, pos } of textNodes) {
        const nodeStartPos = pos + 1; // Position inside the text node
        let currentWordStartIndex = 0;
        // Split by spaces AND punctuation attached to words for better word identification
        const segments = node.text.split(/(\s+|[.,!?;:]+(?=\s|$))/);


        for (const segment of segments) {
             // Skip empty segments, pure whitespace, or pure punctuation segments
             if (!segment || /^\s+$/.test(segment) || /^[.,!?;:]+$/.test(segment)) {
                currentWordStartIndex += segment.length;
                continue;
            }

            const word = segment;
            const wordStartPosInNode = currentWordStartIndex;
            // Match word, allowing potential leading/trailing punctuation handled by split
            const cleanWordMatch = word.match(/^([^.,!?;:]*)(.*?)$/);
            const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;


            if (cleanWord && cleanWord.length >= 3) { // Keep hyphenation check
                let hyphenationResult = wordCache.get(cleanWord);
                if (!hyphenationResult) {
                    try {
                        // Use soft hyphen for internal calculation
                        const hyphenated = await hyphenate(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
                        const hyphenPositions = [];
                        let charIndex = 0;
                        // Count hyphen positions relative to the clean word
                        for (let i = 0; i < hyphenated.length; i++) {
                          if (hyphenated[i] === '\u00AD') {
                             hyphenPositions.push(charIndex);
                          } else {
                             charIndex++;
                          }
                        }
                        // Syllable count is based on clean word hyphenation
                        const syllableCount = hyphenPositions.length + 1;
                        hyphenationResult = { positions: hyphenPositions, count: syllableCount };
                        wordCache.set(cleanWord, hyphenationResult);
                    } catch (e) {
                        if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Hyphenation error on word "${cleanWord}":`, e.message);
                        hyphenationResult = { positions: [], count: 1 }; // Default to 1 syllable on error
                        wordCache.set(cleanWord, hyphenationResult);
                        failedWords.push(cleanWord);
                    }
                }
                 // Calculate absolute position for decoration based on word start and relative hyphen pos
                 hyphenationResult.positions.forEach(relativePos => {
                  // Ensure absolute position is within document bounds
                  const absolutePos = nodeStartPos + wordStartPosInNode + relativePos;
                  if (absolutePos > 0 && absolutePos <= doc.content.size) {
                     newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                  } else {
                    if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Invalid absolutePos calculated: ${absolutePos} for word '${cleanWord}', relativePos ${relativePos}. Doc size: ${doc.content.size}`);
                    pointErrors++;
                  }
                });
            }
             // Increment index by the length of the original segment (word + potential punctuation)
            currentWordStartIndex += segment.length;
        }
    }
     if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Hyphenation errors: ${failedWords.length}, Point errors: ${pointErrors}`);


    // --- Pass 2: Calculate paragraph syllable counts ---
    doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
            let paragraphSyllableCount = 0;
            const paragraphNodePos = pos;
             // Check if this paragraph is a header
             const isHeader = headerRegex.test(node.textContent.trim());

            node.forEach(childNode => {
                if(childNode.isText && childNode.text) {
                    // Split by spaces AND punctuation attached to words
                    childNode.text.trim().split(/(\s+|[.,!?;:]+(?=\s|$))/).forEach(segment => {
                         // Skip empty, whitespace, or punctuation segments
                         if (!segment || /^\s+$/.test(segment) || /^[.,!?;:]+$/.test(segment)) return;

                         const word = segment;
                         const cleanWordMatch = word.match(/^([^.,!?;:]*)(.*?)$/);
                         const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

                         if (cleanWord) {
                             // *** USE CACHED COUNT, BUT DEFAULT TO 1 IF HEADER OR NOT CACHED ***
                             const cachedResult = wordCache.get(cleanWord);
                             // Headers count as 1 syllable total (or based on simple word count if preferred)
                             // Non-headers use cached count or default to 1
                             if (isHeader) {
                                 // Option 1: Count header as 1 syllable total
                                 // paragraphSyllableCount = 1; // Set outside the loop if you want 1 for the whole line
                                 // Option 2: Count words in header simply
                                 paragraphSyllableCount += 1;
                             } else {
                                paragraphSyllableCount += cachedResult ? cachedResult.count : 1;
                             }
                         }
                    });
                }
            });
             // If header counted as 1 total, ensure it's set here
             if (isHeader) {
                 // paragraphSyllableCount = 1; // If using Option 1 above
             }
             // Store nodePos + 1 as before for consistency with gutter logic
             newLineCounts.push({ nodePos: paragraphNodePos, count: paragraphSyllableCount });
        }
    });
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);


    // --- Update State and Plugin ---
    // ... (rest of the function remains the same) ...
     if (typeof setLineCounts === 'function') setLineCounts(newLineCounts);
     if (typeof setProcessingErrors === 'function') setProcessingErrors(failedWords);

    if (editor && !editor.isDestroyed) {
        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Dispatching transaction with ${newDecorationPoints.length} points.`);
        // Use editor state's transaction directly if no insertions happened in LyricStructure plugin
        // If insertions *could* have happened, this dispatch might be slightly delayed relative to the insertion,
        // but SyllableVisualizer's mapping should handle it.
        const visualizerTr = editor.state.tr;
        visualizerTr.setMeta(SyllableVisualizerPluginKey, { points: newDecorationPoints });
        if (editor.view && !editor.view.isDestroyed) {
            editor.view.dispatch(visualizerTr);
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

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  // Set base path only for build, use root for serve (dev)
  const base = command === 'build' ? '/cadence/' : '/'

  return {
    base: base,
    plugins: [react()],
    // Optional: Explicitly configure server root if needed,
    // but usually not required if 'base' is correct for build.
    // server: {
    //   base: '/', // Ensure dev server uses root
    // }
  }
})
```

