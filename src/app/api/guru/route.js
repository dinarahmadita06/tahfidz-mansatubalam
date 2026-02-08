export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';
import { generateNextTeacherUsername } from '@/lib/passwordUtils';

// Constant for active class status
const STATUS_AKTIF = 'AKTIF';

export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API GURU] REQUEST START ---');
  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API GURU] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const noCache = searchParams.get('noCache') === 'true';

    // Check if we have cached data
    const cacheKey = 'guru-list';
    if (!noCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log('[API GURU] Returning cached guru data');
        const endTotal = performance.now();
        console.log(`[API GURU] total (CACHED): ${(endTotal - startTotal).toFixed(2)} ms`);
        return NextResponse.json(cachedData, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
          }
        });
      }
    }

    console.log('[API GURU] Fetching fresh guru data from database');

    const startQueries = performance.now();
    // Filter kelas to only AKTIF status in the guruKelas relation
    const guru = await prisma.guru.findMany({
      select: {
        id: true,
        nip: true,
        jenisKelamin: true,
        tanggalLahir: true,

        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,  // Keep email for internal purposes but make it optional in creation
            username: true,  // Add username field for display in admin table
            image: true,
            createdAt: true
          }
        },
        guruKelas: {
          where: {
            kelas: {
              status: STATUS_AKTIF
            }
          },
          select: {
            peran: true,
            isActive: true,
            kelas: {
              select: {
                id: true,
                nama: true,
                status: true,
                tahunAjaran: {
                  select: {
                    id: true,
                    nama: true
                  }
                },
                _count: {
                  select: {
                    siswa: true
                  }
                }
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
    const endQueries = performance.now();
    console.log(`[API GURU] prisma.findMany: ${(endQueries - startQueries).toFixed(2)} ms`);

    // Cache the response
    setCachedData(cacheKey, guru, 60);

    const endTotal = performance.now();
    console.log(`[API GURU] total: ${(endTotal - startTotal).toFixed(2)} ms`);
    console.log('--- [API GURU] REQUEST END ---');

    return NextResponse.json(guru, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
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

    let { name, password, username, nip, jenisKelamin, tanggalLahir, kelasIds } = body;

    // Set default password jika tidak ada
    if (!password || password.trim() === '') {
      password = 'MAN1'; // Password default untuk semua guru
      console.log('✅ Using default password: MAN1');
    }

    // Validasi input - username WAJIB diisi manual, tanggalLahir OPTIONAL
    if (!name || !username || !jenisKelamin) {
      console.log('❌ Validation failed:', { name, username, jenisKelamin });
      return NextResponse.json({
        error: 'Data tidak lengkap. Nama, username (kode guru), dan jenis kelamin wajib diisi.',
        missing: {
          name: !name,
          username: !username,
          jenisKelamin: !jenisKelamin
        }
      }, { status: 400 });
    }

    // Validasi username alfanumerik (kode guru: huruf dan/atau angka)
    if (!/^[A-Za-z0-9]+$/.test(username)) {
      return NextResponse.json({ 
        success: false, 
        code: "INVALID_USERNAME", 
        message: "Username hanya boleh mengandung huruf dan angka tanpa spasi atau simbol. Contoh: guru01, A12, 94" 
      }, { status: 400 });
    }

    console.log('✅ Validation passed');

    // Validate kelasIds if provided - only AKTIF kelas allowed
    if (kelasIds && kelasIds.length > 0) {
      console.log('🔍 Validating kelas IDs:', kelasIds);
      const kelasWithPembina = await prisma.kelas.findMany({
        where: {
          id: { in: kelasIds },
          status: STATUS_AKTIF
        },
        include: {
          guruKelas: {
            where: { peran: 'utama', isActive: true },
            include: { guru: { include: { user: { select: { name: true } } } } }
          }
        }
      });

      if (kelasWithPembina.length !== kelasIds.length) {
        return NextResponse.json({
          error: 'Beberapa kelas tidak valid atau tidak aktif'
        }, { status: 400 });
      }

      // Check if any class already has a Pembina
      for (const k of kelasWithPembina) {
        if (k.guruKelas.length > 0) {
          return NextResponse.json({
            error: `Kelas ${k.nama} sudah memiliki Guru Pembina: ${k.guruKelas[0].guru.user.name}`
          }, { status: 400 });
        }
      }
      console.log('✅ All kelas valid and available for Pembina');
    }

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

    // Generate internal email (not exposed to user, for DB compatibility)
    const email = `guru.${Date.now()}@internal.tahfidz`;

    console.log('🔍 Checking username availability...');
    const existingUserWithUsername = await prisma.user.findFirst({
      where: { username }
    });

    if (existingUserWithUsername) {
      console.log('❌ Username already exists:', username);
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Password hashed');

    // Prepare data
    const createData = {
      nip: nip || null,
      jenisKelamin: normalizedJenisKelamin,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      user: {
        create: {
          name,
          email, // Use the email (either provided or generated)
          username, // Add the username (with error handling)
          password: hashedPassword,
          role: 'GURU'
        }
      }
    };

    console.log('📦 Creating guru with data:', JSON.stringify({
      ...createData,
      user: { ...createData.user, create: { ...createData.user.create, password: '[HIDDEN]' } }
    }, null, 2));

    // Buat user dan guru dengan retry logic untuk mengatasi race condition
    let guru;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
      try {
        guru = await prisma.guru.create({
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
        break; // Success, exit the loop
      } catch (error) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, error.message);
        
        // If it's a unique constraint violation, generate a new username and try again
        if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
          console.log('Username conflict detected, generating new username...');
          username = await generateNextTeacherUsername(prisma);
          createData.user.create.username = username;
          console.log('New username generated:', username);
          
          if (attempts < maxAttempts) {
            continue; // Retry with new username
          }
        }
        
        // Re-throw if it's not a retryable error or max attempts reached
        throw error;
      }
    }
    
    if (!guru) {
      return NextResponse.json(
        { error: 'Gagal membuat guru setelah beberapa percobaan' },
        { status: 500 }
      );
    }

    console.log('✅ Guru created successfully:', guru.id);

    // Create GuruKelas relationships if kelasIds provided
    if (kelasIds && kelasIds.length > 0) {
      console.log('🔗 Creating GuruKelas relationships for:', kelasIds);
      
      const guruKelasData = kelasIds.map(kelasId => ({
        guruId: guru.id,
        kelasId: kelasId,
        peran: 'utama', // Single source of truth: Teacher is Pembina
        isActive: true
      }));

      // Also update Kelas.guruTahfidzId for legacy compatibility if needed
      // But we prefer centralized management. 
      // For each class, set this guru as the main tahfidz guru.
      await Promise.all(kelasIds.map(kid => 
        prisma.kelas.update({
          where: { id: kid },
          data: { guruTahfidzId: guru.userId }
        })
      ));

      await prisma.guruKelas.createMany({
        data: guruKelasData,
        skipDuplicates: true
      });

      console.log('✅ GuruKelas relationships created');
    }

    // Log activity
    console.log('📝 Logging activity...');
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'GURU',
      description: `Menambahkan guru baru ${guru.user.name} (NIP: ${guru.nip || '-'}) dengan ${kelasIds?.length || 0} kelas`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        guruId: guru.id,
        kelasCount: kelasIds?.length || 0
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
