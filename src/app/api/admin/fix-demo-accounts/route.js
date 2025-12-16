import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    console.log('🔧 Starting demo accounts fix...');

    // Fix 1: Create Guru Profile for Ahmad Fauzi
    console.log('📝 Fixing Guru Account...');
    let guruUser = await prisma.user.findUnique({
      where: { email: 'ahmad.fauzi@tahfidz.sch.id' },
      include: { guru: true }
    });

    let guruFixed = false;
    if (guruUser && !guruUser.guru) {
      console.log('  Creating missing Guru profile...');
      await prisma.guru.create({
        data: {
          userId: guruUser.id,
          jenisKelamin: 'LAKI_LAKI',
          noTelepon: '081234567890',
          alamat: 'Jl. Guru Tahfidz No. 1'
        }
      });
      console.log('  ✅ Guru profile created!');
      guruFixed = true;
    } else if (guruUser && guruUser.guru) {
      console.log('  ✅ Guru profile already exists!');
    } else {
      console.log('  ⚠️  Guru user not found!');
    }

    // Fix 2: Create Siswa Account (Abdullah Rahman)
    console.log('📝 Creating Siswa Account...');
    const hashedPassword = await bcrypt.hash('123456', 10);

    let siswaUser = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true }
    });

    let siswaFixed = false;
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
      console.log('  ✅ Siswa account created!');
      siswaFixed = true;
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
      console.log('  ✅ Siswa profile created!');
      siswaFixed = true;
    } else {
      console.log('  ✅ Siswa account already exists!');
    }

    return NextResponse.json({
      success: true,
      message: 'Demo accounts fixed successfully!',
      changes: {
        guruProfileCreated: guruFixed,
        siswaAccountCreated: siswaFixed
      },
      credentials: {
        admin: {
          email: 'admin@tahfidz.sch.id',
          password: '123456'
        },
        guru: {
          email: 'ahmad.fauzi@tahfidz.sch.id',
          password: '123456'
        },
        siswa: {
          email: 'abdullah.rahman@siswa.tahfidz.sch.id',
          password: '123456'
        },
        orangTua: {
          email: 'ortu.24001@parent.tahfidz.sch.id',
          password: '123456'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fixing demo accounts:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.code
    }, { status: 500 });
  }
}
