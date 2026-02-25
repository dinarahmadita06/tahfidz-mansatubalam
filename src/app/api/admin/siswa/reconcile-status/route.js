import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/admin/siswa/reconcile-status
 * Sinkronkan user.isActive dengan siswa.statusSiswa (legacy fix)
 * - SISWA: user.isActive = (statusSiswa === 'AKTIF')
 * - ORANG TUA: user.isActive = punya ≥1 anak berstatus 'AKTIF'
 */
export async function POST() {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch student-user mappings in one go
    const students = await prisma.siswa.findMany({
      select: { statusSiswa: true, userId: true }
    });

    const aktifUserIds = students.filter(s => s.statusSiswa === 'AKTIF').map(s => s.userId);
    const nonAktifUserIds = students.filter(s => s.statusSiswa !== 'AKTIF').map(s => s.userId);

    // Batch update students' user accounts using updateMany with IN clause
    let updatedStudents = 0;
    if (aktifUserIds.length > 0) {
      const res = await prisma.user.updateMany({
        where: { id: { in: aktifUserIds } },
        data: { isActive: true }
      });
      updatedStudents += res.count;
    }
    if (nonAktifUserIds.length > 0) {
      const res = await prisma.user.updateMany({
        where: { id: { in: nonAktifUserIds } },
        data: { isActive: false }
      });
      updatedStudents += res.count;
    }

    // Determine parent activation using relation filters (no per-parent loop)
    const allParents = await prisma.orangTua.findMany({ select: { userId: true } });
    const activeParents = await prisma.orangTua.findMany({
      where: { orangTuaSiswa: { some: { siswa: { statusSiswa: 'AKTIF' } } } },
      select: { userId: true }
    });

    const activeParentUserIds = new Set(activeParents.map(p => p.userId));
    const allParentUserIds = allParents.map(p => p.userId);
    const toActive = allParentUserIds.filter(id => activeParentUserIds.has(id));
    const toInactive = allParentUserIds.filter(id => !activeParentUserIds.has(id));

    let updatedParents = 0;
    if (toActive.length > 0) {
      const resA = await prisma.user.updateMany({
        where: { id: { in: toActive } },
        data: { isActive: true }
      });
      updatedParents += resA.count;
    }
    if (toInactive.length > 0) {
      const resI = await prisma.user.updateMany({
        where: { id: { in: toInactive } },
        data: { isActive: false }
      });
      updatedParents += resI.count;
    }

    return NextResponse.json({
      success: true,
      updatedStudents,
      updatedParents
    });
  } catch (error) {
    console.error('Reconcile status error:', error);
    return NextResponse.json(
      { error: 'Failed to reconcile statuses', details: error.message },
      { status: 500 }
    );
  }
}
