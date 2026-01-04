import juzMapData from '../quran-juz-map.json';

/**
 * Get Juz number from Surah and Ayah number
 * 
 * @param {number} surahNumber - Surah number (1-114)
 * @param {number} ayahNumber - Ayah number within the surah
 * @returns {number|null} Juz number (1-30) or null if not found/invalid
 */
export function getJuzFromSurahAyah(surahNumber, ayahNumber) {
  try {
    // Validate inputs
    if (
      typeof surahNumber !== 'number' ||
      typeof ayahNumber !== 'number' ||
      surahNumber < 1 ||
      surahNumber > 114 ||
      ayahNumber < 1
    ) {
      console.warn(`[QURAN MAPPING] Invalid input: surah=${surahNumber}, ayah=${ayahNumber}`);
      return null;
    }

    const { juzBoundaries } = juzMapData;

    // Find the juz containing this surah and ayah
    for (const boundary of juzBoundaries) {
      // Check if surah is within this juz range
      const surahInRange =
        (surahNumber > boundary.startSurah && surahNumber < boundary.endSurah) ||
        (surahNumber === boundary.startSurah && ayahNumber >= boundary.startAyah) ||
        (surahNumber === boundary.endSurah && ayahNumber <= boundary.endAyah);

      if (surahInRange) {
        return boundary.juz;
      }
    }

    console.warn(`[QURAN MAPPING] Could not find juz for surah=${surahNumber}, ayah=${ayahNumber}`);
    return null;
  } catch (error) {
    console.error('[QURAN MAPPING] Error in getJuzFromSurahAyah:', error);
    return null;
  }
}

/**
 * Get Juz from existing Hafalan record (with both surah name and number)
 * Prioritize surah number for accuracy
 * 
 * @param {object} hafalan - Hafalan record with surah, surahNumber, ayatMulai
 * @returns {number|null} Juz number or null
 */
export function getJuzFromHafalan(hafalan) {
  if (!hafalan) return null;

  // Try to get surah number
  let surahNum = hafalan.surahNumber;

  // If no surahNumber, try to parse from surahName (fallback, less reliable)
  if (!surahNum && hafalan.surah) {
    // This is a simplified parser - adjust based on your actual surah naming
    const match = hafalan.surah.match(/^(\d+)/);
    if (match) {
      surahNum = parseInt(match[1], 10);
    }
  }

  if (!surahNum) {
    console.warn('[QURAN MAPPING] Cannot extract surah number from hafalan record:', hafalan);
    return null;
  }

  const ayahStart = hafalan.ayatMulai || 1;
  return getJuzFromSurahAyah(surahNum, ayahStart);
}

export default {
  getJuzFromSurahAyah,
  getJuzFromHafalan
};
