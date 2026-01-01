const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findSiswaWithoutParent() {
  try {
    console.log('\n🔍 Finding siswa without parent account...\n');

    // Find siswa with tanggalLahir and WITHOUT parent
    const siswa = await prisma.siswa.findFirst({
      where: {
        tanggalLahir: { not: null },
        orangTuaSiswa: {
          none: {} // No parent registered
        }
      },
      include: { user: true }
    });

    if (!siswa) {
      console.log('❌ No siswa found without parent. All have parents registered.');
      return;
    }

    console.log(`✅ Found siswa: ${siswa.user.name} (NIS: ${siswa.nis})`);
    console.log(`   Tanggal Lahir: ${siswa.tanggalLahir.toISOString().split('T')[0]}`);

    const testPayload = {
      nis: siswa.nis,
      tanggalLahir: siswa.tanggalLahir.toISOString().split('T')[0],
      namaLengkap: 'Test Parent ' + Date.now(),
      noHP: '08' + Math.random().toString().slice(2, 11),
      password: 'TestPassword123'
    };

    console.log(`\n📋 Test payload:`);
    console.log(JSON.stringify(testPayload, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findSiswaWithoutParent();
