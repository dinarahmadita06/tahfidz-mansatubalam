/**
 * Rule-based summarizer for monthly notes (Catatan Bulanan)
 * Transforms multiple catatan entries into a concise summary (max 120 chars)
 * No machine learning - uses simple keyword matching
 */

// Keyword mappings for categorization
const KEYWORD_MAPPING = {
  tajwid: {
    keywords: ['tajwid', 'mad', 'idgham', 'ikhfa', 'iqlab', 'ghunnah', 'panjang pendek', 'harakat'],
    label: 'Tajwid perlu diperbaiki'
  },
  makhraj: {
    keywords: ['makhraj', 'huruf', 'pengucapan', 'artikulasi'],
    label: 'Makhraj perlu ditingkatkan'
  },
  kelancaran: {
    keywords: ['lancar', 'kelancaran', 'terbata', 'terhenti', 'tergesa', 'pelan'],
    label: 'Kelancaran perlu ditingkatkan'
  },
  keindahan: {
    keywords: ['keindahan', 'lagu', 'nada', 'irama', 'tartil', 'adab', 'sikap'],
    label: 'Keindahan bacaan perlu ditingkatkan'
  },
  perkembangan: {
    keywords: ['bagus', 'baik', 'mantap', 'meningkat', 'stabil', 'sudah bagus', 'lanjutkan'],
    label: 'Perkembangan baik'
  }
};

/**
 * Count keyword matches for each category
 * @param {string} text - Combined text from all catatan
 * @returns {Object} - { categoryName: matchCount, ... }
 */
function countKeywordMatches(text) {
  const textLower = text.toLowerCase();
  const scores = {};

  Object.entries(KEYWORD_MAPPING).forEach(([category, config]) => {
    let count = 0;
    config.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = textLower.match(regex);
      count += matches ? matches.length : 0;
    });
    scores[category] = count;
  });

  return scores;
}

/**
 * Truncate text to max 120 characters with ellipsis
 * @param {string} text - Text to truncate
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 120) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Filter and clean catatan list
 * @param {Array} catatanList - Raw catatan array
 * @returns {Array} - Cleaned catatan list
 */
function cleanCatatanList(catatanList = []) {
  if (!Array.isArray(catatanList)) return [];

  return catatanList
    .filter(catatan => {
      // Remove null, undefined, empty string, and whitespace-only strings
      if (!catatan || typeof catatan !== 'string') return false;
      return catatan.trim().length > 0;
    })
    .map(catatan => catatan.trim());
}

/**
 * Get top N categories by score
 * @param {Object} scores - Keyword match scores
 * @param {number} topN - Number of top categories to return
 * @returns {Array} - Top categories with scores
 */
function getTopCategories(scores, topN = 2) {
  return Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, topN)
    .map(([category]) => category);
}

/**
 * Main function: Summarize catatan bulanan
 * @param {Array} catatanList - Array of catatan strings
 * @returns {string} - Summarized catatan (max 120 chars) or "–"
 */
export function summarizeCatatanBulanan(catatanList = []) {
  // Clean and filter catatan list
  const cleanedCatatan = cleanCatatanList(catatanList);

  // Case 1: No catatan at all
  if (cleanedCatatan.length === 0) {
    return '–';
  }

  // Case 2: Only 1 catatan - return it as is (truncated if needed)
  if (cleanedCatatan.length === 1) {
    return truncateText(cleanedCatatan[0]);
  }

  // Case 3+: Multiple catatan - create rule-based summary
  // Combine all catatan into one text for keyword matching
  const combinedText = cleanedCatatan.join(' ');

  // Count keyword matches per category
  const scores = countKeywordMatches(combinedText);

  // Get top 2 categories
  const topCategories = getTopCategories(scores, 2);

  // If no keywords matched, fallback to last catatan
  if (topCategories.length === 0) {
    const lastCatatan = cleanedCatatan[cleanedCatatan.length - 1];
    return truncateText(lastCatatan);
  }

  // Build summary from top categories
  const summaryParts = topCategories.map(category => KEYWORD_MAPPING[category].label);
  let summary = '';

  if (summaryParts.length === 1) {
    // Single theme: one sentence
    summary = summaryParts[0] + '.';
  } else {
    // Multiple themes: connect with " & " and end with period
    summary = summaryParts.join(' & ') + '.';
  }

  // Truncate if exceeds 120 characters
  return truncateText(summary);
}

/**
 * Batch summarize catatan for multiple siswa
 * Useful for pre-processing in API route
 * @param {Array} siswaDataList - Array of { siswaId, catatanList, ... }
 * @returns {Array} - Same array but with catatanBulanan field added
 */
export function summarizeCatatanBatch(siswaDataList = []) {
  return siswaDataList.map(siswa => ({
    ...siswa,
    catatanBulanan: summarizeCatatanBulanan(siswa.catatanList || [])
  }));
}
