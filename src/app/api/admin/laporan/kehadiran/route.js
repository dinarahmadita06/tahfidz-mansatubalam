export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Gunakan singleton prisma
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

export const runtime = 'nodejs';

export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API LAPORAN KEHADIRAN] REQUEST START ---');

  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API LAPORAN KEHADIRAN] Auth duration: ${(endAuth - startAuth).toFixed(2)}ms`);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');

    if (!kelasId || !tanggalMulai || !tanggalSelesai) {
      return NextResponse.json({ error: 'Parameter tidak lengkap' }, { status: 400 });
    }

    // Cache key based on params
    const cacheKey = `report-kehadiran-${kelasId}-${tanggalMulai}-${tanggalSelesai}`;
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('[API LAPORAN KEHADIRAN] Returning cached data');
      return NextResponse.json(cachedData);
    }

    console.log(`[API LAPORAN KEHADIRAN] Fetching data for period: ${tanggalMulai} to ${tanggalSelesai}`);
    const startQueries = performance.now();

    // Parallelize all independent queries
    const [kelas, adminUser, siswaList, kehadiran, hafalanData] = await Promise.all([
      // 1. Get kelas info
      prisma.kelas.findUnique({
        where: { id: kelasId },
        select: {
          id: true,
          nama: true,
          guruTahfidz: {
            select: {
              name: true,
              jabatan: true,
              ttdUrl: true,
              signatureUrl: true
            }
          }
        }
      }),
      // 2. Get admin info
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          jabatan: true,
          ttdUrl: true,
          signatureUrl: true
        }
      }),
      // 3. Get all siswa
      prisma.siswa.findMany({
        where: { kelasId },
        select: {
          id: true,
          nisn: true,
          user: { select: { name: true } }
        }
      }),
      // 4. Get kehadiran
      prisma.presensi.findMany({
        where: {
          siswa: { kelasId },
          tanggal: {
            gte: new Date(tanggalMulai),
            lte: new Date(tanggalSelesai)
          }
        },
        select: {
          id: true,
          siswaId: true,
          status: true,
          tanggal: true
        },
        orderBy: { tanggal: 'asc' }
      }),
      // 5. Get hafalan and penilaian
      prisma.hafalan.findMany({
        where: {
          siswa: { kelasId },
          tanggal: {
            gte: new Date(tanggalMulai),
            lte: new Date(tanggalSelesai)
          }
        },
        select: {
          id: true,
          siswaId: true,
          surah: true,
          tanggal: true,
          penilaian: {
            select: {
              tajwid: true,
              kelancaran: true,
              makhraj: true,
              adab: true
            }
          }
        }
      })
    ]);

    const endQueries = performance.now();
    console.log(`[API LAPORAN KEHADIRAN] DB Queries duration: ${(endQueries - startQueries).toFixed(2)}ms`);

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    // Merge teacher signature info
    let teacherUser = kelas.guruTahfidz;
    
    // Fallback: search in GuruKelas if guruTahfidz is not set (legacy data)
    if (!teacherUser) {
      const guruUtama = await prisma.guruKelas.findFirst({
        where: { kelasId, peran: 'utama', isActive: true },
        include: { 
          guru: { 
            include: { 
              user: {
                select: {
                  name: true,
                  jabatan: true,
                  ttdUrl: true,
                  signatureUrl: true
                }
              } 
            } 
          } 
        }
      });
      if (guruUtama) {
        teacherUser = guruUtama.guru.user;
      }
    }

    const teacher = {
      nama: teacherUser?.name || 'Belum Ditentukan',
      jabatan: teacherUser?.jabatan || 'Guru Tahfidz',
      ttdUrl: teacherUser?.ttdUrl || teacherUser?.signatureUrl || null
    };

    const admin = {
      nama: adminUser?.name || session.user.name,
      jabatan: adminUser?.jabatan || 'Koordinator Tahfidz',
      ttdUrl: adminUser?.ttdUrl || adminUser?.signatureUrl || null
    };

    // Calculate statistics per siswa
    const startProcessing = performance.now();
    
    // Indexing data by siswaId for faster lookup
    const kehadiranBySiswa = {};
    kehadiran.forEach(k => {
      if (!kehadiranBySiswa[k.siswaId]) kehadiranBySiswa[k.siswaId] = [];
      kehadiranBySiswa[k.siswaId].push(k);
    });

    const hafalanBySiswa = {};
    hafalanData.forEach(h => {
      if (!hafalanBySiswa[h.siswaId]) hafalanBySiswa[h.siswaId] = [];
      hafalanBySiswa[h.siswaId].push(h);
    });

    const uniqueDates = [...new Set(kehadiran.map(k => k.tanggal.toISOString().split('T')[0]))];
    const totalPertemuan = uniqueDates.length;

    const siswaData = siswaList.map(siswa => {
      const sKehadiran = kehadiranBySiswa[siswa.id] || [];
      const sHafalan = hafalanBySiswa[siswa.id] || [];

      const hadir = sKehadiran.filter(k => k.status === 'HADIR').length;
      const izin = sKehadiran.filter(k => k.status === 'IZIN').length;
      const sakit = sKehadiran.filter(k => k.status === 'SAKIT').length;
      const alpa = sKehadiran.filter(k => k.status === 'ALPA').length;

      const penilaianList = [];
      sHafalan.forEach(h => {
        if (h.penilaian && h.penilaian.length > 0) {
          penilaianList.push(...h.penilaian);
        }
      });

      let avgTajwid = null, avgKelancaran = null, avgMakhraj = null, avgImplementasi = null, totalNilai = null;
      if (penilaianList.length > 0) {
        const tVal = penilaianList.map(p => p.tajwid).filter(v => v != null);
        const kVal = penilaianList.map(p => p.kelancaran).filter(v => v != null);
        const mVal = penilaianList.map(p => p.makhraj).filter(v => v != null);
        const aVal = penilaianList.map(p => p.adab).filter(v => v != null);
        
        if (tVal.length > 0) avgTajwid = Math.round(tVal.reduce((a, b) => a + b, 0) / tVal.length);
        if (kVal.length > 0) avgKelancaran = Math.round(kVal.reduce((a, b) => a + b, 0) / kVal.length);
        if (mVal.length > 0) avgMakhraj = Math.round(mVal.reduce((a, b) => a + b, 0) / mVal.length);
        if (aVal.length > 0) avgImplementasi = Math.round(aVal.reduce((a, b) => a + b, 0) / aVal.length);
        
        if (avgTajwid && avgKelancaran && avgMakhraj && avgImplementasi) {
          totalNilai = Math.round((avgTajwid + avgKelancaran + avgMakhraj + avgImplementasi) / 4);
        }
      }
      
      const hafalanTerakhir = sHafalan.length > 0 ? sHafalan[0] : null;
      const formatValue = (val) => val === null || val === undefined ? '-' : val;

      return {
        nama: siswa.user.name,
        nisn: siswa.nisn,
        hadir, izin, sakit, alpa,
        jumlahSetoran: sHafalan.length,
        hafalanTerakhir: hafalanTerakhir ? `Surah ${hafalanTerakhir.surah}` : '-',
        tajwid: formatValue(avgTajwid),
        kelancaran: formatValue(avgKelancaran),
        makhraj: formatValue(avgMakhraj),
        implementasi: formatValue(avgImplementasi),
        totalNilai: formatValue(totalNilai),
        statusHafalan: sHafalan.length > 0 ? 'LANJUT' : 'BELUM SETORAN'
      };
    });

    const totalHadir = siswaData.reduce((sum, s) => sum + s.hadir, 0);
    const totalIzin = siswaData.reduce((sum, s) => sum + s.izin, 0);
    const totalSakit = siswaData.reduce((sum, s) => sum + s.sakit, 0);
    const totalAlpa = siswaData.reduce((sum, s) => sum + s.alpa, 0);

    const startDate = new Date(tanggalMulai);
    const endDate = new Date(tanggalSelesai);
    const periodeText = `${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`;

    const responseData = {
      kelasNama: kelas.nama,
      periodeText,
      summary: {
        jumlahSiswa: siswaList.length,
        totalPertemuan,
        totalHadir, totalIzin, totalSakit, totalAlpa
      },
      teacher,
      admin,
      siswaData
    };

    // Cache results for 60 seconds
    setCachedData(cacheKey, responseData, 60);

    const endProcessing = performance.now();
    console.log(`[API LAPORAN KEHADIRAN] Data processing duration: ${(endProcessing - startProcessing).toFixed(2)}ms`);
    console.log(`[API LAPORAN KEHADIRAN] Total duration: ${(endProcessing - startTotal).toFixed(2)}ms`);
    console.log('--- [API LAPORAN KEHADIRAN] REQUEST END ---');

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error generating attendance report:', error);
    return NextResponse.json({ error: 'Gagal generate laporan kehadiran' }, { status: 500 });
  }
}
