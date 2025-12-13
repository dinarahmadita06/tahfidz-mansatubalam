import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if we have cached data
    const cacheKey = 'guru-list';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Returning cached guru data');
      return NextResponse.json(cachedData);
    }

    console.log('Fetching fresh guru data from database');

    const guru = await prisma.guru.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true
          }
        },
        guruKelas: {
          include: {
            kelas: {
              select: {
                id: true,
                nama: true
              }
            }
          }
        },
        _count: {
          select: {
            guruKelas: true
          }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      }
    });

    // Cache the response
    setCachedData(cacheKey, guru);

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error fetching guru:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guru' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('🔍 POST /api/guru called');
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      console.log('❌ Unauthorized - no session or not admin');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session valid:', session.user.email);

    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));

    const { name, email, password, nip, jenisKelamin, noHP, noTelepon, alamat } = body;

    // Validasi input
    if (!name || !email || !password || !jenisKelamin) {
      console.log('❌ Validation failed:', { name, email, hasPassword: !!password, jenisKelamin });
      return NextResponse.json({
        error: 'Data tidak lengkap',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          jenisKelamin: !jenisKelamin
        }
      }, { status: 400 });
    }

    console.log('✅ Validation passed');

    // Normalize jenisKelamin dari L/P ke LAKI_LAKI/PEREMPUAN
    let normalizedJenisKelamin = 'LAKI_LAKI';
    const jkUpper = String(jenisKelamin).toUpperCase().trim();
    if (jkUpper === 'PEREMPUAN' || jkUpper === 'P' || jkUpper === 'FEMALE') {
      normalizedJenisKelamin = 'PEREMPUAN';
    } else if (jkUpper === 'LAKI_LAKI' || jkUpper === 'LAKI-LAKI' || jkUpper === 'L' || jkUpper === 'MALE') {
      normalizedJenisKelamin = 'LAKI_LAKI';
    } else {
      console.log('❌ Invalid jenisKelamin:', jenisKelamin);
      return NextResponse.json({ error: 'Jenis Kelamin harus L atau P' }, { status: 400 });
    }

    console.log('✅ Normalized jenisKelamin:', normalizedJenisKelamin);

    // Cek email sudah ada
    console.log('🔍 Checking existing user...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    console.log('✅ Email available');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Prepare data
    const createData = {
      nip: nip || null,
      jenisKelamin: normalizedJenisKelamin,
      noTelepon: noTelepon || noHP || null,
      alamat: alamat || null,
      user: {
        create: {
          name,
          email,
          password: hashedPassword,
          role: 'GURU'
        }
      }
    };

    console.log('📦 Creating guru with data:', JSON.stringify({
      ...createData,
      user: { ...createData.user, create: { ...createData.user.create, password: '[HIDDEN]' } }
    }, null, 2));

    // Buat user dan guru
    const guru = await prisma.guru.create({
      data: createData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Guru created successfully:', guru.id);

    // Log activity
    console.log('📝 Logging activity...');
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'GURU',
      description: `Menambahkan guru baru ${guru.user.name} (NIP: ${guru.nip || '-'})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        guruId: guru.id
      }
    });

    console.log('✅ Activity logged');

    // Invalidate cache for guru list
    invalidateCache('guru-list');
    console.log('✅ Cache invalidated');

    console.log('🎉 Create guru completed successfully');
    return NextResponse.json(guru, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating guru:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: 'Failed to create guru',
        details: error.message,
        errorName: error.name
      },
      { status: 500 }
    );
  }
}