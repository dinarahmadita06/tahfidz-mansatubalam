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
            include: {
              siswa: {
                select: {
                  id: true,
                  nis: true,
                  user: {
                    select: {
                      name: true
                    }
                  },
                  kelas: {
                    select: {
                      nama: true,
                      id: true
                    }
                  }
                }
              }
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
      }
      // Keep orangTuaSiswa array with full siswa details
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

// POST - Create or Update (UPSERT) orang tua (Admin only)
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
      image,
      nik
    } = body;

    // Validate required fields
    if (!name || !email || !password || !noHP || !nik) {
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

    // ============ UPSERT LOGIC ============
    // Step 1: Check if parent already exists by email
    console.log('🔍 Checking if parent exists with email:', email);
    const existingOrangTua = await prisma.orangTua.findFirst({
      where: {
        user: {
          email: email.toLowerCase()
        }
      },
      include: {
        user: true
      }
    });

    if (existingOrangTua) {
      // Parent already exists → REUSE it (don't update, just return)
      console.log('✅ Parent already exists by email, reusing:', existingOrangTua.id);
      return NextResponse.json(
        {
          ...existingOrangTua,
          user: {
            id: existingOrangTua.user.id,
            name: existingOrangTua.user.name,
            email: existingOrangTua.user.email,
            image: existingOrangTua.user.image,
            isActive: existingOrangTua.user.isActive,
            createdAt: existingOrangTua.user.createdAt
          },
          message: 'Parent sudah ada, menggunakan data existing'
        },
        { status: 200 }
      );
    }

    // Step 2: Parent doesn't exist → CREATE new
    console.log('➕ Creating new parent with email:', email);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and orang tua
    const orangTua = await prisma.orangTua.create({
      data: {
        nik,
        pekerjaan: pekerjaan || null,
        noTelepon: noHP, // Map noHP to noTelepon in Prisma schema
        alamat: alamat || null,
        jenisKelamin: 'LAKI_LAKI', // Add default gender
        user: {
          create: {
            email: email.toLowerCase(),
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

    console.log('✅ Parent created successfully:', orangTua.id);

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'ORANG_TUA',
      description: `Menambahkan orang tua baru ${orangTua.user.name} (No HP: ${orangTua.noTelepon})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        orangTuaId: orangTua.id
      }
    }).catch((err) => console.error('Log activity error:', err));

    return NextResponse.json(orangTua, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating orang tua:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('Error message:', error.message);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation (email or NIK already exists)
      const field = error.meta?.target?.[0];
      let errorMsg = 'Data sudah terdaftar';
      if (field === 'email') {
        errorMsg = 'Email sudah terdaftar, silakan gunakan email lain';
      } else if (field === 'nik') {
        errorMsg = 'NIK sudah terdaftar';
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: 409 }  // Changed to 409 Conflict
      );
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        { error: 'Data tidak ditemukan' },
        { status: 404 }
      );
    }
    
    // Provide detailed error message for debugging
    const errorMessage = error.meta?.cause || error.message || 'Unknown error';
    console.error('Detailed error:', errorMessage);
    
    return NextResponse.json(
      {
        error: 'Gagal menambahkan orang tua',
        ...(process.env.NODE_ENV === 'development' && { details: errorMessage })
      },
      { status: 500 }
    );
  }
}
