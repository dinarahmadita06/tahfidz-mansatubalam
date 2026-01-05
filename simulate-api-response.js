import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    // Find Ahmad Fauzan
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: { name: 'Ahmad Fauzan' }
      },
      select: { id: true }
    });

    if (!siswa) {
      console.log('Siswa not found');
      return;
    }

    // Get hafalan data for January 2026
    const startDate = new Date(2026, 0, 1);
    const endDate = new Date(2026, 0, 31, 23, 59, 59, 999);

    const hafalan = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id,
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        penilaian: true
      }
    });

    console.log('Hafalan records found:', hafalan.length);

    // Build juz distribution
    const juzMap = new Map();
    let totalNilai = 0;
    let totalTajwid = 0;
    let totalKelancaran = 0;
    let totalMakhraj = 0;
    let totalImplementasi = 0;
    let penilaianCount = 0;

    hafalan.forEach((h) => {
      if (h.juz) {
        juzMap.set(h.juz, (juzMap.get(h.juz) || 0) + 1);
      }

      if (h.penilaian && h.penilaian.length > 0) {
        h.penilaian.forEach((p) => {
          if (p.nilaiAkhir != null) totalNilai += p.nilaiAkhir;
          if (p.tajwid != null) totalTajwid += p.tajwid;
          if (p.kelancaran != null) totalKelancaran += p.kelancaran;
          if (p.makhraj != null) totalMakhraj += p.makhraj;
          if (p.adab != null) totalImplementasi += p.adab;
          penilaianCount++;
        });
      }
    });

    // Build juz distribution array with colors
    const colorPalette = [
      '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#EC4899', '#14B8A6', '#6366F1', '#F97316',
      '#84CC16', '#0EA5E9', '#D946EF', '#F43F5E', '#14B8A6',
      '#A78BFA', '#FCA5A5', '#86EFAC', '#93C5FD', '#E9D5FF',
      '#FED7AA', '#FECACA', '#A7F3D0', '#BFDBFE', '#DDD6FE',
      '#FDE68A', '#FECDD3', '#C7D2FE', '#F5D4AC', '#ECC5C0'
    ];

    const juzDistribution = Array.from(juzMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map((entry) => {
        const juzNum = entry[0];
        const count = entry[1];
        return {
          label: `Juz ${juzNum}`,
          value: count,
          color: colorPalette[juzNum % colorPalette.length] || '#10B981'
        };
      });

    console.log('\nJuz Distribution:');
    juzDistribution.forEach((item) => {
      console.log(`${item.label}: ${item.value} setoran (color: ${item.color})`);
    });

    console.log('\nStats:');
    console.log('Total setoran:', hafalan.length);
    console.log('Rata-rata nilai:', penilaianCount > 0 ? (totalNilai / penilaianCount).toFixed(2) : 0);
    console.log('Rata-rata Tajwid:', penilaianCount > 0 ? (totalTajwid / penilaianCount).toFixed(2) : 0);
    console.log('Rata-rata Kelancaran:', penilaianCount > 0 ? (totalKelancaran / penilaianCount).toFixed(2) : 0);
    console.log('Rata-rata Makhraj:', penilaianCount > 0 ? (totalMakhraj / penilaianCount).toFixed(2) : 0);
    console.log('Rata-rata Implementasi:', penilaianCount > 0 ? (totalImplementasi / penilaianCount).toFixed(2) : 0);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
