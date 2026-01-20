import { JUZ_MAPPING, getTotalVersesInJuz } from '../constants/quranMetadata';

/**
 * Merge overlapping intervals and return total unique coverage
 * @param {Array} intervals - Array of [start, end]
 * @returns {number}
 */
export function mergeIntervals(intervals) {
  if (intervals.length === 0) return 0;
  
  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
  const merged = [];
  let current = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next[0] <= current[1] + 1) {
      current[1] = Math.max(current[1], next[1]);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);
  
  return merged.reduce((sum, [start, end]) => sum + (end - start + 1), 0);
}

/**
 * Calculate progress per Juz based on verse-level coverage
 * @param {Array} records - Array of hafalan records { surahNumber, ayatMulai, ayatSelesai }
 * @returns {Object} { totalJuz, juzProgress: [] }
 */
export function calculateJuzProgress(records) {
  const juzCoverage = {};
  for (let j = 1; j <= 30; j++) {
    juzCoverage[j] = {
      totalAyat: getTotalVersesInJuz(j),
      intervals: []
    };
  }

  const processEntry = (item) => {
    const sNum = item.surahNumber;
    const startAyat = item.ayatMulai;
    const endAyat = item.ayatSelesai;

    if (!sNum || !startAyat || !endAyat) return;

    for (let j = 1; j <= 30; j++) {
      const mappings = JUZ_MAPPING[j];
      let juzOffset = 0;
      
      for (const map of mappings) {
        if (map.surah === sNum) {
          const overlapStart = Math.max(startAyat, map.from);
          const overlapEnd = Math.min(endAyat, map.to);
          
          if (overlapStart <= overlapEnd) {
            const relativeStart = overlapStart - map.from + juzOffset + 1;
            const relativeEnd = overlapEnd - map.from + juzOffset + 1;
            juzCoverage[j].intervals.push([relativeStart, relativeEnd]);
          }
        }
        juzOffset += (map.to - map.from + 1);
      }
    }
  };

  records.forEach(processEntry);

  const juzResults = [];
  let totalJuzEquivalent = 0;

  for (let j = 1; j <= 30; j++) {
    const coveredAyat = mergeIntervals(juzCoverage[j].intervals);
    const totalAyat = juzCoverage[j].totalAyat;
    const percent = totalAyat > 0 ? (coveredAyat / totalAyat) * 100 : 0;
    
    totalJuzEquivalent += (coveredAyat / totalAyat);

    juzResults.push({
      juz: j,
      label: `Juz ${j}`,
      progress: parseFloat(percent.toFixed(1)),
      coveredAyat,
      totalAyat
    });
  }

  return {
    totalJuz: parseFloat(totalJuzEquivalent.toFixed(2)),
    juzProgress: juzResults
  };
}

/**
 * Find which juz contains the given surah and ayah
 * @param {number} surahNumber - Surah number (1-114)
 * @param {number} ayahNumber - Ayah number in the surah
 * @returns {number} Juz number (1-30) or 0 if not found
 */
export function findJuzByPosition(surahNumber, ayahNumber) {
  if (!surahNumber || ayahNumber === undefined || ayahNumber === null) return 0;

  for (let juz = 1; juz <= 30; juz++) {
    const mappings = JUZ_MAPPING[juz];
    for (const mapping of mappings) {
      if (mapping.surah === surahNumber && 
          ayahNumber >= mapping.from && 
          ayahNumber <= mapping.to) {
        return juz;
      }
    }
  }
  return 0;
}

/**
 * Get the highest juz number that has been completed
 * 
 * NEW APPROACH: Determines juz based on highest surah+ayah position achieved
 * - Find the maximum (surah, ayah) position across all hafalan records
 * - Map that position to determine which juz it belongs to
 * - Only count a juz as "achieved" if the highest ayah reaches the END of that juz
 * 
 * @param {Array} juzProgress - Array of juz progress objects (for compatibility)
 * @param {Array} hafalanRecords - Raw hafalan records with surah/ayah info
 * @returns {number} Highest juz achieved (1-30), or 0 if none
 */
export function getHighestJuzAchieved(juzProgress, hafalanRecords = null) {
  // Must have hafalan records to determine accurate position
  if (!hafalanRecords || !Array.isArray(hafalanRecords) || hafalanRecords.length === 0) {
    return 0;
  }

  // Find the highest (surah, ayah) position
  let highestSurah = 0;
  let highestAyah = 0;

  hafalanRecords.forEach(record => {
    const surah = Number(record.surahNumber);
    const ayahEnd = Number(record.ayatSelesai);

    // Compare position: higher surah number is always higher
    // If same surah, compare ayah number
    if (surah > highestSurah || (surah === highestSurah && ayahEnd > highestAyah)) {
      highestSurah = surah;
      highestAyah = ayahEnd;
    }
  });

  if (highestSurah === 0) return 0;

  // Find which juz this position belongs to
  const juzAtPosition = findJuzByPosition(highestSurah, highestAyah);
  
  // Now check if this juz is FULLY COMPLETED
  // Juz is achieved only if position >= last ayah of the juz
  if (juzAtPosition > 0) {
    const juzMappings = JUZ_MAPPING[juzAtPosition];
    if (juzMappings && juzMappings.length > 0) {
      const lastMapping = juzMappings[juzMappings.length - 1];
      const juzEndSurah = lastMapping.surah;
      const juzEndAyah = lastMapping.to;

      // Position must reach or exceed the end of the juz to count as achieved
      if (highestSurah > juzEndSurah || 
          (highestSurah === juzEndSurah && highestAyah >= juzEndAyah)) {
        return juzAtPosition;
      } else if (juzAtPosition > 1) {
        // If not at end of this juz, return the previous juz as highest achieved
        return juzAtPosition - 1;
      } else {
        // In first juz but not completed
        return 0;
      }
    }
  }

  return 0;
}

/**
 * Filter and sort juz progress for dashboard view
 * @param {Array} juzProgress - Array of juz progress objects
 * @param {number} limit - Maximum number of juz to show
 * @returns {Array} Filtered and sorted juz progress
 */
export function getDashboardJuzProgress(juzProgress, limit = 5) {
  if (!juzProgress || !Array.isArray(juzProgress)) return [];

  return juzProgress
    .filter(item => item.progress > 0)
    .sort((a, b) => {
      // Sort by progress descending
      if (b.progress !== a.progress) {
        return b.progress - a.progress;
      }
      // If progress is equal, sort by juz number ascending
      return a.juz - b.juz;
    })
    .slice(0, limit);
}
