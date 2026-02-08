import juzMapData from './quran-juz-map.json';

// Mapping of Surah names (transliteration) to their numbers
export const surahNameToNumber = {
  "Al-Fatihah": 1, "Al-Baqarah": 2, "Ali 'Imran": 3, "Ali Imran": 3, "An-Nisa": 4, "An-Nisa'": 4, "Al-Ma'idah": 5, "Al-Maidah": 5,
  "Al-An'am": 6, "Al-Anam": 6, "Al-A'raf": 7, "Al-Araf": 7, "Al-Anfal": 8, "At-Taubah": 9, "Yunus": 10,
  "Hud": 11, "Yusuf": 12, "Ar-Ra'd": 13, "Ar-Rad": 13, "Ibrahim": 14, "Al-Hijr": 15,
  "An-Nahl": 16, "Al-Isra": 17, "Al-Isra'": 17, "Al-Kahf": 18, "Maryam": 19, "Taha": 20,
  "Al-Anbiya": 21, "Al-Anbiya'": 21, "Al-Hajj": 22, "Al-Mu'minun": 23, "Al-Muminun": 23, "An-Nur": 24, "Al-Furqan": 25,
  "Asy-Syu'ara": 26, "Asy-Syuara": 26, "An-Naml": 27, "Al-Qasas": 28, "Al-Ankabut": 29, "Ar-Rum": 30,
  "Luqman": 31, "As-Sajdah": 32, "Al-Ahzab": 33, "Saba'": 34, "Saba": 34, "Fatir": 35,
  "Yasin": 36, "As-Saffat": 37, "Sad": 38, "Az-Zumar": 39, "Ghafir": 40,
  "Fussilat": 41, "Asy-Syura": 42, "Az-Zukhruf": 43, "Ad-Dukhan": 44, "Al-Jasiyah": 45,
  "Al-Ahqaf": 46, "Muhammad": 47, "Al-Fath": 48, "Al-Hujurat": 49, "Qaf": 50,
  "Az-Zariyat": 51, "At-Tur": 52, "An-Najm": 53, "Al-Qamar": 54, "Ar-Rahman": 55,
  "Al-Waqi'ah": 56, "Al-Waqiah": 56, "Al-Hadid": 57, "Al-Mujadilah": 58, "Al-Hasyr": 59, "Al-Mumtahanah": 60,
  "As-Saff": 61, "Al-Jumu'ah": 62, "Al-Jumuah": 62, "Al-Munafiqun": 63, "At-Taghabun": 64, "At-Talaq": 65,
  "At-Tahrim": 66, "Al-Mulk": 67, "Al-Qalam": 68, "Al-Haqqah": 69, "Al-Ma'arij": 70, "Al-Maarij": 70,
  "Nuh": 71, "Al-Jinn": 72, "Al-Muzzammil": 73, "Al-Muddassir": 74, "Al-Qiyamah": 75,
  "Al-Insan": 76, "Al-Mursalat": 77, "An-Naba": 78, "An-Nazi'at": 79, "An-Naziat": 79, "Abasa": 80,
  "At-Takwir": 81, "Al-Infitar": 82, "Al-Mutaffifin": 83, "Al-Insyiqaq": 84, "Al-Buruj": 85,
  "At-Tariq": 86, "Al-A'la": 87, "Al-Ala": 87, "Al-Ghasyiyah": 88, "Al-Fajr": 89, "Al-Balad": 90,
  "Asy-Syams": 91, "Al-Lail": 92, "Ad-Duha": 93, "Asy-Syarh": 94, "At-Tin": 95,
  "Al-Alaq": 96, "Al-Qadr": 97, "Al-Bayyinah": 98, "Az-Zalzalah": 99, "Al-Adiyat": 100,
  "Al-Qari'ah": 101, "Al-Qariah": 101, "At-Takasur": 102, "Al-Asr": 103, "Al-Humazah": 104, "Al-Fil": 105,
  "Quraisy": 106, "Al-Ma'un": 107, "Al-Maun": 107, "Al-Kausar": 108, "Al-Kafirun": 109, "An-Nasr": 110,
  "Al-Lahab": 111, "Al-Ikhlas": 112, "Al-Falaq": 113, "An-Nas": 114
};

/**
 * Normalize surah name for case-insensitive lookup
 * Converts "al-baqarah" → "Al-Baqarah"
 * @param {string} surahName - Raw surah name
 * @returns {string} Normalized surah name in Title Case
 */
export function normalizeSurahName(surahName) {
  if (!surahName || typeof surahName !== 'string') return '';
  
  // Split by dash or space, capitalize first letter of each word
  return surahName
    .split(/[-\s]/)
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('-');
}

/**
 * Get surah number from surah name (case-insensitive)
 * @param {string} surahName - Surah name (any case)
 * @returns {number|null} Surah number or null if not found
 */
export function getSurahNumber(surahName) {
  if (!surahName) return null;
  
  // Try direct lookup first
  let num = surahNameToNumber[surahName];
  if (num) return num;
  
  // Try normalized lookup
  const normalized = normalizeSurahName(surahName);
  num = surahNameToNumber[normalized];
  if (num) return num;
  
  return null;
}

/**
 * Get Juz number from Surah and Ayah number
 */
