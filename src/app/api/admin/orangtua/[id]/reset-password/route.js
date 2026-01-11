export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

/**
 * POST - Reset parent account password
 * Admin-only endpoint to reset password for parent accounts
 * 
 * Request body:
 * {
 *   "newPassword": "new_password_here"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "userId": "user_id",
 *   "updatedAt": "2024-01-05T...",
 *   "message": "Password berhasil diperbarui"
 * }
 */
export async function POST(request, { params }) {
  try {
    const session = await auth();

    // Verify admin authorization
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    let { newPassword } = body;

    // Find parent account with student data for password generation
    const orangTua = await prisma.orangTua.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        orangTuaSiswa: {
          include: {
            siswa: {
              select: {
                nisn: true,
                tanggalLahir: true
              }
            }
          }
        }
      }
    });

    if (!orangTua) {
      return NextResponse.json(
        { error: 'Akun orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    // Standard SIMTAQ password generation if not provided
    if (!newPassword || newPassword.trim() === '') {
      const firstSiswa = orangTua.orangTuaSiswa?.[0]?.siswa;
      if (firstSiswa && firstSiswa.nisn) {
        const birthDate = firstSiswa.tanggalLahir ? new Date(firstSiswa.tanggalLahir) : null;
        const birthYear = birthDate && !isNaN(birthDate.getTime()) ? birthDate.getFullYear() : null;
        newPassword = birthYear ? `${firstSiswa.nisn}-${birthYear}` : firstSiswa.nisn;
      } else {
        return NextResponse.json(
          { error: 'Password baru harus diisi (data siswa terhubung tidak ditemukan)' },
          { status: 400 }
        );
      }
    }

    // Hash the new password with bcrypt
    console.log('🔐 Hashing new password with bcrypt...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in User table
    console.log('📝 Updating password in User table for user ID:', orangTua.user.id);
    const updatedUser = await prisma.user.update({
      where: { id: orangTua.user.id },
      data: {
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        updatedAt: true
      }
    });

    console.log('✅ Password updated successfully for:', updatedUser.email);

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE',
      module: 'ORANG_TUA',
      description: `Reset password orang tua ${orangTua.user.name} (${orangTua.user.email})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        orangTuaId: id,
        userId: orangTua.user.id,
        email: orangTua.user.email
      }
    }).catch((err) => console.error('Log activity error:', err));

    // Return success response with required fields
    return NextResponse.json(
      {
        success: true,
        userId: updatedUser.id,
        updatedAt: updatedUser.updatedAt,
        newPassword: newPassword, // Return the used password
        message: 'Password berhasil di-reset'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error resetting parent password:', error);
    return NextResponse.json(
      {
        error: 'Gagal mereset password orang tua',
        details: error.message
      },
      { status: 500 }
    );
  }
}
