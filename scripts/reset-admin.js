import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newUsername = 'admin.tahfidz1';
  const newPasswordRaw = 'admin.mansatu';
  const hashedPassword = await bcrypt.hash(newPasswordRaw, 10);

  console.log('🔄 Updating admin credentials...');

  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (!admin) {
    console.log('❌ Admin not found!');
    return;
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      username: newUsername,
      password: hashedPassword
    }
  });

  console.log('✅ Admin credentials updated successfully!');
  console.log('👤 Username:', newUsername);
  console.log('🔑 Password:', newPasswordRaw);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
