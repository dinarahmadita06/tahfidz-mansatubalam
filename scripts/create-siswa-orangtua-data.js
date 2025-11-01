import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSiswaOrangTuaData() {
  try {
    console.log('🔍 Creating Siswa and Orang Tua related data...\n');

    // 1. Get SISWA user
    const siswaUser = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true },
    });

    if (!siswaUser) {
      console.error('❌ Siswa user not found!');
      return;
    }

    console.log('✅ Found SISWA user:', siswaUser.email);

    // 2. Create or update Siswa data
    if (siswaUser.siswa) {
      console.log('⚠️  Siswa data already exists, updating status...');

      await prisma.siswa.update({
        where: { id: siswaUser.siswa.id },
        data: { status: 'approved' },
      });

      console.log('✅ Updated Siswa status to approved');
    } else {
      console.log('➕ Creating new Siswa data...');

      const siswa = await prisma.siswa.create({
        data: {
          userId: siswaUser.id,
          nis: '24001',
          tanggalLahir: new Date('2010-01-01'),
          jenisKelamin: 'LAKI_LAKI',
          alamat: 'Jl. Contoh No. 123',
          noTelepon: '081234567890',
          status: 'approved', // IMPORTANT!
        },
      });

      console.log('✅ Created Siswa data with ID:', siswa.id);
    }

    console.log('');

    // 3. Get ORANG_TUA user
    const orangTuaUser = await prisma.user.findUnique({
      where: { email: 'ortu.24001@parent.tahfidz.sch.id' },
      include: { orangTua: true },
    });

    if (!orangTuaUser) {
      console.error('❌ Orang Tua user not found!');
      return;
    }

    console.log('✅ Found ORANG_TUA user:', orangTuaUser.email);

    // 4. Create or update Orang Tua data
    if (orangTuaUser.orangTua) {
      console.log('⚠️  Orang Tua data already exists, updating status...');

      await prisma.orangTua.update({
        where: { id: orangTuaUser.orangTua.id },
        data: { status: 'approved' },
      });

      console.log('✅ Updated Orang Tua status to approved');
    } else {
      console.log('➕ Creating new Orang Tua data...');

      // Get the siswa we just created
      const siswaData = await prisma.siswa.findUnique({
        where: { userId: siswaUser.id },
      });

      const orangTua = await prisma.orangTua.create({
        data: {
          userId: orangTuaUser.id,
          nik: '3201010101100001',
          pekerjaan: 'Wiraswasta',
          tanggalLahir: new Date('1980-01-01'),
          jenisKelamin: 'LAKI_LAKI',
          noTelepon: '081234567891',
          alamat: 'Jl. Contoh No. 123',
          status: 'approved', // IMPORTANT!
        },
      });

      // Create relation to siswa
      await prisma.orangTuaSiswa.create({
        data: {
          orangTuaId: orangTua.id,
          siswaId: siswaData.id,
          hubungan: 'Ayah',
        },
      });

      console.log('✅ Created Orang Tua data with ID:', orangTua.id);
    }

    console.log('\n🎉 All data created successfully!\n');

    // 5. Verify
    console.log('📋 Verification:\n');

    const siswaVerify = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true },
    });

    console.log('SISWA:');
    console.log('  Email:', siswaVerify.email);
    console.log('  Siswa Data:', siswaVerify.siswa ? '✅ EXISTS' : '❌ MISSING');
    console.log('  Status:', siswaVerify.siswa?.status || 'N/A');
    console.log('');

    const orangTuaVerify = await prisma.user.findUnique({
      where: { email: 'ortu.24001@parent.tahfidz.sch.id' },
      include: { orangTua: true },
    });

    console.log('ORANG_TUA:');
    console.log('  Email:', orangTuaVerify.email);
    console.log('  Orang Tua Data:', orangTuaVerify.orangTua ? '✅ EXISTS' : '❌ MISSING');
    console.log('  Status:', orangTuaVerify.orangTua?.status || 'N/A');
    console.log('');

    console.log('✅ Both users can now login!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

createSiswaOrangTuaData();
