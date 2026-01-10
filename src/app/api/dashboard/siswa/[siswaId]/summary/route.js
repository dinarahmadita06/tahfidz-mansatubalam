import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calculateStudentProgress } from '@/lib/services/siswaProgressService';

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
    const { siswaId } = await params;

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
        select: { id: true, latestJuzAchieved: true }
      });
      authorized = siswa && siswa.id === siswaId;
      if (authorized) {
        session.user.latestJuzAchieved = siswa.latestJuzAchieved;
      }
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

      if (siswa && session.user.guruId) {
        const guruKelas = await prisma.guruKelas.findFirst({
          where: {
            guruId: session.user.guruId,
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

    // Get active school year precisely
    const schoolYear = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        nama: true,
        semester: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        targetHafalan: true
      }
    });

    const schoolTarget = schoolYear?.targetHafalan || 0;

    // Use centralized service for progress calculation
    const progressData = await calculateStudentProgress(prisma, siswaId, schoolYear?.id);
    const totalJuzSelesai = progressData.totalJuz;

    // Get total hafalan selesai (setoran count - all time)
    const totalHafalanCount = await prisma.hafalan.count({
      where: { siswaId }
    });

    // Get rata-rata nilai dari penilaian (all time)
    const avgNilai = await prisma.penilaian.aggregate({
      where: { siswaId },
      _avg: { nilaiAkhir: true }
    });

    // Get kehadiran stats (tahun ajaran aktif)
    let kehadiranCount = 0;
    let totalHariCount = 0;

    if (schoolYear) {
      kehadiranCount = await prisma.presensi.count({
        where: {
          siswaId,
          status: 'HADIR',
          tanggal: {
            gte: schoolYear.tanggalMulai,
            lte: schoolYear.tanggalSelesai
          }
        }
      });

      totalHariCount = await prisma.presensi.count({
        where: {
          siswaId,
          tanggal: {
            gte: schoolYear.tanggalMulai,
            lte: schoolYear.tanggalSelesai
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

    // Get student's latest juz achieved for more accurate stats
    const studentInfo = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { latestJuzAchieved: true }
    });

    // ===== 2. JUZ PROGRESS (PER SCHOOL YEAR) =====

    const juzProgress = progressData.uniqueJuzs.map(juz => {
      // For progress bar visualization, we might still want to count records per juz
      // but the centralized service currently only gives unique juzs.
      // To maintain the "10 setoran = 100%" logic, we need to count again.
      return {
        label: `Juz ${juz}`,
        progress: 100, // For dashboard summary, we show achieved juzs as 100% or we can refine
        juz: juz
      };
    });

    const filteredJuzProgress = juzProgress
      .filter(juz => juz.progress > 0)
      .sort((a, b) => a.juz - b.juz);

    // ===== 3. TARGET SEKOLAH & PROGRESS =====
    
    const targetJuzSekolah = schoolYear?.targetHafalan || null;
    
    // Calculate progress percent
    const progressPercent = targetJuzSekolah 
      ? Math.min(100, Math.round((totalJuzSelesai / targetJuzSekolah) * 100))
      : null;

    console.log(`[DEBUG/DASHBOARD] Student ${siswaId} Summary (Active Year):
    - Total Juz: ${totalJuzSelesai}
    - School Target: ${targetJuzSekolah}
    - Progress: ${progressPercent}%
    - Setoran Count: ${totalHafalanCount}
    - School Year: ${schoolYear?.nama || 'None'}
    `);

    const stats = {
      hafalanSelesai: totalJuzSelesai,
      totalHafalan: schoolTarget, 
      rataRataNilai: Math.round(avgNilai._avg.nilaiAkhir || 0),
      kehadiran: kehadiranCount || 0,
      totalHari: totalHariCount || 0,
      catatanGuru: catatanGuruCount || 0,
      totalJuz: totalJuzSelesai
    };

    // ===== 4. QUOTE =====

    const quote = "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.";

    // ===== RETURN RESPONSE =====

    return NextResponse.json(
      {
        stats,
        juzProgress: filteredJuzProgress,
        targetJuzSekolah,
        tahunAjaranAktif: schoolYear ? {
          id: schoolYear.id,
          nama: schoolYear.nama,
          semester: schoolYear.semester,
          targetJuz: schoolYear.targetHafalan,
          startDate: schoolYear.tanggalMulai,
          endDate: schoolYear.tanggalSelesai
        } : null,
        totalJuzSelesai,
        progressPercent,
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
