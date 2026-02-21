export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Ensure database connection is alive
    try {
      await prisma.$connect();
    } catch (connectError) {
      console.error('Database connection error:', connectError);
    }

    // Get siswa data first
    let siswa;
    try {
      siswa = await prisma.siswa.findUnique({
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
          orangTuaSiswa: {
            include: {
              orangTua: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Retry once if connection lost
      if (dbError.code === 'P1017') {
        console.log('🔄 Retrying after connection reset...');
        await prisma.$connect();
        siswa = await prisma.siswa.findUnique({
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
            orangTuaSiswa: {
              include: {
                orangTua: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        });
      } else {
        throw dbError;
      }
    }

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
        status: 'approved',
      };
      notificationTitle = 'Siswa Disetujui';
      notificationMessage = `Siswa ${siswa.user.name} telah disetujui oleh admin.`;
    } else if (action === 'reject') {
      updateData = {
        status: 'rejected',
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
        
        // RULE FINAL: When siswa approved, auto-activate connected parent(s)
        const connectedParents = await tx.orangTuaSiswa.findMany({
          where: { siswaId: siswaId },
          include: {
            orangTua: {
              include: {
                user: true,
              },
            },
          },
        });
        
        // Activate each connected parent's user account
        for (const relation of connectedParents) {
          await tx.user.update({
            where: { id: relation.orangTua.userId },
            data: { isActive: true },
          });
          console.log(`✅ [VALIDATE-SISWA] Auto-activated parent: ${relation.orangTua.user.email}`);
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
    
    // Handle specific Prisma errors
    if (error.code === 'P1017') {
      return NextResponse.json({ 
        error: 'Koneksi database terputus. Silakan coba lagi.' 
      }, { status: 503 });
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Data siswa tidak ditemukan' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      error: 'Gagal memvalidasi siswa. Silakan coba lagi.' 
    }, { status: 500 });
  }
}
