import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanRemainingDummy() {
  try {
    console.log('🧹 Cleaning remaining dummy data...\n');

    // Delete pengumuman dummy
    const pengumumanDeleted = await prisma.pengumuman.deleteMany({});
    console.log(`✅ ${pengumumanDeleted.count} pengumuman deleted`);

    // Delete log activity
    const logDeleted = await prisma.logActivity.deleteMany({});
    console.log(`✅ ${logDeleted.count} log activity deleted`);

    // Delete demo users (siswa & orang tua) - keep only admin and guru
    const demoUsersDeleted = await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
          { email: 'ortu.24001@parent.tahfidz.sch.id' },
        ]
      }
    });
    console.log(`✅ ${demoUsersDeleted.count} demo users deleted`);

    console.log('\n✅ Cleaning complete!');
    console.log('\n📊 Remaining data:');
    console.log('   - Admin user: 1');
    console.log('   - Guru user: 1');
    console.log('   - Everything else: 0');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanRemainingDummy();
