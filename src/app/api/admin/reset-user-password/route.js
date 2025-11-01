import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Cek autentikasi dan pastikan ADMIN
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'User ID dan password baru harus diisi' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Cek apakah user ada dan bukan ADMIN
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Tidak dapat reset password Admin lain' },
        { status: 403 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // Log activity
    await prisma.logActivity.create({
      data: {
        userId: session.user.id,
        jenis: 'UPDATE',
        deskripsi: `Admin reset password untuk user: ${user.email}`,
      },
    });

    console.log(`✅ Admin ${session.user.email} reset password untuk ${user.email}`);

    return NextResponse.json(
      { message: 'Password berhasil direset' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reset user password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
