import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/siswa/auto-deactivate
 *
 * Nonaktifkan otomatis akun siswa yang:
 * - statusSiswa masih AKTIF
 * - sudah melewati ambang waktu sejak Tahun Ajaran Masuk:
 *   default 24 bulan (≈ 2 tahun) atau setara ≥ 4 semester
 *
 * Kebijakan:
 * - Hanya set user.isActive = false
 * - Set siswa.tanggalKeluar = now (jika belum diisi)
 * - TIDAK mengubah siswa.statusSiswa (tetap AKTIF sesuai permintaan)
 * - Sinkronkan akun orang tua: aktif jika masih punya ≥1 anak berstatus AKTIF
 *
 * Konfigurasi ambang (opsional via env):
 * - AUTO_DEACTIVATE_MONTHS (default: 24)
 */
export async function POST(request) {
  try {
    const secret = process.env.CRON_SECRET || '';
    const incomingToken =
      request.headers.get('x-cron-secret') ||
      (request.url ? new URL(request.url).searchParams.get('token') : null);
    const isVercelCron = !!request.headers.get('x-vercel-cron');
    let authorized = false;
    if (isVercelCron) {
      // Triggered by Vercel Scheduled Cron (no session / no token)
      authorized = true;
    } else if (secret && incomingToken && incomingToken === secret) {
      authorized = true;
    } else {
      const session = await auth();
      if (session && session.user.role === 'ADMIN') {
        authorized = true;
      }
    }
    if (!authorized) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const THRESHOLD_MONTHS = parseInt(process.env.AUTO_DEACTIVATE_MONTHS || '24', 10);
    const now = new Date();

    // Ambil semua siswa AKTIF dengan TA masuk (fallback ke createdAt jika tidak ada)
    const siswaList = await prisma.siswa.findMany({
      where: { statusSiswa: 'AKTIF' },
      select: {
        id: true,
        userId: true,
        tanggalKeluar: true,
        createdAt: true,
        tahunAjaranMasuk: { select: { tanggalMulai: true } },
      },
    });

    // Tentukan siapa yang melewati ambang waktu
    const toDeactivateUserIds = [];
    const toDeactivateSiswaIds = [];

    for (const s of siswaList) {
      const masukDate = s.tahunAjaranMasuk?.tanggalMulai ?? s.createdAt;
      if (!masukDate) continue;
      const diffMonths =
        (now.getFullYear() - masukDate.getFullYear()) * 12 + (now.getMonth() - masukDate.getMonth());
      if (diffMonths >= THRESHOLD_MONTHS) {
        toDeactivateUserIds.push(s.userId);
        toDeactivateSiswaIds.push(s.id);
      }
    }

    let updatedStudents = 0;
    if (toDeactivateUserIds.length > 0) {
      const res = await prisma.user.updateMany({
        where: { id: { in: toDeactivateUserIds } },
        data: { isActive: false },
      });
      updatedStudents = res.count;

      // Set tanggalKeluar untuk siswa yang dinonaktifkan (jika belum ada)
      await prisma.siswa.updateMany({
        where: { id: { in: toDeactivateSiswaIds }, tanggalKeluar: null },
        data: { tanggalKeluar: now },
      });
    }

    // Sinkronisasi status akun orang tua (berdasarkan anak aktif)
    const allParents = await prisma.orangTua.findMany({ select: { userId: true } });
    const activeParents = await prisma.orangTua.findMany({
      where: { orangTuaSiswa: { some: { siswa: { statusSiswa: 'AKTIF' } } } },
      select: { userId: true },
    });
    const activeParentUserIds = new Set(activeParents.map((p) => p.userId));
    const allParentUserIds = allParents.map((p) => p.userId);
    const pToActive = allParentUserIds.filter((id) => activeParentUserIds.has(id));
    const pToInactive = allParentUserIds.filter((id) => !activeParentUserIds.has(id));

    let updatedParents = 0;
    if (pToActive.length > 0) {
      const res = await prisma.user.updateMany({
        where: { id: { in: pToActive } },
        data: { isActive: true },
      });
      updatedParents += res.count;
    }
    if (pToInactive.length > 0) {
      const res = await prisma.user.updateMany({
        where: { id: { in: pToInactive } },
        data: { isActive: false },
      });
      updatedParents += res.count;
    }

    return NextResponse.json({
      success: true,
      thresholdMonths: THRESHOLD_MONTHS,
      affectedStudents: toDeactivateSiswaIds.length,
      updatedStudents,
      updatedParents,
    });
  } catch (error) {
    console.error('Auto-deactivate error:', error);
    return NextResponse.json(
      { error: 'Failed to auto-deactivate', details: error.message },
      { status: 500 }
    );
  }
}
