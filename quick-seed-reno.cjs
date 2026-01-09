const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test data for Reno...');

    // Create TahunAjaran
    const tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        nama: '2024/2025',
        semester: 1,
        tanggalMulai: new Date('2024-01-01'),
        tanggalSelesai: new Date('2024-12-31'),
        isActive: true,
      }
    });

    // Create Kelas
    const kelas = await prisma.kelas.create({
      data: {
        nama: 'X-A',
        status: 'AKTIF',
        tahunAjaranId: tahunAjaran.id,
      }
    });

    // Create User (Reno)
    const userReno = await prisma.user.create({
      data: {
        name: 'Reno',
        email: 'reno@test.local',
        password: await bcrypt.hash('password123', 10),
        role: 'SISWA',
        isActive: true,
      }
    });

    // Create Siswa
    const siswa = await prisma.siswa.create({
      data: {
        userId: userReno.id,
        nis: '001',
        nisn: '12345678901',
        status: 'approved',
        statusSiswa: 'AKTIF',
        jenisKelamin: 'LAKI_LAKI',
        kelasId: kelas.id,
        tahunAjaranMasukId: tahunAjaran.id,
        kelasAngkatan: 'X',
      }
    });

    console.log('✓ Created Reno (siswa)');
    console.log('  Siswa ID:', siswa.id);
    console.log('  User ID:', userReno.id);
    console.log('\nNow you can test with:');
    console.log(`  siswaId=${siswa.id}`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
