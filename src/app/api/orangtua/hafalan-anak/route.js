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
    if (session.user.role !== 'orangtua') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Jika siswaId tidak diberikan, ambil semua anak dari orang tua ini
    if (!siswaId) {
      // Get all children of this parent
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
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Student not found or not authorized' },
        { status: 404 }
      );
    }

    // Get hafalan data untuk siswa tersebut
    const hafalanData = await prisma.setoran.findMany({
      where: {
        siswaId: siswaId,
      },
      include: {
        surah: {
          select: {
            namaSurah: true,
            nomorJuz: true,
          },
        },
        guru: {
          select: {
            namaLengkap: true,
          },
        },
      },
      orderBy: {
        tanggalSetor: 'desc',
      },
    });

    // Calculate statistics
    const totalHafalan = hafalanData.length;
    const hafalanLulus = hafalanData.filter((h) => h.status === 'lulus').length;
    const totalNilai = hafalanData.reduce((sum, h) => sum + (h.nilai || 0), 0);
    const rataRataNilai = totalHafalan > 0 ? Math.round(totalNilai / totalHafalan) : 0;

    // Get latest setoran
    const latestSetoran = hafalanData.length > 0 ? hafalanData[0] : null;

    // Calculate progress per Juz
    const juzProgress = await prisma.setoran.groupBy({
      by: ['surah'],
      where: {
        siswaId: siswaId,
        status: 'lulus',
      },
      _count: {
        id: true,
      },
    });

    // Get detailed juz progress
    const juzData = await prisma.surah.groupBy({
      by: ['nomorJuz'],
      _count: {
        id: true,
      },
      _sum: {
        jumlahAyat: true,
      },
    });

    // Calculate completed ayat per juz
    const juzProgressDetail = await Promise.all(
      juzData.map(async (juz) => {
        const completedHafalan = await prisma.setoran.findMany({
          where: {
            siswaId: siswaId,
            status: 'lulus',
            surah: {
              nomorJuz: juz.nomorJuz,
            },
          },
          include: {
            surah: {
              select: {
                jumlahAyat: true,
              },
            },
          },
        });

        const completedAyat = completedHafalan.reduce(
          (sum, h) => sum + (h.surah?.jumlahAyat || 0),
          0
        );
        const totalAyat = juz._sum.jumlahAyat || 0;
        const progress = totalAyat > 0 ? Math.round((completedAyat / totalAyat) * 100) : 0;

        return {
          juz: juz.nomorJuz,
          totalAyat,
          completedAyat,
          progress,
        };
      })
    );

    // Format response
    const response = {
      siswa: {
        id: siswa.id,
        nama: siswa.namaLengkap,
        kelas: siswa.kelas?.namaKelas,
      },
      statistics: {
        totalHafalan,
        hafalanLulus,
        targetHafalan: 30, // This should come from a setting or calculation
        rataRataNilai,
        latestSetoran: latestSetoran
          ? {
              surah: latestSetoran.surah?.namaSurah,
              ayat: `${latestSetoran.ayatMulai}-${latestSetoran.ayatSelesai}`,
              tanggal: latestSetoran.tanggalSetor,
            }
          : null,
      },
      hafalanList: hafalanData.map((h) => ({
        id: h.id,
        surah: h.surah?.namaSurah,
        juz: h.surah?.nomorJuz,
        ayat: `${h.ayatMulai}-${h.ayatSelesai}`,
        tanggalSetor: h.tanggalSetor,
        nilai: h.nilai,
        status: h.status,
        catatanGuru: h.catatan,
        guru: h.guru?.namaLengkap,
      })),
      juzProgress: juzProgressDetail.sort((a, b) => a.juz - b.juz),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching hafalan data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan data', details: error.message },
      { status: 500 }
    );
  }
}
