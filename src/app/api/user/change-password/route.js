export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, oldPassword, newPassword } = body;
    console.log('REQUEST BODY:', { currentPassword, oldPassword, newPassword: newPassword ? '***' : '' });
    
    // Support both currentPassword and oldPassword for compatibility
    const passwordToCheck = currentPassword || oldPassword;

    // Validate all required fields
    if (!passwordToCheck || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru harus diisi' },
        { status: 400 }
      );
    }

    // Validate new password length (minimum 6 characters as per UI requirement)
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password baru minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Get user from database with relations for birthday fallback check
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        siswa: true,
        orangTua: {
          include: {
            orangTuaSiswa: {
              include: { siswa: true }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify current password
    let isPasswordValid = await bcrypt.compare(passwordToCheck, user.password);

    // Fallback for Siswa/Orang Tua if password format is date (YYYY-MM-DD vs DDMMYYYY)
    // This matches the logic in auth.config.js to allow default password as old password
    if (!isPasswordValid && (user.role === 'ORANG_TUA' || user.role === 'SISWA')) {
      let birthDate;
      if (user.role === 'SISWA' && user.siswa?.tanggalLahir) {
        birthDate = new Date(user.siswa.tanggalLahir);
      } else if (user.role === 'ORANG_TUA' && user.orangTua?.orangTuaSiswa?.[0]?.siswa?.tanggalLahir) {
        birthDate = new Date(user.orangTua.orangTuaSiswa[0].siswa.tanggalLahir);
      }

      if (birthDate) {
        const ddmmyyyy = String(birthDate.getDate()).padStart(2, '0') + 
                         String(birthDate.getMonth() + 1).padStart(2, '0') + 
                         birthDate.getFullYear();
        
        const yyyymmdd = birthDate.getFullYear() + '-' + 
                         String(birthDate.getMonth() + 1).padStart(2, '0') + 
                         String(birthDate.getDate()).padStart(2, '0');

        if (String(passwordToCheck) === ddmmyyyy || String(passwordToCheck) === yyyymmdd) {
          // Re-verify against the database hash using the default format (yyyy-mm-dd)
          isPasswordValid = await bcrypt.compare(yyyymmdd, user.password);
        }
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Password lama tidak sesuai' },
        { status: 400 }
      );
    }

    // Ensure new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'Password baru harus berbeda dengan password lama' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    console.log('✅ Password berhasil diubah untuk user:', user.email);

    return NextResponse.json(
      { message: 'Password berhasil diubah' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengubah password' },
      { status: 500 }
    );
  }
}
