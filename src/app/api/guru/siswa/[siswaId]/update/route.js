export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siswaId } = await params;
    const body = await request.json();
    const { name, nis, nisn, tanggalLahir, jenisKelamin, namaWali } = body;

    // Verify this siswa is in guru's class
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        kelas: {
          guruKelas: {
            some: {
              guru: { userId: session.user.id },
              isActive: true,
            },
          },
        },
      },
      include: {
        user: true,
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan atau bukan siswa Anda' }, { status: 404 });
    }

    // Only allow editing if status is rejected
    if (siswa.status !== 'rejected') {
      return NextResponse.json({ error: 'Hanya siswa yang ditolak yang dapat diedit' }, { status: 400 });
    }

    // Update siswa data and change status back to pending
    await prisma.$transaction(async (tx) => {
      // Update User data (name only)
      await tx.user.update({
        where: { id: siswa.userId },
        data: {
          name,
        },
      });

      // Update Siswa data
      await tx.siswa.update({
        where: { id: siswaId },
        data: {
          nis,
          nisn,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          jenisKelamin,
          status: 'pending', // Change status back to pending for re-validation
          rejectionReason: null, // Clear rejection reason
        },
      });

      // Update Wali/Orang Tua data if exists
      if (siswa.orangTuaSiswa?.[0]?.orangTua) {
        const waliUserId = siswa.orangTuaSiswa[0].orangTua.user.id;
        
        // Update wali user data (name only)
        await tx.user.update({
          where: { id: waliUserId },
          data: {
            name: namaWali || siswa.orangTuaSiswa[0].orangTua.user.name,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Data siswa berhasil diperbarui dan menunggu validasi ulang',
    });
  } catch (error) {
    console.error('Error updating siswa:', error);
    return NextResponse.json({ error: 'Gagal memperbarui data siswa' }, { status: 500 });
  }
}
