import { surahNameToNumber, parseSurahRange } from '../quranUtils';
import { calculateJuzProgress } from '../utils/quranProgress';

/**
 * Service to handle student progress calculation and validation
 * SINGLE SOURCE OF TRUTH for Dashboard and Tasmi
 */

/**
 * Calculate student progress for a specific school year (or lifetime if no ID)
 * @param {object} prisma - Prisma client instance
 * @param {string} siswaId - ID of the student
 * @param {string} schoolYearId - ID of the school year (optional)
 * @returns {object} Progress stats
 */
export async function calculateStudentProgress(prisma, siswaId, schoolYearId = null) {
  let dateFilter = {};
  let schoolYear = null;
  
  if (schoolYearId) {
    schoolYear = await prisma.tahunAjaran.findUnique({
      where: { id: schoolYearId },
      select: { id: true, tanggalMulai: true, tanggalSelesai: true, targetHafalan: true, nama: true }
    });
    
    if (schoolYear) {
      dateFilter = {
        tanggal: {
          gte: schoolYear.tanggalMulai,
          lte: schoolYear.tanggalSelesai
        }
      };
    }
  }

  // Fetch records within the date range (or all if no range)
  const hafalanRecords = await prisma.hafalan.findMany({
    where: { 
      siswaId,
      ...dateFilter
    },
    select: {
      juz: true,
      surah: true,
      surahNumber: true,
      ayatMulai: true,
      ayatSelesai: true,
      surahTambahan: true
    }
  });

  // Prepare entries for calculation
  const entries = [];
  
  const addEntry = (item) => {
    let sNum = item.surahNumber;
    if (!sNum && item.surah) {
      const parsed = parseSurahRange(item.surah);
      if (parsed.length > 0) sNum = parsed[0].surahNumber;
      else sNum = surahNameToNumber[item.surah];
    }

    if (sNum && item.ayatMulai && item.ayatSelesai) {
      entries.push({
        surahNumber: sNum,
        ayatMulai: item.ayatMulai,
        ayatSelesai: item.ayatSelesai
      });
    }
  };

  hafalanRecords.forEach(h => {
    // 1. Primary Surah
    addEntry(h);

    // 2. Surah Tambahan
    let tambahan = [];
    try {
      tambahan = typeof h.surahTambahan === 'string' 
        ? JSON.parse(h.surahTambahan) 
        : (h.surahTambahan || []);
    } catch (e) {}

    if (Array.isArray(tambahan)) {
      tambahan.forEach(item => addEntry(item));
    }
  });

  // Calculate final progress per Juz using pure utility
  const result = calculateJuzProgress(entries);
  const { totalJuz, juzProgress } = result;

  // Sync to Siswa table
  const updateData = { latestJuzAchieved: Math.floor(totalJuz) };
  await prisma.siswa.update({
    where: { id: siswaId },
    data: updateData
  }).catch(console.error);

  return {
    totalJuz,
    juzProgress,
    uniqueJuzs: juzProgress.filter(r => r.coveredAyat > 0).map(r => r.juz),
    recordCount: hafalanRecords.length,
    schoolYearId,
    targetJuzMinimal: schoolYear?.targetHafalan || 3
  };
}

/**
 * Check if student is eligible for Tasmi registration
 * @param {number|string} currentProgress - Current unique Juz count
 * @param {number|string} targetJuzMinimal - Minimum target set by school
 * @returns {boolean} Eligibility status
 */
export function isEligibleForTasmi(currentProgress, targetJuzMinimal) {
  const total = Number(currentProgress) || 0;
  const target = Number(targetJuzMinimal) || 0;
  
  if (target <= 0) return false;
  
  // Use a small epsilon to handle float precision issues
  return total + 1e-9 >= target;
}
