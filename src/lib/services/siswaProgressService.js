import { getSurahNumber, parseSurahRange } from '../quranUtils';
import { calculateJuzProgress, getHighestJuzAchieved, getCompletedJuzCount } from '../utils/quranProgress';

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
  
  console.log('[PROGRESS SERVICE] Calculate for siswaId:', siswaId, 'schoolYearId:', schoolYearId);
  
  if (schoolYearId) {
    schoolYear = await prisma.tahunAjaran.findUnique({
      where: { id: schoolYearId },
      select: { id: true, tanggalMulai: true, tanggalSelesai: true, targetHafalan: true, nama: true }
    });
    
    console.log('[PROGRESS SERVICE] School year found:', schoolYear ? schoolYear.nama : 'NOT FOUND');
    
    if (schoolYear) {
      dateFilter = {
        tanggal: {
          gte: schoolYear.tanggalMulai,
          lte: schoolYear.tanggalSelesai
        }
      };
      console.log('[PROGRESS SERVICE] Using date filter:', dateFilter);
    }
  } else {
    console.log('[PROGRESS SERVICE] No schoolYearId - calculating ALL TIME progress');
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
  
  console.log('[PROGRESS SERVICE] Found hafalan records:', hafalanRecords.length);

  // Prepare entries for calculation
  const entries = [];
  
  const addEntry = (item) => {
    let sNum = item.surahNumber;
    if (!sNum && item.surah) {
      const parsed = parseSurahRange(item.surah);
      if (parsed.length > 0) sNum = parsed[0].surahNumber;
      else sNum = getSurahNumber(item.surah); // Case-insensitive lookup
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

  // Get the highest juz achieved based on highest surah+ayah position
  // Pass the processed entries (not raw hafalanRecords) to get accurate position-based determination
  const highestJuzAchieved = getHighestJuzAchieved(juzProgress, entries);
  
  // Get completed juz count (progress >= 100%) for Tasmi eligibility
  const completedJuzCount = getCompletedJuzCount(juzProgress);

  // Sync to Siswa table - use highest juz achieved (not float total)
  const updateData = { latestJuzAchieved: highestJuzAchieved };
  await prisma.siswa.update({
    where: { id: siswaId },
    data: updateData
  }).catch(console.error);

  return {
    totalJuz,
    highestJuzAchieved, // Integer juz count (all juz with progress > 0%) - for general stats
    completedJuzCount, // NEW: Integer juz count (only juz with progress >= 100%) - for Tasmi
    juzProgress,
    uniqueJuzs: juzProgress.filter(r => r.coveredAyat > 0).map(r => r.juz),
    recordCount: hafalanRecords.length,
    schoolYearId,
    targetJuzMinimal: schoolYear?.targetHafalan || 3
  };
}

/**
 * Check if student is eligible for Tasmi registration
 * UPDATED: Now uses completedJuzCount (juz with progress >= 100%)
 * 
 * @param {number} completedJuzCount - Number of juz with progress >= 100%
 * @param {number} targetJuzMinimal - Target minimal dari sekolah (e.g., 1, 2, 3 juz)
 * @returns {object} { isEligible: boolean, remainingJuz: number, message: string }
 */
export function isEligibleForTasmi(completedJuzCount, targetJuzMinimal) {
  const completed = Number(completedJuzCount) || 0;
  const target = Number(targetJuzMinimal) || 0;
  
  if (target <= 0) return { isEligible: false, remainingJuz: target, message: 'Konfigurasi target tidak valid' };
  
  const isEligible = completed >= target;
  const remainingJuz = Math.max(0, target - completed);
  
  let message = '';
  if (isEligible) {
    message = `Siap Mendaftar (Sudah ${completed} Juz selesai 100%)`;
  } else {
    message = `Belum Siap. Butuh ${remainingJuz} Juz lagi untuk diselesaikan 100% (Target: ${target} Juz)`;
  }
  
  return {
    isEligible,
    remainingJuz,
    message
  };
}
