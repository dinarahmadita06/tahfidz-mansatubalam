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

    // Build where clause with date filter
    // Ensure dates are interpreted consistently (assuming YYYY-MM-DD input)
    const startDate = startDateStr ? new Date(startDateStr) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = endDateStr ? new Date(endDateStr) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    
    // Debugging WAJIB: Print Raw Output untuk Memastikan Sumber Benar
    console.log("[PARENT PENILAIAN] userId:", session.user.id);
    console.log("[PARENT PENILAIAN] siswaId:", siswaId);
    console.log("[PARENT PENILAIAN] range:", startDate.toISOString(), "to", endDate.toISOString());

    const whereClause = {
      siswaId,
      hafalan: {
        tanggal: {
          gte: startDate,
          lt: endDate
        }
      }
    };

    // Fetch both assessment and attendance data in parallel
    const [penilaianList, presensiList, presensiStats] = await Promise.all([
      prisma.penilaian.findMany({
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
      }),
      prisma.presensi.findMany({
        where: {
          siswaId,
          tanggal: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          tanggal: true,
          status: true
        }
      }),
      prisma.presensi.groupBy({
        by: ['status'],
        where: {
          siswaId,
          tanggal: {
            gte: startDate,
            lt: endDate
          }
        },
        _count: {
          id: true
        }
      })
    ]);

    // Map attendance status by date (YYYY-MM-DD)
    const attendanceMap = new Map();
    presensiList.forEach(p => {
      const dateKey = p.tanggal.toISOString().split('T')[0];
      attendanceMap.set(dateKey, p.status);
    });

    const counts = {
      HADIR: 0,
      IZIN: 0,
      SAKIT: 0,
      ALFA: 0
    };

    presensiStats.forEach(stat => {
      counts[stat.status] = stat._count.id;
    });

    // Calculate assessment statistics
    const totalPenilaian = penilaianList.length;
    let rataRataNilai = 0;
    let lastAssessment = null;

    if (totalPenilaian > 0) {
      const totalNilai = penilaianList.reduce((sum, p) => sum + (p.nilaiAkhir || 0), 0);
      rataRataNilai = parseFloat((totalNilai / totalPenilaian).toFixed(2));
      
      // Last assessment is the first one because of DESC order
      const last = penilaianList[0];
      lastAssessment = {
        tanggal: last.hafalan?.tanggal || last.createdAt,
        surah: last.hafalan?.surah || '-',
        nilai: last.nilaiAkhir || 0
      };
    }

    // Format response
    const penilaianData = penilaianList.map(p => {
      const nilaiAkhir = p.nilaiAkhir || 0;
      let status = 'belum';
      if (nilaiAkhir >= 75) status = 'lulus';
      else if (nilaiAkhir >= 60) status = 'revisi';

      const assessmentDate = p.hafalan?.tanggal || p.createdAt;
      const dateKey = assessmentDate instanceof Date ? assessmentDate.toISOString().split('T')[0] : new Date(assessmentDate).toISOString().split('T')[0];
      const attendanceStatus = attendanceMap.get(dateKey) || null;

      return {
        id: p.id,
        surah: p.hafalan?.surah || '-',
        ayat: p.hafalan ? `${p.hafalan.ayatMulai}-${p.hafalan.ayatSelesai}` : '-',
        tanggal: assessmentDate, // Send raw date/ISO string
        guru: p.guru?.user?.name || 'Unknown',
        tajwid: p.tajwid || 0,
        kelancaran: p.kelancaran || 0,
        makhraj: p.makhraj || 0,
        implementasi: p.adab || 0,
        nilaiAkhir: nilaiAkhir,
        rataRata: nilaiAkhir,
        catatan: p.catatan || '-',
        status: status, // Use lowercase keys matching UI (lulus, revisi, belum)
        attendanceStatus: attendanceStatus // Added for the new UI column
      };
    });

    if (penilaianData.length > 0) {
      console.log("[PARENT PENILAIAN] total penilaian:", penilaianData.length);
      console.log("[PARENT PENILAIAN] sample:", penilaianData[0]);
    }

    return NextResponse.json({
      siswa: {
        id: siswa.id,
        nama: siswa.user.name,
        kelas: siswa.kelas?.nama || '-'
      },
      statistics: {
        totalPenilaian,
        rataRataNilai,
        lastAssessment,
        hadir: counts.HADIR,
        izin: counts.IZIN,
        sakit: counts.SAKIT,
        alfa: counts.ALFA
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
