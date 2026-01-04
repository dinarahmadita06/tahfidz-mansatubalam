import { prisma } from '@/lib/db';
import { getJuzFromSurahAyah } from '@/lib/helpers/quran-mapping';

/**
 * Backfill juz for existing hafalan records without juz
 * Safe, idempotent script that won't modify other fields
 */
async function backfillJuzForExistingSetoran() {
  console.log('[BACKFILL] Starting juz backfill for existing setoran...');

  try {
    // Get all hafalan records where juz is null
    const hafalanWithoutJuz = await prisma.hafalan.findMany({
      where: {
        juz: null
      },
      select: {
        id: true,
        surah: true,
        surahNumber: true,
        ayatMulai: true,
        siswa: { select: { nama: true } }
      }
    });

    console.log(`[BACKFILL] Found ${hafalanWithoutJuz.length} setoran records without juz`);

    let successCount = 0;
    let failureCount = 0;
    const failedRecords = [];

    // Process each record
    for (const hafalan of hafalanWithoutJuz) {
      try {
        let surahNum = hafalan.surahNumber;

        // If no surahNumber, try to parse from surah string
        if (!surahNum && hafalan.surah) {
          // Try to extract number from surah name (e.g., "1. Al-Fatihah" -> 1)
          const match = hafalan.surah.match(/^(\d+)/);
          if (match) {
            surahNum = parseInt(match[1], 10);
          }
        }

        if (!surahNum) {
          console.warn(`[BACKFILL] Could not extract surah number for hafalan ${hafalan.id} (${hafalan.surah}) - siswa: ${hafalan.siswa.nama}`);
          failureCount++;
          failedRecords.push({
            id: hafalan.id,
            reason: 'Could not extract surah number',
            surah: hafalan.surah
          });
          continue;
        }

        // Get juz from surah and ayah
        const juz = getJuzFromSurahAyah(surahNum, hafalan.ayatMulai);

        if (!juz) {
          console.warn(`[BACKFILL] Could not map juz for hafalan ${hafalan.id} (surah ${surahNum}, ayat ${hafalan.ayatMulai}) - siswa: ${hafalan.siswa.nama}`);
          failureCount++;
          failedRecords.push({
            id: hafalan.id,
            reason: 'Could not map to juz',
            surah: surahNum,
            ayat: hafalan.ayatMulai
          });
          continue;
        }

        // Update record with juz
        await prisma.hafalan.update({
          where: { id: hafalan.id },
          data: {
            juz,
            surahNumber: surahNum // Also save surahNumber for future reference
          }
        });

        successCount++;
        console.log(`[BACKFILL] ✓ Updated hafalan ${hafalan.id} -> Juz ${juz} (Surah ${surahNum}, Ayat ${hafalan.ayatMulai})`);
      } catch (error) {
        console.error(`[BACKFILL] Error updating hafalan ${hafalan.id}:`, error.message);
        failureCount++;
        failedRecords.push({
          id: hafalan.id,
          reason: error.message
        });
      }
    }

    console.log(`\n[BACKFILL] ✅ Backfill complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failureCount}`);

    if (failedRecords.length > 0) {
      console.log(`\n[BACKFILL] Failed records (review needed):`);
      console.log(JSON.stringify(failedRecords, null, 2));
    }

    return {
      success: true,
      processed: hafalanWithoutJuz.length,
      successCount,
      failureCount,
      failedRecords
    };
  } catch (error) {
    console.error('[BACKFILL] Fatal error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the backfill
backfillJuzForExistingSetoran()
  .then((result) => {
    console.log('\n[BACKFILL] Final result:', result);
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('[BACKFILL] Unhandled error:', error);
    process.exit(1);
  });
