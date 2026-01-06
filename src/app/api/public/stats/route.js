import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [siswaCount, guruCount, setoranCount, avgNilai] = await Promise.all([
      // 1. Siswa Aktif (Status Siswa Aktif & User Account Active)
      prisma.siswa.count({
        where: {
          statusSiswa: 'AKTIF',
          user: { isActive: true }
        }
      }),
      // 2. Guru Pembina (Role GURU & User Account Active)
      prisma.user.count({
        where: {
          role: 'GURU',
          isActive: true
        }
      }),
      // 3. Setoran Tercatat (Total Hafalan records)
      prisma.hafalan.count(),
      // 4. Rata-rata Nilai (From Penilaian table)
      prisma.penilaian.aggregate({
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
