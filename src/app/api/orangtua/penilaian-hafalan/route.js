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
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

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

    // Build where clause with optional date filter
    const whereClause = { siswaId };

    if (startDateStr && endDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999); // Include entire last day
      
      whereClause.hafalan = {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    // Fetch penilaian data
    const penilaianList = await prisma.penilaian.findMany({
      where: whereClause,
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
      orderBy: { hafalan: { tanggal: 'desc' } }
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
      tanggal: p.hafalan?.tanggal ? new Date(p.hafalan.tanggal).toLocaleDateString('id-ID') : new Date(p.createdAt).toLocaleDateString('id-ID'),
      guru: p.guru?.user?.name || 'Unknown',
      tajwid: p.tajwid || 0,
      kelancaran: p.kelancaran || 0,
      makhraj: p.makhraj || 0,
      implementasi: p.adab || 0,
      nilaiAkhir: p.nilaiAkhir || 0,
      rataRata: p.nilaiAkhir || 0,
      catatan: p.catatan || '-',
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
        // Calculate per-aspek averages
        rataRataTajwid: penilaianList.length > 0 
          ? Math.round(penilaianList.reduce((sum, p) => sum + (p.tajwid || 0), 0) / penilaianList.length)
          : 0,
        rataRataKelancaran: penilaianList.length > 0
          ? Math.round(penilaianList.reduce((sum, p) => sum + (p.kelancaran || 0), 0) / penilaianList.length)
          : 0,
        rataRataMakhraj: penilaianList.length > 0
          ? Math.round(penilaianList.reduce((sum, p) => sum + (p.makhraj || 0), 0) / penilaianList.length)
          : 0,
        rataRataImplementasi: penilaianList.length > 0
          ? Math.round(penilaianList.reduce((sum, p) => sum + (p.adab || 0), 0) / penilaianList.length)
          : 0
      },
      penilaianData
    });
  } catch (error) {
    console.error('Error fetching penilaian hafalan:', error);
    console.log('Request URL:', request.url);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
