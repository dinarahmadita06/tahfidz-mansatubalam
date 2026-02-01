export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/guru/tasmi/summary-per-kelas
 * Get Tasmi summary statistics per kelas for guru
 * Returns: list of kelas with tasmi counters
 */
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Find the Guru profile ID
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    });

    if (!guru) {
      return NextResponse.json({ summary: [] });
    }

    // Get all kelas that have tasmi submissions for this guru
    const kelasList = await prisma.kelas.findMany({
      where: {
        siswa: {
          some: {
            tasmi: {
              some: {
                guruPengampuId: guru.id
              }
            }
          }
        }
      },
      select: {
        id: true,
        nama: true,
        _count: {
          select: {
            siswa: true
          }
        }
      },
      orderBy: {
        nama: 'asc'
      }
    });

    // Get tasmi statistics for each kelas
    const summaryPromises = kelasList.map(async (kelas) => {
      const tasmiStats = await prisma.tasmi.groupBy({
        by: ['statusPendaftaran'],
        where: {
          guruPengampuId: guru.id,
          siswa: {
            kelasId: kelas.id
          }
        },
        _count: true
      });

      // Count by status
      const total = tasmiStats.reduce((sum, stat) => sum + stat._count, 0);
      const menungguJadwal = tasmiStats.find(s => s.statusPendaftaran === 'MENUNGGU_JADWAL')?._count || 0;
      const perluDinilai = tasmiStats.find(s => s.statusPendaftaran === 'DIJADWALKAN')?._count || 0;
      const selesai = tasmiStats.find(s => s.statusPendaftaran === 'SELESAI')?._count || 0;
      const dibatalkan = tasmiStats.find(s => s.statusPendaftaran === 'DIBATALKAN')?._count || 0;

      // Determine if needs action
      const butuhAksi = menungguJadwal > 0 || perluDinilai > 0;

      return {
        kelasId: kelas.id,
        kelasNama: kelas.nama,
        jumlahSiswa: kelas._count.siswa,
        totalPengajuan: total,
        menungguJadwal,
        perluDinilai,
        selesai,
        dibatalkan,
        butuhAksi
      };
    });

    const summary = await Promise.all(summaryPromises);

    // Sort: Butuh Aksi first, then has submissions, then empty
    summary.sort((a, b) => {
      if (a.butuhAksi && !b.butuhAksi) return -1;
      if (!a.butuhAksi && b.butuhAksi) return 1;
      if (a.totalPengajuan > 0 && b.totalPengajuan === 0) return -1;
      if (a.totalPengajuan === 0 && b.totalPengajuan > 0) return 1;
      return a.kelasNama.localeCompare(b.kelasNama);
    });

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error fetching tasmi summary per kelas:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil ringkasan tasmi per kelas', error: error.message },
      { status: 500 }
    );
  }
}
