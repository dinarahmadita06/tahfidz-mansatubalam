import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Check account status for login validation
 * POST /api/auth/check-status
 * Body: { username: string }
 * Returns: { status: string, message: string, role: string }
 */
export async function POST(request) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return NextResponse.json({
        status: 'invalid',
        message: 'Username diperlukan'
      }, { status: 400 });
    }

    const identifier = username.trim().toUpperCase();

    // Find user by username (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: identifier },
          { username: { equals: identifier, mode: 'insensitive' }}
        ],
        role: { not: 'ADMIN' }
      },
      include: {
        siswa: {
          select: { status: true }
        },
        orangTua: {
          select: { status: true }
        },
        guru: true
      }
    });

    if (!users || users.length === 0) {
      // User not found - return generic error for security
      return NextResponse.json({
        status: 'not_found',
        message: 'Username atau password salah'
      });
    }

    // Check each user's validation status
    for (const user of users) {
      // Check Siswa status
      if (user.role === 'SISWA' && user.siswa) {
        if (user.siswa.status === 'pending') {
          return NextResponse.json({
            status: 'pending',
            role: 'SISWA',
            message: 'Akun Anda belum divalidasi oleh admin. Silakan tunggu hingga proses validasi selesai.\n\nJika sudah lebih dari 1x24 jam, hubungi admin sekolah.'
          });
        }
        if (user.siswa.status === 'rejected') {
          return NextResponse.json({
            status: 'rejected',
            role: 'SISWA',
            message: 'Akun Anda ditolak oleh admin. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.'
          });
        }
        if (user.siswa.status === 'suspended') {
          return NextResponse.json({
            status: 'suspended',
            role: 'SISWA',
            message: 'Akun Anda ditangguhkan. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.'
          });
        }
      }

      // Check Orang Tua status
      if (user.role === 'ORANG_TUA' && user.orangTua) {
        if (user.orangTua.status === 'pending') {
          return NextResponse.json({
            status: 'pending',
            role: 'ORANG_TUA',
            message: 'Akun Anda belum divalidasi oleh admin. Silakan tunggu hingga proses validasi selesai.\n\nJika sudah lebih dari 1x24 jam, hubungi admin sekolah.'
          });
        }
        if (user.orangTua.status === 'rejected') {
          return NextResponse.json({
            status: 'rejected',
            role: 'ORANG_TUA',
            message: 'Akun Anda ditolak oleh admin. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.'
          });
        }
        if (user.orangTua.status === 'suspended') {
          return NextResponse.json({
            status: 'suspended',
            role: 'ORANG_TUA',
            message: 'Akun Anda ditangguhkan. Silakan hubungi pihak sekolah untuk informasi lebih lanjut.'
          });
        }
      }

      // Check if account is inactive
      if (!user.isActive) {
        return NextResponse.json({
          status: 'inactive',
          role: user.role,
          message: 'Akun Anda tidak aktif. Silakan hubungi admin sekolah.'
        });
      }
    }

    // Account exists and is approved - login failure is due to wrong password
    return NextResponse.json({
      status: 'approved',
      message: 'Username atau password salah'
    });

  } catch (error) {
    console.error('❌ [CHECK-STATUS] Error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Terjadi kesalahan sistem'
    }, { status: 500 });
  }
}
