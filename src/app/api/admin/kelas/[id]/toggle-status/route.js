import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// PATCH - Toggle status kelas (AKTIF <-> NONAKTIF)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate ID exists
    console.log('TOGGLE STATUS KELAS - Received ID:', id);

    if (!id || id === 'undefined' || id === 'null') {
      console.error('TOGGLE STATUS KELAS - Invalid ID:', id);
      return NextResponse.json(
        { error: 'ID kelas tidak valid' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    console.log('TOGGLE STATUS KELAS - Request body:', { status });

    // Validate status value
    if (!status || (status !== 'AKTIF' && status !== 'NONAKTIF')) {
      return NextResponse.json(
        { error: 'Status harus AKTIF atau NONAKTIF' },
        { status: 400 }
      );
    }

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            siswa: true
          }
        }
      }
    });

    console.log('TOGGLE STATUS KELAS - Found kelas:', kelas ? {
      id: kelas.id,
      nama: kelas.nama,
      currentStatus: kelas.status,
      siswaCount: kelas._count.siswa
    } : null);

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('TOGGLE STATUS KELAS - Updating status to:', status);

    // Update kelas status
    const updatedKelas = await prisma.kelas.update({
      where: { id },
      data: {
        status: status
      },
      include: {
        tahunAjaran: {
          select: {
            nama: true,
            semester: true
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      }
    });

    console.log('TOGGLE STATUS KELAS - Success:', {
      id: updatedKelas.id,
      nama: updatedKelas.nama,
      newStatus: updatedKelas.status
    });

    // Log activity
    try {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'KELAS',
        description: `Mengubah status kelas ${updatedKelas.nama} menjadi ${status}`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
        metadata: {
          kelasId: updatedKelas.id,
          oldStatus: kelas.status,
          newStatus: status
        }
      });
    } catch (logError) {
      console.error('Error logging toggle status activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: `Status kelas berhasil diubah menjadi ${status}`,
      kelas: updatedKelas
    });
  } catch (error) {
    console.error('Error toggling kelas status:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });

    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan atau sudah dihapus' },
        { status: 404 }
      );
    }

    // Generic error with more details
    return NextResponse.json(
      {
        error: 'Gagal mengubah status kelas',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
