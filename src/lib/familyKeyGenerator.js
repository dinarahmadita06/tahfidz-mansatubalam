/**
 * Family Key Generator
 * Generates a unique key to group siblings in the same family
 * 
 * Rules (Priority Order):
 * 1. If namaWali exists: normalize(namaWali) + "|WALI|" + normalize(alamat_optional)
 * 2. Else if namaAyah AND namaIbu exist: normalize(namaAyah) + "|" + normalize(namaIbu) + "|" + normalize(alamat_optional)
 * 3. Else if only namaIbu: normalize(namaIbu) + "|_missing_|" + normalize(alamat_optional)
 * 4. Else if only namaAyah: normalize(namaAyah) + "|_missing_|" + normalize(alamat_optional)
 * 5. Fallback (inconsistent data): "SINGLE|" + NIS
 */

/**
 * Normalize string for consistent matching
 * - Convert to lowercase
 * - Trim whitespace
 * - Remove common punctuation
 * - Replace multiple spaces with single space
 */
function normalize(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?()]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Generate family key from student data
 * 
 * @param {Object} data - Student data
 * @param {string} data.namaWali - Wali name (optional)
 * @param {string} data.namaAyah - Father name (optional)
 * @param {string} data.namaIbu - Mother name (optional)
 * @param {string} data.alamat - Address (optional)
 * @param {string} data.nis - Student NIS (fallback)
 * @returns {string} Family key
 */
export function generateFamilyKey({ namaWali, namaAyah, namaIbu, alamat, nis }) {
  const normAlamat = normalize(alamat);

  // Rule 1: Wali exists (highest priority)
  if (namaWali && namaWali.trim()) {
    const normWali = normalize(namaWali);
    return `${normWali}|WALI|${normAlamat}`;
  }

  // Rule 2: Both ayah and ibu exist
  if (namaAyah && namaAyah.trim() && namaIbu && namaIbu.trim()) {
    const normAyah = normalize(namaAyah);
    const normIbu = normalize(namaIbu);
    return `${normAyah}|${normIbu}|${normAlamat}`;
  }

  // Rule 3: Single parent - only ibu
  if (namaIbu && namaIbu.trim()) {
    const normIbu = normalize(namaIbu);
    return `${normIbu}|_missing_|${normAlamat}`;
  }

  // Rule 4: Single parent - only ayah
  if (namaAyah && namaAyah.trim()) {
    const normAyah = normalize(namaAyah);
    return `${normAyah}|_missing_|${normAlamat}`;
  }

  // Rule 5: Fallback - no parent data (isolate to prevent wrong merging)
  return `SINGLE|${nis}`;
}

/**
 * Check if a family key represents a single-child family
 * (used for conditional UI logic)
 */
export function isSingleChildKey(familyKey) {
  return familyKey && familyKey.startsWith('SINGLE|');
}

/**
 * Extract NIS from single-child family key
 */
export function extractNisFromSingleKey(familyKey) {
  if (isSingleChildKey(familyKey)) {
    return familyKey.replace('SINGLE|', '');
  }
  return null;
}
