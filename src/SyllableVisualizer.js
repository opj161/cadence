import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

// --- Debugging Flag ---
const DEBUG_SYLLABLE_VISUALIZER = false; // Set to true for console logs from plugin
// --------------------

export const SyllableVisualizerPluginKey = new PluginKey('syllableVisualizer');

// Helper to create gutter count decorations
const createGutterDecorations = (doc, lineCounts, activePos) => {
  const decorations = lineCounts.map(line => {
    if (line.nodePos <= 0 || line.nodePos > doc.content.size) {
      if (DEBUG_SYLLABLE_VISUALIZER) console.warn('[Gutter Decorator] Invalid nodePos for line count:', line.nodePos, 'Doc size:', doc.content.size);
      return null;
    }
    const isActive = line.nodePos === activePos;
    return Decoration.widget(
      line.nodePos, // Position at the start of the paragraph content
      () => {
        const span = document.createElement('span');
        span.className = `pm-gutter-widget ${isActive ? 'active-count' : ''}`;
        span.textContent = `[${line.count}]`;
        span.setAttribute('data-line-pos', line.nodePos.toString()); // For potential future use/debugging
        span.style.cssText = `
          position: absolute;
          left: -45px; /* Adjust as needed based on desired gutter width */
          top: 0; /* Aligns with the start of the line */
          width: 35px; /* Adjust as needed */
          text-align: right;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
          font-size: 11px;
          font-weight: ${isActive ? '600' : '500'};
          color: var(--${isActive ? 'gutter-active-color' : 'text-secondary'});
          opacity: ${isActive ? '1' : '0.6'};
          user-select: none;
          pointer-events: none; /* Prevent interaction with the widget itself */
          line-height: inherit; /* Inherit line-height from paragraph */
          transition: opacity 0.2s ease, color 0.2s ease, font-weight 0.2s ease;
        `;
        return span;
      },
      { side: -1, ignoreSelection: true } // Place before the paragraph content
    );
  }).filter(d => d !== null);
  return DecorationSet.create(doc, decorations);
};

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
                    gutterDecorations: DecorationSet.empty,
                    lineCounts: [],
                    activePos: null,
                    docVersion: state.doc.version,
                };
            },
            apply: (tr, currentPluginState, oldEditorState, newEditorState) => {
                const meta = tr.getMeta(SyllableVisualizerPluginKey);
                let newState = { ...currentPluginState };
                let needsGutterUpdate = false;
                let needsHyphenUpdate = false;

                // Check for new data from processText or handleSelectionUpdate
                if (meta) {
                    if (meta.points !== undefined) {
                        if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.points.length} hyphen points via meta.`);
                        newState.hyphenPoints = meta.points; // Store points if needed later, or just use directly
                        needsHyphenUpdate = true;
                    }
                    if (meta.counts !== undefined) {
                        if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received ${meta.counts.length} line counts via meta.`);
                        newState.lineCounts = meta.counts;
                        needsGutterUpdate = true;
                    }
                    if (meta.activePos !== undefined) {
                         if (DEBUG_SYLLABLE_VISUALIZER) console.log(`[SyllableVisualizer Plugin] Apply: Received activePos ${meta.activePos} via meta.`);
                        if (newState.activePos !== meta.activePos) {
                            newState.activePos = meta.activePos;
                            needsGutterUpdate = true; // Need to update gutter styles for active line
                        }
                    }
                }

                // Update decorations if necessary
                if (needsHyphenUpdate) {
                    newState.hyphenDecorations = createHyphenDecorations(newEditorState.doc, newState.hyphenPoints || []);
                }
                if (needsGutterUpdate) {
                    newState.gutterDecorations = createGutterDecorations(newEditorState.doc, newState.lineCounts, newState.activePos);
                }

                // Map existing decorations if the document changed but no new data was provided
                if (tr.docChanged && !meta) {
                    if (DEBUG_SYLLABLE_VISUALIZER) console.log('[SyllableVisualizer Plugin] Apply: Document changed, mapping old decorations.');
                    newState.hyphenDecorations = currentPluginState.hyphenDecorations.map(tr.mapping, newEditorState.doc);
                    newState.gutterDecorations = currentPluginState.gutterDecorations.map(tr.mapping, newEditorState.doc);
                }

                // Update doc version tracking
                newState.docVersion = newEditorState.doc.version;

                return newState;
            }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            if (!pluginState) return null;

            const allDecorations = [
                ...pluginState.hyphenDecorations.find(),
                ...pluginState.gutterDecorations.find()
            ];

            if (DEBUG_SYLLABLE_VISUALIZER && allDecorations.length > 0) {
                 console.log(`[SyllableVisualizer Plugin] Decorations func: Returning combined Set with ${allDecorations.length} decorations.`);
            }
            // Combine the two sets for rendering
            return DecorationSet.create(state.doc, allDecorations);
          },
        },
      }),
    ];
  },
});

export default SyllableVisualizer;
