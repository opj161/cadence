import { hyphenate } from 'hyphen/de';
import { SyllableVisualizerPluginKey } from '../SyllableVisualizer';

// Regex for headers (used to skip hyphenation)
const headerRegex = /^\[([^\]]+)\]$/;

// Ensure parameter order matches the call site in App.jsx
export const processTextLogic = async (
    editor,               // 1st arg
    setLineCounts,        // 2nd arg
    setGutterData,        // 3rd arg
    setIsProcessing,      // 4th arg
    setProcessingErrors,  // 5th arg
    DEBUG_MODE = false    // 6th arg
) => {
  // ... (initial checks remain the same) ...

  setIsProcessing(true);
  setGutterData([]); // Clear gutter data
  setProcessingErrors([]); // Clear processing errors

  const failedWords = [];
  let pointErrors = 0;
  const timestamp = Date.now();
  if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Starting async processing... Setting isProcessing = true, Cleared Data`);

  try {
    const { state } = editor;
    const { doc } = state;
    const newDecorationPoints = [];
    const newLineCounts = [];
    const wordCache = new Map();

    // --- Pass 1: Hyphenate unique words, build cache, calculate decoration points ---
    const textNodes = [];
    doc.descendants((node, pos) => {
        // *** ADD CHECK FOR HEADER PARENT ***
        const parent = node.isText ? doc.resolve(pos).parent : null;
        const parentIsHeader = parent && parent.type.name === 'paragraph' && headerRegex.test(parent.textContent.trim());

        // Only process text nodes that are NOT inside a header paragraph
        if (node.isText && node.text && !parentIsHeader) {
            textNodes.push({ node, pos });
        } else if (node.isText && node.text && parentIsHeader) {
             if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Skipping hyphenation for header line: "${parent.textContent}"`);
        }
    });


    for (const { node, pos } of textNodes) {
        const nodeStartPos = pos + 1; // Position inside the text node
        let currentWordStartIndex = 0;
        // Split by spaces AND punctuation attached to words for better word identification
        const segments = node.text.split(/(\s+|[.,!?;:]+(?=\s|$))/);


        for (const segment of segments) {
             // Skip empty segments, pure whitespace, or pure punctuation segments
             if (!segment || /^\s+$/.test(segment) || /^[.,!?;:]+$/.test(segment)) {
                currentWordStartIndex += segment.length;
                continue;
            }

            const word = segment;
            const wordStartPosInNode = currentWordStartIndex;
            // Match word, allowing potential leading/trailing punctuation handled by split
            const cleanWordMatch = word.match(/^([^.,!?;:]*)(.*?)$/);
            const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;


            if (cleanWord && cleanWord.length >= 3) { // Keep hyphenation check
                let hyphenationResult = wordCache.get(cleanWord);
                if (!hyphenationResult) {
                    try {
                        // Use soft hyphen for internal calculation
                        const hyphenated = await hyphenate(cleanWord, { hyphenChar: '\u00AD', minWordLength: 3 });
                        const hyphenPositions = [];
                        let charIndex = 0;
                        // Count hyphen positions relative to the clean word
                        for (let i = 0; i < hyphenated.length; i++) {
                          if (hyphenated[i] === '\u00AD') {
                             hyphenPositions.push(charIndex);
                          } else {
                             charIndex++;
                          }
                        }
                        // Syllable count is based on clean word hyphenation
                        const syllableCount = hyphenPositions.length + 1;
                        hyphenationResult = { positions: hyphenPositions, count: syllableCount };
                        wordCache.set(cleanWord, hyphenationResult);
                    } catch (e) {
                        if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Hyphenation error on word "${cleanWord}":`, e.message);
                        hyphenationResult = { positions: [], count: 1 }; // Default to 1 syllable on error
                        wordCache.set(cleanWord, hyphenationResult);
                        failedWords.push(cleanWord);
                    }
                }
                 // Calculate absolute position for decoration based on word start and relative hyphen pos
                 hyphenationResult.positions.forEach(relativePos => {
                  // Ensure absolute position is within document bounds
                  const absolutePos = nodeStartPos + wordStartPosInNode + relativePos;
                  if (absolutePos > 0 && absolutePos <= doc.content.size) {
                     newDecorationPoints.push({ pos: absolutePos, type: 'hyphen' });
                  } else {
                    if (DEBUG_MODE) console.warn(`[ProcessTextLogic Run ${timestamp}] Invalid absolutePos calculated: ${absolutePos} for word '${cleanWord}', relativePos ${relativePos}. Doc size: ${doc.content.size}`);
                    pointErrors++;
                  }
                });
            }
             // Increment index by the length of the original segment (word + potential punctuation)
            currentWordStartIndex += segment.length;
        }
    }
     if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 1 finished. Cache size: ${wordCache.size}, Decoration points: ${newDecorationPoints.length}, Hyphenation errors: ${failedWords.length}, Point errors: ${pointErrors}`);


    // --- Pass 2: Calculate paragraph syllable counts ---
    doc.descendants((node, pos) => {
        if (node.type.name === 'paragraph') {
            let paragraphSyllableCount = 0;
            const paragraphNodePos = pos;
             // Check if this paragraph is a header
             const isHeader = headerRegex.test(node.textContent.trim());

            node.forEach(childNode => {
                if(childNode.isText && childNode.text) {
                    // Split by spaces AND punctuation attached to words
                    childNode.text.trim().split(/(\s+|[.,!?;:]+(?=\s|$))/).forEach(segment => {
                         // Skip empty, whitespace, or punctuation segments
                         if (!segment || /^\s+$/.test(segment) || /^[.,!?;:]+$/.test(segment)) return;

                         const word = segment;
                         const cleanWordMatch = word.match(/^([^.,!?;:]*)(.*?)$/);
                         const cleanWord = cleanWordMatch ? cleanWordMatch[1] : word;

                         if (cleanWord) {
                             // *** USE CACHED COUNT, BUT DEFAULT TO 1 IF HEADER OR NOT CACHED ***
                             const cachedResult = wordCache.get(cleanWord);
                             // Headers count as 1 syllable total (or based on simple word count if preferred)
                             // Non-headers use cached count or default to 1
                             if (isHeader) {
                                 // Option 1: Count header as 1 syllable total
                                 // paragraphSyllableCount = 1; // Set outside the loop if you want 1 for the whole line
                                 // Option 2: Count words in header simply
                                 paragraphSyllableCount += 1;
                             } else {
                                paragraphSyllableCount += cachedResult ? cachedResult.count : 1;
                             }
                         }
                    });
                }
            });
             // If header counted as 1 total, ensure it's set here
             if (isHeader) {
                 // paragraphSyllableCount = 1; // If using Option 1 above
             }
             // Store nodePos + 1 as before for consistency with gutter logic
            newLineCounts.push({ nodePos: paragraphNodePos + 1, count: paragraphSyllableCount });
        }
    });
    if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Pass 2 finished. Calculated counts for ${newLineCounts.length} paragraphs.`);


    // --- Update State and Plugin ---
    // ... (rest of the function remains the same) ...
     if (typeof setLineCounts === 'function') setLineCounts(newLineCounts);
     if (typeof setProcessingErrors === 'function') setProcessingErrors(failedWords);

    if (editor && !editor.isDestroyed) {
        if (DEBUG_MODE) console.log(`[ProcessTextLogic Run ${timestamp}] Dispatching transaction with ${newDecorationPoints.length} points.`);
        // Use editor state's transaction directly if no insertions happened in LyricStructure plugin
        // If insertions *could* have happened, this dispatch might be slightly delayed relative to the insertion,
        // but SyllableVisualizer's mapping should handle it.
        const visualizerTr = editor.state.tr;
        visualizerTr.setMeta(SyllableVisualizerPluginKey, { points: newDecorationPoints });
        if (editor.view && !editor.view.isDestroyed) {
            editor.view.dispatch(visualizerTr);
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