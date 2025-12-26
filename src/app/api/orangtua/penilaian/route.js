import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');

    // Validasi: pastikan user adalah orang tua
    if (session.user.role !== 'ORANGTUA' && session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Jika siswaId tidak diberikan, ambil semua anak dari orang tua ini
    if (!siswaId) {
      const children = await prisma.siswa.findMany({
        where: {
          orangTuaId: session.user.id,
        },
        select: {
          id: true,
          namaLengkap: true,
          kelas: {
            select: {
              namaKelas: true,
            },
          },
        },
      });

      return NextResponse.json({ children });
    }

    // Validasi: pastikan siswa adalah anak dari orang tua ini
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTuaId: session.user.id,
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 404 }
      );
    }

    // Get penilaian data untuk siswa tersebut (SAME AS SISWA API)
    const penilaianList = await prisma.penilaian.findMany({
      where: {
        siswaId: siswaId,
      },
      include: {
        hafalan: {
          select: {
            tanggal: true,
            surah: true,
            ayatMulai: true,
            ayatSelesai: true,
          },
        },
        guru: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics (SAME LOGIC AS SISWA API)
    const totalPenilaian = penilaianList.length;

    let rataRataNilai = 0;
    let rataRataTajwid = 0;
    let rataRataKelancaran = 0;
    let rataRataMakhraj = 0;
    let rataRataImplementasi = 0;

    if (totalPenilaian > 0) {
      let totalNilai = 0;
      let totalTajwid = 0;
      let totalKelancaran = 0;
      let totalMakhraj = 0;
      let totalAdab = 0;

      penilaianList.forEach((p) => {
        totalNilai += p.nilaiAkhir || 0;
        totalTajwid += p.tajwid || 0;
        totalKelancaran += p.kelancaran || 0;
        totalMakhraj += p.makhraj || 0;
        totalAdab += p.adab || 0;
      });

      rataRataNilai = Math.round(totalNilai / totalPenilaian);
      rataRataTajwid = Math.round(totalTajwid / totalPenilaian);
      rataRataKelancaran = Math.round(totalKelancaran / totalPenilaian);
      rataRataMakhraj = Math.round(totalMakhraj / totalPenilaian);
      rataRataImplementasi = Math.round(totalAdab / totalPenilaian);
    }

    // Format penilaian data (FULLY CONSISTENT WITH SISWA API)
    const penilaianData = penilaianList.map((p) => ({
      id: p.id,
      surah: p.hafalan?.surah || '-',
      ayat: p.hafalan ? `${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}` : '-',
      tanggal: p.hafalan?.tanggal || p.createdAt,
      guru: p.guru?.user?.name || 'Unknown',
      tajwid: p.tajwid || 0,
      kelancaran: p.kelancaran || 0,
      makhraj: p.makhraj || 0,
      implementasi: p.adab || 0,
      nilaiAkhir: p.nilaiAkhir || 0,
      catatan: p.catatan || '',
      status: (p.nilaiAkhir || 0) >= 75 ? 'lulus' : (p.nilaiAkhir || 0) >= 60 ? 'revisi' : 'belum',
    }));

    // Return response
    return NextResponse.json({
      siswa: {
        id: siswa.id,
        nama: siswa.namaLengkap,
        kelas: siswa.kelas?.namaKelas || '-',
      },
      statistics: {
        totalPenilaian,
        rataRataNilai,
        rataRataTajwid,
        rataRataKelancaran,
        rataRataMakhraj,
        rataRataImplementasi,
      },
      penilaianData,
    });
  } catch (error) {
    console.error('Error fetching penilaian data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch penilaian data', details: error.message },
      { status: 500 }
    );
  }
}
