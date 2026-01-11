export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

export async function POST(request) {
  try {
    // Cek autentikasi
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru harus diisi' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password baru minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Ambil data user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password lama tidak sesuai' },
        { status: 400 }
      );
    }

    // Pastikan password baru berbeda dengan password lama
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Password baru harus berbeda dengan password lama' },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log('✅ Password berhasil diubah untuk user:', user.email);

    // Log the activity
    const activityAction = session.user.role === 'ORANG_TUA' || session.user.role === 'ORANGTUA' 
      ? ACTIVITY_ACTIONS.ORANGTUA_UBAH_PASSWORD 
      : ACTIVITY_ACTIONS.SISWA_UBAH_PASSWORD;

    await logActivity({
      actorId: session.user.id,
      actorRole: session.user.role,
      actorName: session.user.name,
      action: activityAction,
      title: 'Mengubah Password',
      description: 'Anda berhasil mengubah password akun.',
    });

    return NextResponse.json(
      { message: 'Password berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error change password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
