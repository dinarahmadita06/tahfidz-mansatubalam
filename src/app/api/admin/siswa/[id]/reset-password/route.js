import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// POST - Reset password siswa
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find siswa
    const siswa = await prisma.siswa.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    if (!siswa.nisn) {
      return NextResponse.json({ error: 'NISN tidak ditemukan, gagal mereset password' }, { status: 400 });
    }

    // New password for student is always NISN
    const newPassword = siswa.nisn;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: siswa.userId },
      data: {
        password: hashedPassword
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'RESET_PASSWORD',
      module: 'SISWA',
      description: `Reset password siswa ${siswa.user.name} (NISN: ${siswa.nisn})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: siswa.id,
        siswaEmail: siswa.user.email
      }
    });

    // TODO: Send email with new password
    // For now, just return the password
    // In production, you should send this via email and not return it in response

    return NextResponse.json({
      message: 'Password berhasil di-reset',
      newPassword: newPassword,
      email: siswa.user.email,
      name: siswa.user.name
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Gagal reset password' },
      { status: 500 }
    );
  }
}
