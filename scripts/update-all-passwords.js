import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updateAllPasswords() {
  try {
    const newPassword = '123456';

    console.log('🔄 Generating new password hash...');

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('🔑 New password hash:', hashedPassword);

    // Verify the hash works
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ Hash verification:', isValid);

    if (!isValid) {
      console.error('❌ Hash verification failed! Aborting...');
      return;
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`\n📋 Found ${users.length} users to update:\n`);

    // Update all users
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      console.log(`✅ Updated password for ${user.role}: ${user.email} (${user.name})`);
    }

    console.log('\n🎉 All passwords updated successfully!');
    console.log('\n📝 You can now login with:');
    console.log('   Password: 123456');
    console.log('\n👥 Available accounts:');

    for (const user of users) {
      console.log(`   - ${user.role}: ${user.email}`);
    }

    // Verify one more time with a test user
    const testUser = await prisma.user.findFirst();
    const loginTest = await bcrypt.compare(newPassword, testUser.password);
    console.log('\n🧪 Final verification test:', loginTest ? '✅ PASSED' : '❌ FAILED');

  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllPasswords();
