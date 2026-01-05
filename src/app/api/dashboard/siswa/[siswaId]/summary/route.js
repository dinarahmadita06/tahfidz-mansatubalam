import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/dashboard/siswa/{siswaId}/summary
 * 
 * Unified endpoint for dashboard summary data
 * Used by both student dashboard and parent dashboard
 * 
 * Security:
 * - SISWA role: Can only access their own data (siswaId == their siswaId)
 * - ORANG_TUA role: Can only access connected children (siswaId must be in orangTuaSiswa)
 * - GURU role: Can access students in their classes
 * - ADMIN role: Can access any student
 * 
 * Returns:
 * {
 *   stats: { hafalanSelesai, totalHafalan, rataRataNilai, kehadiran, totalHari, catatanGuru },
 *   juzProgress: [{ label, progress, juz }],
 *   quote: string,
 *   lastUpdated: timestamp
 * }
 */
export async function GET(req, { params }) {
  try {
    const session = await auth();
    const { siswaId } = params;

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ===== AUTHORIZATION CHECK =====

    let authorized = false;

    if (session.user.role === 'SISWA') {
      // SISWA can only access their own dashboard
      const siswa = await prisma.siswa.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });
      authorized = siswa && siswa.id === siswaId;
    } else if (session.user.role === 'ORANG_TUA') {
      // ORANG_TUA can only access their connected children
      const orangTua = await prisma.orangTua.findFirst({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (orangTua) {
        const isConnected = await prisma.orangTuaSiswa.findFirst({
          where: {
            orangTuaId: orangTua.id,
            siswaId: siswaId
          }
        });
        authorized = !!isConnected;
      }
    } else if (session.user.role === 'GURU') {
      // GURU can access students in their classes
      const siswa = await prisma.siswa.findUnique({
        where: { id: siswaId },
        select: { kelasId: true }
      });

      if (siswa) {
        const guruKelas = await prisma.guruKelas.findFirst({
          where: {
            guruId: session.user.id,
            kelasId: siswa.kelasId
          }
        });
        authorized = !!guruKelas;
      }
    } else if (session.user.role === 'ADMIN') {
      // ADMIN can access any student
      const siswaExists = await prisma.siswa.findUnique({
        where: { id: siswaId }
      });
      authorized = !!siswaExists;
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden - Access denied to this student data' },
        { status: 403 }
      );
    }

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
      totalHafalan: targetHafalan?.targetJuz || 0,
      rataRataNilai: Math.round(avgNilai._avg.nilaiAkhir || 0),
      kehadiran: kehadiranCount || 0,
      totalHari: totalHariCount || 0,
      catatanGuru: catatanGuruCount || 0
    };

    // ===== 2. JUZ PROGRESS =====

    const hafalanByJuz = await prisma.hafalan.groupBy({
      by: ['juz'],
      where: { siswaId },
      _count: { id: true }
    });

    const juzProgress = hafalanByJuz.map(item => {
      const estimatedProgress = Math.min(Math.round((item._count.id / 15) * 100), 100);
      return {
        label: `Juz ${item.juz}`,
        progress: estimatedProgress,
        juz: item.juz
      };
    });

    const filteredJuzProgress = juzProgress
      .filter(juz => juz.progress > 0)
      .sort((a, b) => a.juz - b.juz);

    // ===== 3. QUOTE =====

    const quote = "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.";

    // ===== RETURN RESPONSE =====

    return NextResponse.json(
      {
        stats,
        juzProgress: filteredJuzProgress,
        quote,
        lastUpdated: new Date().toISOString()
      },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
