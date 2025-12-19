import { prisma } from './src/lib/prisma.js';

async function checkGuruKelas() {
  console.log('\n🔍 Checking Guru Kelas Assignment...\n');

  // Check Ahmad Fauzi
  const ahmadUser = await prisma.user.findUnique({
    where: { email: 'ahmad.fauzi@tahfidz.sch.id' },
    include: {
      guru: {
        include: {
          guruKelas: {
            include: {
              kelas: true
            }
          }
        }
      }
    }
  });

  console.log('=== Ahmad Fauzi (Guru) ===');
  if (ahmadUser) {
    console.log(`✅ User found: ${ahmadUser.name}`);
    console.log(`   Guru ID: ${ahmadUser.guru?.id || 'MISSING'}`);
    console.log(`   Number of kelas: ${ahmadUser.guru?.guruKelas?.length || 0}`);
    
    if (ahmadUser.guru?.guruKelas?.length > 0) {
      console.log('   Kelas assigned:');
      ahmadUser.guru.guruKelas.forEach((gk, i) => {
        console.log(`     ${i + 1}. ${gk.kelas.nama} (ID: ${gk.kelas.id})`);
      });
    } else {
      console.log('   ❌ NO KELAS ASSIGNED!');
    }
  } else {
    console.log('❌ User not found');
  }

  // Check all GuruKelas
  console.log('\n=== All GuruKelas Records ===');
  const allGuruKelas = await prisma.guruKelas.findMany({
    include: {
      guru: {
        include: { user: true }
      },
      kelas: true
    }
  });

  console.log(`Total GuruKelas records: ${allGuruKelas.length}`);
  allGuruKelas.forEach((gk) => {
    console.log(`  - ${gk.guru.user.name} → ${gk.kelas.nama} (peran: ${gk.peran}, active: ${gk.isActive})`);
  });

  process.exit(0);
}

checkGuruKelas().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
