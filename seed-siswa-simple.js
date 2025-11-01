import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting siswa seed...\n');

  try {
    // Check existing data
    const kelasList = await prisma.kelas.findMany();
    console.log(`Found ${kelasList.length} kelas in database`);

    if (kelasList.length === 0) {
      console.log('❌ No kelas found. Please create kelas first.');
      return;
    }

    // Use first kelas
    const kelas = kelasList[0];
    console.log(`Using kelas: ${kelas.nama} (${kelas.id})\n`);

    // Get guru
    const guru = await prisma.guru.findFirst();
    if (!guru) {
      console.log('❌ No guru found. Please create guru first.');
      return;
    }

    const hashedPassword = await bcrypt.hash('siswa123', 10);

    // Create sample siswa
    const siswaData = [
      {
        email: 'ahmad.fauzan@example.com',
        name: 'Ahmad Fauzan',
        nis: 'S001',
        nisn: '0012345671',
      },
      {
        email: 'fatimah.zahra@example.com',
        name: 'Fatimah Zahra',
        nis: 'S002',
        nisn: '0012345672',
      },
      {
        email: 'muhammad.rizki@example.com',
        name: 'Muhammad Rizki',
        nis: 'S003',
        nisn: '0012345673',
      },
      {
        email: 'aisyah.nur@example.com',
        name: 'Aisyah Nur',
        nis: 'S004',
        nisn: '0012345674',
      },
      {
        email: 'umar.abdullah@example.com',
        name: 'Umar Abdullah',
        nis: 'S005',
        nisn: '0012345675',
      },
    ];

    console.log('👨‍🎓 Creating siswa accounts...\n');

    for (const data of siswaData) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        console.log(`⏭️  Skipping ${data.name} - already exists`);
        continue;
      }

      // Create user and siswa
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          role: 'SISWA',
          siswa: {
            create: {
              nis: data.nis,
              nisn: data.nisn,
              kelasId: kelas.id,
              jenisKelamin: data.name.includes('Fatimah') || data.name.includes('Aisyah') ? 'PEREMPUAN' : 'LAKI_LAKI',
              status: 'approved',
              tanggalLahir: new Date('2008-01-01'),
              tempatLahir: 'Jakarta',
              alamat: 'Jl. Contoh No. 1',
            }
          }
        },
        include: {
          siswa: true
        }
      });

      console.log(`✅ Created: ${user.name} (${user.email})`);
    }

    console.log('\n✅ Seeding completed!');
    console.log('\n📝 Siswa Login:');
    console.log('   Email: [any siswa email above]');
    console.log('   Password: siswa123');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
