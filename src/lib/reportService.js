/**
 * Report Service - Utility functions for generating and exporting reports
 */

/**
 * Calculate date range based on period type
 * @param {string} periode - Period type (harian, mingguan, bulanan, semester1, semester2, custom)
 * @param {string} customStart - Custom start date (for custom period)
 * @param {string} customEnd - Custom end date (for custom period)
 * @returns {Object} - { startDate, endDate }
 */
export function calculateDateRange(periode, customStart = null, customEnd = null) {
  const today = new Date();
  let startDate, endDate;

  switch (periode) {
    case 'harian':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'mingguan':
      startDate = new Date(today.setDate(today.getDate() - 7));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'bulanan':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'semester1':
      startDate = new Date(today.getFullYear(), 6, 1); // Juli
      endDate = new Date(today.getFullYear(), 11, 31); // Desember
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'semester2':
      startDate = new Date(today.getFullYear(), 0, 1); // Januari
      endDate = new Date(today.getFullYear(), 5, 30); // Juni
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'custom':
      startDate = customStart ? new Date(customStart) : null;
      endDate = customEnd ? new Date(customEnd) : null;
      if (endDate) {
        endDate.setHours(23, 59, 59, 999);
      }
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

/**
 * Fetch classes taught by the logged-in guru
 * Gets guruId from session automatically via API
 * @returns {Promise<Array>} - Array of kelas objects
 */
export async function fetchKelasGuru() {
  try {
    const response = await fetch('/api/guru/kelas', {
      credentials: 'include', // Ensure cookies are sent for session
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch kelas`);
    }

    const data = await response.json();

    // API returns { kelas: [...] }
    return Array.isArray(data.kelas) ? data.kelas : [];
  } catch (error) {
    console.error('Error fetching kelas guru:', error);
    throw error; // Re-throw to let caller handle it
  }
}

/**
 * Fetch laporan data based on filters
 * @param {Object} filters - { kelasId, periode, tanggalMulai, tanggalSelesai }
 * @returns {Promise<Object>} - Report data
 */
export async function fetchLaporan(filters) {
  try {
    const { startDate, endDate } = calculateDateRange(
      filters.periode,
      filters.tanggalMulai,
      filters.tanggalSelesai
    );

    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error('Invalid date range');
    }

    const params = new URLSearchParams({
      viewMode: filters.periode === 'harian' ? 'harian' : filters.periode === 'mingguan' || filters.periode === 'bulanan' ? 'bulanan' : 'semesteran',
      periode: filters.periode,
      tanggalMulai: startDate.toISOString(),
      tanggalSelesai: endDate.toISOString(),
    });

    if (filters.kelasId) {
      params.append('kelasId', filters.kelasId);
    }

    if (filters.tanggal) {
      params.append('tanggal', filters.tanggal);
    }

    const response = await fetch(`/api/guru/laporan?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch laporan`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch laporan');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching laporan:', error);
    throw error;
  }
}

/**
 * Export laporan to PDF (reusing admin template)
 * @param {Object} data - { viewMode, kelasId, periode, laporanData, kelasNama }
 * @returns {Promise<void>}
 */
export async function handleExportPDF(data) {
  try {
    const response = await fetch('/api/guru/laporan/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'PDF',
        viewMode: data.viewMode,
        kelasId: data.kelasId,
        periode: data.periode,
        data: data.laporanData,
        kelasNama: data.kelasNama,
      }),
    });

    const result = await response.json();

    if (result.success && result.html) {
      // Open PDF in new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(result.html);
        printWindow.document.close();
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Pop-up blocker mencegah membuka window cetak. Silakan izinkan pop-up untuk situs ini.',
        };
      }
    } else {
      return {
        success: false,
        error: result.error || 'Gagal mengunduh PDF',
      };
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan saat mengunduh PDF',
    };
  }
}

/**
 * Format period label for display
 * @param {string} periode - Period type
 * @returns {string} - Formatted label
 */
export function getPeriodLabel(periode) {
  const labels = {
    harian: 'Harian',
    mingguan: 'Mingguan (7 hari terakhir)',
    bulanan: 'Bulanan',
    semester1: 'Semester 1 (Juli - Desember)',
    semester2: 'Semester 2 (Januari - Juni)',
    custom: 'Custom',
  };
  return labels[periode] || 'Bulanan';
}
