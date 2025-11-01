import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token dan password harus diisi' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // Token masih valid
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kadaluarsa' },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password dan hapus reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log('✅ Password berhasil direset untuk user:', user.email);

    return NextResponse.json(
      { message: 'Password berhasil direset' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reset password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
