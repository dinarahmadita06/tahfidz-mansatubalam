export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get specific tasmi by ID
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get tasmi
    const tasmi = await prisma.tasmi.findFirst({
      where: {
        id,
        siswaId: siswa.id, // Ensure siswa can only access their own tasmi
      },
      include: {
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        siswa: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
      },
    });

    if (!tasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tasmi });
  } catch (error) {
    console.error('Error fetching tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update tasmi (siswa dapat edit jika masih MENUNGGU atau DITOLAK)
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { jumlahHafalan, juzYangDitasmi, guruId, jamTasmi, tanggalTasmi, catatan } = body;

    // Validation
    if (!jumlahHafalan || !juzYangDitasmi || !jamTasmi || !tanggalTasmi || !guruId) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi (jumlah hafalan, juz yang ditasmi, jam, tanggal, dan guru)' },
        { status: 400 }
      );
    }

    if (jumlahHafalan < 2) {
      return NextResponse.json(
        { message: 'Minimal hafalan 2 juz untuk mendaftar Tasmi\'' },
        { status: 400 }
      );
    }

    if (jumlahHafalan > 30) {
      return NextResponse.json(
        { message: 'Jumlah hafalan maksimal 30 juz' },
        { status: 400 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: {
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get existing tasmi
    const existingTasmi = await prisma.tasmi.findFirst({
      where: {
        id,
        siswaId: siswa.id,
      },
    });

    if (!existingTasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hanya bisa edit jika status MENUNGGU atau DITOLAK
    if (existingTasmi.statusPendaftaran !== 'MENUNGGU' && existingTasmi.statusPendaftaran !== 'DITOLAK') {
      return NextResponse.json(
        { message: 'Tidak dapat mengedit tasmi yang sudah disetujui atau selesai' },
        { status: 400 }
      );
    }

    // Verify that the selected guru exists
    const guruExists = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!guruExists) {
      return NextResponse.json(
        { message: 'Guru yang dipilih tidak valid' },
        { status: 400 }
      );
    }

    // Update tasmi
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        jumlahHafalan: parseInt(jumlahHafalan),
        juzYangDitasmi,
        jamTasmi,
        tanggalTasmi: new Date(tanggalTasmi),
        guruPengampu: { connect: { id: guruId } },
        catatan,
        statusPendaftaran: 'MENUNGGU', // Reset status ke MENUNGGU saat diedit
        catatanPenolakan: null, // Clear catatan penolakan
      },
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Pendaftaran Tasmi\' berhasil diupdate', tasmi: updatedTasmi },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete tasmi (siswa dapat hapus jika masih MENUNGGU atau DITOLAK)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get existing tasmi
    const existingTasmi = await prisma.tasmi.findFirst({
      where: {
        id,
        siswaId: siswa.id,
      },
    });

    if (!existingTasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hanya bisa hapus jika status MENUNGGU atau DITOLAK
    if (existingTasmi.statusPendaftaran !== 'MENUNGGU' && existingTasmi.statusPendaftaran !== 'DITOLAK') {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus tasmi yang sudah disetujui atau selesai' },
        { status: 400 }
      );
    }

    // Delete tasmi
    await prisma.tasmi.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Pendaftaran Tasmi\' berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Cancel registration (set status to DIBATALKAN)
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get existing tasmi
    const existingTasmi = await prisma.tasmi.findFirst({
      where: {
        id,
        siswaId: siswa.id,
      },
    });

    if (!existingTasmi) {
      return NextResponse.json(
        { message: 'Data tasmi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hanya bisa batalkan jika status MENUNGGU
    if (existingTasmi.statusPendaftaran !== 'MENUNGGU') {
      return NextResponse.json(
        { message: 'Pendaftaran tidak dapat dibatalkan (sudah diproses/selesai)' },
        { status: 400 }
      );
    }

    // Update status to DIBATALKAN
    const updatedTasmi = await prisma.tasmi.update({
      where: { id },
      data: {
        statusPendaftaran: 'DIBATALKAN',
      },
    });

    return NextResponse.json({
      message: 'Pendaftaran Tasmi\' berhasil dibatalkan',
      tasmi: updatedTasmi,
    });
  } catch (error) {
    console.error('Error canceling tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
