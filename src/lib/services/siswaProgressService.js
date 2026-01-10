import { surahNameToNumber, getJuzsFromRange, parseSurahRange } from '../quranUtils';

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

  const uniqueJuzSet = new Set();
  
  hafalanRecords.forEach(h => {
    // Primary surah/juz
    if (h.juz) {
      uniqueJuzSet.add(h.juz);
    } else {
      const sNum = h.surahNumber || surahNameToNumber[h.surah];
      if (sNum && h.ayatMulai && h.ayatSelesai) {
        const juzs = getJuzsFromRange(sNum, h.ayatMulai, h.ayatSelesai);
        juzs.forEach(j => uniqueJuzSet.add(j));
      }
    }

    // Surah Tambahan
    let tambahan = [];
    try {
      tambahan = typeof h.surahTambahan === 'string' 
        ? JSON.parse(h.surahTambahan) 
        : (h.surahTambahan || []);
    } catch (e) {
      // ignore parse errors
    }

    if (Array.isArray(tambahan)) {
      tambahan.forEach(item => {
        let sNum = item.surahNumber;
        if (!sNum && item.surah) {
           const parsed = parseSurahRange(item.surah);
           if (parsed.length > 0) sNum = parsed[0].surahNumber;
           else sNum = surahNameToNumber[item.surah];
        }
        
        if (sNum && item.ayatMulai && item.ayatSelesai) {
          const juzs = getJuzsFromRange(sNum, item.ayatMulai, item.ayatSelesai);
          juzs.forEach(j => uniqueJuzSet.add(j));
        } else if (item.juz) {
          uniqueJuzSet.add(Number(item.juz));
        }
      });
    }
  });

  const totalJuz = uniqueJuzSet.size;

  // Sync to Siswa table IF it's a lifetime calculation or if the new count is higher
  // This helps keep latestJuzAchieved somewhat accurate
  if (!schoolYearId) {
    await prisma.siswa.update({
      where: { id: siswaId },
      data: { latestJuzAchieved: totalJuz }
    }).catch(console.error);
  } else {
     // If school year calculation, only update if it's higher than what we have (conservative sync)
     const currentSiswa = await prisma.siswa.findUnique({ where: { id: siswaId }, select: { latestJuzAchieved: true }});
     if (currentSiswa && totalJuz > currentSiswa.latestJuzAchieved) {
        await prisma.siswa.update({
          where: { id: siswaId },
          data: { latestJuzAchieved: totalJuz }
        }).catch(console.error);
     }
  }

  return {
    totalJuz,
    uniqueJuzs: Array.from(uniqueJuzSet).sort((a, b) => a - b),
    recordCount: hafalanRecords.length,
    schoolYearId,
    targetJuzMinimal: schoolYear?.targetHafalan || 3
  };
}

/**
 * Check if student is eligible for Tasmi registration
 * @param {number} currentProgress - Current unique Juz count
 * @param {number} targetJuzMinimal - Minimum target set by school
 * @returns {boolean} Eligibility status
 */
export function isEligibleForTasmi(currentProgress, targetJuzMinimal) {
  if (!targetJuzMinimal || targetJuzMinimal <= 0) return false;
  return (currentProgress || 0) >= targetJuzMinimal;
}
