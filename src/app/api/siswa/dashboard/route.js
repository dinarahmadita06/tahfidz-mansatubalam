import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

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
      select: { id: true }
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

    // Get kehadiran stats (tahun ajaran aktif)
    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    let kehadiranCount = 0;
    let totalHariCount = 0;

    if (tahunAjaranAktif) {
      // Count total kehadiran HADIR
      kehadiranCount = await prisma.presensi.count({
        where: {
          siswaId,
          status: 'HADIR',
          tanggal: {
            gte: tahunAjaranAktif.tanggalMulai,
            lte: tahunAjaranAktif.tanggalSelesai
          }
        }
      });

      // Count total hari (all presensi records in active tahun ajaran)
      totalHariCount = await prisma.presensi.count({
        where: {
          siswaId,
          tanggal: {
            gte: tahunAjaranAktif.tanggalMulai,
            lte: tahunAjaranAktif.tanggalSelesai
          }
        }
      });
    }

    // Get catatan guru count
    const catatanGuruCount = await prisma.penilaian.count({
      where: {
        siswaId,
        catatan: { not: null }
      }
    });

    const stats = {
      hafalanSelesai: totalHafalan || 0,
      totalHafalan: tahunAjaranAktif?.targetHafalan || targetHafalan?.targetJuz || 0,
      rataRataNilai: Math.round(avgNilai._avg.nilaiAkhir || 0),
      kehadiran: kehadiranCount || 0,
      totalHari: totalHariCount || 0,
      catatanGuru: catatanGuruCount || 0
    };

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

    // Activity 4: Presensi
    const recentPresensi = await prisma.presensi.findMany({
      where: { siswaId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    recentPresensi.forEach(presensi => {
      const statusText = {
        HADIR: 'Hadir',
        IZIN: 'Izin',
        SAKIT: 'Sakit',
        ALFA: 'Alfa'
      };
      activities.push({
        id: `presensi-${presensi.id}`,
        type: 'presensi',
        title: `Presensi: ${statusText[presensi.status]}`,
        timestamp: presensi.createdAt.toISOString()
      });
    });

    // Sort all activities by timestamp (newest first) and limit to 5
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // ===== 3. JUZ PROGRESS =====

    // Get all hafalan grouped by juz
    const hafalanByJuz = await prisma.hafalan.groupBy({
      by: ['juz'],
      where: { siswaId },
      _count: { id: true }
    });

    // Calculate progress per juz
    // Assuming each juz has ~20 pages, and each setoran is roughly 1-2 pages
    // We'll use a simple percentage based on count of setoran
    const juzProgress = hafalanByJuz.map(item => {
      // Simple calculation: each setoran counts toward progress
      // A typical juz might need ~10-20 setoran to complete
      // So we calculate: (count / 15) * 100, capped at 100%
      const estimatedProgress = Math.min(Math.round((item._count.id / 15) * 100), 100);

      return {
        label: `Juz ${item.juz}`,
        progress: estimatedProgress,
        juz: item.juz
      };
    });

    // Filter only juz with progress > 0 and sort by juz number
    const filteredJuzProgress = juzProgress
      .filter(juz => juz.progress > 0)
      .sort((a, b) => a.juz - b.juz);

    // ===== RETURN RESPONSE =====

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
