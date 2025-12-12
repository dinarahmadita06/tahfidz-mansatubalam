import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil daftar pengumuman
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pengumuman = await prisma.pengumuman.findMany({
      include: {
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
    });

    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman' },
      { status: 500 }
    );
  }
}

// POST - Membuat pengumuman baru
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      judul,
      isi,
      tanggalBerlaku,
      kategori = 'UMUM'
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
      return NextResponse.json(
        { error: 'User ID tidak ditemukan dalam session' },
        { status: 400 }
      );
    }

    // Buat pengumuman
    const pengumuman = await prisma.pengumuman.create({
      data: {
        userId: session.user.id,
        judul: judul.trim(),
        isi: isi.trim(),
        kategori,
        tanggalMulai: new Date(),
        tanggalSelesai: tanggalBerlaku ? new Date(tanggalBerlaku) : null,
        isPinned: false
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

    // Log aktivitas
    try {
      await prisma.logActivity.create({
        data: {
          userId: session.user.id,
          role: session.user.role,
          aktivitas: 'CREATE',
          modul: 'PENGUMUMAN',
          deskripsi: `Membuat pengumuman: ${judul}`,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
          device: request.headers.get('user-agent') || 'Unknown'
        }
      });
    } catch (logError) {
      console.warn('Warning: Gagal log aktivitas:', logError);
      // Jangan return error jika log activity gagal
    }

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dibuat',
      pengumuman
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating pengumuman:', error);
    
    // Berikan error message yang lebih detail
    let errorMessage = 'Gagal membuat pengumuman';
    
    if (error.code === 'P2002') {
      errorMessage = 'Pengumuman dengan judul ini sudah ada';
    } else if (error.code === 'P2025') {
      errorMessage = 'User tidak ditemukan';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update pengumuman
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      kategori = 'UMUM'
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
        kategori,
        tanggalSelesai: tanggalBerlaku ? new Date(tanggalBerlaku) : null
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

    // Log aktivitas
    try {
      await prisma.logActivity.create({
        data: {
          userId: session.user.id,
          role: session.user.role,
          aktivitas: 'UPDATE',
          modul: 'PENGUMUMAN',
          deskripsi: `Mengupdate pengumuman: ${judul}`,
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
          device: request.headers.get('user-agent') || 'Unknown'
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

// DELETE - Menghapus pengumuman
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengumuman harus diisi' },
        { status: 400 }
      );
    }

    await prisma.pengumuman.delete({
      where: { id }
    });

    // Log aktivitas
    await prisma.logActivity.create({
      data: {
        userId: session.user.id,
        role: session.user.role,
        aktivitas: 'DELETE',
        modul: 'PENGUMUMAN',
        deskripsi: `Menghapus pengumuman ID: ${id}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        device: request.headers.get('user-agent') || 'Unknown'
      }
    });

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
