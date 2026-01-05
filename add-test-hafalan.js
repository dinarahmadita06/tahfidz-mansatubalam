import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    // Get the first siswa (that doesn't have hafalan data)
    const siswaWithoutData = await prisma.siswa.findFirst({
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!siswaWithoutData) {
      console.log('No siswa found');
      return;
    }

    console.log('Adding test data for:', siswaWithoutData.user.name);
    console.log('Siswa ID:', siswaWithoutData.id);

    // Add 5 hafalan records for this siswa
    const testData = [
      { surah: 'Al-Fatihah', ayatMulai: 1, ayatSelesai: 7, juz: 1 },
      { surah: 'Al-Baqarah', ayatMulai: 1, ayatSelesai: 50, juz: 1 },
      { surah: 'Al-Baqarah', ayatMulai: 51, ayatSelesai: 100, juz: 2 },
      { surah: 'Ali Imran', ayatMulai: 1, ayatSelesai: 50, juz: 3 },
      { surah: 'An-Nisa', ayatMulai: 1, ayatSelesai: 50, juz: 4 },
    ];

    for (const data of testData) {
      // Get guru ID (find any guru)
      const guru = await prisma.guru.findFirst();
      
      const hafalan = await prisma.hafalan.create({
        data: {
          siswaId: siswaWithoutData.id,
          guruId: guru.id,
          surah: data.surah,
          surahNumber: data.surah === 'Al-Fatihah' ? 1 : data.surah === 'Al-Baqarah' ? 2 : data.surah === 'Ali Imran' ? 3 : 4,
          ayatMulai: data.ayatMulai,
          ayatSelesai: data.ayatSelesai,
          juz: data.juz,
          tanggal: new Date(2026, 0, Math.floor(Math.random() * 5) + 1) // Random day in Jan 2026
        }
      });

      // Add penilaian
      await prisma.penilaian.create({
        data: {
          hafalanId: hafalan.id,
          siswaId: siswaWithoutData.id,
          guruId: guru.id,
          nilaiAkhir: 75 + Math.random() * 25,
          tajwid: 70 + Math.random() * 30,
          kelancaran: 70 + Math.random() * 30,
          makhraj: 70 + Math.random() * 30,
          adab: 70 + Math.random() * 30,
          catatan: 'Test data'
        }
      });

      console.log(`✓ Added hafalan: ${data.surah} (Juz ${data.juz})`);
    }

    console.log('\nTest data added successfully!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
