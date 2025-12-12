import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('📡 Testing Prisma connection...');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log('✅ Database connected! User count:', userCount);

    // Test find siswa user
    const siswaUser = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true },
    });

    if (siswaUser) {
      console.log('✅ Siswa user found:', {
        id: siswaUser.id,
        email: siswaUser.email,
        role: siswaUser.role,
        siswa: siswaUser.siswa,
      });
    } else {
      console.log('❌ Siswa user not found');
    }

    // Test find orangtua user
    const orangtuaUser = await prisma.user.findFirst({
      where: { role: 'ORANG_TUA' },
      include: { orangTua: true },
    });

    if (orangtuaUser) {
      console.log('✅ Orang tua user found:', {
        id: orangtuaUser.id,
        email: orangtuaUser.email,
        role: orangtuaUser.role,
        status: orangtuaUser.orangTua?.status,
      });
    } else {
      console.log('❌ No orang tua users found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
