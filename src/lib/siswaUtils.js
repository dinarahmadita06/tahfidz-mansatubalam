/**
 * Utility functions for Siswa management
 */

/**
 * Generate email siswa dari nama dan NIS
 * Format: kataAwalNamaSiswa.NIS@siswa.tahfidz.sch.id
 * Contoh: Ahmad Fauzi + NIS 2024001 = ahmad.2024001@siswa.tahfidz.sch.id
 */
export function generateSiswaEmail(name, nis) {
  if (!name || !nis) return '';

  // Ambil kata pertama dari nama, lowercase, hilangkan spasi
  const firstName = name.trim().split(' ')[0].toLowerCase();

  // Clean NIS (remove spaces, special chars)
  const cleanNis = String(nis).trim().replace(/[^a-zA-Z0-9]/g, '');

  return `${firstName}.${cleanNis}@siswa.tahfidz.sch.id`;
}

/**
 * Normalize gender input ke enum yang valid
 * Accepts: "Laki-laki", "LAKI_LAKI", "Pria", "L", "P", "Wanita", "Perempuan"
 * Returns: "LAKI_LAKI" atau "PEREMPUAN"
 */
export function normalizeGender(input) {
  if (!input) return 'LAKI_LAKI'; // default

  const normalized = String(input).toUpperCase().trim();

  // Check for male indicators
  if (
    normalized === 'L' ||
    normalized === 'LAKI-LAKI' ||
    normalized === 'LAKI_LAKI' ||
    normalized === 'PRIA' ||
    normalized === 'MALE' ||
    normalized === 'M'
  ) {
    return 'LAKI_LAKI';
  }

  // Check for female indicators
  if (
    normalized === 'P' ||
    normalized === 'PEREMPUAN' ||
    normalized === 'WANITA' ||
    normalized === 'FEMALE' ||
    normalized === 'F'
  ) {
    return 'PEREMPUAN';
  }

  // Default to LAKI_LAKI if unrecognized
  return 'LAKI_LAKI';
}

/**
 * Format gender untuk display
 */
export function formatGender(gender) {
  return gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan';
}

/**
 * Validate NISN (10 digits)
 */
export function validateNISN(nisn) {
  if (!nisn) return { valid: false, error: 'NISN tidak boleh kosong' };

  const nisnStr = String(nisn).trim();

  if (nisnStr.length !== 10) {
    return { valid: false, error: 'NISN harus 10 digit' };
  }

  if (!/^\d+$/.test(nisnStr)) {
    return { valid: false, error: 'NISN hanya boleh berisi angka' };
  }

  return { valid: true };
}

/**
 * Validate NIS
 */
export function validateNIS(nis) {
  if (!nis) return { valid: false, error: 'NIS tidak boleh kosong' };

  const nisStr = String(nis).trim();

  if (nisStr.length < 3) {
    return { valid: false, error: 'NIS minimal 3 karakter' };
  }

  return { valid: true };
}

/**
 * Search helper - check if siswa matches search term
 */
export function matchesSearch(siswa, searchTerm) {
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase();
  const name = siswa.user?.name?.toLowerCase() || '';
  const email = siswa.user?.email?.toLowerCase() || '';
  const nisn = siswa.nisn?.toLowerCase() || '';
  const nis = siswa.nis?.toLowerCase() || '';

  // Search dalam nama orang tua
  const parentName = siswa.orangTuaSiswa?.[0]?.orangTua?.user?.name?.toLowerCase() || '';

  return (
    name.includes(term) ||
    email.includes(term) ||
    nisn.includes(term) ||
    nis.includes(term) ||
    parentName.includes(term)
  );
}
