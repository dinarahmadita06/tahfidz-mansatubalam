import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Mengecek data di database...\n');

    // Check Siswa
    const siswa = await prisma.siswa.findMany({
      include: {
        user: { select: { name: true, email: true } },
        kelas: { select: { nama: true } }
      }
    });
    console.log(`📚 Siswa: ${siswa.length} data`);
    if (siswa.length > 0) {
      siswa.slice(0, 3).forEach(s => {
        console.log(`   - ${s.user.name} (${s.nis}) - Kelas: ${s.kelas?.nama || 'Belum ada'}`);
      });
    }

    // Check Hafalan
    const hafalan = await prisma.hafalan.findMany({
      include: {
        siswa: { include: { user: { select: { name: true } } } },
        guru: { include: { user: { select: { name: true } } } }
      }
    });
    console.log(`\n📖 Hafalan: ${hafalan.length} data`);
    if (hafalan.length > 0) {
      hafalan.slice(0, 3).forEach(h => {
        console.log(`   - ${h.siswa.user.name}: Juz ${h.juz}, Surah ${h.surah}, Ayat ${h.ayatMulai}-${h.ayatSelesai}`);
      });
    }

    // Check Penilaian
    const penilaian = await prisma.penilaian.count();
    console.log(`\n⭐ Penilaian: ${penilaian} data`);

    // Check Kelas
    const kelas = await prisma.kelas.findMany({
      include: {
        _count: { select: { siswa: true } }
      }
    });
    console.log(`\n🏫 Kelas: ${kelas.length} data`);
    if (kelas.length > 0) {
      kelas.forEach(k => {
        console.log(`   - ${k.nama}: ${k._count.siswa} siswa`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
