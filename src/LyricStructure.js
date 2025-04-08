import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

export const LyricStructurePluginKey = new PluginKey('lyricStructureDecorations');
// Separate key for signaling the need for a spacing check
const SpacingCheckNeededKey = new PluginKey('lyricStructureSpacingCheck');

// Regex patterns (keep these)
const headerRegex = /^\[([^\]]+)\]$/;
const chordRegex = /(\[[A-Ga-g][#b]?(?:maj|min|m|M|dim|aug|sus|add|m7|maj7|7|9|11|13)?(?:\/[A-Ga-g][#b]?)?\])/g;
const commentRegex = /^(#|\/\/).*$/;

// findDecorations remains the same as the previous version
function findDecorations(doc) {
    const decorations = [];
    const processedParagraphs = new Set();

    doc.descendants((node, pos) => {
        if (node.isBlock && !processedParagraphs.has(pos)) {
            const paragraphText = node.textContent;
            if (headerRegex.test(paragraphText.trim())) {
                decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: 'lyric-header' }));
                processedParagraphs.add(pos);
            } else if (commentRegex.test(paragraphText.trim())) {
                decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: 'lyric-comment' }));
                processedParagraphs.add(pos);
            }
        }

        if (node.isText) {
             const parentBlockPos = doc.resolve(pos).start(doc.resolve(pos).depth - 1);
             if (!processedParagraphs.has(parentBlockPos)) {
                const text = node.text;
                let match;
                while ((match = chordRegex.exec(text)) !== null) {
                    const start = pos + match.index;
                    const end = start + match[0].length;
                    decorations.push(Decoration.inline(start, end, { class: 'lyric-chord' }));
                }
             }
        }
    });

    return DecorationSet.create(doc, decorations);
}


export const LyricStructure = Extension.create({
    name: 'lyricStructure',

    addProseMirrorPlugins() {
        // No need to store extension reference as it's not being used
        return [
            // Plugin for Decorations
            new Plugin({
                key: LyricStructurePluginKey,
                state: {
                    init(_, { doc }) {
                        return findDecorations(doc);
                    },
                    // Apply now ONLY calculates decorations and potentially signals spacing check
                    apply(tr, oldSet, oldState, newState) {
                        // If the document or selection changed, recalculate decorations
                        if (tr.docChanged || tr.selectionSet) {
                            // Check if we need to signal for spacing check LATER
                            if (tr.docChanged) {
                                let headerPosToCheck = null;
                                tr.steps.forEach(step => {
                                    step.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
                                        // Check the *new* range for headers
                                        newState.doc.nodesBetween(newStart, newEnd, (node, pos) => {
                                            if (node.isBlock && headerRegex.test(node.textContent.trim())) {
                                                // Map the header's position back *through this transaction*
                                                // to where it will be *after* this transaction applies
                                                headerPosToCheck = tr.mapping.map(pos);
                                                return false; // Stop searching within this node
                                            }
                                        });
                                    });
                                });
                                // If a header was affected, set metadata to trigger check in appendTransaction
                                if (headerPosToCheck !== null) {
                                    tr.setMeta(SpacingCheckNeededKey, { checkPos: headerPosToCheck });
                                }
                            }
                            // Return the new decoration set based on the final state of THIS transaction
                            return findDecorations(newState.doc);
                        }

                        // Only map decorations if the doc didn't change
                        if (tr.mapping && oldSet) {
                           return oldSet.map(tr.mapping, tr.doc);
                        }

                        return oldSet;
                    },
                },
                props: {
                    decorations(state) {
                        // Return decorations from this plugin's state
                        return this.getState(state);
                    },
                },
            }),

            // Separate Plugin logic (via appendTransaction) for Spacing Checks
            new Plugin({
                key: SpacingCheckNeededKey, // Re-use key for logic separation, not state storage
                appendTransaction: (transactions, oldState, newState) => {
                    let spacingTr = null; // Hold potential new transaction for spacing

                    transactions.forEach(tr => {
                        const meta = tr.getMeta(SpacingCheckNeededKey);
                        // Check if this transaction signaled a need for spacing check
                        if (meta && meta.checkPos !== undefined) {
                            const pos = meta.checkPos;
                            const resolvedPos = newState.doc.resolve(pos); // Check in the *new* state
                            const nodeBefore = resolvedPos.nodeBefore;

                            // Condition to add space
                            if (pos > 0 && nodeBefore && (!nodeBefore.isTextblock || nodeBefore.textContent.trim() !== '')) {
                                const emptyPara = newState.schema.nodes.paragraph.createAndFill();
                                if (emptyPara) {
                                    // Create a *new* transaction if one isn't already started for spacing
                                    if (!spacingTr) {
                                        spacingTr = newState.tr;
                                    }
                                    // Insert into the new transaction
                                    spacingTr.insert(pos, emptyPara);
                                    // console.log(`Creating spacing transaction: insert at ${pos}`);
                                }
                            }
                        }
                    });

                    // Return the new transaction *if* we created one
                    return spacingTr;
                }
            })
        ];
    },
});

export default LyricStructure;