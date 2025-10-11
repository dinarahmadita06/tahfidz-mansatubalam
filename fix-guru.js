import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixGuru() {
  console.log('🔧 Fixing Guru user...\n');

  try {
    // Update guru user to isActive = true
    const updatedUser = await prisma.user.update({
      where: { email: 'guru@tahfidz.sch.id' },
      data: { isActive: true },
    });

    console.log('✅ Guru user FIXED!');
    console.log('\n📋 Updated Details:');
    console.log('   Email:', updatedUser.email);
    console.log('   Name:', updatedUser.name);
    console.log('   Role:', updatedUser.role);
    console.log('   isActive:', updatedUser.isActive);

    console.log('\n🎉 Guru can now login!');
    console.log('   Email: guru@tahfidz.sch.id');
    console.log('   Password: guru123');

  } catch (error) {
    console.error('❌ Error fixing guru:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixGuru();
