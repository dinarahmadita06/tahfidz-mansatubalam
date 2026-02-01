export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';
import { generateSiswaEmail, generateOrangTuaEmail } from '@/lib/siswaUtils';

// Force Node.js runtime untuk Prisma compatibility
export const runtime = 'nodejs';
// Prevent static optimization

// GET - List all siswa (Admin only)
export async function GET(request) {
  const startTotal = performance.now();
  console.log('--- [API ADMIN SISWA] REQUEST START ---');
  
  try {
    const startAuth = performance.now();
    const session = await auth();
    const endAuth = performance.now();
    console.log(`[API ADMIN SISWA] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const kelasId = searchParams.get('kelasId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Optimization: If limit=1 and status=pending, it's likely for the sidebar badge
    const isBadgeRequest = limit === 1 && status === 'pending' && !search && !kelasId;

    // Build cache key
    const cacheKey = `siswa-list-${status || 'all'}-${kelasId || 'all'}-${search || 'none'}-p${page}-l${limit}`;
    
    // Check cache
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.log('[API ADMIN SISWA] Returning cached data');
      return NextResponse.json(cachedData);
    }

    let whereClause = {};
    if (status) whereClause.status = status;
    if (kelasId) whereClause.kelasId = kelasId;
    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nis: { contains: search } },
        { nisn: { contains: search } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    // Performance: If it's a badge request, we can optimize the select
    const selectFields = isBadgeRequest ? {
      id: true,
      status: true,
      user: {
        select: {
          id: true,
          name: true
        }
      }
    } : {
      id: true,
      nisn: true,
      nis: true,
      jenisKelamin: true,
      tanggalLahir: true,
      alamat: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true
        }
      },
      kelas: {
        select: {
          id: true,
          nama: true,
        }
      },
      orangTuaSiswa: {
        select: {
          hubungan: true,
          orangTua: {
            select: {
              id: true,
              jenisKelamin: true,
              user: {
                select: {
                  name: true,
                  username: true,
                  email: true
                }
              }
            }
          }
        }
      },
      _count: {
        select: {
          hafalan: true
        }
      }
    };

    const startQueries = performance.now();
    let totalCount = 0;
    let siswa = [];

    if (isBadgeRequest) {
      // Optimization for sidebar badge: count only
      totalCount = await prisma.siswa.count({ where: whereClause });
    } else {
      const results = await Promise.all([
        prisma.siswa.count({ where: whereClause }),
        prisma.siswa.findMany({
          where: whereClause,
          skip: (page - 1) * limit,
          take: limit,
          select: selectFields,
          orderBy: {
            createdAt: 'asc'
          }
        })
      ]);
      totalCount = results[0];
      siswa = results[1];
    }
    const endQueries = performance.now();
    const prismaDuration = (endQueries - startQueries).toFixed(2);
    
    const startTransform = performance.now();
    const totalPages = Math.ceil(totalCount / limit);

    const responseData = {
      data: siswa,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages
      }
    };
    const endTransform = performance.now();
    const transformDuration = (endTransform - startTransform).toFixed(2);

    // Cache response
    setCachedData(cacheKey, responseData, isBadgeRequest ? 60 : 30); // Cache badge request for 60s

    const endTotal = performance.now();
    const totalDuration = (endTotal - startTotal).toFixed(2);

    console.log(`[API SISWA PENDING] total: ${totalDuration} ms`);
    console.log(`[API SISWA PENDING] session/auth: ${(endAuth - startAuth).toFixed(2)} ms`);
    console.log(`[API SISWA PENDING] prisma.queries: ${prismaDuration} ms`);
    console.log(`[API SISWA PENDING] transform response: ${transformDuration} ms`);
    console.log('--- [API ADMIN SISWA] REQUEST END ---');

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching siswa:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch siswa',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// POST - Create new siswa (Admin only)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      password,
      nisn,
      nis,
      kelasId,
      tahunAjaranMasukId,
      kelasAngkatan,
      jenisKelamin,
      tanggalLahir,
      alamat,
      parentData
    } = body;

    // Validate required fields
    const missingFields = [];
    if (!name || name.trim() === '') missingFields.push('name');
    if (!nis || nis.trim() === '') missingFields.push('nis');
    if (!kelasId || kelasId.trim() === '') missingFields.push('kelasId');
    if (!jenisKelamin || jenisKelamin.trim() === '') missingFields.push('jenisKelamin');

    if (missingFields.length > 0) {
      return NextResponse.json({ error: 'Data tidak lengkap', missingFields }, { status: 400 });
    }

    // Auto-generate email based on name and NIS
    const email = generateSiswaEmail(name, nis);

    // Hash password
    let studentPassword = password;
    if (!studentPassword || studentPassword.trim() === '') {
      if (!tanggalLahir) {
        throw new Error('Tanggal lahir wajib diisi untuk generate password default');
      }
      // Format as YYYY-MM-DD for default password
      // Parse tanggal lahir dengan UTC untuk hindari timezone shift
      const dateStr = String(tanggalLahir).trim();
      let year, month, day;
      
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Already in YYYY-MM-DD format
        [year, month, day] = dateStr.split('-');
      } else {
        // Parse from Date object using UTC
        const birthDate = new Date(tanggalLahir);
        year = birthDate.getUTCFullYear();
        month = String(birthDate.getUTCMonth() + 1).padStart(2, '0');
        day = String(birthDate.getUTCDate()).padStart(2, '0');
      }
      
      studentPassword = `${year}-${month}-${day}`;
      console.log(`🔑 [CREATE SISWA] Generated password for NIS ${nis}: ${studentPassword}`);
    } else if (studentPassword.length < 8) {
      return NextResponse.json({ 
        success: false, 
        code: "PASSWORD_TOO_SHORT", 
        message: "Password minimal 8 karakter." 
      }, { status: 400 });
    }
    
    const hashedPassword = await bcrypt.hash(studentPassword, 10);

    // ============ ATOMIC TRANSACTION ============
    const siswa = await prisma.$transaction(async (tx) => {
      // Check if username already exists
      const existingUser = await tx.user.findUnique({
        where: { username: nis }
      });
      
      if (existingUser) {
        throw new Error(`NIS ${nis} sudah terdaftar. Gunakan NIS lain atau cek data siswa yang sudah ada.`);
      }
      
      // 1. Create siswa
      const newSiswa = await tx.siswa.create({
        data: {
          nisn,
          nis,
          jenisKelamin,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
          alamat,
          tahunAjaranMasuk: tahunAjaranMasukId ? { connect: { id: tahunAjaranMasukId } } : undefined,
          kelas: kelasId ? { connect: { id: kelasId } } : undefined,
          kelasAngkatan: kelasAngkatan || null,
          status: 'approved',
          user: {
            create: {
              email,
              username: nis,
              password: hashedPassword,
              name,
              role: 'SISWA'
            }
          }
        },
        include: { user: true }
      });

      // 2. Handle Parent Data
      if (parentData && parentData.name) {
        // Auto-generate email based on student if not provided
        const finalEmailWali = parentData.email && parentData.email.trim() !== '' 
          ? parentData.email.toLowerCase() 
          : generateOrangTuaEmail(name, nis);

        // Password parent: birth date DDMMYYYY
        let pPassword = parentData.password;
        if (!pPassword || pPassword.trim() === '') {
          if (!tanggalLahir) {
            throw new Error('Tanggal lahir wajib diisi untuk generate password wali');
          }
          // Format as DDMMYYYY - parse dengan UTC untuk hindari timezone shift
          const dateStr = String(tanggalLahir).trim();
          let year, month, day;
          
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            // Parse dari YYYY-MM-DD
            [year, month, day] = dateStr.split('-');
          } else {
            // Parse from Date object using UTC
            const birthDate = new Date(tanggalLahir);
            year = birthDate.getUTCFullYear();
            month = String(birthDate.getUTCMonth() + 1).padStart(2, '0');
            day = String(birthDate.getUTCDate()).padStart(2, '0');
          }
          
          pPassword = `${day}${month}${year}`;
          console.log(`🔑 [CREATE PARENT] Generated password for ${parentData.name}: ${pPassword}`);
        } else if (pPassword.length < 8) {
          throw new Error('Password wali minimal 8 karakter.');
        }
        const parentHashedPassword = await bcrypt.hash(pPassword, 10);

        // Check if there's an existing parent with the same email
        const existingParent = await tx.user.findUnique({ where: { email: finalEmailWali } });
        if (existingParent && existingParent.name.toLowerCase() !== parentData.name.toLowerCase()) {
           throw new Error(`Email ${finalEmailWali} sudah digunakan oleh wali lain (${existingParent.name})`);
        }

        let orangTuaId;
        if (existingParent) {
          const ot = await tx.orangTua.findUnique({ where: { userId: existingParent.id } });
          orangTuaId = ot?.id;
        }

        if (!orangTuaId) {
          // For parent, create a separate user with a unique username
          const parentUsername = nis; // Use NIS as username (same as student)
          
          // Check if parent account with this email already exists
          const existingParentUser = await tx.user.findFirst({ 
            where: { 
              email: finalEmailWali,
              role: 'ORANG_TUA'
            } 
          });
          if (existingParentUser) {
            throw new Error(`Akun wali dengan email ${finalEmailWali} sudah terdaftar.`);
          }
          
          const parentUser = await tx.user.create({
            data: {
              email: finalEmailWali,
              username: nis, // Use NIS (same as student)
              password: parentHashedPassword,
              name: parentData.name,
              role: 'ORANG_TUA'
            }
          });

          const orangTua = await tx.orangTua.create({
            data: {
              userId: parentUser.id,
              jenisKelamin: parentData.jenisKelamin || 'LAKI_LAKI'
            }
          });
          orangTuaId = orangTua.id;
        }

        // Link
        await tx.orangTuaSiswa.create({
          data: {
            siswaId: newSiswa.id,
            orangTuaId: orangTuaId,
            hubungan: 'Orang Tua'
          }
        });
      }

      return newSiswa;
    });

    // Log activity
    await logActivity({
      actorId: session.user.id,
      actorRole: 'ADMIN',
      action: ACTIVITY_ACTIONS.ADMIN_TAMBAH_SISWA,
      title: 'Menambahkan siswa baru',
      description: `Siswa: ${siswa.user.name} (NIS: ${siswa.nis})`,
      targetUserId: siswa.userId,
      targetRole: 'SISWA',
      targetName: siswa.user.name
    });

    invalidateCache(`siswa-list-kelasId-${kelasId}`);
    invalidateCache('siswa-list-all');

    return NextResponse.json(siswa, { status: 201 });
  } catch (error) {
    console.error('Error creating siswa:', error);
    
    // Check for duplicate username error (parent account)
    if (error.message && error.message.includes('Akun wali untuk NIS') && error.message.includes('sudah terdaftar')) {
      return NextResponse.json({ 
        error: error.message,
        invalidFields: { nis: error.message }
      }, { status: 409 }); // 409 Conflict for duplicate username
    }
    
    // Check for Prisma unique constraint violation
    if (error.code === 'P2002') {
      const target = error.meta?.target;
      if (target?.includes('username')) {
        return NextResponse.json({ 
          error: 'Username sudah digunakan',
          invalidFields: { username: 'Username sudah digunakan' }
        }, { status: 409 });
      }
      if (target?.includes('email')) {
        return NextResponse.json({ 
          error: 'Email sudah digunakan',
          invalidFields: { email: 'Email sudah digunakan' }
        }, { status: 409 });
      }
      if (target?.includes('nis')) {
        return NextResponse.json({ 
          error: 'NIS sudah terdaftar',
          invalidFields: { nis: 'NIS sudah terdaftar' }
        }, { status: 409 });
      }
    }
    
    // Check if this is a unique constraint error related to NIS
    if (error.message && (error.message.includes('NIS') && error.message.includes('sudah terdaftar'))) {
      return NextResponse.json({ 
        error: error.message,
        invalidFields: { nis: error.message }
      }, { status: 409 });
    }
    
    return NextResponse.json({ error: error.message || 'Gagal menambahkan siswa' }, { status: 500 });
  }
}
