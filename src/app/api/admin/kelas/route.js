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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = (searchParams.get('search') || '').trim();
    const jenjang = (searchParams.get('jenjang') || '').trim(); // 'X' | 'XI' | 'XII'
    const tahun = (searchParams.get('tahun') || '').trim(); // e.g. '2026'
    const status = (searchParams.get('status') || '').trim(); // 'AKTIF' | 'NONAKTIF'
    const sort = (searchParams.get('sort') || '').trim(); // 'natural' | 'newest'

    // Build cache key with pagination & filters
    const cacheKey = [
      'admin-kelas',
      `p${page}`,
      `l${limit}`,
      `q:${search || '-'}`,
      `j:${jenjang || '-'}`,
      `t:${tahun || '-'}`,
      `s:${status || '-'}`
    ].join('|');

    // Check cache
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      console.timeEnd('GET /api/admin/kelas');
      return NextResponse.json(cachedData);
    }

    // Build where clause for search & filters
    let whereClause = {};
    if (search) {
      whereClause.OR = [
        { nama: { contains: search, mode: 'insensitive' } },
        { tahunAjaran: { nama: { contains: search, mode: 'insensitive' } } }
      ];
    }
    if (status && (status === 'AKTIF' || status === 'NONAKTIF')) {
      whereClause.status = status;
    }
    if (jenjang && ['X', 'XI', 'XII'].includes(jenjang.toUpperCase())) {
      whereClause.nama = {
        startsWith: jenjang.toUpperCase() + ' ',
        mode: 'insensitive'
      };
    }
    if (tahun) {
      const yearNum = parseInt(tahun, 10);
      if (!isNaN(yearNum)) {
        const start = new Date(yearNum, 0, 1);
        const end = new Date(yearNum + 1, 0, 1);
        whereClause.tahunAjaran = {
          ...(whereClause.tahunAjaran || {}),
          tanggalMulai: { gte: start, lt: end }
        };
      } else {
        // Fallback: filter by tahun ajaran name contains keyword
        whereClause.tahunAjaran = {
          ...(whereClause.tahunAjaran || {}),
          nama: { contains: tahun, mode: 'insensitive' }
        };
      }
    }

    // Helper natural sort for jenjang
    const parseClassName = (nama) => {
      const s = (nama || '').toUpperCase().trim();
      let tingkat = 0;
      let rest = s;
      if (s.startsWith('XII ')) {
        tingkat = 12; rest = s.substring(4);
      } else if (s.startsWith('XI ')) {
        tingkat = 11; rest = s.substring(3);
      } else if (s.startsWith('X ')) {
        tingkat = 10; rest = s.substring(2);
      }
      let grup = '';
      let nomor = 0;
      const grp = rest.match(/^F(\d+)\.(\d+)/);
      if (grp) {
        grup = `F${grp[1]}`;
        nomor = parseInt(grp[2], 10);
      } else {
        const m = rest.match(/^(\d+)/);
        if (m) nomor = parseInt(m[1], 10);
      }
      return { tingkat, grup, nomor, original: nama || '' };
    };
    const naturalSort = (a, b) => {
      const A = parseClassName(a.nama);
      const B = parseClassName(b.nama);
      if (A.tingkat !== B.tingkat) {
        if (A.tingkat === 0) return 1;
        if (B.tingkat === 0) return -1;
        return A.tingkat - B.tingkat;
      }
      if (A.grup !== B.grup) {
        if (!A.grup) return -1;
        if (!B.grup) return 1;
        return A.grup.localeCompare(B.grup);
      }
      if (A.nomor !== B.nomor) {
        return A.nomor - B.nomor;
      }
      return A.original.localeCompare(B.original);
    };

    let total = 0;
    let kelas = [];

    if (sort === 'newest') {
      // Newest first: paginate directly from DB by createdAt desc
      console.time('kelas-count-newest');
      total = await prisma.kelas.count({ where: whereClause });
      console.timeEnd('kelas-count-newest');
      console.time('kelas-findMany-newest');
      kelas = await prisma.kelas.findMany({
        where: whereClause,
        select: {
          id: true,
          nama: true,
          targetJuz: true,
          createdAt: true,
          status: true,
          tahunAjaran: { select: { nama: true, semester: true } },
          guruKelas: {
            where: { isActive: true },
            select: {
              id: true,
              peran: true,
              guru: { select: { id: true, user: { select: { id: true, name: true } } } }
            }
          },
          _count: { select: { siswa: true } }
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit
      });
      console.timeEnd('kelas-findMany-newest');
    } else {
      // Natural sort (default)
      console.time('kelas-findAll-natural');
      const allKelas = await prisma.kelas.findMany({
        where: whereClause,
        select: {
          id: true,
          nama: true,
          targetJuz: true,
          createdAt: true,
          status: true,
          tahunAjaran: {
            select: { nama: true, semester: true }
          },
          guruKelas: {
            where: { isActive: true },
            select: {
              id: true,
              peran: true,
              guru: {
                select: {
                  id: true,
                  user: { select: { id: true, name: true } }
                }
              }
            }
          },
          _count: { select: { siswa: true } }
        }
      });
      console.timeEnd('kelas-findAll-natural');
      total = allKelas.length;
      const sorted = allKelas.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'AKTIF' ? -1 : 1;
        }
        return naturalSort(a, b);
      });
      const start = (page - 1) * limit;
      kelas = sorted.slice(start, start + limit);
    }

    const responseData = {
      data: kelas,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
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
