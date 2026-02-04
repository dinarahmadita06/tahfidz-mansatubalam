export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { getCachedData, setCachedData } from '@/lib/cache';

// Force Node.js runtime
export const runtime = 'nodejs';

// GET - Mengambil data profil admin
export async function GET(request) {
  const startTotal = performance.now();
  
  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    const authDuration = (endAuth - startAuth).toFixed(2);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const cacheKey = `admin-profile-${userId}`;
    
    // Check cache
    const cached = getCachedData(cacheKey);
    if (cached) {
      console.log(`[API PROFILE] total: ${(performance.now() - startTotal).toFixed(2)} ms (CACHED)`);
      return NextResponse.json(cached);
    }

    // Ambil data admin dari database
    const startPrisma = performance.now();
    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nip: true,
        jabatan: true,
        alamat: true,
        createdAt: true,
        ttdUrl: true,
        signatureUrl: true
      }
    });
    const endPrisma = performance.now();
    const prismaDuration = (endPrisma - startPrisma).toFixed(2);

    if (!admin) {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    // Format data profil
    const startTransform = performance.now();
    const profileData = {
      nama: admin.name,
      email: admin.email,
      role: 'Administrator',
      jabatan: admin.jabatan || 'Koordinator Tahfidz',
      nip: admin.nip || '',
      alamat: admin.alamat || 'MAN 1 Bandar Lampung, Jl. Raden Intan No. 12',
      tanggalBergabung: admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }) : '15 Agustus 2024',
      lastLogin: new Date().toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB',
      ttdUrl: admin.ttdUrl,
      signatureUrl: admin.signatureUrl
    };
    const endTransform = performance.now();
    const transformDuration = (endTransform - startTransform).toFixed(2);

    const response = { profile: profileData };
    
    // Cache for 60 seconds
    setCachedData(cacheKey, response, 60);

    const endTotal = performance.now();
    const totalDuration = (endTotal - startTotal).toFixed(2);

    console.log(`[API PROFILE] total: ${totalDuration} ms`);
    console.log(`[API PROFILE] session/auth: ${authDuration} ms`);
    console.log(`[API PROFILE] prisma.user.findUnique: ${prismaDuration} ms`);
    console.log(`[API PROFILE] transform response: ${transformDuration} ms`);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data profil' },
      { status: 500 }
    );
  }
}

// PUT - Update data profil admin
export async function PUT(request) {
  try {
    console.log('===== PUT /api/admin/profile called =====');

    const session = await auth();
    console.log('Session:', session ? { id: session.user.id, role: session.user.role } : 'No session');

    if (!session || session.user.role !== 'ADMIN') {
      console.log('Unauthorized: No session or not admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);

    const { nama, jabatan, nip, alamat } = body;

    // Validasi data
    if (!nama) {
      console.log('Validation failed: nama missing');
      return NextResponse.json(
        { error: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    console.log('Updating user with ID:', session.user.id);

    // Update data admin
    const updatedAdmin = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: nama,
        jabatan: jabatan || null,
        nip: nip || null,
        alamat: alamat || null
      }
    });

    console.log('User updated successfully:', updatedAdmin.id);

    // Log aktivitas
    try {
      await prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
          action: 'UPDATE',
          title: 'Update Profil',
          description: 'Mengupdate profil admin',
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
            device: request.headers.get('user-agent') || 'Unknown'
          }
        }
      });
      console.log('Activity log created');
    } catch (logError) {
      console.error('Failed to create activity log:', logError);
      // Continue even if logging fails
    }

    console.log('Returning success response');
    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      profile: {
        nama: updatedAdmin.name,
        jabatan: updatedAdmin.jabatan,
        nip: updatedAdmin.nip,
        alamat: updatedAdmin.alamat
      }
    });
  } catch (error) {
    console.error('===== Error updating admin profile =====');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: `Gagal memperbarui profil: ${error.message}` },
      { status: 500 }
    );
  }
}

// PATCH - Update password admin
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword, confirmPassword } = body;

    // Validasi input
    if (!oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Password baru dan konfirmasi tidak cocok' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (newPassword.length < 8) {
      return NextResponse.json(
        { 
          success: false, 
          code: "PASSWORD_TOO_SHORT", 
          error: 'Password baru minimal 8 karakter',
          message: 'Password minimal 8 karakter.'
        },
        { status: 400 }
      );
    }

    // Ambil data user dari database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
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

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    // Log aktivitas
    try {
      await prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
          action: 'UPDATE',
          title: 'Ganti Password',
          description: 'Mengubah password akun',
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
            device: request.headers.get('user-agent') || 'Unknown'
          }
        }
      });
    } catch (logError) {
      console.error('Failed to create activity log:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah password' },
      { status: 500 }
    );
  }
}
