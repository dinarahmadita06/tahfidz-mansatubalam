export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { requireAdmin, requireAdminOrGuru } from '@/lib/authHelpers';

import { getCachedData, setCachedData, invalidateCacheByPrefix } from '@/lib/cache';

// GET - Mengambil daftar pengumuman
export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API ADMIN PENGUMUMAN] REQUEST START ---');

  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API ADMIN PENGUMUMAN] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    const authError = requireAdminOrGuru(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Cache key
    const cacheKey = `admin-pengumuman-p${page}-l${limit}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('[API ADMIN PENGUMUMAN] Returning cached data');
      return NextResponse.json(cachedData);
    }

    const startQueries = performance.now();
    const [totalCount, pengumuman] = await Promise.all([
      prisma.pengumuman.count({ where: { deletedAt: null } }),
      prisma.pengumuman.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        select: {
          id: true,
          judul: true,
          isi: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          isPinned: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);
    const endQueries = performance.now();
    console.log(`[API ADMIN PENGUMUMAN] Found ${pengumuman.length} announcements (Total: ${totalCount})`);
    console.log(`[API ADMIN PENGUMUMAN] prisma.findMany: ${(endQueries - startQueries).toFixed(2)} ms`);

    const responseData = { 
      pengumuman,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

    setCachedData(cacheKey, responseData, 30);

    const endTotal = performance.now();
    console.log(`[API ADMIN PENGUMUMAN] total: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log('--- [API ADMIN PENGUMUMAN] REQUEST END ---');

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman' },
      { status: 500 }
    );
  }
}

