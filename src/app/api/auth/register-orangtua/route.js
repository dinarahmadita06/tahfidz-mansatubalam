export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nis, tanggalLahir, namaLengkap, noHP, password } = body;

    // Validate required fields
    if (!nis || !tanggalLahir || !namaLengkap || !noHP || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Validate phone number format (must start with 08)
    if (!noHP.startsWith('08')) {
      return NextResponse.json(
        { error: 'Nomor HP harus diawali dengan 08' },
        { status: 400 }
      );
    }

    // Find student by NIS and tanggalLahir
    const siswa = await prisma.siswa.findFirst({
      where: {
        nis: nis.toString(),
        tanggalLahir: new Date(tanggalLahir)
      },
      include: {
        user: true
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'NIS atau tanggal lahir tidak cocok' },
        { status: 404 }
      );
    }

    // Check if parent already registered for this student
    const existingParent = await prisma.orangTuaSiswa.findFirst({
      where: {
        siswaId: siswa.id
      }
    });

    if (existingParent) {
      return NextResponse.json(
        { error: 'Akun orang tua untuk siswa ini sudah terdaftar' },
        { status: 400 }
      );
    }

    // Check if email already exists (using noHP as username, generate email)
    const parentEmail = `${noHP}@wali.tahfidz.sch.id`;
    const existingEmail = await prisma.user.findUnique({
      where: { email: parentEmail }
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email wali sudah terdaftar dengan nomor HP lain' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create parent account with ATOMIC transaction
    // Parent account is automatically ACTIVE when student is successfully created
    const orangTua = await prisma.orangTua.create({
      data: {
        noTelepon: noHP,
        jenisKelamin: 'LAKI_LAKI', // Default value
        status: 'approved', // Parent auto-activated when student is created
        user: {
          create: {
            name: namaLengkap,
            email: parentEmail,
            password: hashedPassword,
            role: 'ORANG_TUA',
            isActive: true // Auto-activate parent account
          }
        }
      },
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

    console.log('✅ Parent account created successfully:', orangTua.id);

    // Link parent to student
    const orangTuaSiswa = await prisma.orangTuaSiswa.create({
      data: {
        orangTuaId: orangTua.id,
        siswaId: siswa.id,
        hubungan: 'Orang Tua' // Default relationship type
      }
    });

    console.log('✅ Parent linked to student:', siswa.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil! Akun orang tua aktif otomatis.',
        orangTuaId: orangTua.id,
        orangTua: {
          name: orangTua.user.name,
          email: orangTua.user.email
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error registering parent:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0];
      let errorMsg = 'Data sudah terdaftar';
      if (field === 'email') {
        errorMsg = 'Email sudah terdaftar, silakan gunakan email lain';
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Gagal menambahkan orang tua' },
      { status: 500 }
    );
  }
}

