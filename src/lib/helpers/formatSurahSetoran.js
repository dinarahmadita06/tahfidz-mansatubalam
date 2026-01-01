/**
 * Format Surah Setoran helper function
 * Combines main surah and additional surahs into a readable display format
 */

/**
 * Format single surah entry
 * @param {string} surah - Surah name
 * @param {number} ayatMulai - Starting ayat
 * @param {number} ayatSelesai - Ending ayat
 * @returns {string} Formatted surah text
 */
export function formatSingleSurah(surah, ayatMulai, ayatSelesai) {
  if (!surah || ayatMulai === undefined || ayatSelesai === undefined) {
    return '';
  }
  return `${surah} (${ayatMulai}–${ayatSelesai})`;
}

/**
 * Format complete surah setoran (main + additional)
 * @param {object} hafalan - Hafalan object with surah, ayatMulai, ayatSelesai, surahTambahan
 * @returns {array} Array of formatted surah strings
 */
export function formatSurahSetoran(hafalan) {
  const result = [];

  // Add main surah
  if (hafalan.surah && hafalan.ayatMulai && hafalan.ayatSelesai) {
    result.push(
      formatSingleSurah(hafalan.surah, hafalan.ayatMulai, hafalan.ayatSelesai)
    );
  }

  // Add additional surahs from array
  if (hafalan.surahTambahan && Array.isArray(hafalan.surahTambahan)) {
    hafalan.surahTambahan.forEach((item) => {
      if (item.surah && item.ayatMulai && item.ayatSelesai) {
        result.push(
          formatSingleSurah(item.surah, item.ayatMulai, item.ayatSelesai)
        );
      }
    });
  }

  return result;
}

/**
 * Get display text for surah setoran (joined by comma)
 * @param {object} hafalan - Hafalan object
 * @returns {string} Comma-separated surah text
 */
export function getSurahSetoranText(hafalan) {
  const formatted = formatSurahSetoran(hafalan);
  return formatted.join(', ');
}

/**
 * Check if hafalan has multiple surahs
 * @param {object} hafalan - Hafalan object
 * @returns {boolean}
 */
export function haMultipleSurahs(hafalan) {
  if (!hafalan.surah) return false;
  return hafalan.surahTambahan && Array.isArray(hafalan.surahTambahan) && hafalan.surahTambahan.length > 0;
}
