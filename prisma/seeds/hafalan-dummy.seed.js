import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHafalanDummy() {
  console.log('=Ö Seeding Hafalan Data...');

  try {
    // Ambil semua siswa yang sudah ada
    const siswaList = await prisma.siswa.findMany({
      include: {
        user: true,
      },
    });

    if (siswaList.length === 0) {
      console.log('L Tidak ada siswa. Jalankan seed utama terlebih dahulu.');
      return;
    }

    // Ambil semua guru yang sudah ada
    const guruList = await prisma.guru.findMany();

    if (guruList.length === 0) {
      console.log('L Tidak ada guru. Jalankan seed utama terlebih dahulu.');
      return;
    }

    // Data hafalan untuk setiap siswa
    // Juz 30 memiliki 37 surah (dari An-Naba sampai An-Nas)
    const juz30Surahs = [
      { nama: 'An-Naba', ayatCount: 40 },
      { nama: 'An-Nazi\'at', ayatCount: 46 },
      { nama: 'Abasa', ayatCount: 42 },
      { nama: 'At-Takwir', ayatCount: 29 },
      { nama: 'Al-Infitar', ayatCount: 19 },
      { nama: 'Al-Mutaffifin', ayatCount: 36 },
      { nama: 'Al-Inshiqaq', ayatCount: 25 },
      { nama: 'Al-Buruj', ayatCount: 22 },
      { nama: 'At-Tariq', ayatCount: 17 },
      { nama: 'Al-A\'la', ayatCount: 19 },
      { nama: 'Al-Ghashiyah', ayatCount: 26 },
      { nama: 'Al-Fajr', ayatCount: 30 },
      { nama: 'Al-Balad', ayatCount: 20 },
      { nama: 'Ash-Shams', ayatCount: 15 },
      { nama: 'Al-Lail', ayatCount: 21 },
      { nama: 'Ad-Dhuha', ayatCount: 11 },
      { nama: 'Ash-Sharh', ayatCount: 8 },
      { nama: 'At-Tin', ayatCount: 8 },
      { nama: 'Al-Alaq', ayatCount: 19 },
      { nama: 'Al-Qadr', ayatCount: 5 },
      { nama: 'Al-Bayyinah', ayatCount: 8 },
      { nama: 'Az-Zalzalah', ayatCount: 8 },
      { nama: 'Al-Adiyat', ayatCount: 11 },
      { nama: 'Al-Qari\'ah', ayatCount: 11 },
      { nama: 'At-Takathur', ayatCount: 8 },
      { nama: 'Al-Asr', ayatCount: 3 },
      { nama: 'Al-Humazah', ayatCount: 9 },
      { nama: 'Al-Fil', ayatCount: 5 },
      { nama: 'Quraish', ayatCount: 4 },
      { nama: 'Al-Ma\'un', ayatCount: 7 },
      { nama: 'Al-Kawthar', ayatCount: 3 },
      { nama: 'Al-Kafirun', ayatCount: 6 },
      { nama: 'An-Nasr', ayatCount: 3 },
      { nama: 'Al-Masad', ayatCount: 5 },
      { nama: 'Al-Ikhlas', ayatCount: 4 },
      { nama: 'Al-Falaq', ayatCount: 5 },
      { nama: 'An-Nas', ayatCount: 6 },
    ];

    // Juz 29 (beberapa surah)
    const juz29Surahs = [
      { nama: 'Al-Mulk', ayatCount: 30, ayatMulai: 1, ayatSelesai: 30 },
      { nama: 'Al-Qalam', ayatCount: 52, ayatMulai: 1, ayatSelesai: 52 },
      { nama: 'Al-Haqqah', ayatCount: 52, ayatMulai: 1, ayatSelesai: 52 },
      { nama: 'Al-Ma\'arij', ayatCount: 44, ayatMulai: 1, ayatSelesai: 44 },
      { nama: 'Nuh', ayatCount: 28, ayatMulai: 1, ayatSelesai: 28 },
    ];

    // Juz 1 (Al-Fatihah + Al-Baqarah 1-141)
    const juz1Data = [
      { nama: 'Al-Fatihah', ayatCount: 7, ayatMulai: 1, ayatSelesai: 7 },
      { nama: 'Al-Baqarah', ayatCount: 141, ayatMulai: 1, ayatSelesai: 141 },
    ];

    let hafalanCount = 0;

    // Loop untuk setiap siswa (kita buat 3 siswa pertama punya hafalan berbeda)
    for (let i = 0; i < Math.min(siswaList.length, 5); i++) {
      const siswa = siswaList[i];
      const guru = guruList[i % guruList.length];

      console.log(`    Membuat hafalan untuk ${siswa.user.name}...`);

      if (i === 0) {
        // Siswa 1: Hafal Juz 30 lengkap (5 juz total dengan juz 1, 2, 3, 4)
        // Juz 30
        for (const surah of juz30Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              juz: 30,
              surah: surah.nama,
              ayatMulai: 1,
              ayatSelesai: surah.ayatCount,
              keterangan: 'Hafalan Juz 30 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 29
        for (const surah of juz29Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              juz: 29,
              surah: surah.nama,
              ayatMulai: surah.ayatMulai,
              ayatSelesai: surah.ayatSelesai,
              keterangan: 'Hafalan Juz 29 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 1
        for (const surah of juz1Data) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
              juz: 1,
              surah: surah.nama,
              ayatMulai: surah.ayatMulai,
              ayatSelesai: surah.ayatSelesai,
              keterangan: 'Hafalan Juz 1 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 2 (Al-Baqarah 142-252)
        await prisma.hafalan.create({
          data: {
            siswaId: siswa.id,
            guruId: guru.id,
            tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            juz: 2,
            surah: 'Al-Baqarah',
            ayatMulai: 142,
            ayatSelesai: 252,
            keterangan: 'Hafalan Juz 2',
          },
        });
        hafalanCount++;

        // Juz 3 (Al-Baqarah 253-286 + Ali Imran 1-92)
        await prisma.hafalan.create({
          data: {
            siswaId: siswa.id,
            guruId: guru.id,
            tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            juz: 3,
            surah: 'Al-Baqarah',
            ayatMulai: 253,
            ayatSelesai: 286,
            keterangan: 'Hafalan Juz 3 - Al-Baqarah',
          },
        });
        await prisma.hafalan.create({
          data: {
            siswaId: siswa.id,
            guruId: guru.id,
            tanggal: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            juz: 3,
            surah: 'Ali Imran',
            ayatMulai: 1,
            ayatSelesai: 92,
            keterangan: 'Hafalan Juz 3 - Ali Imran',
          },
        });
        hafalanCount += 2;

      } else if (i === 1) {
        // Siswa 2: Hafal Juz 30 lengkap (3 juz total)
        for (const surah of juz30Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
              juz: 30,
              surah: surah.nama,
              ayatMulai: 1,
              ayatSelesai: surah.ayatCount,
              keterangan: 'Hafalan Juz 30 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 29
        for (const surah of juz29Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
              juz: 29,
              surah: surah.nama,
              ayatMulai: surah.ayatMulai,
              ayatSelesai: surah.ayatSelesai,
              keterangan: 'Hafalan Juz 29 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 1
        for (const surah of juz1Data) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
              juz: 1,
              surah: surah.nama,
              ayatMulai: surah.ayatMulai,
              ayatSelesai: surah.ayatSelesai,
              keterangan: 'Hafalan Juz 1 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

      } else if (i === 2) {
        // Siswa 3: Hafal Juz 30 lengkap (2 juz total)
        for (const surah of juz30Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              juz: 30,
              surah: surah.nama,
              ayatMulai: 1,
              ayatSelesai: surah.ayatCount,
              keterangan: 'Hafalan Juz 30 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }

        // Juz 29
        for (const surah of juz29Surahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              juz: 29,
              surah: surah.nama,
              ayatMulai: surah.ayatMulai,
              ayatSelesai: surah.ayatSelesai,
              keterangan: 'Hafalan Juz 29 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }
      } else {
        // Siswa lainnya: Hafal sebagian Juz 30 (belum memenuhi syarat)
        const randomSurahs = juz30Surahs.slice(0, Math.floor(Math.random() * 10) + 5);
        for (const surah of randomSurahs) {
          await prisma.hafalan.create({
            data: {
              siswaId: siswa.id,
              guruId: guru.id,
              tanggal: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
              juz: 30,
              surah: surah.nama,
              ayatMulai: 1,
              ayatSelesai: surah.ayatCount,
              keterangan: 'Hafalan Juz 30 - ' + surah.nama,
            },
          });
          hafalanCount++;
        }
      }
    }

    console.log(` Berhasil membuat ${hafalanCount} data hafalan untuk ${Math.min(siswaList.length, 5)} siswa`);
    console.log('');
    console.log('=Ê Ringkasan:');
    console.log('  - Siswa 1: Hafal 5 Juz (Juz 1, 2, 3, 29, 30)  Bisa Tasmi');
    console.log('  - Siswa 2: Hafal 3 Juz (Juz 1, 29, 30)  Bisa Tasmi');
    console.log('  - Siswa 3: Hafal 2 Juz (Juz 29, 30)  Bisa Tasmi');
    console.log('  - Siswa 4-5: Hafal sebagian Juz 30  Belum bisa Tasmi');

  } catch (error) {
    console.error('L Error saat seeding hafalan:', error);
    throw error;
  }
}

async function main() {
  await seedHafalanDummy();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
