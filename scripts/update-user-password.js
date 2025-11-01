import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const email = 'ahmad.fauzi@tahfidz.sch.id';
    const newPassword = '123456';

    console.log('🔄 Updating password for:', email);

    // Generate new hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log('🔑 New password hash:', hashedPassword);

    // Verify the hash works
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log('✅ Hash verification:', isValid);

    // Update user password
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('✅ Password updated successfully for user:', user);

    // Verify we can login with the new password
    const testUser = await prisma.user.findUnique({
      where: { email },
    });

    const loginTest = await bcrypt.compare(newPassword, testUser.password);
    console.log('🧪 Login test result:', loginTest);

    if (loginTest) {
      console.log('✅ Password update successful! You can now login with:');
      console.log('   Email:', email);
      console.log('   Password:', newPassword);
    } else {
      console.error('❌ Password update failed verification');
    }

  } catch (error) {
    console.error('❌ Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
