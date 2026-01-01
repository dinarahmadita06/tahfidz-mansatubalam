const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testParentRegistration() {
  try {
    // 1. Find a siswa with tanggalLahir
    console.log('\n🔍 Searching for siswa with tanggalLahir...');
    const siswa = await prisma.siswa.findFirst({
      where: { tanggalLahir: { not: null } },
      include: { user: true }
    });

    if (!siswa) {
      console.log('❌ No siswa found with tanggalLahir. Need to create test siswa first.');
      return;
    }

    console.log(`✅ Found siswa: ${siswa.user.name} (NIS: ${siswa.nis})`);
    console.log(`   Tanggal Lahir: ${siswa.tanggalLahir.toISOString().split('T')[0]}`);

    // 2. Check if parent already exists for this siswa
    const existingParent = await prisma.orangTuaSiswa.findFirst({
      where: { siswaId: siswa.id }
    });

    if (existingParent) {
      console.log(`⚠️  Parent already registered for this siswa`);
      console.log(`\nTest payload would be:`);
      console.log({
        nis: siswa.nis,
        tanggalLahir: siswa.tanggalLahir.toISOString().split('T')[0],
        namaLengkap: 'Budi Orang Tua',
        noHP: '08123456789',
        password: 'Password123'
      });
      return;
    }

    console.log(`\n✅ No parent registered yet. Ready to test.`);
    console.log(`\nTest payload:`);
    const testPayload = {
      nis: siswa.nis,
      tanggalLahir: siswa.tanggalLahir.toISOString().split('T')[0],
      namaLengkap: 'Budi Orang Tua Test',
      noHP: '08123456789',
      password: 'Password123'
    };
    console.log(JSON.stringify(testPayload, null, 2));

    console.log(`\n📋 To test the API endpoints locally:

1. Test /api/auth/verify-student:
   POST /api/auth/verify-student
   {
     "nis": "${siswa.nis}",
     "tanggalLahir": "${testPayload.tanggalLahir}"
   }

2. Test /api/auth/register-orangtua:
   POST /api/auth/register-orangtua
   {
     "nis": "${siswa.nis}",
     "tanggalLahir": "${testPayload.tanggalLahir}",
     "namaLengkap": "${testPayload.namaLengkap}",
     "noHP": "${testPayload.noHP}",
     "password": "${testPayload.password}"
   }
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testParentRegistration();
