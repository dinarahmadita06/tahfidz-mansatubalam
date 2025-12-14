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

      // 3. Add guru utama if provided (non-null, non-empty)
      if (guruUtamaId && guruUtamaId.trim()) {
        await tx.guruKelas.create({
          data: {
            kelasId: id,
            guruId: guruUtamaId, // Keep as string - it's a CUID
            peran: 'utama',
            isActive: true,
          },
        });
      }

      // 4. Add guru pendamping if provided (filter out empty values)
      if (guruPendampingIds && Array.isArray(guruPendampingIds) && guruPendampingIds.length > 0) {
        const validGuruIds = guruPendampingIds.filter(id => id && id.trim());
        if (validGuruIds.length > 0) {
          const guruPendampingData = validGuruIds.map((guruId) => ({
            kelasId: id,
            guruId: guruId, // Keep as string - it's a CUID
            peran: 'pendamping',
            isActive: true,
          }));

          await tx.guruKelas.createMany({
            data: guruPendampingData,
          });
        }
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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
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

    // Validate ID exists
    console.log('DELETE KELAS - Received ID:', id);

    if (!id || id === 'undefined' || id === 'null') {
      console.error('DELETE KELAS - Invalid ID:', id);
      return NextResponse.json(
        { error: 'ID kelas tidak valid' },
        { status: 400 }
      );
    }

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        siswa: true,
        guruKelas: true,
        _count: {
          select: {
            siswa: true,
            guruKelas: true,
            targetHafalan: true,
            agenda: true
          }
        }
      }
    });

    console.log('DELETE KELAS - Found kelas:', kelas ? {
      id: kelas.id,
      nama: kelas.nama,
      siswaCount: kelas._count.siswa,
      guruKelasCount: kelas._count.guruKelas,
      targetHafalanCount: kelas._count.targetHafalan,
      agendaCount: kelas._count.agenda
    } : null);

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if kelas has students
    if (kelas.siswa && kelas.siswa.length > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus kelas yang masih memiliki ${kelas.siswa.length} siswa. Silakan pindahkan siswa ke kelas lain terlebih dahulu.`
        },
        { status: 400 }
      );
    }

    // Check if kelas has target hafalan records
    if (kelas._count.targetHafalan > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus kelas yang memiliki ${kelas._count.targetHafalan} target hafalan. Silakan hapus target hafalan terlebih dahulu.`
        },
        { status: 400 }
      );
    }

    // Check if kelas has agenda records
    if (kelas._count.agenda > 0) {
      return NextResponse.json(
        {
          error: `Tidak dapat menghapus kelas yang memiliki ${kelas._count.agenda} agenda. Silakan hapus agenda terlebih dahulu.`
        },
        { status: 400 }
      );
    }

    // Store data for logging
    const kelasNama = kelas.nama;

    console.log('DELETE KELAS - Proceeding to delete kelas:', id);

    // Delete in transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Delete guruKelas first (if cascade is not set)
      if (kelas.guruKelas && kelas.guruKelas.length > 0) {
        await tx.guruKelas.deleteMany({
          where: { kelasId: id }
        });
        console.log('DELETE KELAS - Deleted guruKelas relations');
      }

      // Delete kelas
      await tx.kelas.delete({
        where: { id }
      });
      console.log('DELETE KELAS - Deleted kelas successfully');
    });

    // Log activity
    try {
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
    } catch (logError) {
      console.error('Error logging delete activity:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      message: 'Kelas berhasil dihapus',
      deletedKelasNama: kelasNama
    });
  } catch (error) {
    console.error('Error deleting kelas:', error);
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

    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas karena masih terhubung dengan data lain (siswa, hafalan, atau relasi lainnya)' },
        { status: 400 }
      );
    }

    if (error.code === 'P2014') {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus kelas karena melanggar constraint relasi database' },
        { status: 400 }
      );
    }

    // Generic error with more details
    return NextResponse.json(
      {
        error: 'Gagal menghapus kelas',
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// PATCH - Toggle kelas status (Aktif/Nonaktif)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Parameter isActive harus boolean' },
        { status: 400 }
      );
    }

    // Check if kelas exists
    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        guruKelas: true
      }
    });

    if (!kelas) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update all guruKelas isActive status
    await prisma.guruKelas.updateMany({
      where: { kelasId: id },
      data: { isActive }
    });

    // Fetch updated kelas data
    const updatedKelas = await prisma.kelas.findUnique({
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

    // Log activity
    try {
      await logActivity({
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'UPDATE',
        module: 'KELAS',
        description: `Mengubah status kelas ${kelas.nama} menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`,
        ipAddress: getIpAddress(request),
        userAgent: getUserAgent(request),
        metadata: {
          kelasId: kelas.id,
          newStatus: isActive ? 'ACTIVE' : 'INACTIVE'
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't throw, just log the error
    }

    return NextResponse.json(updatedKelas);
  } catch (error) {
    console.error('Error toggling kelas status:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah status kelas', details: error.message },
      { status: 500 }
    );
  }
}
