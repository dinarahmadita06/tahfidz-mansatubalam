require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debug() {
  try {
    const klasIds = ['cmj8u93ew0001kv04hyfichsr', 'cmjuokra50001js041z0yffum'];
    
    console.log('\n=== DEBUG SISWA & KELAS ===\n');
    
    // Check if kelas exist
    const kelas = await prisma.kelas.findMany({
      where: { id: { in: klasIds } },
      select: { id: true, nama: true, status: true }
    });
    console.log('Kelas found:', kelas);
    
    // Count ALL siswa
    const totalSiswa = await prisma.siswa.count();
    console.log('Total siswa in DB:', totalSiswa);
    
    // Count siswa in these classes
    const siswaInKelas = await prisma.siswa.count({
      where: { kelasId: { in: klasIds } }
    });
    console.log('Siswa in target kelas:', siswaInKelas);
    
    // Get sample siswa data
    if (siswaInKelas > 0) {
      const sample = await prisma.siswa.findMany({
        where: { kelasId: { in: klasIds } },
        select: {
          id: true,
          nis: true,
          status: true,
          kelasId: true,
          user: { select: { name: true, isActive: true } }
        },
        take: 5
      });
      console.log('\nSample siswa:', sample);
    } else {
      // Get ALL siswa to see what's there
      const allSiswa = await prisma.siswa.findMany({
        select: {
          id: true,
          nis: true,
          kelasId: true,
          status: true,
          user: { select: { name: true } }
        },
        take: 5
      });
      console.log('\nAll siswa in DB (first 5):', allSiswa);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
