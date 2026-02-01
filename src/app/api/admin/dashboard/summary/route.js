export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma, pingDB } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const fetchCache = 'force-no-store';

export async function GET() {
  const startTotal = performance.now();
  console.log('--- [DASHBOARD SUMMARY] REQUEST START ---');

  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[DASHBOARD SUMMARY] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Measure DB Ping
    const dbPing = await pingDB();
    console.log(`[DASHBOARD SUMMARY] DB Ping: ${dbPing} ms`);

    const startQueries = performance.now();

    // Check if models exist on prisma object to prevent "undefined" errors
    if (!prisma.siswa || !prisma.guru || !prisma.kelas || !prisma.notification) {
      console.error('[DASHBOARD SUMMARY] Missing models on prisma client:', {
        siswa: !!prisma.siswa,
        guru: !!prisma.guru,
        kelas: !!prisma.kelas,
        notification: !!prisma.notification,
        pengumuman: !!prisma.pengumuman
      });
    }

    // Consolidated Parallel Queries
    const [
      totalSiswa,
      siswaAktif,
      totalGuru,
      totalKelas,
      pendingCount,
      unreadNotificationsCount,
      pengumuman,
      tahunAjaranAktif,
      avgNilaiData,
      presensiData,
      juzTertinggiData,
      siswaJuzData,
      kelasWithSiswa
    ] = await Promise.all([
      prisma.siswa?.count() || 0,
      prisma.siswa?.count({ where: { status: 'approved' } }) || 0,
      prisma.guru?.count() || 0,
      prisma.kelas?.count({ where: { status: 'AKTIF' } }) || 0,
      prisma.siswa?.count({ where: { status: 'pending' } }) || 0,
      prisma.notification?.count({ where: { userId: session.user.id, isRead: false } }) || 0,
      prisma.pengumuman?.findMany({ 
        where: { 
          deletedAt: null,
          isPublished: true
        },
        take: 5,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        select: { 
          id: true, 
          judul: true, 
          isi: true, 
          createdAt: true, 
          isPinned: true,
          attachmentUrl: true,
          attachmentName: true
        }
      }) || [],
      prisma.tahunAjaran?.findFirst({ 
        where: { isActive: true },
        select: { 
          id: true, 
          nama: true, 
          semester: true,
          targetHafalan: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          isActive: true
        }
      }) || null,
      prisma.penilaian?.aggregate({ 
        where: { siswa: { status: 'approved' } },
        _avg: { nilaiAkhir: true }
      }) || { _avg: { nilaiAkhir: 0 } },
      prisma.presensi?.groupBy({ 
        where: { siswa: { status: 'approved' } },
        by: ['status'],
        _count: { _all: true }
      }) || [],
      prisma.siswa?.aggregate({
        where: { 
          status: 'approved',
          statusSiswa: 'AKTIF'
        },
        _max: { latestJuzAchieved: true }
      }) || { _max: { latestJuzAchieved: 0 } },
      prisma.hafalan?.groupBy({ 
        where: { siswa: { status: 'approved' } },
        by: ['siswaId'],
        _max: { juz: true }
      }) || [],
      prisma.kelas?.findMany({ 
        where: { status: 'AKTIF' },
        select: {
          id: true,
          nama: true,
          siswa: {
            where: { status: 'approved' },
            select: { id: true }
          }
        }
      }) || []
    ]);

    const endQueries = performance.now();
    console.log(`[DASHBOARD SUMMARY] prisma.queries: ${(endQueries - startQueries).toFixed(2)} ms`);
    console.log(`[DASHBOARD SUMMARY] siswaAktif: ${siswaAktif}, siswaJuzData count: ${siswaJuzData.length}`);

    const startProcessing = performance.now();

    const targetJuz = tahunAjaranAktif?.targetHafalan || 3;

    // Hitung Juz Tertinggi dari field latestJuzAchieved siswa aktif
    const maxJuzRaw = juzTertinggiData?._max?.latestJuzAchieved || 0;
    // Clamp hasil final ke range 0..30
    const juzTertinggi = Math.max(0, Math.min(30, maxJuzRaw));
    
    console.log(`[DASHBOARD SUMMARY] Juz Tertinggi (siswa AKTIF): ${juzTertinggi}`);

    // Process Juz per Siswa untuk statistik target
    const siswaJuzMap = {};
    let siswaMencapaiTarget = 0;
    
    siswaJuzData.forEach(h => {
      const maxJuz = h._max.juz || 0;
      siswaJuzMap[h.siswaId] = maxJuz;
      if (maxJuz >= targetJuz) {
        siswaMencapaiTarget++;
      }
    });

    // Process Kelas Target
    const kelasTop5Raw = kelasWithSiswa.map(k => {
      const totalSiswaDiKelas = k.siswa.length;
      if (totalSiswaDiKelas === 0) return { id: k.id, nama: k.nama, total: 0, mencapai: 0, persen: 0 };
      
      let mencapai = 0;
      k.siswa.forEach(s => {
        if ((siswaJuzMap[s.id] || 0) >= targetJuz) mencapai++;
      });
      
      return {
        id: k.id,
        nama: k.nama,
        total: totalSiswaDiKelas,
        mencapai,
        persen: Math.round((mencapai / totalSiswaDiKelas) * 1000) / 10
      };
    });

    const kelasTop5 = kelasTop5Raw
      .sort((a, b) => b.persen - a.persen)
      .slice(0, 5);

    let kelasMencapaiTargetCount = 0;
    kelasTop5Raw.forEach(k => {
      if (k.persen >= 50) kelasMencapaiTargetCount++;
    });

    // Process Presensi
    let totalPresensi = 0;
    let hadirCount = 0;
    presensiData.forEach(p => {
      totalPresensi += p._count._all;
      if (p.status === 'HADIR') hadirCount += p._count._all;
    });

    const endProcessing = performance.now();
    console.log(`[DASHBOARD SUMMARY] processing: ${(endProcessing - startProcessing).toFixed(2)} ms`);

    const response = {
      success: true,
      dbPing,
      stats: {
        totalSiswa,
        siswaAktif,
        totalGuru,
        totalKelas,
        juzTertinggi,
        rataRataNilai: avgNilaiData._avg.nilaiAkhir ? Math.round(avgNilaiData._avg.nilaiAkhir * 10) / 10 : 0,
        rataRataKehadiran: totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100 * 10) / 10 : 0,
        siswaMencapaiTarget,
        persentaseSiswaMencapaiTarget: siswaAktif > 0 ? Math.round((siswaMencapaiTarget / siswaAktif) * 100) : 0,
        kelasMencapaiTarget: kelasMencapaiTargetCount,
      },
      pendingCount,
      unreadNotificationsCount,
      pengumuman,
      tahunAjaranAktif,
      statistikTarget: {
        kelasTop5,
        siswa: {
          mencapai: siswaMencapaiTarget,
          belum: Math.max(0, siswaAktif - siswaMencapaiTarget),
          total: siswaAktif,
          persen: siswaAktif > 0 ? Math.round((siswaMencapaiTarget / siswaAktif) * 1000) / 10 : 0
        }
      }
    };

    const endTotal = performance.now();
    console.log(`[DASHBOARD SUMMARY] total: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log('--- [DASHBOARD SUMMARY] REQUEST END ---');

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      }
    });

  } catch (error) {
    console.error('[DASHBOARD SUMMARY] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
