import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/orangtua/penilaian-hafalan
 * Fetch penilaian hafalan untuk anak yang dipilih orang tua
 * Query params: siswaId (required)
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');

    // Jika tidak ada siswaId, return children list
    if (!siswaId) {
      const children = await prisma.siswa.findMany({
        where: {
          orangTuaSiswa: {
            some: {
              orangTua: { userId: session.user.id }
            }
          }
        },
        select: {
          id: true,
          user: { select: { name: true } },
          kelas: { select: { nama: true } }
        }
      });

      return NextResponse.json({
        children: children.map(c => ({
          id: c.id,
          namaLengkap: c.user.name,
          kelas: { namaKelas: c.kelas?.nama }
        }))
      });
    }

    // Validasi: siswa harus terhubung dengan orang tua ini
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTuaSiswa: {
          some: {
            orangTua: { userId: session.user.id }
          }
        }
      },
      select: {
        id: true,
        user: { select: { name: true } },
        kelas: { select: { nama: true } }
      }
    });

    if (!siswa) {
      return NextResponse.json({
        error: 'Student not found or not authorized',
        siswa: null,
        statistics: {
          totalPenilaian: 0,
          rataRataNilai: 0
        },
        penilaianData: []
      }, { status: 403 });
    }

    // Fetch penilaian data
    const penilaianList = await prisma.penilaian.findMany({
      where: { siswaId },
      include: {
        hafalan: {
          select: {
            surah: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        },
        guru: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate statistics
    const totalPenilaian = penilaianList.length;
    let rataRataNilai = 0;

    if (totalPenilaian > 0) {
      const totalNilai = penilaianList.reduce((sum, p) => sum + (p.nilaiAkhir || 0), 0);
      rataRataNilai = Math.round(totalNilai / totalPenilaian);
    }

    // Format response
    const penilaianData = penilaianList.map(p => ({
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
      rataRata: p.nilaiAkhir || 0,
      catatan: p.catatan || '',
      status: (p.nilaiAkhir || 0) >= 75 ? 'lulus' : (p.nilaiAkhir || 0) >= 60 ? 'revisi' : 'belum'
    }));

    return NextResponse.json({
      siswa: {
        id: siswa.id,
        nama: siswa.user.name,
        kelas: siswa.kelas?.nama || '-'
      },
      statistics: {
        totalPenilaian,
        rataRataNilai,
        rataRataTajwid: 0,
        rataRataKelancaran: 0,
        rataRataMakhraj: 0,
        rataRataImplementasi: 0
      },
      penilaianData
    });
  } catch (error) {
    console.error('Error fetching penilaian hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
