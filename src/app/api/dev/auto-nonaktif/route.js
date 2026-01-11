export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DEV UTILITY ONLY - Auto-deactivate graduated students and their parents
 * POST /api/dev/auto-nonaktif
 * 
 * Checks all students with statusSiswa=LULUS and lulusAt set
 * If (today > lulusAt + GRACE_PERIOD_DAYS), deactivates student and connected parents
 */
export async function POST(request) {
  try {
    // Security: Only allow in development/local environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || '90');
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);

    console.log(`🔍 [AUTO-NONAKTIF] Running auto-deactivation job...`);
    console.log(`   Grace period: ${gracePeriodDays} days`);
    console.log(`   Cutoff date: ${cutoffDate.toISOString()}`);

    // Find all graduated students whose grace period has expired
    const expiredGraduates = await prisma.siswa.findMany({
      where: {
        statusSiswa: 'LULUS',
        lulusAt: {
          lte: cutoffDate
        }
      },
      include: {
        user: {
          select: { id: true, email: true, name: true }
        },
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
                user: {
                  select: { id: true, email: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    console.log(`📊 Found ${expiredGraduates.length} students eligible for deactivation`);

    let deactivatedStudents = 0;
    let deactivatedParents = 0;
    const results = [];

    // Process each expired graduate
    for (const siswa of expiredGraduates) {
      try {
        // Deactivate student account
        await prisma.user.update({
          where: { id: siswa.userId },
          data: { isActive: false }
        });
        deactivatedStudents++;
        results.push({
          siswaId: siswa.id,
          siswaEmail: siswa.user.email,
          siswaName: siswa.user.name,
          lulusAt: siswa.lulusAt,
          status: 'deactivated'
        });

        console.log(`✅ Deactivated student: ${siswa.user.email} (lulus: ${siswa.lulusAt?.toISOString().split('T')[0]})`);

        // Deactivate connected parents
        for (const relation of siswa.orangTuaSiswa) {
          await prisma.user.update({
            where: { id: relation.orangTua.userId },
            data: { isActive: false }
          });
          deactivatedParents++;
          console.log(`✅ Deactivated parent: ${relation.orangTua.user.email}`);
        }
      } catch (error) {
        console.error(`❌ Error deactivating student ${siswa.id}:`, error.message);
        results.push({
          siswaId: siswa.id,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-deactivation completed`,
      statistics: {
        gracePeriodDays,
        cutoffDate: cutoffDate.toISOString(),
        expiredGraduatesFound: expiredGraduates.length,
        studentsDeactivated: deactivatedStudents,
        parentsDeactivated: deactivatedParents
      },
      details: results
    });
  } catch (error) {
    console.error('❌ [AUTO-NONAKTIF] Error:', error);
    return NextResponse.json(
      { error: 'Failed to run auto-deactivation job', details: error.message },
      { status: 500 }
    );
  }
}
