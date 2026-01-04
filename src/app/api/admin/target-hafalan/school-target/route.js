import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

// PATCH - Update target hafalan sekolah global
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { schoolTarget } = body;

    if (schoolTarget === undefined) {
      return NextResponse.json(
        { success: false, message: 'Target sekolah harus diisi' },
        { status: 400 }
      );
    }

    // Validasi target minimal 0.5 juz, maksimal 30 juz
    if (schoolTarget < 0.5 || schoolTarget > 30) {
      return NextResponse.json(
        { success: false, message: 'Target hafalan harus antara 0.5 - 30 juz' },
        { status: 400 }
      );
    }

    // Update atau create record untuk menyimpan school target global
    // Menggunakan ID khusus 'school-target-global' untuk menyimpan nilai global
    const result = await prisma.targetHafalan.upsert({
      where: { id: 'school-target-global' },
      update: {
        targetJuz: Math.round(schoolTarget * 2) / 2 // Keep decimal precision
      },
      create: {
        id: 'school-target-global',
        targetJuz: Math.round(schoolTarget * 2) / 2,
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear()
      }
    });

    // ✅ Log activity - Set target hafalan
    await logActivity({
      actorId: session.user.id,
      actorRole: 'ADMIN',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.ADMIN_SET_TARGET,
      title: 'Set target hafalan sekolah',
      description: `Mengatur target hafalan sekolah menjadi ${schoolTarget} juz per tahun`,
      metadata: {
        schoolTarget,
        targetId: 'school-target-global',
        bulan: new Date().getMonth() + 1,
        tahun: new Date().getFullYear(),
      },
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json({
      success: true,
      message: 'Target hafalan sekolah berhasil diperbarui',
      data: result
    });

  } catch (error) {
    console.error('Error updating school target:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui target sekolah' },
      { status: 500 }
    );
  }
}

// GET - Ambil target hafalan sekolah global
export async function GET(request) {
  try {
    const schoolTargetRecord = await prisma.targetHafalan.findUnique({
      where: { id: 'school-target-global' }
    });

    const schoolTarget = schoolTargetRecord?.targetJuz || 2; // Default 2 juz

    return NextResponse.json({
      success: true,
      data: {
        schoolTarget,
        record: schoolTargetRecord
      }
    });

  } catch (error) {
    console.error('Error fetching school target:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat target sekolah' },
      { status: 500 }
    );
  }
}
