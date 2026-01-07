import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * GET /api/tahun-ajaran/aktif
 * Fetch active tahun ajaran with target hafalan
 * Used by dashboard and other components to display consistent target
 */
export async function GET() {
  try {
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        nama: true,
        semester: true,
        tahun: true,
        targetHafalan: true,
        tanggalMulai: true,
        tanggalSelesai: true,
        isActive: true
      }
    });

    if (!activeTahunAjaran) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active tahun ajaran found'
      });
    }

    return NextResponse.json({
      success: true,
      data: activeTahunAjaran
    });
  } catch (error) {
    console.error('[Tahun Ajaran Aktif] Error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch active tahun ajaran',
        details: error.message
      },
      { status: 500 }
    );
  }
}
