/**
 * Calculate average score with consistent rounding
 * Used by both guru and siswa endpoints to ensure consistency
 * 
 * @param {number} tajwid - Score for tajwid (0-100)
 * @param {number} kelancaran - Score for kelancaran (0-100)
 * @param {number} makhraj - Score for makhraj (0-100)
 * @param {number} adab - Score for adab/implementasi (0-100)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Average score with consistent rounding
 */
export function calcAverageScore(tajwid, kelancaran, makhraj, adab, decimals = 2) {
  const scores = [
    Number(tajwid) || 0,
    Number(kelancaran) || 0,
    Number(makhraj) || 0,
    Number(adab) || 0
  ];

  // Filter out 0 if all scores are 0 (invalid case)
  const validScores = scores.filter(s => s > 0);
  if (validScores.length === 0) {
    return 0;
  }

  // Calculate average
  const sum = scores.reduce((acc, score) => acc + score, 0);
  const average = sum / 4;  // Always divide by 4, not by count of valid scores

  // Round to specified decimal places
  return parseFloat(average.toFixed(decimals));
}

/**
 * Calculate average from array of penilaian objects
 * Used for statistics (rataRataNilai, rataRataTajwid, etc.)
 * 
 * @param {Array} penilaianList - Array of penilaian objects
 * @param {string} field - Field name to average ('nilaiAkhir', 'tajwid', 'kelancaran', 'makhraj', 'adab')
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Average value
 */
export function calcStatisticAverage(penilaianList, field, decimals = 2) {
  if (!Array.isArray(penilaianList) || penilaianList.length === 0) {
    return 0;
  }

  const sum = penilaianList.reduce((acc, p) => {
    return acc + (Number(p[field]) || 0);
  }, 0);

  const average = sum / penilaianList.length;
  return parseFloat(average.toFixed(decimals));
}

/**
 * Normalize nilai akhir in response objects to consistent decimal places
 * 
 * @param {Object|Array} data - Single penilaian object or array of objects
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {Object|Array} Data with normalized nilaiAkhir
 */
export function normalizeNilaiAkhir(data, decimals = 2) {
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      nilaiAkhir: parseFloat((Number(item.nilaiAkhir) || 0).toFixed(decimals))
    }));
  }

  return {
    ...data,
    nilaiAkhir: parseFloat((Number(data.nilaiAkhir) || 0).toFixed(decimals))
  };
}
