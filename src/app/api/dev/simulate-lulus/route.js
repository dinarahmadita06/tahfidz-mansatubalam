export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * DEV UTILITY ONLY - Simulate student graduation
 * POST /api/dev/simulate-lulus?siswaId=...&daysAgo=...
 * 
 * Sets siswa statusSiswa=LULUS
 * Sets lulusAt to N days ago (for testing grace period expiration)
 * Then runs auto-deactivation to verify it works
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

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const daysAgo = parseInt(searchParams.get('daysAgo') || '0');

    if (!siswaId) {
      return NextResponse.json(
        { error: 'Missing siswaId parameter' },
        { status: 400 }
      );
    }

    console.log(`📋 [SIMULATE-LULUS] Simulating graduation...`);
    console.log(`   Siswa ID: ${siswaId}`);
    console.log(`   Set lulusAt to ${daysAgo} days ago`);

    // Verify siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa not found', siswaId },
        { status: 404 }
      );
    }

    // Calculate lulusAt date (N days ago)
    const lulusAt = new Date();
    lulusAt.setDate(lulusAt.getDate() - daysAgo);

    // Update siswa to LULUS status
    const updatedSiswa = await prisma.siswa.update({
      where: { id: siswaId },
      data: {
        statusSiswa: 'LULUS',
        lulusAt: lulusAt,
        tanggalKeluar: lulusAt
      },
      include: {
        user: { select: { email: true, name: true } },
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
                user: { select: { email: true, name: true } }
              }
            }
          }
        }
      }
    });

    console.log(`✅ Set student to LULUS status`);
    console.log(`   Siswa: ${updatedSiswa.user.email} (${updatedSiswa.user.name})`);
    console.log(`   LulusAt: ${lulusAt.toISOString().split('T')[0]}`);
    console.log(`   Connected parents: ${updatedSiswa.orangTuaSiswa.length}`);

    // Now run auto-deactivation check
    console.log(`\n🔄 Running auto-deactivation check...`);

    const gracePeriodDays = parseInt(process.env.GRACE_PERIOD_DAYS || '90');
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - gracePeriodDays * 24 * 60 * 60 * 1000);

    const isEligibleForDeactivation = lulusAt <= cutoffDate;

    console.log(`   Grace period: ${gracePeriodDays} days`);
    console.log(`   Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
    console.log(`   LulusAt: ${lulusAt.toISOString().split('T')[0]}`);
    console.log(`   Eligible for deactivation: ${isEligibleForDeactivation}`);

    let deactivationResult = {
      performed: false,
      reason: ''
    };

    if (isEligibleForDeactivation) {
      // Deactivate student
      await prisma.user.update({
        where: { id: siswa.userId },
        data: { isActive: false }
      });
      console.log(`✅ Deactivated student account`);

      // Deactivate parents
      for (const relation of updatedSiswa.orangTuaSiswa) {
        await prisma.user.update({
          where: { id: relation.orangTua.userId },
          data: { isActive: false }
        });
        console.log(`✅ Deactivated parent: ${relation.orangTua.user.email}`);
      }

      deactivationResult = {
        performed: true,
        reason: 'Grace period has expired',
        deactivatedStudent: siswa.user.email,
        deactivatedParents: updatedSiswa.orangTuaSiswa.map(r => r.orangTua.user.email)
      };
    } else {
      const daysUntilDeactivation = Math.ceil((cutoffDate - lulusAt) / (1000 * 60 * 60 * 24));
      deactivationResult = {
        performed: false,
        reason: `Grace period not yet expired (${daysUntilDeactivation} days remaining)`,
        willDeactivateOn: cutoffDate.toISOString().split('T')[0]
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Student graduation simulated',
      siswa: {
        id: updatedSiswa.id,
        email: updatedSiswa.user.email,
        name: updatedSiswa.user.name,
        statusSiswa: 'LULUS',
        lulusAt: lulusAt.toISOString().split('T')[0]
      },
      deactivation: deactivationResult
    });
  } catch (error) {
    console.error('❌ [SIMULATE-LULUS] Error:', error);
    return NextResponse.json(
      { error: 'Failed to simulate graduation', details: error.message },
      { status: 500 }
    );
  }
}
