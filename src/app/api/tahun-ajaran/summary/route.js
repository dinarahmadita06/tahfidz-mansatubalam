export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * GET /api/tahun-ajaran/summary
 * 
 * Returns summary statistics:
 * - jumlahKelas: count of kelas in active tahun ajaran
 * - jumlahSiswa: total count of all siswa (all periods, all statuses)
 * - siswaAktif: count of siswa with status = approved (tervalidasi)
 * - siswaPending: count of siswa with status = pending (belum divalidasi)
 * 
 * Response:
 * {
 *   "jumlahKelas": 4,
 *   "jumlahSiswa": 8,
 *   "siswaAktif": 7,
 *   "siswaPending": 1,
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

    // Helper function to get siswa statistics
    const getSiswaStats = async () => {
      const [totalSiswa, siswaAktif, siswaPending] = await Promise.all([
        // Total siswa (semua status, semua periode)
        prisma.siswa.count(),
        // Siswa aktif = sudah divalidasi (approved)
        prisma.siswa.count({
          where: { status: 'approved' }
        }),
        // Siswa pending = belum divalidasi
        prisma.siswa.count({
          where: { status: 'pending' }
        })
      ]);

      return {
        totalSiswa,
        siswaAktif,
        siswaPending
      };
    };

    if (!activeTahunAjaran) {
      // No active tahun ajaran, but still return siswa stats
      const siswaStats = await getSiswaStats();
      
      return NextResponse.json({
        jumlahKelas: 0,
        jumlahSiswa: siswaStats.totalSiswa,
        siswaAktif: siswaStats.siswaAktif,
        siswaPending: siswaStats.siswaPending,
        activeTahunAjaranId: null
      });
    }

    // Count kelas in active tahun ajaran
    const jumlahKelas = await prisma.kelas.count({
      where: {
        tahunAjaranId: activeTahunAjaran.id
      }
    });

    // Get siswa statistics (all periods)
    const siswaStats = await getSiswaStats();

    return NextResponse.json({
      jumlahKelas,
      jumlahSiswa: siswaStats.totalSiswa,
      siswaAktif: siswaStats.siswaAktif,
      siswaPending: siswaStats.siswaPending,
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
