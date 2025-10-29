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

    // Get penilaian data untuk siswa tersebut
    const penilaianData = await prisma.penilaian.findMany({
      where: {
        siswaId: siswaId,
      },
      include: {
        setoran: {
          include: {
            surah: {
              select: {
                namaSurah: true,
              },
            },
            guru: {
              select: {
                namaLengkap: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate averages
    const totalPenilaian = penilaianData.length;
    let totalTajwid = 0;
    let totalKelancaran = 0;
    let totalAdab = 0;

    penilaianData.forEach((p) => {
      totalTajwid += p.nilaiTajwid || 0;
      totalKelancaran += p.nilaiKelancaran || 0;
      totalAdab += p.nilaiAdab || 0;
    });

    const rataRataTajwid = totalPenilaian > 0 ? Math.round(totalTajwid / totalPenilaian) : 0;
    const rataRataKelancaran =
      totalPenilaian > 0 ? Math.round(totalKelancaran / totalPenilaian) : 0;
    const rataRataAdab = totalPenilaian > 0 ? Math.round(totalAdab / totalPenilaian) : 0;

    // Format response
    const response = {
      siswa: {
        id: siswa.id,
        nama: siswa.namaLengkap,
        kelas: siswa.kelas?.namaKelas,
      },
      statistics: {
        rataRataTajwid,
        rataRataKelancaran,
        rataRataAdab,
        totalPenilaian,
      },
      penilaianList: penilaianData.map((p) => ({
        id: p.id,
        tanggal: p.createdAt,
        surah: p.setoran?.surah?.namaSurah || 'Unknown',
        ayat: p.setoran
          ? `${p.setoran.ayatMulai}-${p.setoran.ayatSelesai}`
          : 'Unknown',
        tajwid: p.nilaiTajwid,
        kelancaran: p.nilaiKelancaran,
        adab: p.nilaiAdab,
        catatan: p.catatan,
        guru: p.setoran?.guru?.namaLengkap || 'Unknown',
      })),
      chartData: penilaianData
        .slice(0, 10)
        .reverse()
        .map((p) => ({
          tanggal: p.createdAt,
          nilaiRataRata: Math.round(
            ((p.nilaiTajwid || 0) + (p.nilaiKelancaran || 0) + (p.nilaiAdab || 0)) / 3
          ),
        })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching penilaian data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch penilaian data', details: error.message },
      { status: 500 }
    );
  }
}
