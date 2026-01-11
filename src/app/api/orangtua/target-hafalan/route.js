export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Ambil daftar anak dari orang tua
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari data orang tua
    const orangTua = await prisma.orangTua.findUnique({
      where: { userId: session.user.id },
      include: {
        siswa: {
          where: {
            status: 'approved'
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            kelas: {
              include: {
                tahunAjaran: true
              }
            }
          }
        }
      }
    });

    if (!orangTua) {
      return NextResponse.json(
        { success: false, message: 'Data orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    // Format data anak
    const anakList = orangTua.siswa.map(siswa => ({
      id: siswa.id,
      nama: siswa.user.name,
      email: siswa.user.email,
      nis: siswa.nis,
      kelas: siswa.kelas.nama,
      tahunAjaran: siswa.kelas.tahunAjaran.nama
    }));

    return NextResponse.json({
      success: true,
      data: {
        anakList
      }
    });

  } catch (error) {
    console.error('Error fetching anak list:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data anak' },
      { status: 500 }
    );
  }
}
