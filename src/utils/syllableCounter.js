// utils/syllableCounter.js
import { hyphenate } from 'hyphen/de';

const wordCache = new Map();

// Helper function to actually perform syllable counting for a word
async function performSyllableCount(cleanedWord) {
  // Words with 1 or 2 letters are typically one syllable.
  // hyphenate might require a minimum word length (e.g., 3 for hyphen/de by default).
  if (cleanedWord.length <= 2) {
    return 1;
  }

  try {
    // Use soft hyphen (\u00AD) as the hyphenation character.
    const hyphenatedWord = await hyphenate(cleanedWord, { hyphenChar: '\u00AD', minWordLength: 3 });
    // The number of syllables is the number of parts the word is split into.
    // e.g., "Sil-ben" (Sil\u00ADben) has one soft hyphen, resulting in 2 parts/syllables.
    const syllables = (hyphenatedWord.match(/\u00AD/g) || []).length + 1;
    return syllables;
  } catch (error) {
    console.warn(`Could not hyphenate word: "${cleanedWord}". Error: ${error.message}. Using fallback.`);
    // Fallback for words that cause errors or cannot be hyphenated:
    // A very basic fallback: count vowel groups.
    const vowelGroups = cleanedWord.match(/[aeiouäöü]+/g);
    return vowelGroups ? Math.max(1, vowelGroups.length) : 1;
  }
}

// Async function to count syllables in a single word, using cache
async function countWordSyllables(word) {
  if (!word || word.trim().length === 0) {
    return 0;
  }

  // Pre-process word: convert to lowercase and remove non-alphanumeric characters
  // except for German umlauts and ß.
  const cleanedWord = word.toLowerCase().replace(/[^a-zäöüß\d]/g, '');

  if (cleanedWord.length === 0) {
    return 0;
  }

  // Check cache first
  if (wordCache.has(cleanedWord)) {
    return wordCache.get(cleanedWord); // Return the promise from cache
  }

  // If not in cache, perform the calculation and store the promise in the cache
  const countPromise = performSyllableCount(cleanedWord);
  wordCache.set(cleanedWord, countPromise);
  
  // Add a catch to the promise when storing it if you want to remove failing promises from cache
  // or handle errors specifically for caching, e.g., cache a "failed" marker.
  // For now, if it fails, the failed promise will be cached and re-thrown to callers.
  // Alternatively, to ensure retries on next call for failed words:
  // countPromise.catch(error => {
  //   if (wordCache.get(cleanedWord) === countPromise) { // only remove if it's still this same promise
  //     wordCache.delete(cleanedWord);
  //   }
  //   // Propagate error
  //   throw error;
  // });


  return countPromise;
}

// Main function to count syllables in a text
export async function countSyllables(text) {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  // Normalize whitespace and split into words.
  const words = text.trim().split(/[\s\n\r\t.,;:!?()"]+/).filter(word => word.length > 0);

  let totalSyllables = 0;
  const wordPromises = [];

  for (const word of words) {
    // Collect all promises
    wordPromises.push(countWordSyllables(word));
  }

  // Wait for all promises to resolve
  const syllableCountsPerWord = await Promise.all(wordPromises);

  // Sum up the results
  for (const count of syllableCountsPerWord) {
    totalSyllables += count;
  }

  return totalSyllables;
}
