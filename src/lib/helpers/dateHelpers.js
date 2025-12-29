/**
 * Format tanggal ke format Indonesia (DD Bulan YYYY)
 * Safe format dengan validasi yang ketat
 * 
 * @param {string|Date|null|undefined} dateValue - Tanggal dari database (createdAt, updatedAt, etc)
 * @returns {string} Tanggal terformat atau '-' jika tidak valid
 * 
 * @example
 * formatTanggalIndonesia('2025-12-29T10:30:00Z') // "29 Desember 2025"
 * formatTanggalIndonesia(new Date('2025-12-29')) // "29 Desember 2025"
 * formatTanggalIndonesia(null) // "-"
 * formatTanggalIndonesia('invalid') // "-"
 */
export function formatTanggalIndonesia(dateValue) {
  // Jika tidak ada tanggal
  if (!dateValue) {
    return '-';
  }

  try {
    const date = new Date(dateValue);
    
    // Validasi apakah date valid (check timestamp validity)
    if (isNaN(date.getTime())) {
      console.warn('Invalid date detected:', dateValue);
      return '-';
    }

    // Format: DD Bulan YYYY (contoh: 29 Desember 2025)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateValue);
    return '-';
  }
}

/**
 * Format tanggal dan waktu ke format Indonesia (DD Bulan YYYY, HH:MM)
 * 
 * @param {string|Date|null|undefined} dateValue - Tanggal dari database
 * @returns {string} Tanggal dan waktu terformat atau '-' jika tidak valid
 * 
 * @example
 * formatTanggalJamIndonesia('2025-12-29T10:30:00Z') // "29 Desember 2025, 10:30"
 */
export function formatTanggalJamIndonesia(dateValue) {
  if (!dateValue) {
    return '-';
  }

  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '-';
    }

    const tanggal = date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const jam = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    return `${tanggal}, ${jam}`;
  } catch (error) {
    console.error('Error formatting date with time:', error);
    return '-';
  }
}

/**
 * Format tanggal ke format ISO (YYYY-MM-DD)
 * Berguna untuk input type="date" di HTML form
 * 
 * @param {string|Date|null|undefined} dateValue - Tanggal dari database
 * @returns {string} Tanggal dalam format ISO atau empty string
 */
export function formatTanggalISO(dateValue) {
  if (!dateValue) {
    return '';
  }

  try {
    const date = new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    // Return format YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date to ISO:', error);
    return '';
  }
}
