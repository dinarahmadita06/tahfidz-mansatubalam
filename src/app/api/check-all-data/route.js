export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Count all tables
    const counts = {
      // Users & Profiles
      users: await prisma.user.count(),
      siswa: await prisma.siswa.count(),
      guru: await prisma.guru.count(),
      orangTua: await prisma.orangTua.count(),

      // Academic
      kelas: await prisma.kelas.count(),
      tahunAjaran: await prisma.tahunAjaran.count(),
      guruKelas: await prisma.guruKelas.count(),

      // Hafalan
      hafalan: await prisma.hafalan.count(),
      targetHafalan: await prisma.targetHafalan.count(),
      tasmi: await prisma.tasmi.count(),

      // Assessment
      penilaian: await prisma.penilaian.count(),
      tahsin: await prisma.tahsin.count(),

      // Attendance
      presensi: await prisma.presensi.count(),

      // Master Data
      surah: await prisma.surah.count(),

      // Others
      pengumuman: await prisma.pengumuman.count(),
      bukuDigital: await prisma.bukuDigital.count(),
      logActivity: await prisma.logActivity.count(),

      // Relations
      orangTuaSiswa: await prisma.orangTuaSiswa.count(),
    };

    return NextResponse.json({
      success: true,
      counts: counts,
      total: Object.values(counts).reduce((a, b) => a + b, 0)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check data', details: error.message },
      { status: 500 }
    );
  }
}
