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