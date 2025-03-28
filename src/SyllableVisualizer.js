import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// --- Debugging Flag ---
const DEBUG_SYLLABLE_VISUALIZER = false; // Set to true for console logs from plugin
// --------------------

export const SyllableVisualizerPluginKey = new PluginKey('syllableVisualizer');

/**
 * Custom Tiptap Extension to visually display syllable hyphens.
 * Reads decoration points directly from extension options during decoration calculation.
 */
export const SyllableVisualizer = Extension.create({
  name: 'syllableVisualizer',

  addOptions() {
    return {
      decorationPoints: [],
    };
  },

  addProseMirrorPlugins() {
    // const extensionThis = this; // *** REMOVED - No longer needed ***

    return [
      new Plugin({
        key: SyllableVisualizerPluginKey,
        state: {
            init: (_, state) => {
                if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Init State.');
                return {
                    decorationSet: DecorationSet.empty,
                    docVersion: state.doc.version,
                };
            },
            apply: (tr, currentPluginState, oldEditorState, newEditorState) => {
                const newPoints = tr.getMeta(SyllableVisualizerPluginKey);

                if (newPoints) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply State: Received ${newPoints.length} points via transaction meta.`);
                    const { doc } = newEditorState;
                    const decorations = newPoints.map(point => {
                        if (point.type === 'hyphen') {
                            if (DEBUG_SYLLABLE_VISUALIZER && (point.pos <= 0 || point.pos > doc.content.size)) {
                                console.warn('[SyllableVisualizer Plugin] Invalid decoration position in meta:', point.pos, 'Doc size:', doc.content.size);
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

                    const newDecorationSet = DecorationSet.create(doc, decorations);
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply State: Created DecorationSet with ${newDecorationSet.find().length} decorations.`);
                    return {
                        decorationSet: newDecorationSet,
                        docVersion: newEditorState.doc.version,
                    };
                }

                if (currentPluginState.docVersion !== newEditorState.doc.version && tr.docChanged) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply State: Document changed, mapping old decorations.');
                    return {
                        ...currentPluginState,
                        decorationSet: currentPluginState.decorationSet.map(tr.mapping, newEditorState.doc),
                        docVersion: newEditorState.doc.version,
                    };
                }
                return currentPluginState;
            }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
             if (DEBUG_SYLLABLE_VISUALIZER && pluginState?.decorationSet?.find().length) {
                 // Log only if there are decorations to avoid spamming
                 console.log(`[SyllableVisualizer Plugin] Decorations func: Returning Set with ${pluginState.decorationSet.find().length} decorations.`);
             }
            return pluginState?.decorationSet;
          },
        },
      }),
    ];
  },
});

export default SyllableVisualizer;