import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // SECURITY: Fetch orangTua from userId to get correct orangTuaId
    const orangTua = await prisma.orangTua.findFirst({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!orangTua) {
      return NextResponse.json({ error: 'Parent profile not found' }, { status: 404 });
    }

    // Get anak (siswa) of this orang tua using correct orangTuaId
    const orangTuaSiswa = await prisma.orangTuaSiswa.findMany({
      where: {
        orangTuaId: orangTua.id
      },
      include: {
        siswa: {
          select: {
            id: true
          }
        }
      }
    });

    const siswaIds = orangTuaSiswa.map(os => os.siswa.id);

    if (siswaIds.length === 0) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const mode = searchParams.get('mode') || 'detail'; // 'detail' or 'summary'

    // Build where clause
    let whereClause = {
      siswaId: {
        in: siswaIds
      }
    };

    // Add date filter if provided
    if (startDate && endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      whereClause.tanggal = {
        gte: new Date(startDate),
        lte: endDateObj
      };
    }

    if (mode === 'summary') {
      // Return aggregated per-student data for the period
      const hafalan = await prisma.hafalan.findMany({
        where: whereClause,
        include: {
          penilaian: true,
          siswa: {
            include: {
              user: { select: { name: true } },
              kelas: { select: { nama: true } }
            }
          }
        },
        orderBy: { tanggal: 'desc' }
      });

      // Group by student and calculate aggregates
      const groupedBySiswa = {};
      hafalan.forEach(h => {
        const siswaId = h.siswaId;
        if (!groupedBySiswa[siswaId]) {
          groupedBySiswa[siswaId] = {
            siswaData: h.siswa,
            hafalanList: [],
            penilaianList: []
          };
        }
        groupedBySiswa[siswaId].hafalanList.push(h);
        if (h.penilaian && h.penilaian.length > 0) {
          groupedBySiswa[siswaId].penilaianList.push(...h.penilaian);
        }
      });

      // Build summary result
      const result = Object.values(groupedBySiswa).map(data => {
        const penilaianList = data.penilaianList;
        
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
        const jumlahSetoran = data.hafalanList.length;
        
        // Get hafalan terakhir
        const hafalanTerakhir = data.hafalanList.length > 0 ? data.hafalanList[0] : null;
        const hafalanTerakhirText = hafalanTerakhir ? `Surah ${hafalanTerakhir.surah}` : '-';
        
        // Format values with fallback to '-'
        const formatValue = (val) => val === null || val === undefined ? '-' : (typeof val === 'number' ? Math.round(val * 10) / 10 : val);
        
        return {
          siswaId: data.siswaData.id,
          namaLengkap: data.siswaData.user.name,
          kelasNama: data.siswaData.kelas.nama,
          jumlahSetoran,
          hafalanTerakhir: hafalanTerakhirText,
          rataRataTajwid: formatValue(rataRataTajwid),
          rataRataKelancaran: formatValue(rataRataKelancaran),
          rataRataMakhraj: formatValue(rataRataMakhraj),
          rataRataImplementasi: formatValue(rataRataImplementasi),
          rataRataNilaiBulanan: formatValue(rataRataNilaiBulanan),
          statusHafalan: jumlahSetoran > 0 ? 'LANJUT' : 'BELUM SETORAN'
        };
      });

      return NextResponse.json(result);
    } else {
      // Detail mode - return raw hafalan entries
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
          guru: {
            include: {
              user: {
                select: {
                  name: true
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

      return NextResponse.json(laporan);
    }
  } catch (error) {
    console.error('Error fetching laporan hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch laporan hafalan' },
      { status: 500 }
    );
  }
}

// Export PDF endpoint
export async function POST(request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { siswaId, periode, format } = body

    // TODO: Implementasi pembuatan PDF/Excel
    // Untuk saat ini, return success message

    return NextResponse.json({
      success: true,
      message: `Laporan dalam format ${format} akan segera diunduh`,
      downloadUrl: `/api/orangtua/laporan-hafalan/download?siswaId=${siswaId}&periode=${periode}&format=${format}`
    })

  } catch (error) {
    console.error('Error exporting laporan:', error)
    return NextResponse.json(
      { error: 'Failed to export laporan', details: error.message },
      { status: 500 }
    )
  }
}
