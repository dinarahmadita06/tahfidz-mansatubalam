export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // 'active', 'inactive', or null for all

    let whereClause = {
      kelasId: id
    };

    if (statusFilter === 'active') {
      whereClause.isActive = true;
    } else if (statusFilter === 'inactive') {
      whereClause.isActive = false;
    }

    const guruKelas = await prisma.guruKelas.findMany({
      where: whereClause,
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: [
        { peran: 'asc' }, // utama dulu
        { isActive: 'desc' }, // aktif dulu
        { tanggalMulai: 'desc' }
      ]
    });

    return NextResponse.json(guruKelas);
  } catch (error) {
    console.error('Error fetching guru kelas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guru kelas' },
      { status: 500 }
    );
  }
}

// DELETE endpoint untuk menghapus guru dari kelas
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const guruId = searchParams.get('guruId');

    if (!guruId) {
      return NextResponse.json({ error: 'guruId required' }, { status: 400 });
    }

    // Get guru kelas data before deletion
    const guruKelas = await prisma.guruKelas.findUnique({
      where: {
        guruId_kelasId: {
          guruId,
          kelasId: id
        }
      },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      }
    });

    if (!guruKelas) {
      return NextResponse.json({ error: 'Guru tidak ditemukan di kelas ini' }, { status: 404 });
    }

    // Store data for logging
    const guruName = guruKelas.guru.user.name;
    const kelasName = guruKelas.kelas.nama;
    const peran = guruKelas.peran;

    await prisma.guruKelas.delete({
      where: {
        guruId_kelasId: {
          guruId,
          kelasId: id
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'REMOVE_GURU',
      module: 'KELAS',
      description: `Menghapus guru ${guruName} (${peran}) dari kelas ${kelasName}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: id,
        guruId: guruId,
        peran: peran
      }
    });

    return NextResponse.json({ message: 'Guru berhasil dihapus dari kelas' });
  } catch (error) {
    console.error('Error deleting guru from kelas:', error);
    return NextResponse.json(
      { error: 'Failed to delete guru from kelas' },
      { status: 500 }
    );
  }
}
