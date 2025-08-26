import Paragraph from '@tiptap/extension-paragraph';
import { PasteRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Slice, Fragment } from '@tiptap/pm/model';
import { hyphenate } from 'hyphen/de';
import { CadenceParagraphView } from './CadenceParagraphView';

const CadencePluginKey = new PluginKey('cadence');
const ActiveLinePluginKey = new PluginKey('activeLineHighlighter');

// --- Logic migrated from LyricStructure.js ---
const headerRegex = /^\[([^\]]+)\]$/;
const chordRegex = /(\[[A-Ga-g][#b]?(?:maj|min|m|M|dim|aug|sus|add|m7|maj7|7|9|11|13)?(?:\/[A-Ga-g][#b]?)?\])/g;
const commentRegex = /^(#|\/\/).*$/;

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
      // Accept either a Map (old) or a plain object (safer for metadata)
      if (meta.counts instanceof Map) {
        this.storage.counts = meta.counts;
      } else {
        try {
          // Convert plain object keys (strings) back to numeric positions
          const entries = Object.entries(meta.counts || {}).map(([k, v]) => [Number(k), v]);
          this.storage.counts = new Map(entries);
        } catch (e) {
          this.storage.counts = new Map();
        }
      }
      this.storage.errors = meta.errors || [];
      this.storage.isProcessing = false;
      // Debug: expose first few reconstructed counts for runtime inspection
      try {
        const sample = Array.from((this.storage.counts || new Map()).entries()).slice(0, 12);
        console.debug('[cadence] onTransaction reconstructed counts sample:', sample);
      } catch (e) {
        // ignore
      }
    } else if (meta?.isProcessing) {
      this.storage.isProcessing = true;
    }
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /.*/g, // A regex that matches any pasted content
        handler: ({ match, state, range }) => {
          const pastedText = match[0];
          // Only apply custom logic if pasted text contains newlines
          if (!pastedText.includes('\n')) {
            return false; // Let default behavior handle it
          }

          const { schema } = state;
          const lines = pastedText.split('\n');
          const fragment = Fragment.fromArray(
            lines.map(line => {
              const lineContent = line ? schema.text(line) : null;
              return schema.nodes.cadenceParagraph.create(null, lineContent);
            })
          );

          // Create a slice with the new fragment
          const slice = new Slice(fragment, 1, 1);

          // Return the slice to replace the matched content
          return slice;
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    const extension = this; // Make extension instance available in plugin

    return [
      // New plugin for active line highlighting
      new Plugin({
        key: ActiveLinePluginKey,
        state: {
          init: () => DecorationSet.empty,
          apply: (tr, old) => {
            // No need to update if selection or document hasn't changed.
            if (!tr.selectionSet && !tr.docChanged) {
              return old;
            }

            // Find the paragraph containing the current selection's head.
            const { $head } = tr.selection;
            let paragraphNode = null;
            let paragraphPos = null;
            
            // Walk up the tree to find the cadenceParagraph node
            for (let d = $head.depth; d >= 0; d--) {
              const node = $head.node(d);
              if (node.type.name === 'cadenceParagraph') {
                paragraphNode = node;
                paragraphPos = $head.start(d);
                break;
              }
            }

            // If we found a paragraph, create decoration for it
            if (paragraphNode && paragraphPos !== null) {
              const decoration = Decoration.node(paragraphPos, paragraphPos + paragraphNode.nodeSize, {
                class: 'is-active-line',
              });
              return DecorationSet.create(tr.doc, [decoration]);
            }

            return DecorationSet.empty;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
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

            // --- Auto-spacing logic for headers, integrated here ---
            const headersToCheck = new Set();
            tr.steps.forEach(step => {
              step.getMap().forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                tr.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                  if (node.type.name === 'cadenceParagraph' && headerRegex.test(node.textContent.trim())) {
                    headersToCheck.add(pos);
                  }
                });
              });
            });

            if (headersToCheck.size > 0) {
              headersToCheck.forEach(pos => {
                const resolvedPos = tr.doc.resolve(pos);
                const nodeBefore = resolvedPos.nodeBefore;
                if (pos > 0 && nodeBefore && (!nodeBefore.isTextblock || nodeBefore.textContent.trim() !== '')) {
                  const emptyPara = tr.doc.type.schema.nodes.cadenceParagraph.createAndFill();
                  tr.insert(pos, emptyPara);
                }
              });
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
  const failedWords = [];
  const wordCache = new Map();
  const processedParagraphsForDecorations = new Set();
  // A map to hold running syllable counts for each paragraph position
  const paragraphSyllableTotals = new Map();

  // --- Initial Pass: Identify Headers/Comments and Initialize Syllable Counters ---
  doc.descendants((node, pos) => {
    // --- LyricStructure Block Decoration Logic (Headers & Comments) ---
    if (node.isBlock && node.type.name === 'cadenceParagraph' && !processedParagraphsForDecorations.has(pos)) {
        const paragraphText = node.textContent.trim();
        if (headerRegex.test(paragraphText)) {
            newDecorationPoints.push(Decoration.node(pos, pos + node.nodeSize, { class: 'lyric-header' }));
            processedParagraphsForDecorations.add(pos);
        } else if (commentRegex.test(paragraphText)) {
            newDecorationPoints.push(Decoration.node(pos, pos + node.nodeSize, { class: 'lyric-comment' }));
            processedParagraphsForDecorations.add(pos);
        }
    }

    // Initialize syllable count for paragraph nodes that aren't headers/comments
    if (node.type.name === 'cadenceParagraph' && !processedParagraphsForDecorations.has(pos)) {
      if (!paragraphSyllableTotals.has(pos)) {
        paragraphSyllableTotals.set(pos, 0);
      }
    }
  });

  // --- Consolidated Pass: Hyphenation and Syllable Counting ---
  for (const { node, pos } of findTextNodes(doc)) {
    const segments = node.text.split(/(\s+)/);
    let currentSegmentStartIndex = 0;

    for (const segment of segments) {
      if (!segment || /^\s+$/.test(segment)) {
        currentSegmentStartIndex += segment.length;
        continue;
      }

      // --- Find Parent Paragraph and check if it should be skipped ---
      const parentNodeInfo = doc.resolve(pos + currentSegmentStartIndex);
      let parentParagraphPos = null;
      
      // Walk up to find the cadenceParagraph node
      for (let d = parentNodeInfo.depth; d >= 0; d--) {
        const ancestorNode = parentNodeInfo.node(d);
        if (ancestorNode.type.name === 'cadenceParagraph') {
          parentParagraphPos = parentNodeInfo.start(d);
          break;
        }
      }

      // Skip this text node if its parent paragraph is a header or comment
      if (parentParagraphPos !== null && processedParagraphsForDecorations.has(parentParagraphPos)) {
        currentSegmentStartIndex += segment.length;
        continue;
      }

    const wordMatch = segment.match(/^(\W*)(\w+)(\W*)$/);
    if (wordMatch) {
      const coreWord = wordMatch[2].toLowerCase();
      let syllableCount = 1; // Default for short words or on error

      if (coreWord && coreWord.length >= 3) {
        let wordData = wordCache.get(coreWord);
        if (!wordData) {
          try {
            const hyphenated = await hyphenate(coreWord, { hyphenChar: '\u00AD' });
            const positions = [];
            let charIndex = 0;
            for (const char of hyphenated) {
              if (char === '\u00AD') {
                positions.push(charIndex);
              } else {
                charIndex++;
              }
            }
            wordData = { positions, count: positions.length + 1 };
            wordCache.set(coreWord, wordData);
          } catch (e) {
            wordData = { positions: [], count: 1 };
            wordCache.set(coreWord, wordData);
            failedWords.push(coreWord);
          }
        }

        syllableCount = wordData.count;

        // Create hyphen decorations from cached or newly processed data
        const wordStartPos = pos + currentSegmentStartIndex + (wordMatch[1] || '').length;
        (wordData.positions || []).forEach(relPos => {
          newDecorationPoints.push(Decoration.widget(wordStartPos + relPos, () => {
            const span = document.createElement('span');
            span.className = 'syllable-hyphen';
            return span;
          }, { side: -1 }));
        });
      }

      // Add syllable count to the running total for this paragraph
      if (parentParagraphPos !== null) {
        const currentTotal = paragraphSyllableTotals.get(parentParagraphPos) || 0;
        paragraphSyllableTotals.set(parentParagraphPos, currentTotal + syllableCount);
      }
    }
      currentSegmentStartIndex += segment.length;
    }
  }

  // --- Final Pass: Only Chord Decorations (Block decorations and counts are handled above) ---
  doc.descendants((node, pos) => {
    // --- LyricStructure Inline (Chord) Decoration Logic ---
    if (node.isText) {
        const resolvedTextPos = doc.resolve(pos);
        let parentBlockPos = pos;
        // Find the parent paragraph's starting position
        for (let d = resolvedTextPos.depth; d > 0; d--) {
          const ancestorNode = resolvedTextPos.node(d);
          if(ancestorNode.type.name === 'cadenceParagraph') {
              parentBlockPos = resolvedTextPos.start(d);
              break;
          }
        }

        if (!processedParagraphsForDecorations.has(parentBlockPos)) {
            let match;
            chordRegex.lastIndex = 0; // Reset regex state
            while ((match = chordRegex.exec(node.text)) !== null) {
                const start = pos + match.index;
                const end = start + match[0].length;
                newDecorationPoints.push(Decoration.inline(start, end, { class: 'lyric-chord' }));
            }
        }
    }
  });

  // If the document has changed again, abort before dispatching.
  if (version !== view.state.doc.version) {
    return;
  }

  // Dispatch a transaction with the results in metadata.
  const finalDecorations = DecorationSet.create(doc, newDecorationPoints);
  // Convert Map to plain object for safe metadata transfer
  const countsObj = {};
  paragraphSyllableTotals.forEach((value, key) => {
    countsObj[key] = value;
  });
  const meta = { decorations: finalDecorations, counts: countsObj, errors: failedWords };
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
