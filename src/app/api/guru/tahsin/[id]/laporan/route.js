import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch laporan progres tahsin per kelas
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const { id } = params; // id is kelasId

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get kelas data
    const kelas = await prisma.kelas.findUnique({
      where: { id: id },
      select: {
        id: true,
        nama: true,
      },
    });

    if (!kelas) {
      return NextResponse.json(
        { message: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get all siswa in this kelas with their tahsin records
    const siswaList = await prisma.siswa.findMany({
      where: {
        kelasId: id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        tahsin: {
          where: {
            guruId: guru.id,
          },
          orderBy: {
            tanggal: 'desc',
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Total surat in Quran (114 surat)
    const TOTAL_SURAT = 114;

    // Process data for each siswa
    const laporanData = siswaList.map((siswa) => {
      // Get unique surat that have been completed
      const suratSelesai = new Set();

      siswa.tahsin.forEach((record) => {
        // Extract surat numbers from materiHariIni and bacaanDipraktikkan
        // Expected format: "Surat Al-Fatihah", "QS. Al-Baqarah", etc.
        const materiMatches = record.materiHariIni?.match(/\d+/g);
        const bacaanMatches = record.bacaanDipraktikkan?.match(/\d+/g);

        if (materiMatches) {
          materiMatches.forEach(num => {
            const suratNum = parseInt(num);
            if (suratNum >= 1 && suratNum <= 114) {
              suratSelesai.add(suratNum);
            }
          });
        }

        if (bacaanMatches) {
          bacaanMatches.forEach(num => {
            const suratNum = parseInt(num);
            if (suratNum >= 1 && suratNum <= 114) {
              suratSelesai.add(suratNum);
            }
          });
        }
      });

      const totalSurat = suratSelesai.size;
      const progressPercentage = Math.round((totalSurat / TOTAL_SURAT) * 100);

      return {
        siswaId: siswa.id,
        nis: siswa.nis,
        nama: siswa.user.name,
        totalSurat: totalSurat,
        progressPercentage: progressPercentage,
        totalRecords: siswa.tahsin.length,
        lastUpdate: siswa.tahsin.length > 0 ? siswa.tahsin[0].tanggal : null,
      };
    });

    return NextResponse.json({
      kelas: kelas,
      laporan: laporanData,
      summary: {
        totalSiswa: laporanData.length,
        rataRataProgres: laporanData.length > 0
          ? Math.round(laporanData.reduce((sum, item) => sum + item.progressPercentage, 0) / laporanData.length)
          : 0,
        totalSuratSelesai: laporanData.reduce((sum, item) => sum + item.totalSurat, 0),
      },
    });
  } catch (error) {
    console.error('Error fetching laporan tahsin:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
