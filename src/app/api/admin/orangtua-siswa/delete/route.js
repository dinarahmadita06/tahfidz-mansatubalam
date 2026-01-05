import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

/**
 * DELETE /api/admin/orangtua-siswa
 * Unlink a student from a parent account
 * 
 * Request body:
 * {
 *   "orangTuaId": "...",
 *   "siswaId": "..."
 * }
 */
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orangTuaId, siswaId } = body;

    if (!orangTuaId || !siswaId) {
      return NextResponse.json(
        { error: 'orangTuaId dan siswaId harus disediakan' },
        { status: 400 }
      );
    }

    // Check if orangTua exists
    const orangTua = await prisma.orangTua.findUnique({
      where: { id: orangTuaId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!orangTua) {
      return NextResponse.json({ error: 'Orang tua tidak ditemukan' }, { status: 404 });
    }

    // Check if siswa exists
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // Check if relation exists
    const existingRelation = await prisma.orangTuaSiswa.findUnique({
      where: {
        orangTuaId_siswaId: {
          orangTuaId,
          siswaId,
        },
      },
    });

    if (!existingRelation) {
      return NextResponse.json(
        { error: 'Hubungan antara siswa dan orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    // Delete the relation
    await prisma.orangTuaSiswa.delete({
      where: {
        orangTuaId_siswaId: {
          orangTuaId,
          siswaId,
        },
      },
    });

    console.log('✅ Successfully unlinked orangTua from siswa:', { siswaId, orangTuaId });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'ORANGTUA_SISWA',
      description: `Memutus hubungan siswa ${siswa.user.name} dengan orang tua ${orangTua.user.name}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId,
        orangTuaId,
        siswaName: siswa.user.name,
        orangTuaName: orangTua.user.name,
      },
    }).catch((err) => console.error('Log activity error:', err));

    return NextResponse.json(
      {
        message: 'Berhasil memutus hubungan siswa dengan orang tua',
        data: {
          siswaId,
          orangTuaId,
          siswaName: siswa.user.name,
          orangTuaName: orangTua.user.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error unlinking orangtua-siswa:', error);

    const errorMessage = error.meta?.cause || error.message || 'Unknown error';
    
    return NextResponse.json(
      {
        error: 'Gagal memutus hubungan siswa dengan orang tua',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}
