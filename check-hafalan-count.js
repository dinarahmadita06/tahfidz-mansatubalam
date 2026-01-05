import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const totalHafalan = await prisma.hafalan.count();
    const totalSiswa = await prisma.siswa.count();
    
    console.log('Total hafalan records:', totalHafalan);
    console.log('Total siswa:', totalSiswa);
    
    if (totalHafalan > 0) {
      const sampleHafalan = await prisma.hafalan.findMany({
        take: 5,
        select: { 
          id: true, 
          siswaId: true,
          surah: true, 
          ayatMulai: true,
          juz: true,
          tanggal: true
        }
      });
      console.log('\nSample hafalan:', sampleHafalan);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
