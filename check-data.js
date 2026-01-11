import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('Checking database connection and data...');
    
    // Check total user count
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    // Check users without username (which might be causing issues after migration)
    const usersWithoutUsername = await prisma.user.count({
      where: {
        username: null
      }
    });
    console.log('Users without username:', usersWithoutUsername);
    
    if (usersWithoutUsername > 0) {
      console.log('Found users without username. Need to populate username field.');
      
      // Sample of users without username
      const sampleUsers = await prisma.user.findMany({
        where: {
          username: null
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      console.log('Sample users without username:', JSON.stringify(sampleUsers, null, 2));
    }
    
    // Check other tables
    const guruCount = await prisma.guru.count();
    const siswaCount = await prisma.siswa.count();
    const ortuCount = await prisma.orangTua.count();
    const kelasCount = await prisma.kelas.count();
    const tahunAjaranCount = await prisma.tahunAjaran.count();
    const hafalanCount = await prisma.hafalan.count();
    
    console.log('Guru:', guruCount);
    console.log('Siswa:', siswaCount);
    console.log('Orang Tua:', ortuCount);
    console.log('Kelas:', kelasCount);
    console.log('Tahun Ajaran:', tahunAjaranCount);
    console.log('Hafalan:', hafalanCount);
    
    if (userCount === 0) {
      console.log('Warning: No users found in database. This might explain why data is not showing.');
    }
    
  } catch (error) {
    console.error('Error checking data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();