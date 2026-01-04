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
      // For monthly/semester reports, we need aggregated data per student
      const hafalan = await prisma.hafalan.findMany({
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

      // Get presensi data for the same date range
      let presensiData = [];
      if (tanggalMulai && tanggalSelesai) {
        const startDate = new Date(tanggalMulai);
        const endDate = new Date(tanggalSelesai);
        endDate.setHours(23, 59, 59, 999);
        
        presensiData = await prisma.presensi.findMany({
          where: {
            guruId: session.user.guruId,
            tanggal: {
              gte: startDate,
              lte: endDate
            },
            ...(kelasId && {
              siswa: {
                kelasId: kelasId
              }
            }),
            ...(siswaId && { siswaId })
          }
        });
      }

      // Group hafalan by student and calculate aggregates
      const groupedBySiswa = {};
      
      hafalan.forEach(h => {
        const siswaId = h.siswaId;
        if (!groupedBySiswa[siswaId]) {
          groupedBySiswa[siswaId] = {
            siswaId: h.siswaId,
            namaLengkap: h.siswa.user.name,
            kelasNama: h.siswa.kelas.nama,
            hafalanList: [],
            penilaianList: []
          };
        }
        groupedBySiswa[siswaId].hafalanList.push(h);
        if (h.penilaian && h.penilaian.length > 0) {
          groupedBySiswa[siswaId].penilaianList.push(...h.penilaian);
        }
      });

      // Group presensi by student for attendance calculation
      const presensiBySiswa = {};
      presensiData.forEach(p => {
        if (!presensiBySiswa[p.siswaId]) {
          presensiBySiswa[p.siswaId] = [];
        }
        presensiBySiswa[p.siswaId].push(p);
      });

      // Calculate aggregates for each student
      const result = Object.values(groupedBySiswa).map(siswaData => {
        const penilaianList = siswaData.penilaianList;
        
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
        const jumlahSetoran = siswaData.hafalanList.length;
        
        // Calculate attendance
        const siswaPresensi = presensiBySiswa[siswaData.siswaId] || [];
        const totalHadir = siswaPresensi.filter(p => p.status === 'HADIR').length;
        const totalTidakHadir = siswaPresensi.filter(p => p.status === 'IZIN' || p.status === 'SAKIT' || p.status === 'ALFA').length;
        
        return {
          siswaId: siswaData.siswaId,
          namaLengkap: siswaData.namaLengkap,
          kelasNama: siswaData.kelasNama,
          jumlahSetoran: jumlahSetoran,
          rataRataTajwid: rataRataTajwid ? Math.round(rataRataTajwid * 10) / 10 : null,
          rataRataKelancaran: rataRataKelancaran ? Math.round(rataRataKelancaran * 10) / 10 : null,
          rataRataMakhraj: rataRataMakhraj ? Math.round(rataRataMakhraj * 10) / 10 : null,
          rataRataImplementasi: rataRataImplementasi ? Math.round(rataRataImplementasi * 10) / 10 : null,
          rataRataNilaiBulanan: rataRataNilaiBulanan ? Math.round(rataRataNilaiBulanan * 10) / 10 : null,
          totalHadir: totalHadir,
          totalTidakHadir: totalTidakHadir,
          statusHafalan: jumlahSetoran > 0 ? 'LANJUT' : 'BELUM ADA SETORAN', // Simple logic
          catatanBulanan: '' // This would come from separate catatan storage
        };
      });

      // Debug logging (temporary)
      console.log('Monthly report query parameters:', {
        tanggalMulai,
        tanggalSelesai,
        kelasId,
        siswaId,
        viewMode,
        whereClause,
        rawCount: hafalan.length,
        presensiCount: presensiData.length,
        resultCount: result.length
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