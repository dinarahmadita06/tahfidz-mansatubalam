import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * PATCH /api/admin/siswa/[id]/kelas
 * Assign kelas to a student
 */
export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: siswaId } = params;
    const body = await request.json();
    const { kelasId } = body;

    // Validation
    if (!kelasId) {
      return NextResponse.json(
        { success: false, error: 'Kelas harus dipilih' },
        { status: 400 }
      );
    }

    // Check if student exists
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: true,
        kelas: true
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { success: false, error: 'Siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if kelas exists and is active
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        tahunAjaran: true
      }
    });

    if (!kelas) {
      return NextResponse.json(
        { success: false, error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    if (kelas.status !== 'AKTIF') {
      return NextResponse.json(
        { success: false, error: 'Kelas tidak aktif. Pilih kelas yang aktif.' },
        { status: 400 }
      );
    }

    // Update siswa with kelas
    const updatedSiswa = await prisma.siswa.update({
      where: { id: siswaId },
      data: {
        kelas: {
          connect: { id: kelasId }
        }
      },
      include: {
        user: true,
        kelas: {
          include: {
            tahunAjaran: true
          }
        }
      }
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        actorId: session.user.id,
        actorRole: 'ADMIN',
        action: 'ASSIGN_KELAS',
        title: 'Assign Siswa ke Kelas',
        description: `Admin ${session.user.name} memasukkan siswa ${siswa.user.name} ke kelas ${kelas.nama}`,
        metadata: {
          siswaId,
          kelasId,
          kelasNama: kelas.nama,
          previousKelas: siswa.kelas?.nama || null
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Siswa ${siswa.user.name} berhasil dimasukkan ke ${kelas.nama}`,
      data: updatedSiswa
    });

  } catch (error) {
    console.error('Error assigning kelas to siswa:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
