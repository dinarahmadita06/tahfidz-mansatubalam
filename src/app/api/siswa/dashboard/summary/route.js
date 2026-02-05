export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calculateStudentProgress } from '@/lib/services/siswaProgressService';
import { getRelativeTime } from '@/lib/helpers/siswaActivityLogger';


export async function GET() {
  const startTime = performance.now();
  try {
    const session = await auth();
    
    console.log('[DASHBOARD SUMMARY] === START REQUEST ===');
    console.log('[DASHBOARD SUMMARY] Session:', {
      exists: !!session,
      userId: session?.user?.id,
      role: session?.user?.role,
      email: session?.user?.email
    });

    if (!session || session.user.role !== 'SISWA') {
      console.log('[DASHBOARD SUMMARY] Unauthorized - no session or not SISWA role');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get student identity
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        kelasId: true,
        latestJuzAchieved: true,
        user: { select: { name: true } }
      }
    });
    
    console.log('[DASHBOARD SUMMARY] Siswa data:', {
      found: !!siswa,
      siswaId: siswa?.id,
      kelasId: siswa?.kelasId,
      name: siswa?.user?.name
    });

    if (!siswa) {
      console.log('[DASHBOARD SUMMARY] ERROR: Siswa not found for userId:', session.user.id);
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    const siswaId = siswa.id;

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // 2. Parallel Queries
    const [
      schoolYear,
      penilaianListForAvg,
      catatanGuruCount,
      pengumuman,
      activitiesRaw
    ] = await Promise.all([
      prisma.tahunAjaran.findFirst({
        where: { isActive: true },
        select: {
          id: true,
          nama: true,
          semester: true,
          tanggalMulai: true,
          tanggalSelesai: true,
          targetHafalan: true
        }
      }),
      // FIXED: Ambil detail penilaian untuk perhitungan yang sama dengan Penilaian Hafalan
      prisma.penilaian.findMany({
        where: { siswaId },
        select: {
          id: true,
          tajwid: true,
          kelancaran: true,
          makhraj: true,
          adab: true,
          nilaiAkhir: true,
          hafalan: {
            select: {
              tanggal: true,
              guruId: true
            }
          }
        },
        orderBy: {
          hafalan: {
            tanggal: 'desc'
          }
        }
      }),
      prisma.penilaian.count({
        where: { siswaId, catatan: { not: null } }
      }),
      prisma.pengumuman.findMany({
        take: 5,
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
        where: {
          AND: [
            { tanggalMulai: { lte: now } },
            {
              OR: [
                { tanggalSelesai: null },
                { tanggalSelesai: { gte: todayStart } }
              ]
            },
            { isPublished: true },
            { deletedAt: null },
            { 
              OR: [
                { audience: 'ALL' },
                { audience: 'SISWA' }
              ]
            }
          ]
        },
        select: {
          id: true,
          judul: true,
          isi: true,
          createdAt: true,
          isPinned: true
        }
      }),
      prisma.activityLog.findMany({
        where: { targetUserId: siswaId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          action: true,
          title: true,
          description: true,
          actorName: true,
          metadata: true,
          createdAt: true
        }
      })
    ]);

    console.log('[DASHBOARD SUMMARY] Query results:', {
      schoolYear: schoolYear ? { id: schoolYear.id, nama: schoolYear.nama, isActive: true, targetHafalan: schoolYear.targetHafalan } : null,
      penilaianCount: penilaianListForAvg.length,
      catatanGuruCount,
      pengumumanCount: pengumuman.length,
      activitiesCount: activitiesRaw.length
    });
    
    if (!schoolYear) {
      console.log('[DASHBOARD SUMMARY] ⚠️ WARNING: No active school year found!');
    }
    
    if (penilaianListForAvg.length === 0) {
      console.log('[DASHBOARD SUMMARY] ⚠️ WARNING: No penilaian data found for siswaId:', siswaId);
    }

    // 3. Calculate rata-rata nilai using SAME method as Penilaian Hafalan
    // Group by date + guru, calculate average per session, then average all sessions
    const groupedMap = new Map();
    
    penilaianListForAvg.forEach(p => {
      if (!p.hafalan) return;
      
      // Skip unscored assessments
      const hasValidScore = p.tajwid > 0 || p.kelancaran > 0 || p.makhraj > 0 || p.adab > 0;
      if (!hasValidScore) return;
      
      const dateKey = p.hafalan.tanggal.toISOString().split('T')[0];
      const guruId = p.hafalan.guruId || 'unknown';
      const groupKey = `${dateKey}_${guruId}`;
      
      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          scores: {
            tajwid: [],
            kelancaran: [],
            makhraj: [],
            adab: []
          }
        });
      }
      
      const group = groupedMap.get(groupKey);
      group.scores.tajwid.push(p.tajwid || 0);
      group.scores.kelancaran.push(p.kelancaran || 0);
      group.scores.makhraj.push(p.makhraj || 0);
      group.scores.adab.push(p.adab || 0);
    });
    
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
    const sessionAverages = Array.from(groupedMap.values()).map(group => {
      const avgTajwid = avg(group.scores.tajwid);
      const avgKelancaran = avg(group.scores.kelancaran);
      const avgMakhraj = avg(group.scores.makhraj);
      const avgAdab = avg(group.scores.adab);
      
      // nilaiTotal per session = rata-rata 4 aspek
      return parseFloat(((avgTajwid + avgKelancaran + avgMakhraj + avgAdab) / 4).toFixed(2));
    });
    
    const rataRataNilai = sessionAverages.length > 0 
      ? parseFloat(avg(sessionAverages).toFixed(2))
      : 0;
    
    console.log('[DASHBOARD SUMMARY] Total sessions:', sessionAverages.length, 'Rata-rata:', rataRataNilai);

    // Sequential but fast calculations/further queries
    // Progress calculation uses a service that might do multiple queries, keeping it separate for clarity
    const progressData = await calculateStudentProgress(prisma, siswaId, schoolYear?.id);
    const totalJuzSelesai = progressData.totalJuz;
    
    console.log('[DASHBOARD SUMMARY] Progress data:', {
      totalJuz: totalJuzSelesai,
      juzProgressCount: progressData.juzProgress.length
    });

    // Kehadiran stats (only if school year exists)
    let kehadiranCount = 0;
    let totalHariCount = 0;
    if (schoolYear) {
      [kehadiranCount, totalHariCount] = await Promise.all([
        prisma.presensi.count({
          where: {
            siswaId,
            status: 'HADIR',
            tanggal: { gte: schoolYear.tanggalMulai, lte: schoolYear.tanggalSelesai }
          }
        }),
        prisma.presensi.count({
          where: {
            siswaId,
            tanggal: { gte: schoolYear.tanggalMulai, lte: schoolYear.tanggalSelesai }
          }
        })
      ]);
      console.log('[DASHBOARD SUMMARY] Kehadiran:', kehadiranCount, 'dari', totalHariCount, 'hari');
    } else {
      console.log('[DASHBOARD SUMMARY] ⚠️ Skipping kehadiran query (no active school year)');
    }

    // 4. Data Transformation
    const activities = activitiesRaw.map((activity) => ({
      id: activity.id,
      action: activity.action,
      title: activity.title,
      description: activity.description,
      actorName: activity.actorName,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
      createdAt: activity.createdAt,
      relativeTime: getRelativeTime(activity.createdAt)
    }));

    const juzProgress = progressData.juzProgress
      .sort((a, b) => a.juz - b.juz);

    const targetJuzSekolah = schoolYear?.targetHafalan || null;
    const progressPercent = targetJuzSekolah 
      ? Math.min(100, Math.round((totalJuzSelesai / targetJuzSekolah) * 100))
      : null;

    const endTime = performance.now();
    console.log(`[API/SISWA/DASHBOARD/SUMMARY] Took ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`[API/SISWA/DASHBOARD/SUMMARY] Final stats:`, {
      hafalanSelesai: totalJuzSelesai,
      totalHafalan: schoolYear?.targetHafalan || 0,
      rataRataNilai,
      kehadiranCount,
      totalHariCount
    });
    
    // Build warnings array
    const warnings = [];
    if (!schoolYear) {
      warnings.push('Tahun ajaran aktif belum disetel - menampilkan progress all-time');
    }
    if (penilaianListForAvg.length === 0) {
      warnings.push('Belum ada data penilaian hafalan');
    }
    if (totalJuzSelesai === 0) {
      warnings.push('Belum ada hafalan yang tercatat');
    }

    return NextResponse.json({
      success: true,
      siswaId,
      siswaName: siswa.user.name,
      warnings: warnings.length > 0 ? warnings : undefined,
      stats: {
        hafalanSelesai: totalJuzSelesai,
        totalHafalan: schoolYear?.targetHafalan || 0,
        rataRataNilai: rataRataNilai, // Using calculated value from grouped method
        kehadiran: kehadiranCount,
        totalHari: totalHariCount,
        catatanGuru: catatanGuruCount,
        totalJuz: totalJuzSelesai
      },
      juzProgress,
      pengumuman,
      activities,
      tahunAjaranAktif: schoolYear ? {
        id: schoolYear.id,
        nama: schoolYear.nama,
        semester: schoolYear.semester,
        targetJuz: schoolYear.targetHafalan,
        startDate: schoolYear.tanggalMulai,
        endDate: schoolYear.tanggalSelesai
      } : null,
      targetJuzSekolah,
      totalJuzSelesai,
      progressPercent,
      quote: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.",
      lastUpdated: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    });

  } catch (error) {
    console.error('[API/SISWA/DASHBOARD/SUMMARY] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
