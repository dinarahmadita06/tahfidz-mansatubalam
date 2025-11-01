import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { identifier } = await request.json();

    if (!identifier) {
      return NextResponse.json(
        { error: 'Username, email, atau nomor HP harus diisi' },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email dan pastikan role ADMIN
    const user = await prisma.user.findFirst({
      where: {
        email: identifier,
        role: 'ADMIN',
      },
    });

    if (!user) {
      // Jangan beritahu user jika email tidak ditemukan (untuk keamanan)
      return NextResponse.json(
        { message: 'Jika email Admin terdaftar, link reset password akan dikirim' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 jam

    // Simpan token ke database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Kirim email untuk Admin
    // Untuk saat ini, kita akan log URL-nya
    console.log('🔗 Reset Password URL:', resetUrl);
    console.log('👤 Admin:', user.name, '|', user.email);
    console.log('📧 Email reset password akan dikirim ke:', user.email);

    return NextResponse.json(
      {
        message: 'Link reset password telah dikirim',
        // Hanya untuk development/testing
        ...(process.env.NODE_ENV === 'development' && { resetUrl })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error forgot password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
