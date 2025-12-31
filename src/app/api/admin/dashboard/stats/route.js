import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// Mark this as a dynamic route - do not call during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 300000; // 5 minutes in milliseconds

// Function to get cached data
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Function to set cached data
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we have cached data
    const cacheKey = 'admin-dashboard-stats';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached dashboard stats');
      return NextResponse.json(cachedData);
    }

    console.log('Fetching fresh dashboard stats from database');

    // Get total counts
    const [
      totalGuru,
      totalSiswa,
      totalKelasAktif,
      totalOrangTua,
      totalHafalan,
      tahunAjaranAktif,
      siswaMenungguValidasi
    ] = await Promise.all([
      prisma.guru.count(),
      prisma.siswa.count({
        where: { status: 'approved' }
      }),
      prisma.kelas.count({
        where: {
          tahunAjaran: {
            isActive: true
          }
        }
      }),
      prisma.orangTua.count(),
      prisma.hafalan.count(),
      prisma.tahunAjaran.findFirst({
        where: { isActive: true }
      }),
      prisma.siswa.count({
        where: { status: 'pending' }
      })
    ]);

    // Get hafalan stats per kelas
    const kelasWithHafalan = await prisma.kelas.findMany({
      where: {
        tahunAjaran: {
          isActive: true
        }
      },
      include: {
        siswa: {
          where: {
            status: 'approved'
          },
          include: {
            hafalan: {
              select: {
                juz: true,
                nilaiAkhir: true
              }
            }
          }
        },
        targetHafalan: {
          where: {
            bulan: new Date().getMonth() + 1,
            tahun: new Date().getFullYear()
          }
        }
      }
    });

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

    // Get recent hafalan activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentHafalan = await prisma.hafalan.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    // Get kehadiran stats (last 30 days)
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

    const totalPresensi = presensiStats.reduce((sum, stat) => sum + stat._count, 0);
    const hadirCount = presensiStats.find(s => s.status === 'HADIR')?._count || 0;
    const kehadiranPercentage = totalPresensi > 0 ? Math.round((hadirCount / totalPresensi) * 100) : 0;

    // Calculate average nilai hafalan
    const hafalanWithNilai = await prisma.hafalan.aggregate({
      _avg: {
        nilaiAkhir: true
      },
      where: {
        nilaiAkhir: {
          not: null
        }
      }
    });

    const rataRataNilai = hafalanWithNilai._avg.nilaiAkhir || 0;

    // Get kelas yang belum update hafalan minggu ini
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

    // Cache the response
    setCachedData(cacheKey, responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}