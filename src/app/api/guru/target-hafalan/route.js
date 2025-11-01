import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Ambil data target hafalan kelas yang diampu guru
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari data guru
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { success: false, message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Ambil kelas yang diampu guru (yang aktif)
    const guruKelas = await prisma.guruKelas.findFirst({
      where: {
        guruId: guru.id,
        isActive: true
      },
      include: {
        kelas: {
          include: {
            tahunAjaran: true
          }
        }
      },
      orderBy: {
        tanggalMulai: 'desc'
      }
    });

    if (!guruKelas) {
      return NextResponse.json({
        success: true,
        data: {
          kelas: null,
          siswaList: [],
          statistics: {
            targetSekolah: 0,
            targetKelas: 0,
            rataRataProgres: 0
          }
        }
      });
    }

    const kelas = guruKelas.kelas;

    // Ambil daftar siswa di kelas tersebut
    const siswaList = await prisma.siswa.findMany({
      where: {
        kelasId: kelas.id,
        status: 'approved'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        hafalan: {
          select: {
            juz: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    // Hitung capaian setiap siswa
    const siswaWithProgress = siswaList.map(siswa => {
      // Hitung total juz yang sudah dihafal (distinct juz)
      const uniqueJuz = [...new Set(siswa.hafalan.map(h => h.juz))];
      const capaianJuz = uniqueJuz.length;

      return {
        id: siswa.id,
        nama: siswa.user.name,
        email: siswa.user.email,
        nis: siswa.nis,
        target: kelas.targetJuz || 2,
        capaian: capaianJuz
      };
    });

    // Hitung statistik
    const targetSekolah = kelas.targetJuz || 2;
    const targetKelas = kelas.targetJuz || 2;

    const totalProgress = siswaWithProgress.reduce((sum, siswa) => {
      return sum + (siswa.target > 0 ? (siswa.capaian / siswa.target) * 100 : 0);
    }, 0);

    const rataRataProgres = siswaWithProgress.length > 0
      ? Math.round(totalProgress / siswaWithProgress.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        kelas: {
          id: kelas.id,
          nama: kelas.nama,
          tahunAjaran: {
            nama: kelas.tahunAjaran.nama
          }
        },
        siswaList: siswaWithProgress,
        statistics: {
          targetSekolah,
          targetKelas,
          rataRataProgres
        }
      }
    });

  } catch (error) {
    console.error('Error fetching target hafalan guru:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data target hafalan' },
      { status: 500 }
    );
  }
}
