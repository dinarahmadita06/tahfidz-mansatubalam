require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('\n=== FIND GURU ID WHO HAS TARGET KELAS ===\n');
    
    // Get guru who has AKTIF Kelas X A3 and XI A1
    const targetGuruKelas = await prisma.guruKelas.findMany({
      where: {
        kelasId: { in: ['cmj8u93ew0001kv04hyfichsr', 'cmjuokra50001js041z0yffum'] },
        isActive: true,
        kelas: {
          status: 'AKTIF'
        }
      },
      include: {
        guru: {
          select: {
            id: true,
            user: { select: { id: true, name: true, email: true } }
          }
        },
        kelas: { select: { nama: true } }
      }
    });
    
    console.log('GuruKelas with filters (isActive + kelas.status=AKTIF):');
    targetGuruKelas.forEach(gk => {
      console.log(`  - Guru: ${gk.guru.user.name} (ID: ${gk.guru.id}, User ID: ${gk.guru.user.id}), Kelas: ${gk.kelas.nama}`);
    });
    
    // Get unique gurus
    const uniqueGurus = [...new Set(targetGuruKelas.map(gk => gk.guruId))];
    console.log('\nUnique Guru IDs with target kelas:', uniqueGurus);
    
    // Get their user IDs
    console.log('\nCorresponding USER IDs:');
    for (const gk of targetGuruKelas) {
      console.log(`  Guru: ${gk.guru.id} -> User: ${gk.guru.user.id} (${gk.guru.user.email})`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
