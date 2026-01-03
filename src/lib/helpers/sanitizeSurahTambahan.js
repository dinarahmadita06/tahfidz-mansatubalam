/**
 * Sanitize and validate surahTambahan array before sending to API
 * 
 * Rules:
 * - Filter out empty or invalid items
 * - Ensure surah field is not empty
 * - Ensure ayatMulai and ayatSelesai are valid numbers
 * - Ensure ayatMulai <= ayatSelesai
 * 
 * @param {Array} surahArray - Array of surah tambahan objects
 * @returns {Array} Cleaned and validated array, or empty array if none valid
 */
export function cleanSurahTambahan(surahArray) {
  if (!Array.isArray(surahArray)) return [];

  return surahArray
    .filter(item => {
      // Check if surah field exists and is not empty
      if (!item.surah || (typeof item.surah === 'string' && !item.surah.trim())) {
        return false;
      }

      // Validate ayat numbers
      const ayatMulai = Number(item.ayatMulai);
      const ayatSelesai = Number(item.ayatSelesai);

      // Check if both are valid numbers and > 0
      if (isNaN(ayatMulai) || isNaN(ayatSelesai) || ayatMulai <= 0 || ayatSelesai <= 0) {
        return false;
      }

      // Ensure ayatMulai <= ayatSelesai
      if (ayatMulai > ayatSelesai) {
        return false;
      }

      return true;
    })
    .map(item => ({
      surah: typeof item.surah === 'string' ? item.surah.trim() : item.surah,
      ayatMulai: Number(item.ayatMulai),
      ayatSelesai: Number(item.ayatSelesai)
    }));
}

/**
 * Validate individual surah tambahan item
 * @param {Object} item - Single surah item to validate
 * @returns {Object} { isValid: boolean, error?: string }
 */
export function validateSurahItem(item) {
  if (!item.surah || (typeof item.surah === 'string' && !item.surah.trim())) {
    return { isValid: false, error: 'Nama surah tidak boleh kosong' };
  }

  const ayatMulai = Number(item.ayatMulai);
  const ayatSelesai = Number(item.ayatSelesai);

  if (isNaN(ayatMulai) || isNaN(ayatSelesai)) {
    return { isValid: false, error: 'Ayat harus berupa angka' };
  }

  if (ayatMulai <= 0 || ayatSelesai <= 0) {
    return { isValid: false, error: 'Nomor ayat harus lebih besar dari 0' };
  }

  if (ayatMulai > ayatSelesai) {
    return { isValid: false, error: 'Ayat mulai tidak boleh lebih besar dari ayat selesai' };
  }

  return { isValid: true };
}

/**
 * Prepare payload for penilaian API with cleaned surah tambahan
 * @param {Object} formData - Raw form data from frontend
 * @returns {Object} Cleaned payload ready to send to API
 */
export function preparePenilaianPayload(formData) {
  return {
    ...formData,
    surahTambahan: cleanSurahTambahan(formData.surahTambahan || [])
  };
}
