export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    // Hash password yang sama untuk semua user demo
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 1. Create/Update Admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@tahfidz.sch.id' },
      update: {
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
      create: {
        email: 'admin@tahfidz.sch.id',
        password: hashedPassword,
        name: 'Administrator',
        role: 'ADMIN',
      },
    });

    // 2. Create/Update Guru (Ahmad Fauzi sudah ada dari seed sebelumnya)
    const guru = await prisma.user.upsert({
      where: { email: 'ahmad.fauzi@tahfidz.sch.id' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'ahmad.fauzi@tahfidz.sch.id',
        password: hashedPassword,
        name: 'Ustadz Ahmad Fauzi',
        role: 'GURU',
      },
    });

    // 3. Create/Update Siswa dengan profile lengkap
    let siswa = await prisma.user.findUnique({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      include: { siswa: true },
    });

    if (!siswa) {
      // Create new user dengan profile siswa
      siswa = await prisma.user.create({
        data: {
          email: 'abdullah.rahman@siswa.tahfidz.sch.id',
          password: hashedPassword,
          name: 'Abdullah Rahman',
          role: 'SISWA',
          siswa: {
            create: {
              nis: 'DEMO24001',
              jenisKelamin: 'LAKI_LAKI',
              status: 'approved',
              alamat: 'Jl. Demo Siswa No. 1',
              noTelepon: '081234567890',
            },
          },
        },
        include: { siswa: true },
      });
    } else {
      // Update password dan pastikan profile siswa ada
      await prisma.user.update({
        where: { id: siswa.id },
        data: { password: hashedPassword },
      });

      if (!siswa.siswa) {
        // Create profile siswa jika belum ada
        await prisma.siswa.create({
          data: {
            userId: siswa.id,
            nis: 'DEMO24001',
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved',
            alamat: 'Jl. Demo Siswa No. 1',
            noTelepon: '081234567890',
          },
        });
      } else {
        // Update status menjadi approved
        await prisma.siswa.update({
          where: { id: siswa.siswa.id },
          data: { status: 'approved' },
        });
      }
    }

    // 4. Create/Update Orang Tua dengan profile lengkap
    let orangTua = await prisma.user.findUnique({
      where: { email: 'ortu.24001@parent.tahfidz.sch.id' },
      include: { orangTua: true },
    });

    if (!orangTua) {
      // Create new user dengan profile orang tua
      orangTua = await prisma.user.create({
        data: {
          email: 'ortu.24001@parent.tahfidz.sch.id',
          password: hashedPassword,
          name: 'Bapak Ahmad (Orang Tua)',
          role: 'ORANG_TUA',
          orangTua: {
            create: {
              nik: 'DEMO3201234567890001',
              jenisKelamin: 'LAKI_LAKI',
              status: 'approved',
              pekerjaan: 'Wiraswasta',
              alamat: 'Jl. Demo Orang Tua No. 1',
              noTelepon: '081234567891',
            },
          },
        },
        include: { orangTua: true },
      });
    } else {
      // Update password dan pastikan profile orang tua ada
      await prisma.user.update({
        where: { id: orangTua.id },
        data: { password: hashedPassword },
      });

      if (!orangTua.orangTua) {
        // Create profile orang tua jika belum ada
        await prisma.orangTua.create({
          data: {
            userId: orangTua.id,
            nik: 'DEMO3201234567890001',
            jenisKelamin: 'LAKI_LAKI',
            status: 'approved',
            pekerjaan: 'Wiraswasta',
            alamat: 'Jl. Demo Orang Tua No. 1',
            noTelepon: '081234567891',
          },
        });
      } else {
        // Update status menjadi approved
        await prisma.orangTua.update({
          where: { id: orangTua.orangTua.id },
          data: { status: 'approved' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User demo berhasil dibuat/diupdate!',
      users: {
        admin: {
          email: admin.email,
          name: admin.name,
          password: '123456'
        },
        guru: {
          email: guru.email,
          name: guru.name,
          password: '123456'
        },
        siswa: {
          email: siswa.email,
          name: siswa.name,
          password: '123456'
        },
        orangTua: {
          email: orangTua.email,
          name: orangTua.name,
          password: '123456'
        }
      },
      instructions: 'Semua user demo menggunakan password: 123456'
    });

  } catch (error) {
    console.error('Error seeding users:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
