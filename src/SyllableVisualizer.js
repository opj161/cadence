import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// --- Debugging Flag ---
const DEBUG_SYLLABLE_VISUALIZER = false; // Set to true for console logs from plugin
// --------------------

export const SyllableVisualizerPluginKey = new PluginKey('syllableVisualizer');

// REMOVED: createGutterDecorations function

// Helper to create hyphen decorations (Keep this)
const createHyphenDecorations = (doc, points) => {
    // ... (keep existing implementation) ...
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
                    span.textContent = '-';
                    return span;
                },
                { side: -1, marks: [], ignoreSelection: true }
            );
        }
        return null;
    }).filter(d => d !== null);
    return DecorationSet.create(doc, decorations);
};


/**
 * Custom Tiptap Extension to visually display syllable hyphens and gutter counts.
 */
export const SyllableVisualizer = Extension.create({
  name: 'syllableVisualizer',

  // No addOptions needed as points/counts come via meta

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
                    hyphenPoints: [], // Keep points if needed for mapping
                };
            },
            apply: (tr, currentPluginState, oldEditorState, newEditorState) => {
                const meta = tr.getMeta(SyllableVisualizerPluginKey);
                let newState = { ...currentPluginState };
                let needsHyphenUpdate = false;

                // Check for new hyphen points data from processText
                if (meta) {
                    if (meta.points !== undefined) {
                        if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.points.length} hyphen points via meta.`);
                        newState.hyphenPoints = meta.points;
                        needsHyphenUpdate = true;
                    }
                }

                // Update hyphen decorations if necessary
                if (needsHyphenUpdate) {
                    newState.hyphenDecorations = createHyphenDecorations(newEditorState.doc, newState.hyphenPoints || []);
                }

                // Map existing hyphen decorations if the document changed but no new data was provided
                if (tr.docChanged && !meta) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, mapping old hyphen decorations.');
                    newState.hyphenDecorations = currentPluginState.hyphenDecorations.map(tr.mapping, newEditorState.doc);
                }

                // Update doc version tracking
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
            // Only return hyphen decorations
            if (DEBUG_SYLLABLE_VISUALIZER && pluginState.hyphenDecorations.find().length > 0) {
              console.log(`[SyllableVisualizer Plugin] Decorations func: Returning Set with ${pluginState.hyphenDecorations.find().length} hyphen decorations.`);
            }
            return pluginState.hyphenDecorations;
          },
        },
      }),
    ];
  },
});

export default SyllableVisualizer;
