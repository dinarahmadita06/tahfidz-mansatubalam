export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getSurahSetoranText } from '@/lib/helpers/formatSurahSetoran';

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
              tanggal: true,
              surahTambahan: true
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

    // --- GROUPING LOGIC START ---
    // Group assessments by date and guru to represent a single "meeting"
    const groupedMap = new Map();

    penilaianList.forEach((p) => {
      const assessmentDate = p.hafalan?.tanggal || p.createdAt;
      const dateKey = assessmentDate instanceof Date ? assessmentDate.toISOString().split('T')[0] : new Date(assessmentDate).toISOString().split('T')[0];
      const guruId = p.guruId || 'unknown';
      const groupKey = `${dateKey}_${guruId}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          id: p.id,
          tanggal: assessmentDate,
          dateKey: dateKey,
          guru: p.guru?.user?.name || 'Unknown',
          guruId: guruId,
          hafalanItems: [],
          scores: {
            tajwid: [],
            kelancaran: [],
            makhraj: [],
            adab: [],
            nilaiAkhir: []
          },
          catatanList: []
        });
      }

      const group = groupedMap.get(groupKey);
      
      if (p.hafalan) {
        group.hafalanItems.push(p.hafalan);
      }

      group.scores.tajwid.push(p.tajwid || 0);
      group.scores.kelancaran.push(p.kelancaran || 0);
      group.scores.makhraj.push(p.makhraj || 0);
      group.scores.adab.push(p.adab || 0);
      group.scores.nilaiAkhir.push(p.nilaiAkhir || 0);

      if (p.catatan && p.catatan.trim() && p.catatan !== '-') {
        group.catatanList.push(p.catatan);
      }
    });

    // Process grouped data into final penilaianData
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    const penilaianData = Array.from(groupedMap.values()).map((group) => {
      const avgNilaiAkhir = avg(group.scores.nilaiAkhir);
      let status = 'belum';
      if (avgNilaiAkhir >= 75) status = 'lulus';
      else if (avgNilaiAkhir >= 60) status = 'revisi';

      const attendanceStatus = attendanceMap.get(group.dateKey) || null;

      // Format all surahs
      const surahTexts = group.hafalanItems.map(h => getSurahSetoranText(h)).filter(Boolean);
      const combinedSurah = [...new Set(surahTexts)].join(', ');

      return {
        id: group.id,
        surah: combinedSurah || '-',
        ayat: '', // Included in surah text
        tanggal: group.tanggal,
        guru: group.guru,
        tajwid: parseFloat(avg(group.scores.tajwid).toFixed(2)),
        kelancaran: parseFloat(avg(group.scores.kelancaran).toFixed(2)),
        makhraj: parseFloat(avg(group.scores.makhraj).toFixed(2)),
        implementasi: parseFloat(avg(group.scores.adab).toFixed(2)),
        nilaiAkhir: parseFloat(avgNilaiAkhir.toFixed(2)),
        rataRata: parseFloat(avgNilaiAkhir.toFixed(2)),
        catatan: [...new Set(group.catatanList)].join('; ') || '-',
        status: status,
        attendanceStatus: attendanceStatus
      };
    });

    // Update statistics based on grouped data
    const totalPenilaian = penilaianData.length;
    let rataRataNilai = 0;
    let lastAssessment = null;

    if (totalPenilaian > 0) {
      rataRataNilai = parseFloat((penilaianData.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / totalPenilaian).toFixed(2));
      const last = penilaianData[0];
      lastAssessment = {
        tanggal: last.tanggal,
        surah: last.surah,
        nilai: last.nilaiAkhir
      };
    }
    // --- GROUPING LOGIC END ---

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