export function getJuzFromSurahAyah(surahNumber, ayahNumber) {
  if (!surahNumber || !ayahNumber) return null;
  const { juzBoundaries } = juzMapData;
  for (const boundary of juzBoundaries) {
    const surahInRange =
      (surahNumber > boundary.startSurah && surahNumber < boundary.endSurah) ||
      (surahNumber === boundary.startSurah && ayahNumber >= boundary.startAyah) ||
      (surahNumber === boundary.endSurah && ayahNumber <= boundary.endAyah);

    if (surahInRange) return boundary.juz;
  }
  return null;
}

/**
 * Get all Juz covered by a surah and ayah range
 */
export function getJuzsFromRange(surahNumber, ayatMulai, ayatSelesai) {
  const juzs = new Set();
  const startJuz = getJuzFromSurahAyah(surahNumber, ayatMulai);
  const endJuz = getJuzFromSurahAyah(surahNumber, ayatSelesai);
  
  if (startJuz) juzs.add(startJuz);
  if (endJuz) juzs.add(endJuz);
  
  // If they span multiple juz, include the ones in between
  if (startJuz && endJuz && startJuz < endJuz) {
    for (let i = startJuz + 1; i < endJuz; i++) {
      juzs.add(i);
    }
  }
  
  return Array.from(juzs);
}

/**
 * Parse a surah string like "Ali Imran (1-198)" or "Al-Baqarah 1-5"
 */
export function parseSurahRange(input) {
  if (!input) return [];
  
  // Handle multiple entries separated by comma
  const entries = input.split(/,(?![^(]*\))/).map(s => s.trim());
  const results = [];

  for (const entry of entries) {
    // Regex to match "Surah Name (start-end)" or "Surah Name start-end"
    // Also matches "1. Surah Name" pattern
    const regex = /^(\d+\.\s*)?(.+?)\s*\(?(\d+)\s*[-–]\s*(\d+)\)?$/;
    const match = entry.match(regex);

    if (match) {
      const name = match[2].trim();
      const start = parseInt(match[3]);
      const end = parseInt(match[4]);
      
      let surahNum = getSurahNumber(name);
      
      // Try to get number from the "1. Surah" prefix if name mapping fails
      if (!surahNum && match[1]) {
        surahNum = parseInt(match[1]);
      }
      
      if (surahNum) {
        results.push({ surahNumber: surahNum, surahName: name, ayatMulai: start, ayatSelesai: end });
      }
    } else {
      // Try fallback for just surah name if no range
      const fallbackRegex = /^(\d+\.\s*)?(.+?)$/;
      const fallbackMatch = entry.match(fallbackRegex);
      if (fallbackMatch) {
         const name = fallbackMatch[2].trim();
         let surahNum = getSurahNumber(name);
         if (!surahNum && fallbackMatch[1]) {
           surahNum = parseInt(fallbackMatch[1]);
         }
         if (surahNum) {
           results.push({ surahNumber: surahNum, surahName: name });
         }
      }
    }
  }

  return results;
}

/**
 * Calculate the count of unique Juz covered by a student's hafalan records
 */
export async function updateSiswaLatestJuz(prisma, siswaId) {
  try {
    const hafalanRecords = await prisma.hafalan.findMany({
      where: { siswaId },
      select: {
        surahNumber: true,
        ayatMulai: true,
        ayatSelesai: true,
        surahTambahan: true,
        juz: true
      }
    });

    const uniqueJuzs = new Set();

    for (const record of hafalanRecords) {
      // ✅ Resolve surahNumber if missing (fallback for old records)
      let currentSurahNumber = record.surahNumber;
      if (!currentSurahNumber && record.surah) {
        currentSurahNumber = getSurahNumber(record.surah);
      }

      // Check primary surah
      if (currentSurahNumber && record.ayatMulai && record.ayatSelesai) {
        const juzs = getJuzsFromRange(currentSurahNumber, record.ayatMulai, record.ayatSelesai);
        juzs.forEach(j => uniqueJuzs.add(j));
      } else if (record.juz) {
        uniqueJuzs.add(record.juz);
      }

      // Check surah tambahan
      let tambahan = [];
      try {
        tambahan = typeof record.surahTambahan === 'string' 
          ? JSON.parse(record.surahTambahan) 
          : (record.surahTambahan || []);
      } catch (e) {
        console.error('[updateSiswaLatestJuz] Error parsing surahTambahan:', e);
      }

      if (Array.isArray(tambahan)) {
        for (const item of tambahan) {
          let sNum = item.surahNumber;
          if (!sNum && item.surah) {
             const parsed = parseSurahRange(item.surah);
             if (parsed.length > 0) sNum = parsed[0].surahNumber;
             else sNum = getSurahNumber(item.surah);
          }
          
          if (sNum && item.ayatMulai && item.ayatSelesai) {
            const juzs = getJuzsFromRange(sNum, item.ayatMulai, item.ayatSelesai);
            juzs.forEach(j => uniqueJuzs.add(j));
          } else if (item.juz) {
            uniqueJuzs.add(Number(item.juz));
          }
        }
      }
    }

    const totalJuz = uniqueJuzs.size;

    console.log(`[DEBUG/PROGRESS] Student ${siswaId} Audit:
    - Total Hafalan Records: ${hafalanRecords.length}
    - Unique Juz Detected: ${totalJuz}
    - Juz List: [${Array.from(uniqueJuzs).sort((a,b) => a-b).join(', ')}]
    - Timestamp: ${new Date().toLocaleString('id-ID')}
    `);

    // Update siswa
    await prisma.siswa.update({
      where: { id: siswaId },
      data: { latestJuzAchieved: totalJuz }
    });

    return totalJuz;
  } catch (error) {
    console.error('Error updating Siswa latest Juz:', error);
    return 0;
  }
}
