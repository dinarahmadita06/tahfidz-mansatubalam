export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const [siswaCount, guruCount, setoranCount, avgNilai] = await Promise.all([
      // 1. Siswa Aktif (Status approved - tervalidasi)
      prisma.siswa.count({
        where: {
          status: 'approved'
        }
      }),
      // 2. Guru Pembina (Total records in Guru table)
      prisma.guru.count(),
      // 3. Setoran Tercatat (Total Hafalan records from approved students)
      prisma.hafalan.count({
        where: {
          siswa: {
            status: 'approved'
          }
        }
      }),
      // 4. Rata-rata Nilai (From Penilaian table for approved students)
      prisma.penilaian.aggregate({
        where: {
          siswa: {
            status: 'approved'
          }
        },
        _avg: {
          nilaiAkhir: true
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        siswaAktif: siswaCount || 0,
        guruPembina: guruCount || 0,
        setoranTercatat: setoranCount || 0,
        rataRataNilai: avgNilai._avg.nilaiAkhir ? parseFloat(avgNilai._avg.nilaiAkhir.toFixed(1)) : 0
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengambil data statistik',
      data: {
        siswaAktif: 0,
        guruPembina: 0,
        setoranTercatat: 0,
        rataRataNilai: 0
      }
    }, { status: 500 });
  }
}
