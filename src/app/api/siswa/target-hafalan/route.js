import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/siswa/target-hafalan
 * 
 * Fetch target hafalan dari tahun ajaran aktif
 * 
 * Response:
 * {
 *   "targetJuz": 4,
 *   "tahunAjaran": "2025/2026",
 *   "semester": 2,
 *   "tanggalMulai": "2025-07-01T00:00:00.000Z",
 *   "tanggalSelesai": "2025-12-31T23:59:59.999Z"
 * }
 * 
 * Jika target null:
 * {
 *   "targetJuz": null,
 *   "message": "Admin belum mengatur target"
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active tahun ajaran
    const tahunAjaran = await prisma.tahunAjaran.findFirst({
      where: {
        isActive: true
      },
      select: {
        id: true,
        nama: true,
        semester: true,
        targetHafalan: true,
        tanggalMulai: true,
        tanggalSelesai: true
      }
    });

    if (!tahunAjaran) {
      console.log('[TARGET HAFALAN] No active tahun ajaran found');
      return NextResponse.json({
        targetJuz: null,
        message: 'Tahun ajaran aktif tidak ditemukan'
      });
    }

    // Check if target is set
    if (!tahunAjaran.targetHafalan) {
      console.log('[TARGET HAFALAN] Target not set for tahun ajaran:', tahunAjaran.id);
      return NextResponse.json({
        targetJuz: null,
        tahunAjaran: tahunAjaran.nama,
        semester: tahunAjaran.semester,
        message: 'Admin belum mengatur target'
      });
    }

    console.log(`[TARGET HAFALAN] Fetched target ${tahunAjaran.targetHafalan} juz for ${tahunAjaran.nama}`);

    return NextResponse.json({
      targetJuz: tahunAjaran.targetHafalan,
      tahunAjaran: tahunAjaran.nama,
      semester: tahunAjaran.semester,
      tanggalMulai: tahunAjaran.tanggalMulai,
      tanggalSelesai: tahunAjaran.tanggalSelesai
    });

  } catch (error) {
    console.error('Error fetching target hafalan:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch target hafalan',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
