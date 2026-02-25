export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/kelas/seed/xii?execute=1
 *
 * Menjamin daftar kelas XII sesuai spesifikasi:
 * - XII F1.1 – XII F1.10
 * - XII F2.1 – XII F2.4
 * - XII F3, XII F4
 *
 * Tanpa execute=1 → dry-run (hanya listing yang perlu dibuat)
 * Dengan execute=1 → membuat kelas yang belum ada (status default, targetJuz=1)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const execute = searchParams.get('execute') === '1';

    // Daftar target
    const required = [
      'XII F1.1','XII F1.2','XII F1.3','XII F1.4','XII F1.5',
      'XII F1.6','XII F1.7','XII F1.8','XII F1.9','XII F1.10',
      'XII F2.1','XII F2.2','XII F2.3','XII F2.4',
      'XII F3','XII F4'
    ];
    const requiredSet = new Set(required);

    // Ambil semua kelas XII yang ada
    const existing = await prisma.kelas.findMany({
      where: { nama: { startsWith: 'XII ' } },
      select: { id: true, nama: true }
    });
    const existingNames = new Set(existing.map(k => k.nama));

    const missing = required.filter(n => !existingNames.has(n));

    let created = [];
    if (execute && missing.length > 0) {
      // Cari Tahun Ajaran aktif
      const activeTA = await prisma.tahunAjaran.findFirst({
        where: { isActive: true },
        select: { id: true }
      });
      if (!activeTA) {
        return NextResponse.json(
          { error: 'Tahun ajaran aktif tidak ditemukan. Atur tahun ajaran aktif terlebih dahulu.' },
          { status: 400 }
        );
      }

      // Buat kelas yang belum ada
      for (const nama of missing) {
        const k = await prisma.kelas.create({
          data: {
            nama,
            tahunAjaranId: activeTA.id,
            targetJuz: 1
          },
          select: { id: true, nama: true }
        });
        created.push(k);
      }
    }

    return NextResponse.json({
      success: true,
      execute,
      requiredCount: required.length,
      existingCount: existing.length,
      missingCount: missing.length,
      missingList: missing,
      created
    });
  } catch (error) {
    console.error('[SEED XII] Error:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan kelas XII', details: error.message },
      { status: 500 }
    );
  }
}

