export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

/**
 * POST /api/admin/guru/[id]/reset-password
 * Reset password akun GURU ke default: MAN1
 * Admin only
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Guru ID is required' }, { status: 400 });
    }

    // Find guru and user
    const guru = await prisma.guru.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, name: true, username: true } }
      }
    });

    if (!guru || !guru.user) {
      return NextResponse.json({ error: 'Guru tidak ditemukan' }, { status: 404 });
    }

    const defaultPassword = 'MAN1';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { id: guru.user.id },
      data: {
        password: passwordHash,
        updatedAt: new Date()
      }
    });

    // Activity log (best-effort)
    try {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'GURU',
        description: `Reset password guru ${guru.user.name} (${guru.user.username || guru.user.email}) ke default`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
        metadata: {
          guruId: id,
          userId: guru.user.id,
          defaultPassword: 'MAN1'
        }
      });
    } catch (e) {
      // ignore log errors
    }

    return NextResponse.json({
      success: true,
      userId: updatedUser.id,
      message: 'Password guru berhasil di-reset ke default (MAN1)',
      newPassword: defaultPassword
    });
  } catch (error) {
    console.error('❌ Error resetting guru password:', error);
    return NextResponse.json(
      { error: 'Gagal mereset password guru', details: error.message },
      { status: 500 }
    );
  }
}

