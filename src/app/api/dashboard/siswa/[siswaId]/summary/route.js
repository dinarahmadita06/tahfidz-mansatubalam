export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
  console.time('SUMMARY_GET_Total');
  try {
    console.time('SUMMARY_GET_Auth');
    const session = await auth();
    console.timeEnd('SUMMARY_GET_Auth');
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

    // First get school year separately since it's needed for the presence queries
    console.time('SUMMARY_GET_SchoolYear');
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
    console.timeEnd('SUMMARY_GET_SchoolYear');

    // Execute remaining queries in parallel for better performance
    console.time('SUMMARY_GET_ParallelQueries');
    const [
      progressData,
      totalHafalanCount,
      avgNilai,
      [kehadiranCount, totalHariCount],
      catatanGuruCount
    ] = await Promise.all([
      // Calculate progress
      calculateStudentProgress(prisma, siswaId, schoolYear?.id),
      // Count hafalan
      prisma.hafalan.count({ where: { siswaId } }),
      // Aggregate nilai
      prisma.penilaian.aggregate({
        where: { siswaId },
        _avg: { nilaiAkhir: true }
      }),
      // Get kehadiran stats if school year exists
      (schoolYear ? Promise.all([
        prisma.presensi.count({
          where: {
            siswaId,
            status: 'HADIR',
            tanggal: {
              gte: schoolYear.tanggalMulai,
              lte: schoolYear.tanggalSelesai
            }
          }
        }),
        prisma.presensi.count({
          where: {
            siswaId,
            tanggal: {
              gte: schoolYear.tanggalMulai,
              lte: schoolYear.tanggalSelesai
            }
          }
        })
      ]) : Promise.resolve([0, 0])),
      // Count catatan guru
      prisma.penilaian.count({
        where: {
          siswaId,
          catatan: { not: null }
        }
      })
    ]);
    console.timeEnd('SUMMARY_GET_ParallelQueries');

    const schoolTarget = schoolYear?.targetHafalan || 0;
    const totalJuzSelesai = progressData.totalJuz;

    // Get student's latest juz achieved for more accurate stats
    const studentInfo = await prisma.siswa.findUnique({
      where: { id: siswaId },
      select: { latestJuzAchieved: true }
    });

    // ===== 2. JUZ PROGRESS (PER SCHOOL YEAR) =====
    
    // Use the granular progress data from the service
    const filteredJuzProgress = progressData.juzProgress
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

    console.timeEnd('SUMMARY_GET_Total');

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
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
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
