import { hyphenate } from 'hyphen/de'; // <-- TIER 2 CHANGE: Use async hyphenate
import { SyllableVisualizerPluginKey } from '../SyllableVisualizer'; // Adjust path if needed

// This function contains the core logic for processing text, now async
export const processTextLogic = async (editor, setLineCounts, setIsProcessing, setProcessingErrors, DEBUG_MODE = false) => {
  // Check for editor validity early
  if (!editor || !editor.state || !editor.isEditable) {
    if (DEBUG_MODE) console.log("[ProcessTextLogic] Skipping: Editor not ready or not editable.");
    setIsProcessing(false); // Ensure state is reset if skipped
    return;
  }

  // Set processing state
  setIsProcessing(true);
  setProcessingErrors([]); // Reset errors at the start of processing
  const failedWords = []; // Collect words that fail hyphenation in this run
  let pointErrors = 0; // Errors related to decoration points

  // Use a static counter if needed, or manage elsewhere if necessary across calls
  // let processingCounter = 0; // Example if needed within this scope only
  // processingCounter++;
  // const currentRun = processingCounter;
  const timestamp = Date.now(); // Use timestamp for easier log correlation
  if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Starting async processing... Setting isProcessing = true`);

  try {
    const { state } = editor;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    const wordCache = new Map();

    // --- Pass 1: Hyphenate unique words, build cache, and calculate decoration points ---
    const textNodes = [];
    doc.descendants((node, pos) => {
        if (node.isText && node.text) {
            textNodes.push({ node, pos });
        }
    });

    // Process nodes sequentially to avoid race conditions with cache/positions
    for (const { node, pos } of textNodes) {
        const nodeStartPos = pos + 1;
        let currentWordStartIndex = 0;

        // Split by whitespace but keep delimiters
        const segments = node.text.split(/(\s+)/);

        for (const segment of segments) {
            if (!segment || /^\s+$/.test(segment)) {
                currentWordStartIndex += segment.length;
                continue; // Skip whitespace
            }

            const word = segment;
            const wordStartPosInNode = currentWordStartIndex;
            const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
            const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

            if (cleanWord && cleanWord.length >= 3) {
                let hyphenationResult = wordCache.get(cleanWord);

                if (!hyphenationResult) {
                    try {
                        // <-- TIER 2 CHANGE: Use async hyphenate -->
                        const hyphenated = await hyphenate(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
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
                        wordCache.set(cleanWord, hyphenationResult);
                        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Cached '${cleanWord}': ${syllableCount} syllables, positions: ${hyphenPositions.join(',')}`);
                    } catch (e) {
                        console.warn(`[ProcessTextLogic Run ${timestamp}] Hyphenation error on word "${cleanWord}":`, e);
                        hyphenationResult = { positions: [], count: 1 }; // Treat as 1 syllable on error
                        wordCache.set(cleanWord, hyphenationResult); // Cache error result too
                        failedWords.push(cleanWord); // <-- TIER 2 CHANGE: Collect failed words
                        pointErrors++;
                    }
                }

                // Add decoration points based on cached/calculated positions
                hyphenationResult.positions.forEach(relativePos => {
                  const absolutePos = nodeStartPos + wordStartPosInNode + relativePos;
                  if (absolutePos <= 0 || absolutePos > doc.content.size) {
                     if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Invalid absolutePos calculated: ${absolutePos} ...`);
                    pointErrors++;
                  } else {
                    newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                  }
                });
            }
            // Advance index for the next segment
            currentWordStartIndex += segment.length;
        } // End loop through segments
    } // End loop through textNodes
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Hyphenation errors: ${failedWords.length}, Point errors: ${pointErrors}`);


    // --- Pass 2: Calculate paragraph syllable counts using the cache ---
    doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
            let paragraphSyllableCount = 0;
            const paragraphNodePos = pos;

            node.textContent.trim().split(/\s+/).forEach(word => {
                if (!word) return;
                const cleanWordMatch = word.match(/^(.*?)([.,!?;:]*)$/);
                const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

                if (cleanWord) {
                    const cachedResult = wordCache.get(cleanWord);
                    paragraphSyllableCount += cachedResult ? cachedResult.count : 1; // Add cached count or 1 if not found/too short
                }
            });
            newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount });
        }
    });
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);

    if (DEBUG_MODE) {
      console.log(`[ProcessTextLogic Run ${timestamp}] Finished processing. Found ${newLineCounts.length} paragraphs, ${newDecorationPoints.length} decoration points.`);
    }

    // --- Update State and Plugin ---
    setLineCounts(newLineCounts); // Update React state for gutter rendering
    setProcessingErrors(failedWords); // Update error state <-- TIER 2 CHANGE

    // Dispatch transaction ONLY if editor still exists and is not destroyed
    if (editor && !editor.isDestroyed) {
      if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Dispatching transaction with ${newDecorationPoints.length} points.`);
      const tr = editor.state.tr;
      // ONLY send points to the plugin
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
      // Catch any unexpected errors during the whole process
      console.error(`[ProcessTextLogic Run ${timestamp}] Unexpected error during processing:`, error);
      setProcessingErrors(["General processing error"]); // Indicate a generic error
  } finally {
    // Ensure processing state is always reset
    setIsProcessing(false);
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Setting isProcessing = false (in finally)`);
  }
};