import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');
    const kelasId = searchParams.get('kelasId');
    const siswaId = searchParams.get('siswaId');
    const viewMode = searchParams.get('viewMode') || 'bulanan'; // Default to bulanan

    // Build where clause
    let whereClause = {
      guruId: session.user.guruId
    };

    // Add date filter if provided
    if (tanggalMulai && tanggalSelesai) {
      // Parse dates with timezone handling
      const startDate = new Date(tanggalMulai);
      const endDate = new Date(tanggalSelesai);
      
      // Ensure we include the full day for the end date
      endDate.setHours(23, 59, 59, 999);
      
      whereClause.tanggal = {
        gte: startDate,
        lte: endDate
      };
    }

    // Add kelas filter if provided
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    // Add siswa filter if provided
    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    if (viewMode === 'bulanan' || viewMode === 'semesteran') {
      // For monthly/semester reports, we need ALL APPROVED siswa from the kelas with aggregated data
      // PENDING students are excluded from official reports
      
      // First, get all APPROVED siswa in the selected kelas
      let allSiswa = [];
      if (kelasId) {
        allSiswa = await prisma.siswa.findMany({
          where: {
            kelasId: kelasId,
            statusSiswa: 'AKTIF', // Only active students
            status: 'approved' // Only approved students (exclude PENDING)
          },
          include: {
            user: {
              select: {
                name: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
          },
          orderBy: {
            user: {
              name: 'asc'
            }
          }
        });
      }

      // Get hafalan data for the date range (only for students in this kelas)
      const endDate = new Date(tanggalSelesai);
      endDate.setHours(23, 59, 59, 999);
      
      // Parallel fetch for performance: hafalan and presensi
      const [hafalan, presensi] = await Promise.all([
        prisma.hafalan.findMany({
          where: {
            guruId: session.user.guruId,
            siswa: {
              kelasId: kelasId,
              status: 'approved' // Only include penilaian from approved students in official reports
            },
            tanggal: {
              gte: new Date(tanggalMulai),
              lte: endDate
            }
          },
          include: {
            penilaian: true
          },
          orderBy: {
            tanggal: 'desc'
          }
        }),
        prisma.presensi.findMany({
          where: {
            siswa: {
              kelasId: kelasId,
              status: 'approved' // Only include attendance from approved students in official reports
            },
            tanggal: {
              gte: new Date(tanggalMulai),
              lte: endDate
            }
          }
        })
      ]);

      // Group presensi by student
      const groupedPresensi = {};
      presensi.forEach(p => {
        if (!groupedPresensi[p.siswaId]) {
          groupedPresensi[p.siswaId] = { HADIR: 0, IZIN: 0, SAKIT: 0, ALFA: 0 };
        }
        if (groupedPresensi[p.siswaId][p.status] !== undefined) {
          groupedPresensi[p.siswaId][p.status]++;
        }
      });

      // Group hafalan by student and calculate aggregates
      const groupedBySiswa = {};
      
      hafalan.forEach(h => {
        const siswaId = h.siswaId;
        if (!groupedBySiswa[siswaId]) {
          groupedBySiswa[siswaId] = {
            hafalanList: [],
            penilaianList: []
          };
        }
        groupedBySiswa[siswaId].hafalanList.push(h);
        if (h.penilaian && h.penilaian.length > 0) {
          groupedBySiswa[siswaId].penilaianList.push(...h.penilaian);
        }
      });

      // Build result with ALL siswa in the kelas
      const result = allSiswa.map((siswa, idx) => {
        const siswaHafalanData = groupedBySiswa[siswa.id] || { hafalanList: [], penilaianList: [] };
        const penilaianList = siswaHafalanData.penilaianList;
        
        // Calculate averages
        const tajwidValues = penilaianList.filter(p => p.tajwid != null).map(p => p.tajwid);
        const kelancaranValues = penilaianList.filter(p => p.kelancaran != null).map(p => p.kelancaran);
        const makhrajValues = penilaianList.filter(p => p.makhraj != null).map(p => p.makhraj);
        const adabValues = penilaianList.filter(p => p.adab != null).map(p => p.adab);
        
        const rataRataTajwid = tajwidValues.length > 0 ? tajwidValues.reduce((a, b) => a + b, 0) / tajwidValues.length : null;
        const rataRataKelancaran = kelancaranValues.length > 0 ? kelancaranValues.reduce((a, b) => a + b, 0) / kelancaranValues.length : null;
        const rataRataMakhraj = makhrajValues.length > 0 ? makhrajValues.reduce((a, b) => a + b, 0) / makhrajValues.length : null;
        const rataRataImplementasi = adabValues.length > 0 ? adabValues.reduce((a, b) => a + b, 0) / adabValues.length : null;
        
        // Calculate overall average
        const allNilai = [...tajwidValues, ...kelancaranValues, ...makhrajValues, ...adabValues];
        const rataRataNilaiBulanan = allNilai.length > 0 ? allNilai.reduce((a, b) => a + b, 0) / allNilai.length : null;
        
        // Count total hafalan entries
        const jumlahSetoran = siswaHafalanData.hafalanList.length;
        
        // Get hafalan terakhir (latest) from the list
        const hafalanTerakhir = siswaHafalanData.hafalanList.length > 0 ? siswaHafalanData.hafalanList[0] : null;
        const hafalanTerakhirText = hafalanTerakhir ? `Surah ${hafalanTerakhir.surah}` : '-';

        // Attendance stats
        const pCounts = groupedPresensi[siswa.id] || { HADIR: 0, IZIN: 0, SAKIT: 0, ALFA: 0 };
        const kehadiranRecap = `H:${pCounts.HADIR} I:${pCounts.IZIN} S:${pCounts.SAKIT} A:${pCounts.ALFA}`;
        
        return {
          no: idx + 1,
          siswaId: siswa.id,
          namaLengkap: siswa.user.name,
          kelasNama: siswa.kelas.nama,
          hadir: pCounts.HADIR,
          izin: pCounts.IZIN,
          sakit: pCounts.SAKIT,
          alfa: pCounts.ALFA,
          totalHadir: pCounts.HADIR,
          totalTidakHadir: pCounts.IZIN + pCounts.SAKIT + pCounts.ALFA,
          kehadiran: kehadiranRecap,
          jumlahSetoran: jumlahSetoran,
          hafalanTerakhir: hafalanTerakhirText,
          rataRataTajwid: rataRataTajwid ? Math.round(rataRataTajwid * 10) / 10 : '-',
          rataRataKelancaran: rataRataKelancaran ? Math.round(rataRataKelancaran * 10) / 10 : '-',
          rataRataMakhraj: rataRataMakhraj ? Math.round(rataRataMakhraj * 10) / 10 : '-',
          rataRataImplementasi: rataRataImplementasi ? Math.round(rataRataImplementasi * 10) / 10 : '-',
          rataRataNilaiBulanan: rataRataNilaiBulanan ? Math.round(rataRataNilaiBulanan * 10) / 10 : '-',
          statusHafalan: jumlahSetoran > 0 ? 'LANJUT' : 'BELUM SETORAN'
        };
      });

      // Debug logging (temporary)
      console.log('Monthly report query parameters:', {
        tanggalMulai,
        tanggalSelesai,
        kelasId,
        viewMode,
        totalSiswa: allSiswa.length,
        siswaWithHafalan: Object.keys(groupedBySiswa).length,
        resultCount: result.length,
        note: 'Now includes ALL siswa in kelas, with and without hafalan'
      });

      return NextResponse.json(result);
    } else {
      // For daily/harian reports, return raw data
      const laporan = await prisma.hafalan.findMany({
        where: whereClause,
        include: {
          siswa: {
            include: {
              user: {
                select: {
                  name: true
                }
              },
              kelas: {
                select: {
                  nama: true
                }
              }
            }
          },
          penilaian: true
        },
        orderBy: {
          tanggal: 'desc'
        }
      });

      // Debug logging (temporary)
      console.log('Daily report query parameters:', {
        tanggalMulai,
        tanggalSelesai,
        kelasId,
        siswaId,
        viewMode,
        whereClause,
        resultCount: laporan.length
      });

      return NextResponse.json(laporan);
    }
  } catch (error) {
    console.error('Error fetching laporan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan' },
      { status: 500 }
    );
  }
}