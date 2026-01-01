const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestSiswaAndTestParent() {
  try {
    console.log('\n📝 Creating test siswa for parent registration test...\n');

    // Create a test siswa
    const user = await prisma.user.create({
      data: {
        name: 'Test Siswa Parent Registration',
        email: `siswa.test.${Date.now()}@siswa.tahfidz.sch.id`,
        password: await bcrypt.hash('TestPassword123', 10),
        role: 'SISWA',
        isActive: true
      }
    });

    const siswa = await prisma.siswa.create({
      data: {
        userId: user.id,
        nis: 'TEST' + Date.now(),
        jenisKelamin: 'LAKI_LAKI',
        tanggalLahir: new Date('2010-05-15'),
        status: 'approved',
        statusSiswa: 'AKTIF'
      }
    });

    console.log(`✅ Created test siswa:`);
    console.log(`   ID: ${siswa.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   NIS: ${siswa.nis}`);
    console.log(`   Tanggal Lahir: 2010-05-15`);

    const testPayload = {
      nis: siswa.nis,
      tanggalLahir: '2010-05-15',
      namaLengkap: 'Orang Tua Test Registrasi',
      noHP: '0898' + Math.random().toString().slice(2, 10),
      password: 'TestPassword123'
    };

    console.log(`\n📋 Test payload ready:`);
    console.log(JSON.stringify(testPayload, null, 2));
    
    console.log(`\n🧪 Now testing the API...\n`);

    // Test 1: Verify Student
    console.log('📝 Test 1: Verify Student');
    const verifyRes = await fetch('http://localhost:3000/api/auth/verify-student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nis: testPayload.nis,
        tanggalLahir: testPayload.tanggalLahir
      })
    });

    const verifyData = await verifyRes.json();
    console.log(`Status: ${verifyRes.status}`);
    console.log(`Response:`, JSON.stringify(verifyData, null, 2));

    if (!verifyRes.ok) {
      console.log('❌ Verification failed');
      return;
    }

    console.log('✅ Verification succeeded\n');

    // Test 2: Register Parent
    console.log('📝 Test 2: Register Parent Account');
    const registerRes = await fetch('http://localhost:3000/api/auth/register-orangtua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    const registerData = await registerRes.json();
    console.log(`Status: ${registerRes.status}`);
    console.log(`Response:`, JSON.stringify(registerData, null, 2));

    if (registerRes.ok) {
      console.log('\n✅ Parent registration succeeded!');
      console.log('\n🎉 Parent account is automatically ACTIVE when student is created!');
      
      // Verify parent is active
      const parentCheck = await prisma.orangTua.findUnique({
        where: { id: registerData.orangTuaId },
        include: { user: true }
      });
      
      console.log(`\n📊 Parent account status:`);
      console.log(`   isActive: ${parentCheck.user.isActive}`);
      console.log(`   status: ${parentCheck.status}`);
    } else {
      console.log('\n❌ Parent registration failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSiswaAndTestParent();
