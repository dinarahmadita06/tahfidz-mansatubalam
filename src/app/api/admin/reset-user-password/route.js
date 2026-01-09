import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateGuruPassword, generateStrongPassword } from '@/lib/passwordUtils';

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
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
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
    
    let finalPassword = newPassword;
    let resetMessage = 'Password berhasil di-reset';
    
    // Specialized reset logic for GURU
    if (user.role === 'GURU' && newPassword === 'DEFAULT_FORMAT') {
      const guruData = await prisma.guru.findUnique({
        where: { userId: userId }
      });
    
      if (guruData) {
        if (!guruData.tanggalLahir) {
          finalPassword = `guru.${user.name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z]/g, '')}`;
          resetMessage = 'Tanggal lahir tidak tersedia, password guru di-reset tanpa tahun';
        } else {
          finalPassword = generateGuruPassword(user.name, guruData.tanggalLahir);
        }
      } else {
        // Fallback if Guru record not found
        finalPassword = generateStrongPassword();
        resetMessage = 'Data guru tidak lengkap, password di-reset ke format acak';
      }
    }
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(finalPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        actorRole: 'ADMIN',
        actorName: session.user.name,
        action: 'UPDATE',
        title: 'Reset Password User',
        description: `Admin reset password untuk user: ${user.email}`,
        targetUserId: userId,
        targetRole: user.role,
        targetName: user.name
      },
    });
    
    console.log(`✅ Admin ${session.user.email} reset password untuk ${user.email}`);
    
    return NextResponse.json(
      { 
        message: resetMessage,
        newPassword: finalPassword === newPassword ? undefined : finalPassword
      },
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
