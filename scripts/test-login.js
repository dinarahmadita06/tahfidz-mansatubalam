import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    const email = 'ahmad.fauzi@tahfidz.sch.id';
    const password = '123456';

    console.log('🧪 Testing login credentials...\n');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('\n' + '='.repeat(60) + '\n');

    // 1. Check if user exists
    console.log('1️⃣ Checking if user exists in database...');
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        siswa: true,
        guru: true,
        orangTua: true,
      },
    });

    if (!user) {
      console.error('❌ User NOT found in database!');
      return;
    }

    console.log('✅ User found!');
    console.log('   - ID:', user.id);
    console.log('   - Name:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - Password hash:', user.password.substring(0, 20) + '...');
    console.log('   - Password hash length:', user.password.length);

    // 2. Check password
    console.log('\n2️⃣ Testing password comparison...');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.error('❌ Password does NOT match!');
      console.log('\nDEBUG INFO:');
      console.log('   - Input password:', password);
      console.log('   - Stored hash:', user.password);
      return;
    }

    console.log('✅ Password matches!');

    // 3. Check role-specific data
    console.log('\n3️⃣ Checking role-specific data...');
    if (user.role === 'GURU' && user.guru) {
      console.log('✅ Guru data found!');
      console.log('   - Guru ID:', user.guru.id);
    } else if (user.role === 'SISWA' && user.siswa) {
      console.log('✅ Siswa data found!');
      console.log('   - Siswa ID:', user.siswa.id);
      console.log('   - Status:', user.siswa.status);
    } else if (user.role === 'ORANG_TUA' && user.orangTua) {
      console.log('✅ Orang Tua data found!');
      console.log('   - Orang Tua ID:', user.orangTua.id);
      console.log('   - Status:', user.orangTua.status);
    }

    // 4. Expected redirect
    console.log('\n4️⃣ Expected redirect path...');
    const dashboardMap = {
      ADMIN: '/admin',
      GURU: '/guru',
      SISWA: '/siswa',
      ORANG_TUA: '/orangtua',
    };
    const expectedPath = dashboardMap[user.role] || '/siswa';
    console.log('✅ Should redirect to:', expectedPath);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ You should be able to login with these credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('   Expected redirect:', expectedPath);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
