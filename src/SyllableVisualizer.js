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
                let pointsToUse = newState.hyphenPoints;
                let decorationsNeedRecalculation = false;
                let pointsChangedViaMeta = false;

                // Check if new points were passed via metadata
                if (meta && meta.points !== undefined) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.points.length} points via meta.`);
                    // Basic check if points actually changed to avoid unnecessary updates
                    if (JSON.stringify(meta.points) !== JSON.stringify(newState.hyphenPoints)) {
                        pointsToUse = meta.points;
                        decorationsNeedRecalculation = true;
                        pointsChangedViaMeta = true;
                    }
                } else if (tr.docChanged) {
                    // If doc changed and no new points via meta, map existing points
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, mapping old hyphen points.');
                    pointsToUse = currentPluginState.hyphenPoints
                        .map(point => ({ ...point, pos: tr.mapping.map(point.pos) }))
                        // Filter out points that are no longer valid in the new document
                        .filter(point => point.pos > 0 && point.pos <= newEditorState.doc.content.size);
                    decorationsNeedRecalculation = true; // Always recalculate if doc changed
                }

                newState.hyphenPoints = pointsToUse;

                // If new points were received or doc changed, recalculate decorations
                if (decorationsNeedRecalculation) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Recalculating decorations for ${newState.hyphenPoints.length} points. Doc version: ${newEditorState.doc.version}`);
                    newState.hyphenDecorations = createHyphenDecorations(newEditorState.doc, newState.hyphenPoints);
                }
                // This case is mostly a fallback, the above should handle docChanged leading to recalculation.
                // else if (tr.docChanged && !meta) {
                //    // If only docChanged and no meta, map the old DecorationSet directly.
                //    // This might be less accurate if structural changes occurred.
                //    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, no meta, mapping old decoration set.');
                //    newState.hyphenDecorations = currentPluginState.hyphenDecorations.map(tr.mapping, newEditorState.doc);
                // }


                // Always update doc version
                newState.docVersion = newEditorState.doc.version;

                // Determine if the state actually changed
                const significantChange = decorationsNeedRecalculation || // Decorations were recomputed
                                          pointsChangedViaMeta || // Points explicitly changed
                                          (tr.docChanged && !meta); // Document changed without new points (covered by recalc)


                if (significantChange || newState.docVersion !== currentPluginState.docVersion) {
                    if (DEBUG_SYLLABLE_VISUALIZER && !significantChange && newState.docVersion !== currentPluginState.docVersion) {
                        console.log('[SyllableVisualizer Plugin] Apply: Returning new state due to docVersion change only.');
                    }
                    return newState;
                }

                // If nothing relevant changed, return the old state
                if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: No significant changes, returning current plugin state.');
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