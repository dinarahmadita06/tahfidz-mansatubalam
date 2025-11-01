import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testDB() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('✅ DB Connected');
    console.log('Found', users.length, 'users');
    if (users[0]) {
      console.log('Sample user:', users[0].email);
    }
  } catch (err) {
    console.error('❌ DB Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();
