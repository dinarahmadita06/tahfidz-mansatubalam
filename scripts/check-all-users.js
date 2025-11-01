import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      return;
    }

    console.log(`📊 Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Password Hash: ${user.password ? user.password.substring(0, 30) + '...' : 'NULL'}`);
      console.log(`   Hash Length: ${user.password?.length || 0}`);
      console.log('');
    });

    console.log('📋 Summary:');
    console.log(`   Total users: ${users.length}`);
    console.log(`   ADMIN: ${users.filter(u => u.role === 'ADMIN').length}`);
    console.log(`   GURU: ${users.filter(u => u.role === 'GURU').length}`);
    console.log(`   SISWA: ${users.filter(u => u.role === 'SISWA').length}`);
    console.log(`   ORANG_TUA: ${users.filter(u => u.role === 'ORANG_TUA').length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();
