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