const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const [totalSiswa, approved, pending] = await Promise.all([
    prisma.siswa.count(),
    prisma.siswa.count({ where: { status: 'approved' } }),
    prisma.siswa.count({ where: { status: 'pending' } })
  ]);
  
  console.log('=== VERIFIKASI QUERY SISWA (FIXED) ===');
  console.log('Total Siswa:', totalSiswa);
  console.log('Siswa Approved (Aktif):', approved);
  console.log('Siswa Pending:', pending);
  console.log('');
  console.log('✅ Seharusnya sekarang: Total 8, Aktif 7, Pending 1');
  
  await prisma.$disconnect();
})();
