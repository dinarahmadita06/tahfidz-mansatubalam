export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';
import { invalidateCache, getCachedData, setCachedData } from '@/lib/cache';


export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, tahunAjaranId, targetJuz, guruUtamaId, forceCreate } = body;

    // Validate required fields
    if (!nama || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Nama kelas dan tahun ajaran harus diisi.' },
        { status: 400 }
      );
    }

    // Check if tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId } // tahunAjaranId is a string (CUID), not a number
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check for duplicate class name (case-insensitive)
    const existingKelas = await prisma.kelas.findFirst({
      where: {
        nama: {
          equals: nama,
          mode: 'insensitive'
        }
      }
    });

    if (existingKelas) {
      return NextResponse.json(
        { error: `Kelas "${nama}" sudah ada. Silakan gunakan nama kelas yang berbeda.` },
        { status: 409 }
      );
    }

    // Validasi: Cek apakah guru utama sudah menjadi guru di kelas lain
    if (guruUtamaId && guruUtamaId.trim() && !forceCreate) {
      const existingGuruKelas = await prisma.guruKelas.findFirst({
        where: {
          guruId: guruUtamaId
        },
        include: {
          kelas: {
            select: {
              id: true,
              nama: true
            }
          },
          guru: {
            include: {
              user: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (existingGuruKelas) {
        // Guru sudah memiliki kelas lain, minta konfirmasi
        return NextResponse.json({
          requiresConfirmation: true,
          guruName: existingGuruKelas.guru.user.name,
          existingKelas: existingGuruKelas.kelas.nama,
          newKelas: nama,
          message: `${existingGuruKelas.guru.user.name} saat ini menjadi Guru Tahfidz di kelas ${existingGuruKelas.kelas.nama}. Apakah Anda yakin ingin menambahkannya ke kelas ${nama}?`
        }, { status: 409 });
      }
    }

    // Create kelas dengan guru menggunakan transaction
    const kelas = await prisma.$transaction(async (tx) => {
      // Get guru utama userId for Kelas.guruTahfidzId
      let guruTahfidzUserId = null;
      if (guruUtamaId && guruUtamaId.trim()) {
        const guru = await tx.guru.findUnique({
          where: { id: guruUtamaId },
          select: { userId: true }
        });
        if (guru) {
          guruTahfidzUserId = guru.userId;
        }
      }

      // 1. Create kelas
      const newKelas = await tx.kelas.create({
        data: {
          nama,
          tahunAjaranId: tahunAjaranId, // Keep as string - it's a CUID
          targetJuz: targetJuz ? parseInt(targetJuz) : 1,
          guruTahfidzId: guruTahfidzUserId,
        }
      });

      // 2. Add guru pembina if provided
      if (guruUtamaId && guruUtamaId.trim()) {
        await tx.guruKelas.create({
          data: {
            kelasId: newKelas.id,
            guruId: guruUtamaId, // Keep as string - it's a CUID
            peran: 'utama',
            isActive: true,
          },
        });
      }

      // 3. Clear any unintended existing assignments for this class (not possible on create but for consistency)
      // Remove guru pendamping handling as requested
      
      // 4. Fetch complete kelas data
      const kelasWithRelations = await tx.kelas.findUnique({
        where: { id: newKelas.id },
        include: {
          tahunAjaran: {
            select: {
              nama: true,
              semester: true
            }
          },
          guruKelas: {
            include: {
              guru: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              siswa: true
            }
          }
        }
      });

      return kelasWithRelations;
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'KELAS',
      description: `Menambahkan kelas baru ${kelas.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: kelas.id,
        kelasNama: kelas.nama,
        tahunAjaranId: kelas.tahunAjaranId,
        guruPembinaId: guruUtamaId,
      }
    });

    // Invalidate cache for kelas and guru
    invalidateCache('kelas-list');
    invalidateCache('guru-list');

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error creating kelas:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kelas', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch kelas list
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.time('GET /api/admin/kelas');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';

    // Build cache key with pagination
    const cacheKey = search
      ? `kelas-list-search-${search}-page-${page}`
      : `kelas-list-all-page-${page}`;

    // Check cache
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.timeEnd('GET /api/admin/kelas');
      return NextResponse.json(cachedData);
    }

    // Build where clause for search
    let whereClause = {};
    if (search) {
      whereClause = {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { tahunAjaran: { nama: { contains: search, mode: 'insensitive' } } }
        ]
      };
    }

    // Parallel: count + findMany
    console.time('kelas-count-query');
    const total = await prisma.kelas.count({
      where: whereClause
    });
    console.timeEnd('kelas-count-query');

    // Fetch paginated kelas
    console.time('kelas-findMany-query');
    const kelas = await prisma.kelas.findMany({
      where: whereClause,
      select: {
        id: true,
        nama: true,
        targetJuz: true,
        createdAt: true,
        tahunAjaran: {
          select: {
            nama: true,
            semester: true
          }
        },
        guruKelas: {
          where: { isActive: true },
          select: {
            id: true,
            guru: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' }
    });
    console.timeEnd('kelas-findMany-query');

    const responseData = {
      success: true,
      data: kelas,
      pagination: {
        page,
        perPage,
        total,
        totalPages: Math.ceil(total / perPage)
      }
    };

    // Cache response
    setCachedData(cacheKey, responseData);

    console.timeEnd('GET /api/admin/kelas');
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching kelas:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kelas', details: error.message },
      { status: 500 }
    );
  }
}
