export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache } from '@/lib/cache';

// Default handler untuk method yang tidak didukung
export async function GET(request, { params }) {
  return NextResponse.json({ error: 'Method GET not allowed for this endpoint' }, { status: 405 });
}

// PUT - Update kelas
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nama, tahunAjaranId, targetJuz, kapasitas, guruUtamaId, forceUpdate } = body;

    // Validate required fields
    if (!nama || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Nama kelas dan tahun ajaran harus diisi.' },
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

    // Validasi: Cek apakah guru utama sudah menjadi guru di kelas lain
    if (guruUtamaId && guruUtamaId.trim() && !forceUpdate) {
      const existingGuruKelas = await prisma.guruKelas.findFirst({
        where: {
          guruId: guruUtamaId,
          kelasId: {
            not: id // Exclude kelas yang sedang diedit
          }
        },
        include: {
          kelas: {
            select: {
              id: true,
              nama: true
            }
          },
          guru: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (existingGuruKelas) {
        // Guru sudah memiliki kelas lain, minta konfirmasi
        return NextResponse.json({
          requiresConfirmation: true,
          guruName: existingGuruKelas.guru.user.name,
          existingKelas: existingGuruKelas.kelas.nama,
          newKelas: nama,
          message: `${existingGuruKelas.guru.user.name} saat ini menjadi Guru Tahfidz di kelas ${existingGuruKelas.kelas.nama}. Apakah Anda yakin ingin menambahkannya ke kelas ${nama}?`
        }, { status: 409 });
      }
    }

    // Update kelas dengan guru menggunakan transaction
    const updatedKelas = await prisma.$transaction(async (tx) => {
      // Get guru utama userId for Kelas.guruTahfidzId
      let guruTahfidzUserId = null;
      if (guruUtamaId && guruUtamaId.trim()) {
        const guru = await tx.guru.findUnique({
          where: { id: guruUtamaId },
          select: { userId: true }
        });
        if (guru) {
          guruTahfidzUserId = guru.userId;
        }
      }

      // 1. Update kelas data
      const updated = await tx.kelas.update({
        where: { id },
        data: {
          nama,
          tahunAjaranId: tahunAjaranId, // Keep as string - it's a CUID
          targetJuz: targetJuz ? parseInt(targetJuz) : null,
          kapasitas: kapasitas ? parseInt(kapasitas) : null,
          guruTahfidzId: guruTahfidzUserId,
        }
      });

      // 2. Remove all existing guru assignments
      await tx.guruKelas.deleteMany({
        where: { kelasId: id }
      });

      // 3. Add guru pembina if provided and valid
      if (guruUtamaId && guruUtamaId.trim() !== '') {
        // Verify guru exists before creating relation
        const guruExists = await tx.guru.findUnique({
          where: { id: guruUtamaId }
        });

        if (guruExists) {
          await tx.guruKelas.create({
            data: {
              kelasId: id,
              guruId: guruUtamaId, // Keep as string - it's a CUID
              peran: 'utama',
              isActive: true,
            },
          });
        } else {
          console.warn(`Guru with ID ${guruUtamaId} not found, skipping assignment`);
        }
      }

      // 4. Removed guru pendamping handling as requested
      
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
          guruPembinaId: guruUtamaId,
        }
      });
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't throw, just log the error
    }

    // Invalidate guru cache karena kelas binaan berubah
    invalidateCache('guru-list');

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

    // Check if kelas is still active
    if (kelas.status === 'AKTIF') {
      return NextResponse.json(
        {
          error: 'Kelas aktif tidak dapat dihapus. Silakan nonaktifkan kelas terlebih dahulu.',
          code: 'ACTIVE_CLASS_DELETE_FORBIDDEN'
        },
        { status: 403 }
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

    // Invalidate guru cache karena kelas binaan berubah
    invalidateCache('guru-list');

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
    
    // Parse request body with error handling
    let body = {};
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      );
    }
    
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

    return NextResponse.json({
      message: 'Status kelas berhasil diubah',
      success: true,
      data: updatedKelas
    });
  } catch (error) {
    console.error('Error toggling kelas status:', error);
    return NextResponse.json(
      { error: 'Gagal mengubah status kelas', details: error.message },
      { status: 500 }
    );
  }
}
