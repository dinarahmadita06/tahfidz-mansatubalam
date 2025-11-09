import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSiswaStatus() {
  try {
    console.log('🔍 Checking all siswa status...');

    const allSiswa = await prisma.siswa.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total siswa: ${allSiswa.length}`);
    console.log('');

    const statusCounts = {};
    allSiswa.forEach(s => {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    });

    console.log('Status breakdown:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count} siswa`);
    });

    console.log('');
    console.log('Recent siswa:');
    allSiswa.slice(0, 10).forEach(s => {
      console.log(`  - ${s.user.name} (${s.user.email}) - Status: ${s.status}`);
    });

    // Find Fatimah specifically
    const fatimah = allSiswa.find(s => s.user.email === 'fatimah.hakim@siswa.tahfidz.sch.id');
    if (fatimah) {
      console.log('');
      console.log('👤 Fatimah Hakim found:');
      console.log(`   Name: ${fatimah.user.name}`);
      console.log(`   Email: ${fatimah.user.email}`);
      console.log(`   Status: ${fatimah.status}`);
      console.log(`   ID: ${fatimah.id}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkSiswaStatus();
