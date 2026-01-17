const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const hafalan = await prisma.hafalan.findMany({
    include: {
      siswa: { 
        select: { 
          nis: true, 
          status: true,
          user: { select: { name: true, email: true } }
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('TOTAL HAFALAN:', hafalan.length);
  hafalan.forEach((h, i) => {
    console.log(`${i+1}. ${h.siswa.user.name} (${h.siswa.status}) - Juz ${h.juz}, ${h.surah}, ${h.tanggal.toISOString().split('T')[0]}`);
  });
  
  await prisma.$disconnect();
})();
