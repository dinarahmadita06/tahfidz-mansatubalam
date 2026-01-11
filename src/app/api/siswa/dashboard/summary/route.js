import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calculateStudentProgress } from '@/lib/services/siswaProgressService';
import { getRelativeTime } from '@/lib/helpers/siswaActivityLogger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = performance.now();
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
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

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    const siswaId = siswa.id;

    // 2. Parallel Queries
    const [
      schoolYear,
      avgNilai,
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
      prisma.penilaian.aggregate({
        where: { siswaId },
        _avg: { nilaiAkhir: true }
      }),
      prisma.penilaian.count({
        where: { siswaId, catatan: { not: null } }
      }),
      prisma.pengumuman.findMany({
        take: 3,
        orderBy: { isPinned: 'desc' },
        where: {
          OR: [
            { tanggalSelesai: null },
            { tanggalSelesai: { gte: new Date() } }
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

    // 3. Sequential but fast calculations/further queries
    // Progress calculation uses a service that might do multiple queries, keeping it separate for clarity
    const progressData = await calculateStudentProgress(prisma, siswaId, schoolYear?.id);
    const totalJuzSelesai = progressData.totalJuz;

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

    const juzProgress = progressData.uniqueJuzs
      .map(juz => ({
        label: `Juz ${juz}`,
        progress: 100,
        juz: juz
      }))
      .sort((a, b) => a.juz - b.juz);

    const targetJuzSekolah = schoolYear?.targetHafalan || null;
    const progressPercent = targetJuzSekolah 
      ? Math.min(100, Math.round((totalJuzSelesai / targetJuzSekolah) * 100))
      : null;

    const endTime = performance.now();
    console.log(`[API/SISWA/DASHBOARD/SUMMARY] Took ${(endTime - startTime).toFixed(2)}ms`);

    return NextResponse.json({
      success: true,
      siswaId,
      siswaName: siswa.user.name,
      stats: {
        hafalanSelesai: totalJuzSelesai,
        totalHafalan: schoolYear?.targetHafalan || 0,
        rataRataNilai: Math.round(avgNilai._avg.nilaiAkhir || 0),
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
