export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getCachedData, setCachedData } from '@/lib/cache';

// Mark this as a dynamic route - do not call during build

// GET dashboard stats with aggressive caching (60 seconds)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.time('GET /api/admin/dashboard/stats');

    // CACHE: Dashboard stats can be cached for 60 seconds (non-realtime data)
    const cacheKey = 'dashboard-stats-cache';
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('📦 Using cached dashboard stats');
      console.timeEnd('GET /api/admin/dashboard/stats');
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        }
      });
    }

    console.log('📊 Fetching fresh dashboard stats from database');

    // OPTIMIZATION 1: Parallel basic counts
    console.time('parallel-counts');
    const [
      totalGuru,
      totalSiswa,
      totalOrangTua,
      siswaMenungguValidasi,
      tahunAjaranAktif
    ] = await Promise.all([
      prisma.guru.count(),
      prisma.siswa.count({
        where: { status: 'approved' }
      }),
      prisma.orangTua.count(),
      prisma.siswa.count({
        where: { status: 'pending' }
      }),
      prisma.tahunAjaran.findFirst({
        where: { isActive: true }
      })
    ]);
    console.timeEnd('parallel-counts');

    // OPTIMIZATION 2: Get kelas aktif count efficiently
    console.time('kelas-count-query');
    const totalKelasAktif = await prisma.kelas.count({
      where: {
        tahunAjaran: {
          isActive: true
        }
      }
    });
    console.timeEnd('kelas-count-query');

    // OPTIMIZATION 3: Get hafalan count efficiently
    console.time('hafalan-count-query');
    const totalHafalan = await prisma.hafalan.count({
      where: {
        siswa: {
          status: 'approved'
        }
      }
    });
    console.timeEnd('hafalan-count-query');

    // OPTIMIZATION 4: Get hafalan stats per kelas (only essential data)
    console.time('kelas-hafalan-stats');
    const kelasWithHafalan = await prisma.kelas.findMany({
      where: {
        tahunAjaran: {
          isActive: true
        }
      },
      select: {
        id: true,
        nama: true,
        targetJuz: true,
        siswa: {
          where: {
            status: 'approved'
          },
          select: {
            id: true,
            hafalan: {
              select: {
                juz: true
              }
            }
          }
        }
      }
    });
    console.timeEnd('kelas-hafalan-stats');

    // Calculate hafalan progress per kelas
    const hafalanPerKelas = kelasWithHafalan.map(kelas => {
      const totalJuz = kelas.siswa.reduce((total, siswa) => {
        const juzSet = new Set(siswa.hafalan.map(h => h.juz));
        return total + juzSet.size;
      }, 0);

      const totalSiswaKelas = kelas.siswa.length;
      const rataRataJuz = totalSiswaKelas > 0 ? totalJuz / totalSiswaKelas : 0;

      const target = kelas.targetJuz || 0;
      const progress = target > 0 ? (rataRataJuz / target) * 100 : 0;

      return {
        namaKelas: kelas.nama,
        totalSiswa: totalSiswaKelas,
        totalJuz: totalJuz,
        rataRataJuz: Math.round(rataRataJuz * 10) / 10,
        target: target,
        progress: Math.min(Math.round(progress), 100)
      };
    });

    // OPTIMIZATION 5: Get recent hafalan activity (last 7 days)
    console.time('recent-hafalan-query');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentHafalan = await prisma.hafalan.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });
    console.timeEnd('recent-hafalan-query');

    // OPTIMIZATION 6: Get kehadiran stats (last 30 days)
    console.time('kehadiran-stats-query');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const presensiStats = await prisma.presensi.groupBy({
      by: ['status'],
      where: {
        tanggal: {
          gte: thirtyDaysAgo
        }
      },
      _count: true
    });
    console.timeEnd('kehadiran-stats-query');

    const totalPresensi = presensiStats.reduce((sum, stat) => sum + stat._count, 0);
    const hadirCount = presensiStats.find(s => s.status === 'HADIR')?._count || 0;
    const kehadiranPercentage = totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100) : 0;

    // OPTIMIZATION 7: Calculate average nilai hafalan
    console.time('avg-penilaian-query');
    const avgPenilaian = await prisma.penilaian.aggregate({
      _avg: {
        nilaiAkhir: true
      },
      where: {
        nilaiAkhir: {
          not: null
        },
        siswa: {
          status: 'approved'
        }
      }
    });
    console.timeEnd('avg-penilaian-query');

    const rataRataNilai = avgPenilaian._avg.nilaiAkhir || 0;

    // OPTIMIZATION 8: Get kelas yang belum update hafalan minggu ini
    console.time('kelas-not-updated-query');
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const kelasWithRecentHafalan = await prisma.kelas.findMany({
      where: {
        tahunAjaran: {
          isActive: true
        },
        siswa: {
          some: {
            hafalan: {
              some: {
                createdAt: {
                  gte: startOfWeek
                }
              }
            }
          }
        }
      },
      select: {
        id: true
      }
    });
    console.timeEnd('kelas-not-updated-query');

    const kelasWithRecentHafalanIds = new Set(kelasWithRecentHafalan.map(k => k.id));
    const kelasBelumUpdate = kelasWithHafalan.filter(k => !kelasWithRecentHafalanIds.has(k.id));

    const responseData = {
      stats: {
        totalGuru,
        totalSiswa,
        totalKelasAktif,
        totalOrangTua,
        totalHafalan,
        siswaMenungguValidasi,
        recentHafalan,
        kehadiranPercentage,
        rataRataNilai: Math.round(rataRataNilai * 10) / 10
      },
      tahunAjaranAktif,
      hafalanPerKelas,
      kelasBelumUpdate: kelasBelumUpdate.map(k => ({
        id: k.id,
        nama: k.nama,
        totalSiswa: k.siswa.length
      })),
      presensiStats: presensiStats.map(s => ({
        status: s.status,
        count: s._count
      }))
    };

    // Cache for 60 seconds
    setCachedData(cacheKey, responseData, 60);

    console.timeEnd('GET /api/admin/dashboard/stats');
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}