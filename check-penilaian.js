import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPenilaian() {
  try {
    console.log('🔍 Mengecek data penilaian di database...\n');

    // Get all penilaian
    const penilaian = await prisma.penilaian.findMany({
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        guru: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        hafalan: {
          select: {
            surah: true,
            juz: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Show last 10 records
    });

    if (penilaian.length === 0) {
      console.log('❌ Tidak ada data penilaian di database');
    } else {
      console.log(`✅ Ditemukan ${penilaian.length} data penilaian (10 terbaru):\n`);

      penilaian.forEach((p, index) => {
        console.log(`${index + 1}. Penilaian ID: ${p.id}`);
        console.log(`   Siswa: ${p.siswa.user.name}`);
        console.log(`   Guru: ${p.guru.user.name}`);
        console.log(`   Hafalan: Surah ${p.hafalan.surah}, Juz ${p.hafalan.juz}, Ayat ${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}`);
        console.log(`   Nilai:`);
        console.log(`   - Tajwid: ${p.tajwid}`);
        console.log(`   - Kelancaran: ${p.kelancaran}`);
        console.log(`   - Makhraj: ${p.makhraj}`);
        console.log(`   - Adab: ${p.adab}`);
        console.log(`   - Nilai Akhir: ${p.nilaiAkhir}`);
        console.log(`   Catatan: ${p.catatan || '-'}`);
        console.log(`   Dibuat: ${p.createdAt.toLocaleString('id-ID')}`);
        console.log('');
      });
    }

    // Show total count
    const totalCount = await prisma.penilaian.count();
    console.log(`📊 Total penilaian di database: ${totalCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPenilaian();
