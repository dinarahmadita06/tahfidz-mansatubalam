import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  try {
    // Get all siswa
    const siswaList = await prisma.siswa.findMany({
      include: { user: { select: { email: true, name: true } } },
      take: 3
    });
    
    console.log('Sample Siswa:');
    for (const siswa of siswaList) {
      const hafalanCount = await prisma.hafalan.count({
        where: { siswaId: siswa.id }
      });
      console.log(`- ${siswa.user.name} (${siswa.user.email}): ${hafalanCount} hafalan records`);
      
      if (hafalanCount > 0) {
        const sample = await prisma.hafalan.findMany({
          where: { siswaId: siswa.id },
          take: 2,
          select: { id: true, surah: true, ayatMulai: true, ayatSelesai: true, juz: true, tanggal: true }
        });
        console.log('  Sample records:', sample);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
