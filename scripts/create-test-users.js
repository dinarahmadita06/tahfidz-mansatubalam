import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    const password = '123456';
    console.log('🔐 Generating password hash for all users...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('✅ Password hash generated:', hashedPassword.substring(0, 30) + '...');
    console.log('✅ Verification:', await bcrypt.compare(password, hashedPassword));
    console.log('');

    const usersToCreate = [
      {
        email: 'admin@tahfidz.sch.id',
        name: 'Administrator',
        role: 'ADMIN',
        password: hashedPassword,
      },
      {
        email: 'abdullah.rahman@siswa.tahfidz.sch.id',
        name: 'Abdullah Rahman',
        role: 'SISWA',
        password: hashedPassword,
      },
      {
        email: 'ortu.24001@parent.tahfidz.sch.id',
        name: 'Orang Tua Siswa',
        role: 'ORANG_TUA',
        password: hashedPassword,
      },
    ];

    console.log('👥 Creating test users...\n');

    for (const userData of usersToCreate) {
      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existing) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        console.log(`   Updating password...`);

        await prisma.user.update({
          where: { email: userData.email },
          data: { password: hashedPassword },
        });

        console.log(`   ✅ Password updated for ${userData.role}: ${userData.email}`);
      } else {
        console.log(`➕ Creating new user: ${userData.email}`);

        const user = await prisma.user.create({
          data: userData,
        });

        console.log(`   ✅ Created ${userData.role}: ${user.email} (ID: ${user.id})`);
      }
      console.log('');
    }

    console.log('🎉 All test users created/updated successfully!\n');

    // Verify all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    console.log('📋 All users in database:\n');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.role}: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   ID: ${user.id}`);
      console.log('');
    });

    console.log('✅ All users can now login with password: 123456\n');

    // Test password verification for all
    console.log('🧪 Testing password verification for all users...\n');
    for (const user of allUsers) {
      const fullUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      const isValid = await bcrypt.compare(password, fullUser.password);
      console.log(`${isValid ? '✅' : '❌'} ${user.role} (${user.email}): ${isValid ? 'Password OK' : 'Password FAILED'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
