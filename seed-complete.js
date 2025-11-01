import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting complete seed...\n');

  try {
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    console.log('👤 Creating Admin...');
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@tahfidz.sch.id' }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: 'admin@tahfidz.sch.id',
          password: await bcrypt.hash('admin123', 10),
          name: 'Administrator',
          role: 'ADMIN',
        }
      });
      console.log('✅ Admin created');
    } else {
      console.log('⏭️  Admin already exists');
    }

    // 2. Create Guru
    console.log('\n👨‍🏫 Creating Guru...');
    let guruUser = await prisma.user.findUnique({
      where: { email: 'guru@tahfidz.sch.id' },
      include: { guru: true }
    });

    if (!guruUser) {
      guruUser = await prisma.user.create({
        data: {
          email: 'guru@tahfidz.sch.id',
          password: await bcrypt.hash('guru123', 10),
          name: 'Ustadz Ahmad',
          role: 'GURU',
          guru: {
            create: {
              nip: 'G001',
              jabatan: 'Guru Tahfidz',
              jenisKelamin: 'LAKI_LAKI',
              alamat: 'Jl. Guru No. 1',
            }
          }
        },
        include: { guru: true }
      });
      console.log('✅ Guru created');
    } else {
      console.log('⏭️  Guru already exists');
    }

    // 3. Create Tahun Ajaran
    console.log('\n📅 Creating Tahun Ajaran...');
    let tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    if (!tahunAjaran) {
      tahunAjaran = await prisma.tahunAjaran.create({
        data: {
          nama: '2024/2025',
          tanggalMulai: new Date('2024-07-15'),
          tanggalSelesai: new Date('2025-06-30'),
          isActive: true,
        }
      });
      console.log('✅ Tahun Ajaran created');
    } else {
      console.log('⏭️  Tahun Ajaran already exists');
    }

    // 4. Create Kelas
    console.log('\n🏫 Creating Kelas...');
    const kelasData = [
      { id: 'x-a1', nama: 'X A1' },
      { id: 'x-a2', nama: 'X A2' },
      { id: 'xi-a1', nama: 'XI A1' },
      { id: 'xi-a2', nama: 'XI A2' },
      { id: 'xii-a1', nama: 'XII A1' },
      { id: 'xii-a2', nama: 'XII A2' },
    ];

    const kelasList = [];
    for (const kelasInfo of kelasData) {
      let kelas = await prisma.kelas.findUnique({
        where: { id: kelasInfo.id }
      });

      if (!kelas) {
        kelas = await prisma.kelas.create({
          data: {
            id: kelasInfo.id,
            nama: kelasInfo.nama,
            tahunAjaranId: tahunAjaran.id,
            targetJuz: 1,
            status: 'AKTIF',
          }
        });
        console.log(`✅ Created kelas: ${kelas.nama}`);
      } else {
        console.log(`⏭️  Kelas ${kelas.nama} already exists`);
      }
      kelasList.push(kelas);
    }

    // 5. Assign Guru to Kelas
    console.log('\n👨‍🏫 Assigning Guru to Kelas...');
    for (const kelas of kelasList) {
      const existing = await prisma.guruKelas.findUnique({
        where: {
          guruId_kelasId: {
            guruId: guruUser.guru.id,
            kelasId: kelas.id
          }
        }
      });

      if (!existing) {
        await prisma.guruKelas.create({
          data: {
            guruId: guruUser.guru.id,
            kelasId: kelas.id,
            isActive: true,
          }
        });
        console.log(`✅ Assigned guru to ${kelas.nama}`);
      }
    }

    // 6. Create Siswa
    console.log('\n👨‍🎓 Creating Siswa...');
    const siswaPassword = await bcrypt.hash('siswa123', 10);

    const siswaData = [
      { nama: 'Ahmad Fauzan', nis: 'S101', kelasId: 'x-a1', jk: 'LAKI_LAKI' },
      { nama: 'Fatimah Zahra', nis: 'S102', kelasId: 'x-a1', jk: 'PEREMPUAN' },
      { nama: 'Muhammad Rizki', nis: 'S103', kelasId: 'x-a1', jk: 'LAKI_LAKI' },
      { nama: 'Aisyah Nur', nis: 'S104', kelasId: 'x-a2', jk: 'PEREMPUAN' },
      { nama: 'Umar Abdullah', nis: 'S105', kelasId: 'x-a2', jk: 'LAKI_LAKI' },
      { nama: 'Khadijah Amira', nis: 'S106', kelasId: 'xi-a1', jk: 'PEREMPUAN' },
      { nama: 'Hasan Basri', nis: 'S107', kelasId: 'xi-a1', jk: 'LAKI_LAKI' },
      { nama: 'Zainab Husna', nis: 'S108', kelasId: 'xi-a2', jk: 'PEREMPUAN' },
      { nama: 'Ali Akbar', nis: 'S109', kelasId: 'xi-a2', jk: 'LAKI_LAKI' },
      { nama: 'Maryam Siddiq', nis: 'S110', kelasId: 'xii-a1', jk: 'PEREMPUAN' },
    ];

    for (const data of siswaData) {
      const email = data.nama.toLowerCase().replace(/ /g, '.') + '@siswa.com';

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (!existingUser) {
        await prisma.user.create({
          data: {
            email,
            password: siswaPassword,
            name: data.nama,
            role: 'SISWA',
            siswa: {
              create: {
                nis: data.nis,
                kelas: {
                  connect: { id: data.kelasId }
                },
                jenisKelamin: data.jk,
                status: 'approved',
                tanggalLahir: new Date('2008-01-15'),
                alamat: 'Jl. Siswa No. 1',
              }
            }
          }
        });
        console.log(`✅ Created: ${data.nama} (${email})`);
      } else {
        console.log(`⏭️  ${data.nama} already exists`);
      }
    }

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Admin: admin@tahfidz.sch.id / admin123');
    console.log('   Guru: guru@tahfidz.sch.id / guru123');
    console.log('   Siswa: [nama.siswa]@siswa.com / siswa123');
    console.log('   Example: ahmad.fauzan@siswa.com / siswa123');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
