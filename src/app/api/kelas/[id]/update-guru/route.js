export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { guruId, isActive, peran } = await request.json();

    if (!guruId) {
      return NextResponse.json({ error: 'guruId required' }, { status: 400 });
    }

    // Cari guru kelas
    const guruKelas = await prisma.guruKelas.findUnique({
      where: {
        guruId_kelasId: {
          guruId,
          kelasId: id
        }
      }
    });

    if (!guruKelas) {
      return NextResponse.json({ error: 'Guru tidak ditemukan di kelas ini' }, { status: 404 });
    }

    const updateData = {};

    // Update status aktif
    if (isActive !== undefined) {
      updateData.isActive = isActive;

      // Jika dinonaktifkan, set tanggal selesai
      if (!isActive) {
        updateData.tanggalSelesai = new Date();
      } else {
        // Jika diaktifkan kembali, reset tanggal selesai
        updateData.tanggalSelesai = null;

        // Jika peran utama, nonaktifkan guru utama lain
        if (guruKelas.peran === 'utama') {
          await prisma.guruKelas.updateMany({
            where: {
              kelasId: id,
              peran: 'utama',
              isActive: true,
              guruId: { not: guruId }
            },
            data: {
              isActive: false,
              tanggalSelesai: new Date()
            }
          });
        }
      }
    }

    // Update peran
    if (peran && ['utama', 'pengganti'].includes(peran)) {
      updateData.peran = peran;

      // Jika diubah jadi utama dan aktif, nonaktifkan guru utama lain
      if (peran === 'utama' && guruKelas.isActive) {
        await prisma.guruKelas.updateMany({
          where: {
            kelasId: id,
            peran: 'utama',
            isActive: true,
            guruId: { not: guruId }
          },
          data: {
            isActive: false,
            tanggalSelesai: new Date()
          }
        });
      }
    }

    const updatedGuruKelas = await prisma.guruKelas.update({
      where: {
        guruId_kelasId: {
          guruId,
          kelasId: id
        }
      },
      data: updateData,
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true
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

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE_GURU',
      module: 'KELAS',
      description: `Mengupdate status guru ${updatedGuruKelas.guru.user.name} di kelas ${updatedGuruKelas.kelas.nama} (Peran: ${updatedGuruKelas.peran}, Status: ${updatedGuruKelas.isActive ? 'Aktif' : 'Nonaktif'})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: id,
        guruId: guruId,
        updatedFields: Object.keys(updateData)
      }
    });

    return NextResponse.json(updatedGuruKelas);
  } catch (error) {
    console.error('Error updating guru kelas:', error);
    return NextResponse.json(
      { error: 'Failed to update guru kelas' },
      { status: 500 }
    );
  }
}
