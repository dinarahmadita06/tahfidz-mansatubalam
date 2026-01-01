require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('\n=== DEBUG GURU KELAS ===\n');
    
    // Find the guru user (nama: guru yang login di console)
    // Untuk sekarang, mari kita lihat semua guru yang ada
    const gurus = await prisma.guru.findMany({
      select: {
        id: true,
        user: { select: { name: true, email: true } }
      },
      take: 3
    });
    console.log('All gurus:', gurus);
    
    if (gurus.length > 0) {
      const guruId = gurus[0].id;
      console.log('\nChecking first guru:', guruId);
      
      // Check GuruKelas for this guru
      const guruKelas = await prisma.guruKelas.findMany({
        where: {
          guruId: guruId,
          isActive: true
        },
        include: {
          kelas: {
            select: { id: true, nama: true, status: true }
          }
        }
      });
      console.log('GuruKelas (isActive=true):', guruKelas);
      
      // Check ALL GuruKelas for this guru (no filter)
      const allGuruKelas = await prisma.guruKelas.findMany({
        where: { guruId: guruId },
        include: {
          kelas: {
            select: { id: true, nama: true, status: true }
          }
        }
      });
      console.log('\nAll GuruKelas for this guru:', allGuruKelas);
      
      // Check if there are GuruKelas for our target classes
      const targetGuruKelas = await prisma.guruKelas.findMany({
        where: {
          kelasId: { in: ['cmj8u93ew0001kv04hyfichsr', 'cmjuokra50001js041z0yffum'] }
        },
        include: {
          guru: { select: { id: true, user: { select: { name: true } } } },
          kelas: { select: { nama: true, status: true } }
        }
      });
      console.log('\nGuruKelas for target classes:', targetGuruKelas);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
