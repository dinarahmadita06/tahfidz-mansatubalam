import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addDummyHafalan() {
  try {
    // Get Fatimah data
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true,
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
              include: {
                guru: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!siswa) {
      console.log('❌ Siswa Fatimah tidak ditemukan');
      return;
    }

    console.log('👤 Siswa:', siswa.user.name);
    console.log('🏫 Kelas:', siswa.kelas?.nama || 'Belum ada kelas');

    // Get guru pengampu
    const guruPengampu = siswa.kelas?.guruKelas[0]?.guru;

    if (!guruPengampu) {
      console.log('❌ Guru pengampu tidak ditemukan');
      return;
    }

    console.log('👨‍🏫 Guru:', guruPengampu.user.name);

    // Check existing hafalan
    const existingHafalan = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id
      }
    });

    console.log('📚 Hafalan existing:', existingHafalan.length, 'records');

    // Delete existing hafalan untuk fresh start
    if (existingHafalan.length > 0) {
      await prisma.hafalan.deleteMany({
        where: {
          siswaId: siswa.id
        }
      });
      console.log('🗑️  Hafalan lama dihapus');
    }

    // Add dummy hafalan - 3 juz (Juz 1, 29, 30)
    const dummyHafalan = [
      // Juz 1 (Al-Fatihah + Al-Baqarah 1-141)
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 1,
        surah: 'Al-Baqarah',
        ayatMulai: 1,
        ayatSelesai: 141,
        keterangan: 'Hafalan Juz 1 lengkap',
        tanggal: new Date('2024-01-15')
      },
      // Juz 29 (Al-Mulk + Al-Qalam + Al-Haqqah + Al-Ma'arij + Nuh + Al-Jinn + Al-Muzzammil + Al-Muddaththir)
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 29,
        surah: 'Al-Mulk',
        ayatMulai: 1,
        ayatSelesai: 30,
        keterangan: 'Hafalan Juz 29 - Surah Al-Mulk',
        tanggal: new Date('2024-02-10')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 29,
        surah: 'Al-Qalam',
        ayatMulai: 1,
        ayatSelesai: 52,
        keterangan: 'Hafalan Juz 29 - Surah Al-Qalam',
        tanggal: new Date('2024-02-15')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 29,
        surah: 'Al-Haqqah',
        ayatMulai: 1,
        ayatSelesai: 52,
        keterangan: 'Hafalan Juz 29 - Surah Al-Haqqah',
        tanggal: new Date('2024-02-20')
      },
      // Juz 30 (An-Naba' sampai An-Nas)
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 30,
        surah: 'An-Naba',
        ayatMulai: 1,
        ayatSelesai: 40,
        keterangan: 'Hafalan Juz 30 - Juz Amma',
        tanggal: new Date('2024-03-01')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 30,
        surah: 'An-Nazi\'at',
        ayatMulai: 1,
        ayatSelesai: 46,
        keterangan: 'Hafalan Juz 30 - Surah An-Nazi\'at',
        tanggal: new Date('2024-03-05')
      },
      {
        siswaId: siswa.id,
        guruId: guruPengampu.id,
        juz: 30,
        surah: 'Abasa',
        ayatMulai: 1,
        ayatSelesai: 42,
        keterangan: 'Hafalan Juz 30 - Surah Abasa',
        tanggal: new Date('2024-03-10')
      }
    ];

    // Insert hafalan
    for (const hafalan of dummyHafalan) {
      await prisma.hafalan.create({
        data: hafalan
      });
    }

    console.log('✅ Berhasil menambahkan', dummyHafalan.length, 'data hafalan');
    console.log('📊 Total Juz: 3 (Juz 1, 29, 30)');
    console.log('');
    console.log('🎯 Sekarang Fatimah bisa mendaftar Tasmi dengan data:');
    console.log('   - Jumlah Hafalan: 3 Juz (otomatis terisi)');
    console.log('   - Juz yang Ditasmi: "Juz 1, Juz 29, Juz 30" (isi manual)');
    console.log('   - Jam Tasmi: "08:00" (isi manual)');
    console.log('   - Tanggal Tasmi: Pilih tanggal (isi manual)');
    console.log('   - Catatan: "Siap untuk ujian Tasmi\'" (opsional)');
    console.log('');
    console.log('💡 Login sebagai Fatimah: fatimah.hakim@siswa.tahfidz.sch.id / password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDummyHafalan();
