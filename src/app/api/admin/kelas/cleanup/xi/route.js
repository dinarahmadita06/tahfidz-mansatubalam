export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/kelas/cleanup/xi?execute=1
 * Membersihkan kelas XI agar hanya menyisakan: "XI F1", "XI F2", "XI F3", "XI F4"
 * - Kelas XI lain (mis. "XI F1.10", "XI F2.3", dst) dianggap berlebih.
 * - Jika kelas berlebih tidak punya siswa => dihapus (DELETE)
 * - Jika masih ada siswa => status di-set "NONAKTIF" (tidak dihapus untuk keamanan data)
 * 
 * Query:
 * - execute=1 → jalankan perubahan; tanpa parameter → dry-run (hanya listing)
 */
export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const execute = searchParams.get('execute') === '1';

    // Daftar FINAL kelas XI yang diperbolehkan (total 16)
    // Sesuai gambar: XI F1.1–XI F1.10, XI F2.1–XI F2.4, XI F3, XI F4
    const allowed = new Set([
      'XI F1.1','XI F1.2','XI F1.3','XI F1.4','XI F1.5',
      'XI F1.6','XI F1.7','XI F1.8','XI F1.9','XI F1.10',
      'XI F2.1','XI F2.2','XI F2.3','XI F2.4',
      'XI F3','XI F4'
    ]);

    // Ambil semua kelas XI
    const xiClasses = await prisma.kelas.findMany({
      where: {
        nama: { startsWith: 'XI ' }
      },
      select: {
        id: true,
        nama: true,
        status: true,
        _count: { select: { siswa: true } }
      },
      orderBy: { nama: 'asc' }
    });

    const toKeep = [];
    const toDeleteCandidates = [];
    const toDeactivate = [];

    for (const k of xiClasses) {
      if (allowed.has(k.nama)) {
        toKeep.push(k);
      } else {
        if (k._count.siswa === 0) {
          toDeleteCandidates.push(k);
        } else {
          toDeactivate.push(k);
        }
      }
    }

    let deleted = 0;
    let deactivated = 0;

    if (execute) {
      // Hapus kelas tanpa siswa
      for (const k of toDeleteCandidates) {
        await prisma.kelas.delete({ where: { id: k.id } });
        deleted++;
      }

      // Nonaktifkan kelas yang masih punya siswa
      for (const k of toDeactivate) {
        if (k.status !== 'NONAKTIF') {
          await prisma.kelas.update({
            where: { id: k.id },
            data: { status: 'NONAKTIF' }
          });
          deactivated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      execute,
      summary: {
        totalXI: xiClasses.length,
        kept: toKeep.length,
        extra: toDeleteCandidates.length + toDeactivate.length,
        deletable: toDeleteCandidates.length,
        withStudents: toDeactivate.length,
        deleted: execute ? deleted : 0,
        deactivated: execute ? deactivated : 0
      },
      keptList: toKeep.map(k => ({ id: k.id, nama: k.nama })),
      deletableList: toDeleteCandidates.map(k => ({ id: k.id, nama: k.nama })),
      withStudentsList: toDeactivate.map(k => ({ id: k.id, nama: k.nama, siswa: k._count.siswa }))
    });
  } catch (error) {
    console.error('[XI CLEANUP] Error:', error);
    return NextResponse.json(
      { error: 'Gagal membersihkan kelas XI', details: error.message },
      { status: 500 }
    );
  }
}