// POST - Membuat pengumuman baru (ADMIN only)
export async function POST(request) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) return authError;

    const body = await request.json();
    const {
      judul,
      isi,
      tanggalBerlaku,
      attachmentUrl,
      attachmentName,
      attachmentSize,
      audience = 'ALL',
      isPublished = true
    } = body;

    // Validasi input
    if (!judul || !judul.trim()) {
      return NextResponse.json(
        { error: 'Judul pengumuman tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (!isi || !isi.trim()) {
      return NextResponse.json(
        { error: 'Isi pengumuman tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Validasi userId
    if (!session.user.id) {
      console.error('CREATE PENGUMUMAN - No user ID in session');
      return NextResponse.json(
        { error: 'User ID tidak ditemukan dalam session' },
        { status: 400 }
      );
    }

    console.log('CREATE PENGUMUMAN - Session user:', {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name
    });

    console.log('CREATE PENGUMUMAN - Creating pengumuman:', {
      userId: session.user.id,
      judul: judul.trim(),
      isiLength: isi.trim().length
    });

    // Buat pengumuman
    const pengumuman = await prisma.pengumuman.create({
      data: {
        userId: session.user.id,
        judul: judul.trim(),
        isi: isi.trim(),
        tanggalMulai: new Date(),
        tanggalSelesai: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
        isPinned: false,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentSize: attachmentSize ? parseInt(attachmentSize) : null,
        audience: audience || 'ALL',
        isPublished: isPublished ?? true,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Kirim Push Notification ke semua role terkait (Orang Tua, Guru, Siswa)
    try {
      const { broadcastAnnouncement } = await import('@/lib/push');
      await broadcastAnnouncement(judul.trim(), pengumuman.id);
      console.log('PUSH NOTIFICATION - Broadcasted to all roles');
    } catch (pushError) {
      console.error('PUSH NOTIFICATION - Broadcast Failed:', pushError);
    }

    console.log('CREATE PENGUMUMAN - Success:', {
      id: pengumuman.id,
      judul: pengumuman.judul
    });

    // Log aktivitas
    try {
      await prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
          action: 'CREATE',
          title: 'Buat Pengumuman',
          description: `Membuat pengumuman: ${judul}`,
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
            device: request.headers.get('user-agent') || 'Unknown'
          }
        }
      });
    } catch (logError) {
      console.warn('Warning: Gagal log aktivitas:', logError);
      // Jangan return error jika log activity gagal
    }

    // Invalidate cache
    invalidateCacheByPrefix('admin-pengumuman');
    
    // Revalidate dashboard pages untuk refresh widget pengumuman
    revalidatePath('/admin/dashboard');
    revalidatePath('/guru/dashboard');
    revalidatePath('/siswa/dashboard');
    revalidatePath('/orangtua/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dibuat',
      pengumuman
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pengumuman:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Berikan error message yang lebih detail
    let errorMessage = 'Gagal membuat pengumuman';
    let statusCode = 500;

    if (error.code === 'P2002') {
      errorMessage = 'Pengumuman dengan judul ini sudah ada';
      statusCode = 400;
    } else if (error.code === 'P2003') {
      // Foreign key constraint violation
      errorMessage = 'User tidak ditemukan di database. Silakan logout dan login kembali.';
      statusCode = 400;
      console.error('P2003 Foreign key constraint - userId tidak valid:', error.meta);
    } else if (error.code === 'P2025') {
      errorMessage = 'User tidak ditemukan';
      statusCode = 404;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: statusCode }
    );
  }
}

// PUT - Update pengumuman (ADMIN only)
export async function PUT(request) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengumuman harus diisi' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      judul,
      isi,
      tanggalBerlaku,
      kategori = 'UMUM',
      attachmentUrl,
      attachmentName,
      attachmentSize,
      audience,
      isPublished
    } = body;

    // Validasi input
    if (!judul || !judul.trim()) {
      return NextResponse.json(
        { error: 'Judul pengumuman tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (!isi || !isi.trim()) {
      return NextResponse.json(
        { error: 'Isi pengumuman tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Update pengumuman
    const pengumuman = await prisma.pengumuman.update({
      where: { id },
      data: {
        judul: judul.trim(),
        isi: isi.trim(),
        tanggalSelesai: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentSize: attachmentSize ? parseInt(attachmentSize) : null,
        audience: audience !== undefined ? audience : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Invalidate cache
    invalidateCacheByPrefix('admin-pengumuman');
    
    // Revalidate dashboard pages untuk refresh widget pengumuman
    revalidatePath('/admin/dashboard');
    revalidatePath('/guru/dashboard');
    revalidatePath('/siswa/dashboard');
    revalidatePath('/orangtua/dashboard');

    // Log aktivitas
    try {
      await prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
          action: 'UPDATE',
          title: 'Update Pengumuman',
          description: `Mengupdate pengumuman: ${judul}`,
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
            device: request.headers.get('user-agent') || 'Unknown'
          }
        }
      });
    } catch (logError) {
      console.warn('Warning: Gagal log aktivitas:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil diupdate',
      pengumuman
    });
  } catch (error) {
    console.error('Error updating pengumuman:', error);
    
    let errorMessage = 'Gagal mengupdate pengumuman';
    
    if (error.code === 'P2025') {
      errorMessage = 'Pengumuman tidak ditemukan';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus pengumuman (ADMIN only)
export async function DELETE(request) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengumuman harus diisi' },
        { status: 400 }
      );
    }

    // Implement soft delete as requested by deletedAt rule
    const pengumuman = await prisma.pengumuman.updateMany({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    if (pengumuman.count === 0) {
      console.log(`[API ADMIN PENGUMUMAN] ID ${id} not found or already deleted`);
    }

    // Invalidate cache
    invalidateCacheByPrefix('admin-pengumuman');
    
    // Revalidate dashboard pages untuk refresh widget pengumuman
    revalidatePath('/admin/dashboard');
    revalidatePath('/guru/dashboard');
    revalidatePath('/siswa/dashboard');
    revalidatePath('/orangtua/dashboard');

    // Log aktivitas
    try {
      await prisma.activityLog.create({
        data: {
          actorId: session.user.id,
          actorRole: session.user.role,
          actorName: session.user.name,
          action: 'DELETE',
          title: 'Hapus Pengumuman',
          description: `Menghapus pengumuman ID: ${id}`,
          metadata: {
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
            device: request.headers.get('user-agent') || 'Unknown'
          }
        }
      });
    } catch (logError) {
      console.warn('Warning: Gagal log aktivitas:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengumuman' },
      { status: 500 }
    );
  }
}
