import { prisma } from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function fixDemoAccounts() {
  console.log('\n🔧 Fixing Demo Accounts...\n');

  try {
    // Fix 1: Create Guru Profile for Ahmad Fauzi
    console.log('📝 Fixing Guru Account...');
    let guruUser = await prisma.user.findUnique({
      where: { email: 'ahmad.fauzi@tahfidz.sch.id' },
      include: { guru: true }
    });

    if (guruUser && !guruUser.guru) {
      console.log('  Creating missing Guru profile...');
      await prisma.guru.create({
        data: {
          userId: guruUser.id,
          jenisKelamin: 'LAKI_LAKI',
          
        }
      });
      console.log('  ✅ Guru profile created!\n');
    } else {
      console.log('  ✅ Guru profile already exists!\n');
    }

    // Fix 2: Create Siswa Account (Abdullah Rahman)
    console.log('📝 Creating Siswa Account...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    let siswaUser = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true }
    });

    if (!siswaUser) {
      // Find a unique NIS
      let nis = 'DEMO24001';
      let counter = 1;
      let existingNis = await prisma.siswa.findUnique({
        where: { nis },
      });
      while (existingNis) {
        nis = `DEMO24001${counter}`;
        counter++;
        existingNis = await prisma.siswa.findUnique({
          where: { nis },
        });
      }

      console.log(`  Creating new Siswa user with NIS: ${nis}...`);
      siswaUser = await prisma.user.create({
        data: {
          email: 'abdullah.rahman@siswa.tahfidz.sch.id',
          password: hashedPassword,
          name: 'Abdullah Rahman',
          role: 'SISWA',
          siswa: {
            create: {
              nis: nis,
              jenisKelamin: 'LAKI_LAKI',
              status: 'approved',
              alamat: 'Jl. Demo Siswa No. 1',
              noTelepon: '081234567890'
            }
          }
        },
        include: { siswa: true }
      });
      console.log('  ✅ Siswa account created!\n');
    } else if (!siswaUser.siswa) {
      // Find a unique NIS
      let nis = 'DEMO24001';
      let counter = 1;
      let existingNis = await prisma.siswa.findUnique({
        where: { nis },
      });
      while (existingNis) {
        nis = `DEMO24001${counter}`;
        counter++;
        existingNis = await prisma.siswa.findUnique({
          where: { nis },
        });
      }

      console.log(`  Creating missing Siswa profile with NIS: ${nis}...`);
      await prisma.siswa.create({
        data: {
          userId: siswaUser.id,
          nis: nis,
          jenisKelamin: 'LAKI_LAKI',
          status: 'approved',
          alamat: 'Jl. Demo Siswa No. 1',
          noTelepon: '081234567890'
        }
      });
      console.log('  ✅ Siswa profile created!\n');
    } else {
      console.log('  ✅ Siswa account already exists!\n');
    }

    console.log('✅ All demo accounts fixed!\n');
    console.log('📋 Demo Credentials:');
    console.log('   Admin: admin@tahfidz.sch.id / 123456');
    console.log('   Guru: ahmad.fauzi@tahfidz.sch.id / 123456');
    console.log('   Siswa: abdullah.rahman@siswa.tahfidz.sch.id / 123456');
    console.log('   Orang Tua: ortu.24001@parent.tahfidz.sch.id / 123456\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing accounts:', error);
    process.exit(1);
  }
}

fixDemoAccounts();
