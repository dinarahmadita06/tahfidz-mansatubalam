import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creating admin, guru, siswa, and orangtua users...');

  const hashedPassword = await bcrypt.hash('admin.mansatu', 10);
  const guruPassword = await bcrypt.hash('guru123', 10);
  const siswaPassword = await bcrypt.hash('siswa123', 10);
  const orangTuaPassword = await bcrypt.hash('orangtua123', 10);

  // Check if users exist
  const adminExists = await prisma.user.findUnique({ where: { username: 'admin.tahfidz1' } });
  const guruExists = await prisma.user.findUnique({ where: { email: 'guru@tahfidz.sch.id' } });
  const siswaExists = await prisma.user.findUnique({ where: { email: 'siswa@example.com' } });
  const orangTuaExists = await prisma.user.findUnique({ where: { email: 'orangtua@example.com' } });

  // Create Admin if not exists
  if (!adminExists) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@tahfidz.sch.id',
        username: 'admin.tahfidz1',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created:', adminUser.username);
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // Create Guru if not exists
  if (!guruExists) {
    const guruUser = await prisma.user.create({
      data: {
        email: 'guru@tahfidz.sch.id',
        password: guruPassword,
        name: 'Ustadz Ahmad',
        role: 'GURU',
        guru: {
          create: {
            nip: 'G001',
            jabatan: 'Guru Tahfidz',
            jenisKelamin: 'LAKI_LAKI',
          },
        },
      },
    });
    console.log('✅ Guru user created:', guruUser.email);
  } else {
    console.log('ℹ️ Guru user already exists');
  }

  // Create Siswa if not exists
  if (!siswaExists) {
    const siswaUser = await prisma.user.create({
      data: {
        email: 'siswa@example.com',
        password: siswaPassword,
        name: 'Muhammad Hasan',
        role: 'SISWA',
        siswa: {
          create: {
            nis: 'S001',
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved',
          },
        },
      },
    });
    console.log('✅ Siswa user created:', siswaUser.email);
  } else {
    console.log('ℹ️ Siswa user already exists');
  }

  // Create Orang Tua if not exists
  if (!orangTuaExists) {
    const orangTuaUser = await prisma.user.create({
      data: {
        email: 'orangtua@example.com',
        password: orangTuaPassword,
        name: 'Bapak Hasan',
        role: 'ORANG_TUA',
        orangTua: {
          create: {
            nik: '1234567890123456',
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved',
          },
        },
      },
    });
    console.log('✅ Orang Tua user created:', orangTuaUser.email);
  } else {
    console.log('ℹ️ Orang Tua user already exists');
  }

  console.log('\n✅ All users seeded successfully!');
  console.log('\nLogin credentials:');
  console.log('Admin: admin.tahfidz1 / admin.mansatu');
  console.log('Guru: guru@tahfidz.sch.id / guru123');
  console.log('Siswa: siswa@example.com / siswa123');
  console.log('Orang Tua: orangtua@example.com / orangtua123');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
