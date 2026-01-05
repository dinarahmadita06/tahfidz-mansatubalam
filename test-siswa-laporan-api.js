import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    // Find a siswa with hafalan data
    const siswaWithData = await prisma.siswa.findFirst({
      where: {
        hafalan: {
          some: {}
        }
      },
      include: {
        hafalan: {
          select: {
            juz: true,
            tanggal: true,
            penilaian: {
              select: {
                nilaiAkhir: true,
                tajwid: true,
                kelancaran: true,
                makhraj: true,
                adab: true
              }
            }
          }
        }
      }
    });

    if (!siswaWithData) {
      console.log('No siswa with hafalan data found');
      return;
    }

    console.log('Siswa with data:', siswaWithData.id);
    console.log('Total hafalan:', siswaWithData.hafalan.length);

    // Calculate juz distribution
    const juzMap = new Map();
    siswaWithData.hafalan.forEach((h) => {
      if (h.juz) {
        juzMap.set(h.juz, (juzMap.get(h.juz) || 0) + 1);
      }
    });

    console.log('Juz distribution:', Array.from(juzMap.entries()));

    // Calculate aspect scores
    let totalTajwid = 0;
    let totalKelancaran = 0;
    let totalMakhraj = 0;
    let totalAdab = 0;
    let penilaianCount = 0;

    siswaWithData.hafalan.forEach((h) => {
      if (h.penilaian && h.penilaian.length > 0) {
        h.penilaian.forEach((p) => {
          if (p.tajwid != null) totalTajwid += p.tajwid;
          if (p.kelancaran != null) totalKelancaran += p.kelancaran;
          if (p.makhraj != null) totalMakhraj += p.makhraj;
          if (p.adab != null) totalAdab += p.adab;
          penilaianCount++;
        });
      }
    });

    console.log('\nPenilaian stats:');
    console.log('Total penilaian:', penilaianCount);
    if (penilaianCount > 0) {
      console.log('Avg Tajwid:', (totalTajwid / penilaianCount).toFixed(2));
      console.log('Avg Kelancaran:', (totalKelancaran / penilaianCount).toFixed(2));
      console.log('Avg Makhraj:', (totalMakhraj / penilaianCount).toFixed(2));
      console.log('Avg Adab:', (totalAdab / penilaianCount).toFixed(2));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
