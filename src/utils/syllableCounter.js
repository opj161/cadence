// utils/syllableCounter.js
export function countSyllables(text) {
  if (!text) return 0;
  
  // Convert text to lowercase
  text = text.toLowerCase();
  
  // Replace non-word characters with spaces
  text = text.replace(/[^a-z\d]/g, ' ');
  
  // Split into words
  const words = text.split(/\s+/).filter(word => word.length > 0);
  
  // Count syllables for each word
  let totalSyllables = 0;
  
  for (const word of words) {
    totalSyllables += countWordSyllables(word);
  }
  
  return totalSyllables;
}

function countWordSyllables(word) {
  // Simple syllable counting algorithm
  if (word.length <= 3) return 1;
  
  // Remove ending e, es, ed
  word = word.replace(/e$|es$|ed$/, '');
  
  // Count vowel groups
  const vowelGroups = word.match(/[aeiouy]+/g);
  
  return vowelGroups ? vowelGroups.length : 1;
}
