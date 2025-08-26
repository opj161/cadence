import Paragraph from '@tiptap/extension-paragraph';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { hyphenate } from 'hyphen/de';
import { CadenceParagraphView } from './CadenceParagraphView';

const CadencePluginKey = new PluginKey('cadence');

/**
 * CadenceExtension
 *
 * This extension extends the default Tiptap Paragraph node to include
 * custom functionality for syllable counting and visualization. It serves
 * as the central hub for all the logic that was previously handled in
 * React components and utility files.
 */
export const CadenceExtension = Paragraph.extend({
  name: 'cadenceParagraph',

  addStorage() {
    return {
      counts: new Map(),
      isProcessing: false,
      errors: [],
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => new CadenceParagraphView(node, editor.view, getPos, editor);
  },

  onTransaction({ transaction }) {
    // After the async processing is done, the plugin dispatches a transaction
    // with the results in the metadata. We listen for that here and update
    // our more accessible extension storage.
    const meta = transaction.getMeta(CadencePluginKey);
    if (meta?.counts) {
      this.storage.counts = meta.counts;
      this.storage.errors = meta.errors || [];
      this.storage.isProcessing = false;
    } else if (meta?.isProcessing) {
      this.storage.isProcessing = true;
    }
  },

  addProseMirrorPlugins() {
    const extension = this; // Make extension instance available in plugin

    return [
      new Plugin({
        key: CadencePluginKey,
        state: {
          init: () => ({
            decorations: DecorationSet.empty,
            docVersion: 0,
          }),
          apply: (tr, value) => {
            // Check for metadata from our async process
            const meta = tr.getMeta(CadencePluginKey);
            if (meta?.decorations) {
              // We received new decorations, update the plugin state
              return { ...value, decorations: meta.decorations };
            }

            // If the document hasn't changed, just map the existing decorations
            if (!tr.docChanged) {
              return { ...value, decorations: value.decorations.map(tr.mapping, tr.doc) };
            }

            // --- Start Async Processing ---
            // The document has changed, so we need to re-process.
            // We don't block the transaction, but kick off the async work.
            const newDocVersion = tr.doc.version;
            
            // Set processing state via a separate transaction to immediately update storage
            if (!extension.storage.isProcessing) {
              setTimeout(() => {
                const { view } = extension.editor;
                if (view && !view.isDestroyed && view.state.doc.version === newDocVersion) {
                  view.dispatch(view.state.tr.setMeta(CadencePluginKey, { isProcessing: true }));
                }
              }, 10); // Small delay to avoid race conditions
            }
            
            const { view } = extension.editor;
            if (view) {
              processDocumentAsync(tr.doc, newDocVersion, view);
            }

            // Return the old decorations for now; they will be updated by the async transaction.
            return { ...value, docVersion: newDocVersion, decorations: value.decorations.map(tr.mapping, tr.doc) };
          },
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          },
        },
      }),
    ];
  },
});

// This async function contains the logic from the original syllableProcessor.js
async function processDocumentAsync(doc, version, view) {
  // If the document has changed since we started, abort.
  if (version !== doc.version) {
    return;
  }

  const newDecorationPoints = [];
  const newLineCounts = new Map();
  const failedWords = [];
  const wordCache = new Map();

  // Pass 1: Hyphenate and create decoration points
  for (const { node, pos } of findTextNodes(doc)) {
    const segments = node.text.split(/(\s+)/);
    let currentSegmentStartIndex = 0;

    for (const segment of segments) {
      if (!segment || /^\s+$/.test(segment)) {
        currentSegmentStartIndex += segment.length;
        continue;
      }

      const wordMatch = segment.match(/^(\W*)(\w+)(\W*)$/);
      if (wordMatch) {
        const coreWord = wordMatch[2];
        if (coreWord && coreWord.length >= 3) {
          let hyphenationResult = wordCache.get(coreWord);
          if (!hyphenationResult) {
            try {
              const hyphenated = await hyphenate(coreWord, { hyphenChar: '\u00AD' });
              const hyphenPositions = [];
              let charIndex = 0;
              for (const char of hyphenated) {
                if (char === '\u00AD') hyphenPositions.push(charIndex);
                else charIndex++;
              }
              hyphenationResult = { positions: hyphenPositions, count: hyphenPositions.length + 1 };
              wordCache.set(coreWord, hyphenationResult);
            } catch (e) {
              hyphenationResult = { positions: [], count: 1 };
              wordCache.set(coreWord, hyphenationResult);
              failedWords.push(coreWord);
            }
          }
          
          const wordStartPos = pos + currentSegmentStartIndex + (wordMatch[1] || '').length;
          hyphenationResult.positions.forEach(relPos => {
            newDecorationPoints.push(Decoration.widget(wordStartPos + relPos, () => {
              const span = document.createElement('span');
              span.className = 'syllable-hyphen';
              return span;
            }, { side: -1 }));
          });
        }
      }
      currentSegmentStartIndex += segment.length;
    }
  }

  // Pass 2: Calculate line syllable counts
  doc.descendants((node, pos) => {
    if (node.type.name === 'cadenceParagraph') {
        let lineSyllableCount = 0;
        const words = (node.textContent || '').match(/\b\w+\b/g) || [];
        words.forEach(word => {
            if (word.length >= 3) {
                const cachedResult = wordCache.get(word.toLowerCase());
                lineSyllableCount += cachedResult ? cachedResult.count : 1;
            } else if (word.length > 0) {
                lineSyllableCount += 1;
            }
        });
        // We store counts by the node's starting position. Keying by `pos + 1` as in the old
        // logic is brittle. Sticking to `pos` is more robust.
        newLineCounts.set(pos, lineSyllableCount);
    }
  });

  // If the document has changed again, abort before dispatching.
  if (version !== view.state.doc.version) {
    return;
  }

  // Dispatch a transaction with the results in metadata.
  const finalDecorations = DecorationSet.create(doc, newDecorationPoints);
  const meta = { decorations: finalDecorations, counts: newLineCounts, errors: failedWords };
  view.dispatch(view.state.tr.setMeta(CadencePluginKey, meta));
}

function findTextNodes(doc) {
    const textNodes = [];
    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            textNodes.push({ node, pos: pos + 1 }); // ProseMirror positions are 1-based inside nodes
        }
    });
    return textNodes;
}
