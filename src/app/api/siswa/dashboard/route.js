export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calculateStudentProgress } from '@/lib/services/siswaProgressService';


export async function GET(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { id: true, latestJuzAchieved: true }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa not found' },
        { status: 404 }
      );
    }

    const siswaId = siswa.id;

    // ===== 1. STATS =====

    // Get total hafalan selesai (setoran)
    const totalHafalan = await prisma.hafalan.count({
      where: { siswaId }
    });

    // Get total target hafalan
    const targetHafalan = await prisma.targetHafalan.findFirst({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      select: { targetJuz: true }
    });

    // Get rata-rata nilai dari penilaian
    const avgNilai = await prisma.penilaian.aggregate({
      where: { siswaId },
      _avg: { nilaiAkhir: true }
    });

    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    // Use centralized service for progress calculation (active school year)
    const progressData = await calculateStudentProgress(prisma, siswa.id, tahunAjaranAktif?.id);
    const totalJuzSelesai = progressData.totalJuz;

    // Get catatan guru count
    const catatanGuruCount = await prisma.penilaian.count({
      where: {
        siswaId,
        catatan: { not: null }
      }
    });

    // ===== 2. RECENT ACTIVITIES (EVENT-BASED) =====

    const activities = [];

    // Activity 1: Tasmi registration/ujian
    const recentTasmi = await prisma.tasmi.findMany({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        guruPenguji: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    recentTasmi.forEach(tasmi => {
      if (tasmi.statusPendaftaran === 'SELESAI' && tasmi.publishedAt) {
        activities.push({
          id: `tasmi-result-${tasmi.id}`,
          type: 'tasmi',
          title: `Hasil Tasmi ${tasmi.juzYangDitasmi} telah dipublikasi`,
          timestamp: tasmi.publishedAt.toISOString()
        });
      } else if (tasmi.statusPendaftaran === 'DISETUJUI' && tasmi.tanggalUjian) {
        activities.push({
          id: `tasmi-approved-${tasmi.id}`,
          type: 'tasmi',
          title: `Tasmi ${tasmi.juzYangDitasmi} disetujui - Ujian: ${new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID')}`,
          timestamp: tasmi.updatedAt.toISOString()
        });
      } else if (tasmi.statusPendaftaran === 'MENUNGGU') {
        activities.push({
          id: `tasmi-pending-${tasmi.id}`,
          type: 'tasmi',
          title: `Pendaftaran Tasmi ${tasmi.juzYangDitasmi} menunggu persetujuan`,
          timestamp: tasmi.createdAt.toISOString()
        });
      }
    });

    // Activity 2: Setoran hafalan
    const recentHafalan = await prisma.hafalan.findMany({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        guru: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    recentHafalan.forEach(hafalan => {
      activities.push({
        id: `hafalan-${hafalan.id}`,
        type: 'setor',
        title: `Setoran ${hafalan.surah} ayat ${hafalan.ayatMulai}-${hafalan.ayatSelesai}`,
        timestamp: hafalan.createdAt.toISOString()
      });
    });

    // Activity 3: Penilaian/Catatan guru
    const recentPenilaian = await prisma.penilaian.findMany({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        guru: {
          include: { user: { select: { name: true } } }
        },
        hafalan: {
          select: { surah: true }
        }
      }
    });

    recentPenilaian.forEach(penilaian => {
      if (penilaian.catatan) {
        activities.push({
          id: `catatan-${penilaian.id}`,
          type: 'catatan',
          title: `Catatan dari ${penilaian.guru.user.name}: ${penilaian.catatan}`,
          timestamp: penilaian.createdAt.toISOString()
        });
      } else {
        activities.push({
          id: `nilai-${penilaian.id}`,
          type: 'nilai',
          title: `Nilai ${penilaian.hafalan.surah}: ${penilaian.nilaiAkhir}`,
          timestamp: penilaian.createdAt.toISOString()
        });
      }
    });

    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // ===== 3. JUZ PROGRESS (PER SCHOOL YEAR) =====

    const juzProgress = progressData.juzProgress
      .sort((a, b) => a.juz - b.juz);

    const stats = {
      hafalanSelesai: totalJuzSelesai, // ✅ Use synchronized value
      totalHafalan: tahunAjaranAktif?.targetHafalan || targetHafalan?.targetJuz || 0,
      rataRataNilai: Math.round(avgNilai._avg.nilaiAkhir || 0),
      catatanGuru: catatanGuruCount || 0
    };

    // Filter and sort
    const filteredJuzProgress = juzProgress
      .sort((a, b) => a.juz - b.juz);

    // ===== RETURN RESPONSE =====

    console.log(`[DEBUG/DASHBOARD] Student ${siswaId} Dashboard:
    - Hafalan Selesai (Juz): ${siswa.latestJuzAchieved}
    - Setoran Count: ${totalHafalan}
    - Juz Progress Count: ${filteredJuzProgress.length}
    `);

    return NextResponse.json({
      siswaId,
      stats,
      recentActivities: sortedActivities,
      juzProgress: filteredJuzProgress
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
