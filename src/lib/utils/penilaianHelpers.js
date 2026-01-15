// ===== HELPER FUNCTIONS FOR PENILAIAN =====

/**
 * Safe number conversion with fallback
 * @param {any} value - Value to convert to number
 * @param {number} fallback - Fallback value if conversion fails (default: 0)
 * @returns {number} - Safe number value
 */
export const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? fallback : num;
};

/**
 * Calculate average from array of scores
 * @param {number[]} scores - Array of numeric scores
 * @param {number} fallback - Fallback value if calculation fails (default: 0)
 * @returns {number} - Rounded average or fallback
 */
export const calcAvg = (scores, fallback = 0) => {
  if (!Array.isArray(scores) || scores.length === 0) {
    return fallback;
  }

  const validScores = scores.map((s) => safeNumber(s, 0)).filter((s) => s > 0);

  if (validScores.length === 0) {
    return fallback;
  }

  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
};

/**
 * Calculate average score from assessment components
 * @param {Object} assessment - Assessment object with score fields
 * @returns {number} - Calculated average score
 */
export const calcAssessmentAvg = (assessment) => {
  if (!assessment) return 0;

  const { tajwid, kelancaran, makhraj, implementasi } = assessment;
  const scores = [
    safeNumber(tajwid),
    safeNumber(kelancaran),
    safeNumber(makhraj),
    safeNumber(implementasi),
  ];

  return calcAvg(scores, 0);
};

/**
 * Map assessment data to table row format
 * @param {Object} assessment - Raw assessment from API
 * @returns {Object} - Formatted row data
 */
export const mapAssessmentToRow = (assessment) => {
  if (!assessment) return null;

  const avgScore = safeNumber(assessment.nilaiAkhir, 0);
  
  // Format Surah/Ayat: "Nama Surah (Ayat X-Y)" atau "-" jika kosong
  let surahAyatText = '-';
  if (assessment.surah && assessment.ayat) {
    surahAyatText = `${assessment.surah} (${assessment.ayat})`;
  } else if (assessment.surah) {
    surahAyatText = assessment.surah;
  }

  return {
    id: assessment.id,
    tanggal: assessment.tanggal || '-',
    surah: assessment.surah || '-',
    ayat: assessment.ayat || '-',
    surahAyatFull: surahAyatText, // Format lengkap untuk display
    tajwid: safeNumber(assessment.tajwid, 0),
    kelancaran: safeNumber(assessment.kelancaran, 0),
    makhraj: safeNumber(assessment.makhraj, 0),
    implementasi: safeNumber(assessment.implementasi, 0),
    rataRata: avgScore,
    status: assessment.status || 'belum',
    catatan: assessment.catatan || '-',
    guru: assessment.guru || '-',
  };
};

/**
 * Format date to Indonesian format
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatTanggal = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return '-';
  }
};

/**
 * Determine status based on score
 * @param {number} score - Assessment score
 * @returns {string} - Status (lulus/revisi/belum)
 */
export const getStatusFromScore = (score) => {
  const safeScore = safeNumber(score, 0);

  if (safeScore >= 75) return 'lulus';
  if (safeScore >= 60) return 'revisi';
  return 'belum';
};

/**
 * Merge attendance and assessment data by date
 * @param {Array} attendanceList - Array of attendance records
 * @param {Array} assessmentList - Array of assessment records
 * @returns {Array} - Merged daily progress data sorted by date (newest first)
 */
export const mergeAttendanceWithAssessmentsByDate = (attendanceList = [], assessmentList = []) => {
  if (!Array.isArray(attendanceList) || !Array.isArray(assessmentList)) {
    return [];
  }

  // Create a map of assessments by date
  const assessmentsByDate = new Map();
  assessmentList.forEach((assessment) => {
    if (!assessment.tanggal) return;

    const dateKey = new Date(assessment.tanggal).toISOString().split('T')[0];
    if (!assessmentsByDate.has(dateKey)) {
      assessmentsByDate.set(dateKey, []);
    }
    assessmentsByDate.get(dateKey).push(assessment);
  });

  // Merge attendance with assessments
  const mergedData = attendanceList.map((attendance) => {
    const dateKey = new Date(attendance.tanggal).toISOString().split('T')[0];
    const dailyAssessments = assessmentsByDate.get(dateKey) || [];

    return {
      id: attendance.id,
      tanggal: attendance.tanggal,
      kegiatan: attendance.kegiatan || 'Kegiatan Tahfidz',
      status: attendance.status,
      jam: attendance.jam,
      catatan: attendance.catatan,
      assessments: dailyAssessments.map((a) => ({
        id: a.id,
        surah: a.surah,
        ayat: a.ayat,
        tajwid: safeNumber(a.tajwid, 0),
        kelancaran: safeNumber(a.kelancaran, 0),
        makhraj: safeNumber(a.makhraj, 0),
        implementasi: safeNumber(a.implementasi, 0),
        nilaiAkhir: safeNumber(a.nilaiAkhir, 0),
        catatan: a.catatan || '',
        guru: a.guru || '-',
      })),
      hasAssessment: dailyAssessments.length > 0,
    };
  });

  // Sort by date (newest first)
  return mergedData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
};
