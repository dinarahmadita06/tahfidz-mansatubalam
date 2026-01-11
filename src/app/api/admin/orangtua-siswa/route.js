export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// Force Node.js runtime untuk Prisma compatibility
export const runtime = 'nodejs';

// POST - Link OrangTua to Siswa
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siswaId, orangTuaId, hubungan = 'Orang Tua' } = body;

    // Validate required fields
    if (!siswaId || !orangTuaId) {
      return NextResponse.json(
        { error: 'siswaId dan orangTuaId wajib diisi' },
        { status: 400 }
      );
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
      return NextResponse.json({ error: 'Orang Tua tidak ditemukan' }, { status: 404 });
    }

    // Check if relation already exists
    const existingRelation = await prisma.orangTuaSiswa.findFirst({
      where: {
        siswaId,
        orangTuaId,
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        { error: 'Hubungan antara siswa dan orang tua sudah ada' },
        { status: 400 }
      );
    }

    // Create the relation
    const orangTuaSiswa = await prisma.orangTuaSiswa.create({
      data: {
        siswaId,
        orangTuaId,
        hubungan,
      },
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        orangTua: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log('✅ Successfully linked orangTua to siswa:', { siswaId, orangTuaId, hubungan });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'ORANGTUA_SISWA',
      description: `Menghubungkan siswa ${siswa.user.name} dengan orang tua ${orangTua.user.name}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        siswaId,
        orangTuaId,
        hubungan,
      },
    }).catch((err) => console.error('Log activity error:', err));

    return NextResponse.json(
      {
        message: 'Berhasil menghubungkan siswa dengan orang tua',
        data: orangTuaSiswa,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error linking orangtua-siswa:', error);
    
    // Provide detailed error message for debugging
    const errorMessage = error.meta?.cause || error.message || 'Unknown error';
    const statusCode = error.code === 'P2002' ? 400 : 500;
    
    return NextResponse.json(
      {
        error: statusCode === 400 ? 'Hubungan sudah ada atau data tidak valid' : 'Gagal menghubungkan siswa dengan orang tua',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: statusCode }
    );
  }
}

// GET - Get all OrangTuaSiswa relations (optional, for debugging/listing)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const orangTuaId = searchParams.get('orangTuaId');

    let whereClause = {};

    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    if (orangTuaId) {
      whereClause.orangTuaId = orangTuaId;
    }

    const relations = await prisma.orangTuaSiswa.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        orangTua: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: relations });
  } catch (error) {
    console.error('Error fetching orangtua-siswa relations:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data hubungan orang tua - siswa' },
      { status: 500 }
    );
  }
}
