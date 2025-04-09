import { hyphenate } from 'hyphen/de';
import { SyllableVisualizerPluginKey } from '../SyllableVisualizer';

// Maximum number of text nodes to process in a single batch
const MAX_TEXT_NODES_PER_BATCH = 100;

// Ensure parameter order matches the call site in App.jsx
export const processTextLogic = async (
    editor,               // 1st arg
    setLineCounts,        // 2nd arg
    setGutterData,        // 3rd arg
    setIsProcessing,      // 4th arg
    setProcessingErrors,  // 5th arg
    DEBUG_MODE = false    // 6th arg
) => {
  // Check if editor is valid BEFORE trying to use state setters
  if (!editor || !editor.state || !editor.isEditable) {
    if (DEBUG_MODE) console.log("[ProcessTextLogic] Skipping: Editor not ready or not editable.");
    if(typeof setIsProcessing === 'function') setIsProcessing(false);
    return;
  }

  // Check if setters are functions *before* calling them
  if (typeof setIsProcessing !== 'function' || typeof setGutterData !== 'function' || typeof setProcessingErrors !== 'function') {
      console.error("[ProcessTextLogic] ERROR: One or more state setters are not functions!", {
          setIsProcessing: typeof setIsProcessing,
          setGutterData: typeof setGutterData,
          setProcessingErrors: typeof setProcessingErrors,
      });
      if(typeof setIsProcessing === 'function') setIsProcessing(false);
      return;
  }

  // Now it's safe to call the setters
  setIsProcessing(true);
  setGutterData([]);
  setProcessingErrors([]);

  // Limit the size of failedWords array to prevent memory issues
  const MAX_FAILED_WORDS = 50;
  const failedWords = [];
  let pointErrors = 0;
  const timestamp = Date.now();
  if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Starting async processing...`);

  try {
    const { state } = editor;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    const wordCache = new Map();

    // --- Pass 1: Hyphenate unique words, build cache, calculate decoration points ---
    const textNodes = [];
    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            textNodes.push({ node, pos });
        }
    });

    // For large documents, process text nodes in batches to avoid blocking the main thread
    const isLargeDocument = textNodes.length > MAX_TEXT_NODES_PER_BATCH;

    // Process text nodes in batches if it's a large document
    if (isLargeDocument && DEBUG_MODE) {
        console.log(`[ProcessTextLogic Run ${timestamp}] Large document detected with ${textNodes.length} text nodes. Processing in batches.`);
    }

    // Process text nodes in smaller batches for large documents
    const batchSize = isLargeDocument ? MAX_TEXT_NODES_PER_BATCH : textNodes.length;

    for (let batchIndex = 0; batchIndex < textNodes.length; batchIndex += batchSize) {
        const batchEnd = Math.min(batchIndex + batchSize, textNodes.length);
        const currentBatch = textNodes.slice(batchIndex, batchEnd);

        if (isLargeDocument && DEBUG_MODE) {
            console.log(`[ProcessTextLogic Run ${timestamp}] Processing batch ${batchIndex / batchSize + 1} of ${Math.ceil(textNodes.length / batchSize)}`);
        }

        // Process each text node in the current batch
        for (const { node, pos } of currentBatch) {
        const nodeStartPos = pos; // ProseMirror positions are often 1-based after node start
        let currentSegmentStartIndex = 0;
        const segments = node.text.split(/(\s+)/); // Split by whitespace, keeping delimiters

        for (const segment of segments) {
            const segmentLength = segment.length;
            if (!segment || /^\s+$/.test(segment)) {
                currentSegmentStartIndex += segmentLength; // Advance past whitespace
                continue;
            }

            // --- FIX: Robust Word Extraction and Indexing ---
            // Match the core word characters (\w includes letters, numbers, underscore)
            // and capture its start index within the current segment.
            // This regex handles leading/trailing non-word chars.
            const wordMatch = segment.match(/^(\W*)(\w+)(\W*)$/);

            if (wordMatch) {
                const leadingChars = wordMatch[1] || '';
                const coreWord = wordMatch[2]; // This is the word to hyphenate
                //const trailingChars = wordMatch[3] || ''; // We don't need trailing chars for positioning
                const coreWordStartIndexInSegment = leadingChars.length; // Index where core word starts in the segment

                if (coreWord && coreWord.length >= 3) { // Only process words of sufficient length
                    let hyphenationResult = wordCache.get(coreWord);

                    if (!hyphenationResult) {
                        try {
                            const hyphenated = await hyphenate(coreWord, { hyphenChar: '\u00AD', minWordLength: 3 });
                            const hyphenPositions = [];
                            let charIndex = 0;
                            for (let i = 0; i < hyphenated.length; i++) {
                              if (hyphenated[i] === '\u00AD') {
                                hyphenPositions.push(charIndex);
                              } else {
                                charIndex++;
                              }
                            }
                            const syllableCount = hyphenPositions.length + 1;
                            hyphenationResult = { positions: hyphenPositions, count: syllableCount };
                            wordCache.set(coreWord, hyphenationResult);
                        } catch (e) {
                            console.warn(`[ProcessTextLogic Run ${timestamp}] Hyphenation error on word "${coreWord}":`, e.message);
                            hyphenationResult = { positions: [], count: 1 };
                            wordCache.set(coreWord, hyphenationResult);
                            // Only add to failedWords if we haven't reached the limit
                            if (failedWords.length < MAX_FAILED_WORDS) {
                                failedWords.push(coreWord);
                            }
                        }
                    }

                    // --- IMPROVED: More Robust Absolute Position Calculation ---
                    hyphenationResult.positions.forEach(relativePos => {
                        try {
                            // Calculate the absolute position with more careful validation
                            const segmentStartPos = nodeStartPos + currentSegmentStartIndex;
                            const wordStartPos = segmentStartPos + coreWordStartIndexInSegment;
                            const absolutePos = wordStartPos + relativePos;

                            // Validate the position is within document bounds
                            if (absolutePos > 0 && absolutePos < doc.content.size) {
                                // Additional validation: ensure we're not placing a hyphen at a node boundary
                                const resolvedPos = doc.resolve(absolutePos);
                                if (resolvedPos.parent === doc.resolve(wordStartPos).parent) {
                                    newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                                } else if (DEBUG_MODE) {
                                    console.warn(`[ProcessTextLogic Run ${timestamp}] Skipping hyphen at node boundary: ${absolutePos} for word '${coreWord}'`);
                                    pointErrors++;
                                }
                            } else {
                                if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Invalid absolutePos out of bounds: ${absolutePos} for word '${coreWord}', relativePos ${relativePos}. Doc size: ${doc.content.size}`);
                                pointErrors++;
                            }
                        } catch (posError) {
                            if (DEBUG_MODE) console.error(`[ProcessTextLogic Run ${timestamp}] Error calculating position for word '${coreWord}':`, posError);
                            pointErrors++;
                        }
                    });
                }
            }
            // --- End of Fix ---

            // Advance index for the next segment
            currentSegmentStartIndex += segmentLength;
        } // End loop through segments
    } // End loop through current batch of text nodes

        // For large documents, yield to the main thread between batches
        if (isLargeDocument && batchIndex + batchSize < textNodes.length) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    } // End loop through all batches
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Hyphenation errors: ${failedWords.length}, Point errors: ${pointErrors}`);


    // --- Pass 2: Calculate paragraph syllable counts ---
    doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
            let paragraphSyllableCount = 0;
            const paragraphNodePos = pos;

            // Iterate through actual words more reliably
            node.forEach(childNode => {
                if(childNode.isText && childNode.text) {
                    // Match words within this text node
                     const words = childNode.text.match(/\b\w+\b/g) || []; // Use \w+ to match word characters
                     words.forEach(word => {
                         if(word.length >= 3) { // Check length again for consistency
                            const cachedResult = wordCache.get(word);
                            paragraphSyllableCount += cachedResult ? cachedResult.count : 1;
                         } else if (word.length > 0) {
                             paragraphSyllableCount += 1; // Count short words as 1 syllable
                         }
                    });
                }
            });

            newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount });
        }
    });
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);


    // --- Update State and Plugin ---
     if (typeof setLineCounts === 'function') setLineCounts(newLineCounts);
     if (typeof setProcessingErrors === 'function') setProcessingErrors(failedWords);

    if (editor && !editor.isDestroyed) {
        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Dispatching transaction with ${newDecorationPoints.length} points.`);
        const tr = editor.state.tr;
        // Send potentially empty points array if no hyphens found
        tr.setMeta(SyllableVisualizerPluginKey, { points: newDecorationPoints });
        if (editor.view && !editor.view.isDestroyed) {
            editor.view.dispatch(tr);
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