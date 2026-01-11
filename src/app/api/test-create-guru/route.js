export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📝 Received data:', JSON.stringify(body, null, 2));

    const { name, email, password, nip, jenisKelamin, noHP, alamat } = body;

    // Validasi input
    if (!name || !email || !password || !jenisKelamin) {
      return NextResponse.json({
        error: 'Data tidak lengkap',
        received: { name, email, hasPassword: !!password, jenisKelamin }
      }, { status: 400 });
    }

    console.log('✅ Validation passed');

    // Normalize jenisKelamin
    let normalizedJenisKelamin = 'LAKI_LAKI';
    const jkUpper = String(jenisKelamin).toUpperCase().trim();
    if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE') {
      normalizedJenisKelamin = 'PEREMPUAN';
    } else if (jkUpper === 'LAKI_LAKI' || jkUpper === 'LAKI-LAKI' || jkUpper === 'L' || jkUpper === 'MALE') {
      normalizedJenisKelamin = 'LAKI_LAKI';
    } else {
      return NextResponse.json({ error: 'Jenis Kelamin harus L atau P' }, { status: 400 });
    }

    console.log('✅ Normalized jenisKelamin:', normalizedJenisKelamin);

    // Cek email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    console.log('✅ Email available');

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Prepare data
    const createData = {
      nip: nip || null,
      jenisKelamin: normalizedJenisKelamin,
      noHP: noHP || null,
      alamat: alamat || null,
      user: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: 'GURU'
        }
      }
    };

    console.log('📦 Create data:', JSON.stringify(createData, null, 2));

    // Buat user dan guru
    const guru = await prisma.guru.create({
      data: createData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Guru created successfully:', guru.id);

    return NextResponse.json({
      success: true,
      guru,
      message: 'Test create guru berhasil'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Test create error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
