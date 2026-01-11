export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/tahun-ajaran/summary
 * 
 * Returns summary statistics for the active tahun ajaran:
 * - jumlahKelas: count of kelas in active tahun ajaran
 * - jumlahSiswa: count of active siswa in those kelas
 * 
 * Response:
 * {
 *   "jumlahKelas": 4,
 *   "jumlahSiswa": 180,
 *   "activeTahunAjaranId": "tahun-ajaran-id"
 * }
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find active tahun ajaran
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { id: true }
    });

    if (!activeTahunAjaran) {
      // No active tahun ajaran
      return NextResponse.json({
        jumlahKelas: 0,
        jumlahSiswa: 0,
        activeTahunAjaranId: null
      });
    }

    // Count kelas in active tahun ajaran
    const jumlahKelas = await prisma.kelas.count({
      where: {
        tahunAjaranId: activeTahunAjaran.id
      }
    });

    // Count siswa in kelas of active tahun ajaran
    const jumlahSiswa = await prisma.siswa.count({
      where: {
        kelas: {
          tahunAjaranId: activeTahunAjaran.id
        }
      }
    });

    return NextResponse.json({
      jumlahKelas,
      jumlahSiswa,
      activeTahunAjaranId: activeTahunAjaran.id
    });
  } catch (error) {
    console.error('Error fetching tahun ajaran summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
