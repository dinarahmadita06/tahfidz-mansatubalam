import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// PUT - Update kelas
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, tahunAjaranId, targetJuz, kapasitas, guruUtamaId, guruPendampingIds } = body;

    // Validate required fields
    if (!nama || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id }
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update kelas dengan guru menggunakan transaction
    const updatedKelas = await prisma.$transaction(async (tx) => {
      // 1. Update kelas data
      const updated = await tx.kelas.update({
        where: { id },
        data: {
          nama,
          tahunAjaranId: tahunAjaranId, // Keep as string - it's a CUID
          targetJuz: targetJuz ? parseInt(targetJuz) : null,
          kapasitas: kapasitas ? parseInt(kapasitas) : null,
        }
      });

      // 2. Remove all existing guru assignments
      await tx.guruKelas.deleteMany({
        where: { kelasId: id }
      });

      // 3. Add guru utama if provided
      if (guruUtamaId) {
        await tx.guruKelas.create({
          data: {
            kelasId: id,
            guruId: guruUtamaId, // Keep as string - it's a CUID
            peran: 'utama',
            isActive: true,
          },
        });
      }

      // 4. Add guru pendamping if provided
      if (guruPendampingIds && Array.isArray(guruPendampingIds) && guruPendampingIds.length > 0) {
        const guruPendampingData = guruPendampingIds.map((guruId) => ({
          kelasId: id,
          guruId: guruId, // Keep as string - it's a CUID
          peran: 'pendamping',
          isActive: true,
        }));

        await tx.guruKelas.createMany({
          data: guruPendampingData,
        });
      }

      // 5. Fetch complete kelas data
      const kelasWithRelations = await tx.kelas.findUnique({
        where: { id },
        include: {
          tahunAjaran: {
            select: {
              nama: true,
              semester: true
            }
          },
          guruKelas: {
            include: {
              guru: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              siswa: true
            }
          }
        }
      });

      return kelasWithRelations;
    });

    // Log activity
    try {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'KELAS',
        description: `Mengupdate data kelas ${updatedKelas.nama}`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
        metadata: {
          kelasId: updatedKelas.id,
          guruUtamaId: guruUtamaId || null,
          guruPendampingCount: guruPendampingIds?.length || 0
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't throw, just log the error
    }

    return NextResponse.json(updatedKelas);
  } catch (error) {
    console.error('Error updating kelas:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate kelas', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete kelas
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        siswa: true,
        guruKelas: true,
        hafalan: true
      }
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if kelas has students
    if (kelas.siswa.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas yang memiliki siswa' },
        { status: 400 }
      );
    }

    // Check if kelas has hafalan records
    if (kelas.hafalan.length > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas yang memiliki data hafalan' },
        { status: 400 }
      );
    }

    // Store data for logging
    const kelasNama = kelas.nama;

    // Delete kelas (will also delete guruKelas records due to cascade)
    await prisma.kelas.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'KELAS',
      description: `Menghapus kelas ${kelasNama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedKelasId: id,
        deletedKelasNama: kelasNama
      }
    });

    return NextResponse.json({ message: 'Kelas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kelas:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kelas' },
      { status: 500 }
    );
  }
}
