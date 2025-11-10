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

    // 3. Create/Update Siswa (Abdullah sudah ada dari seed sebelumnya)
    const siswa = await prisma.user.upsert({
      where: { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'abdullah.rahman@siswa.tahfidz.sch.id',
        password: hashedPassword,
        name: 'Abdullah Rahman',
        role: 'SISWA',
      },
    });

    // 4. Create/Update Orang Tua
    const orangTua = await prisma.user.upsert({
      where: { email: 'ortu.24001@parent.tahfidz.sch.id' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'ortu.24001@parent.tahfidz.sch.id',
        password: hashedPassword,
        name: 'Bapak Ahmad (Orang Tua)',
        role: 'ORANG_TUA',
      },
    });

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
