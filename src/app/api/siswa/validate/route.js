import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// PATCH - Approve or Reject siswa
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaId, action, rejectionReason } = body; // action: 'approve' or 'reject'

    if (!siswaId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get siswa data first
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        kelas: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' }, { status: 404 });
    }

    if (siswa.status !== 'pending') {
      return NextResponse.json({ error: 'Siswa already validated' }, { status: 400 });
    }

    let updateData = {};
    let notificationMessage = '';
    let notificationTitle = '';

    if (action === 'approve') {
      updateData = {
        status: 'active',
        approvedBy: session.user.id,
        approvedAt: new Date(),
      };
      notificationTitle = 'Siswa Disetujui';
      notificationMessage = `Siswa ${siswa.user.name} telah disetujui oleh admin.`;
    } else if (action === 'reject') {
      updateData = {
        status: 'rejected',
        rejectedBy: session.user.id,
        rejectedAt: new Date(),
        rejectionReason: rejectionReason || 'Tidak memenuhi persyaratan',
      };
      notificationTitle = 'Siswa Ditolak';
      notificationMessage = `Siswa ${siswa.user.name} ditolak. Alasan: ${rejectionReason || 'Tidak memenuhi persyaratan'}`;
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update siswa and user status
    const result = await prisma.$transaction(async (tx) => {
      const updatedSiswa = await tx.siswa.update({
        where: { id: siswaId },
        data: updateData,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          kelas: {
            select: {
              nama: true,
            },
          },
        },
      });

      // Update user isActive status
      if (action === 'approve') {
        await tx.user.update({
          where: { id: siswa.userId },
          data: { isActive: true },
        });
      }

      // Create notification for guru who created the siswa
      if (siswa.createdBy) {
        // Get guru data to get their userId
        const guru = await tx.guru.findUnique({
          where: { id: siswa.createdBy },
          select: { userId: true },
        });

        if (guru) {
          await tx.notification.create({
            data: {
              userId: guru.userId,
              title: notificationTitle,
              message: notificationMessage,
              type: action === 'approve' ? 'student_approved' : 'student_rejected',
              link: '/guru/siswa',
            },
          });
        }
      }

      return updatedSiswa;
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: action === 'approve' ? 'APPROVE' : 'REJECT',
      module: 'SISWA',
      description: action === 'approve'
        ? `Menyetujui siswa ${result.user.name} (NISN: ${result.nisn})`
        : `Menolak siswa ${result.user.name} (NISN: ${result.nisn}) - Alasan: ${rejectionReason || 'Tidak memenuhi persyaratan'}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId: result.id,
        action: action,
        rejectionReason: action === 'reject' ? rejectionReason : null
      }
    });

    return NextResponse.json({
      message: action === 'approve' ? 'Siswa berhasil disetujui' : 'Siswa berhasil ditolak',
      siswa: result,
    });
  } catch (error) {
    console.error('Error validating siswa:', error);
    return NextResponse.json({ error: 'Failed to validate siswa' }, { status: 500 });
  }
}
