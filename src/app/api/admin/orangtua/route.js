export const dynamic = 'force-dynamic';
export const revalidate = 0;
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
        {
          orangTuaSiswa: {
            some: {
              siswa: {
                nis: { contains: search, mode: 'insensitive' }
              }
            }
          }
        }
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
                  nisn: true,
                  tanggalLahir: true,
                  statusSiswa: true,
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

    // Transform response to include _count and map siswa field for frontend compatibility
    const transformedOrangTua = orangTua.map(ot => ({
      ...ot,
      siswa: ot.orangTuaSiswa || [],
      _count: {
        siswa: ot.orangTuaSiswa?.length || 0
      }
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
    console.log('📥 OrangTua POST body received:', body);
    const {
      nisSiswa,
      name,
      jenisKelamin,
      noHP,
      pekerjaan,
      alamat
    } = body;

    // Validate required fields
    if (!nisSiswa || !name || !jenisKelamin) {
      return NextResponse.json({ error: 'NIS Siswa, Nama Wali, dan Jenis Kelamin wajib diisi' }, { status: 400 });
    }

    // Lookup siswa by NIS
    console.log('🔍 Looking up siswa with NIS:', nisSiswa);
    const siswa = await prisma.siswa.findFirst({
      where: { nis: nisSiswa.toString().trim() },
      select: {
        id: true,
        nis: true,
        tanggalLahir: true,
        user: {
          select: {
            name: true
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json({ 
        error: `Siswa dengan NIS ${nisSiswa} tidak ditemukan. Pastikan NIS sudah benar.` 
      }, { status: 404 });
    }

    console.log('✅ Siswa found:', siswa.user.name);

    // Auto-determine jenis wali from gender
    const normalizedGender = jenisKelamin.toString().toUpperCase().trim();
    let jenisWali = 'AYAH';
    if (normalizedGender === 'P' || normalizedGender === 'PEREMPUAN') {
      jenisWali = 'IBU';
    }

    console.log('👥 Jenis wali determined:', jenisWali);

    // Generate credentials using helper
    const { buildOrtuCredentials } = await import('@/lib/passwordUtils');
    const credentials = await buildOrtuCredentials({
      tanggalLahirSiswa: siswa.tanggalLahir,
      nisSiswa: siswa.nis,
      bcrypt
    });

    console.log('🔑 Generated credentials - Username:', credentials.username, 'Password:', credentials.passwordPlain);

    // ============ CHECK EXISTING USER ============
    // Check if user with this username already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        username: credentials.username,
        role: 'ORANG_TUA'
      },
      include: {
        orangTua: {
          include: {
            orangTuaSiswa: true
          }
        }
      }
    });

    let orangTua;

    if (existingUser && existingUser.orangTua) {
      // User already exists → REUSE
      console.log('✅ Orang tua with username', credentials.username, 'already exists, reusing');
      orangTua = existingUser.orangTua;
    } else {
      // Create new user and orang tua
      console.log('➕ Creating new orang tua user');
      
      const normalizedJenisKelamin = (normalizedGender === 'P' || normalizedGender === 'PEREMPUAN') 
        ? 'PEREMPUAN' 
        : 'LAKI_LAKI';

      // Generate email from NIS (nullable, for future use)
      const generatedEmail = `wali.${siswa.nis}@ortu.tahfidz.sch.id`;

      orangTua = await prisma.orangTua.create({
        data: {
          pekerjaan: pekerjaan || null,
          alamat: alamat || null,
          jenisKelamin: normalizedJenisKelamin,
          status: 'approved',
          user: {
            create: {
              username: credentials.username,
              email: generatedEmail,
              password: credentials.passwordHash,
              name,
              role: 'ORANG_TUA',
              isActive: true
            }
          }
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              isActive: true,
              createdAt: true
            }
          }
        }
      });

      console.log('✅ Orang tua created:', orangTua.id);
    }

    // ============ CREATE RELATION ============
    // Check if relation already exists
    const existingRelation = await prisma.orangTuaSiswa.findFirst({
      where: {
        orangTuaId: orangTua.id,
        siswaId: siswa.id
      }
    });

    if (existingRelation) {
      console.log('ℹ️  Relasi sudah ada, skip create');
    } else {
      await prisma.orangTuaSiswa.create({
        data: {
          orangTuaId: orangTua.id,
          siswaId: siswa.id,
          jenisWali: jenisWali
        }
      });
      console.log('✅ Relasi orangTuaSiswa created');
    }

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'ORANG_TUA',
      description: `Menghubungkan wali ${orangTua.user.name} dengan siswa ${siswa.user.name} (NIS: ${siswa.nis})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        orangTuaId: orangTua.id,
        siswaId: siswa.id,
        jenisWali
      }
    }).catch((err) => console.error('Log activity error:', err));

    // Return response with credentials (for display to admin)
    return NextResponse.json({
      success: true,
      orangTua: {
        id: orangTua.id,
        user: orangTua.user,
        status: orangTua.status,
        jenisKelamin: orangTua.jenisKelamin
      },
      siswa: {
        id: siswa.id,
        nis: siswa.nis,
        name: siswa.user.name
      },
      credentials: {
        username: credentials.username,
        password: credentials.passwordPlain,
        info: 'Username = NIS siswa, Password = tanggal lahir siswa (DDMMYYYY)'
      },
      jenisWali
    }, { status: 201 });
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



