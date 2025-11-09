import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkHafalan() {
  try {
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true
      }
    });

    if (!siswa) {
      console.log('L Siswa tidak ditemukan');
      return;
    }

    console.log(' Siswa ditemukan:', siswa.user.name);
    console.log('   ID:', siswa.id);
    console.log('');

    const hafalan = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id
      }
    });

    console.log('=Ö Total hafalan records:', hafalan.length);

    if (hafalan.length > 0) {
      const uniqueJuz = new Set(hafalan.map(h => h.juz));
      console.log('=Ú Total Juz:', uniqueJuz.size);
      console.log('=Ë Juz list:', Array.from(uniqueJuz).sort((a, b) => a - b));
      console.log('');
      console.log('Detail per Juz:');
      Array.from(uniqueJuz).sort((a, b) => a - b).forEach(juz => {
        const hafalanJuz = hafalan.filter(h => h.juz === juz);
        console.log(`  Juz ${juz}: ${hafalanJuz.length} surah`);
      });
    } else {
      console.log('L Tidak ada data hafalan');
    }

  } catch (error) {
    console.error('L Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHafalan();
