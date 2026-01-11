import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, semester, tanggalMulai, tanggalSelesai, isActive } = body;

    // Validate required fields
    if (!nama || !semester || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // If setting this as active, deactivate other active tahun ajaran
    if (isActive) {
      await prisma.tahunAjaran.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    // Create tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.create({
      data: {
        nama,
        semester,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: new Date(tanggalSelesai),
        isActive: isActive || false
      },
      include: {
        _count: {
          select: {
            kelas: true
          }
        }
      }
    });

    // Invalidate cache
    invalidateCache('admin-tahun-ajaran-list');
    invalidateCache('admin-tahun-ajaran-summary');

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'TAHUN_AJARAN',
      description: `Menambahkan tahun ajaran baru ${tahunAjaran.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        tahunAjaranId: tahunAjaran.id,
        isActive: tahunAjaran.isActive
      }
    });

    return NextResponse.json(tahunAjaran);
  } catch (error) {
    console.error('Error creating tahun ajaran:', error);
    return NextResponse.json(
      { error: 'Gagal membuat tahun ajaran' },
      { status: 500 }
    );
  }
}
