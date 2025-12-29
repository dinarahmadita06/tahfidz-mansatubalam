import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// GET - List all orang tua (Admin only)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    let whereClause = {};

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { noHP: { contains: search } }
      ];
    }

    if (status !== null && status !== undefined && status !== '') {
      whereClause.user = {
        ...whereClause.user,
        isActive: status === 'active'
      };
    }

    const [orangTua, total] = await Promise.all([
      prisma.orangTua.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              isActive: true,
              createdAt: true
            }
          },
          orangTuaSiswa: {
            select: {
              siswaId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.orangTua.count({ where: whereClause })
    ]);

    // Transform response to include _count
    const transformedOrangTua = orangTua.map(ot => ({
      ...ot,
      _count: {
        siswa: ot.orangTuaSiswa?.length || 0
      },
      orangTuaSiswa: undefined  // Remove the array, only use count
    }));

    return NextResponse.json({
      data: transformedOrangTua,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orang tua:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orang tua' },
      { status: 500 }
    );
  }
}

// POST - Create new orang tua (Admin only)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      noHP,
      pekerjaan,
      alamat,
      image
    } = body;

    // Validate required fields
    if (!name || !email || !password || !noHP) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Validate Indonesian phone number format
    const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
    if (!phoneRegex.test(noHP.replace(/[-\s]/g, ''))) {
      return NextResponse.json({ error: 'Format nomor HP tidak valid' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and orang tua
    const orangTua = await prisma.orangTua.create({
      data: {
        pekerjaan: pekerjaan || null,
        noHP,
        alamat: alamat || null,
        user: {
          create: {
            email,
            password: hashedPassword,
            name,
            role: 'ORANG_TUA',
            image: image || null,
            isActive: true
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      },
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'ORANG_TUA',
      description: `Menambahkan orang tua baru ${orangTua.user.name} (No HP: ${orangTua.noHP})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        orangTuaId: orangTua.id
      }
    });

    return NextResponse.json(orangTua, { status: 201 });
  } catch (error) {
    console.error('Error creating orang tua:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan orang tua' },
      { status: 500 }
    );
  }
}
