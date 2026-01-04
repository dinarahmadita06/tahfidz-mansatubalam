import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
// GET - Fetch siswa's own tasmi history with pagination
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get pagination params
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Parallel fetch for independent data
    const [tasmi, totalCount, hafalanData] = await Promise.all([
      // Fetch tasmi history with pagination
      // NOTE: Explicitly EXCLUDE nilai fields from siswa view (security)
      prisma.tasmi.findMany({
        where: {
          siswaId: siswa.id,
        },
        select: {
          id: true,
          siswaId: true,
          statusPendaftaran: true,
          tanggalTasmi: true,
          jamTasmi: true,
          juzYangDitasmi: true,
          jumlahHafalan: true,
          tanggalDaftar: true,
          catatanPengajuan: true,
          // EXCLUDED FOR SECURITY: nilaiAkhir, nilaiKelancaran, nilaiAdab, nilaiTajwid, nilaiIrama, catatanPenguji, predikat, publishedAt, pdfUrl
          siswa: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
              kelas: {
                select: {
                  nama: true,
                },
              },
            },
          },
          guruPengampu: {
            include: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          tanggalDaftar: 'desc',
        },
        skip,
        take: limit,
      }),

      // Count total tasmi records
      prisma.tasmi.count({
        where: {
          siswaId: siswa.id,
        },
      }),

      // Calculate total juz hafalan from DISTINCT juz in Hafalan table
      prisma.hafalan.findMany({
        where: {
          siswaId: siswa.id,
        },
        select: {
          juz: true,
        },
        distinct: ['juz'],
      }),
    ]);

    const totalJuzHafalan = hafalanData.length;

    // Target juz sekolah (default 3, could be from settings in the future)
    const targetJuzSekolah = 3;

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tasmi,
      totalJuzHafalan,
      targetJuzSekolah,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// POST - Register for tasmi
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { jumlahHafalan, juzYangDitasmi, guruId, jamTasmi, tanggalTasmi, catatan } = body;

    // Validation
    if (!jumlahHafalan || !juzYangDitasmi || !jamTasmi || !tanggalTasmi || !guruId) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi (jumlah hafalan, juz yang ditasmi, jam, tanggal, dan guru)' },
        { status: 400 }
      );
    }

    if (jumlahHafalan > 30) {
      return NextResponse.json(
        { message: 'Jumlah hafalan maksimal 30 juz' },
        { status: 400 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: {
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!siswa.kelas) {
      return NextResponse.json(
        { message: 'Anda belum terdaftar di kelas manapun' },
        { status: 400 }
      );
    }

    // Verify that the selected guru exists
    const guruExists = await prisma.guru.findUnique({
      where: { id: guruId },
    });

    if (!guruExists) {
      return NextResponse.json(
        { message: 'Guru yang dipilih tidak valid' },
        { status: 400 }
      );
    }

    // Check if already has pending tasmi
    const pendingTasmi = await prisma.tasmi.findFirst({
      where: {
        siswaId: siswa.id,
        statusPendaftaran: 'MENUNGGU',
      },
    });

    if (pendingTasmi) {
      return NextResponse.json(
        { message: 'Anda masih memiliki pendaftaran yang menunggu verifikasi' },
        { status: 400 }
      );
    }

    // Validasi minimal hafalan (minimal 3 juz atau target sekolah, ambil yang lebih besar)
    const minimalHafalan = 3; // Default minimal 3 juz
    if (jumlahHafalan < minimalHafalan) {
      return NextResponse.json(
        { message: `Hafalan belum memenuhi syarat minimal Tasmi (minimal ${minimalHafalan} juz). Saat ini Anda baru ${jumlahHafalan} juz.` },
        { status: 400 }
      );
    }

    // Create tasmi registration
    const tasmi = await prisma.tasmi.create({
      data: {
        siswaId: siswa.id,
        jumlahHafalan: parseInt(jumlahHafalan),
        juzYangDitasmi,
        jamTasmi,
        tanggalTasmi: new Date(tanggalTasmi),
        guruPengampuId: guruId,
        catatan,
        statusPendaftaran: 'MENUNGGU',
      },
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            kelas: {
              select: {
                nama: true,
              },
            },
          },
        },
        guruPengampu: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // ✅ Log activity - siswa daftar tasmi
    await logActivity({
      actorId: session.user.id,
      actorRole: 'SISWA',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.SISWA_DAFTAR_TASMI,
      title: 'Mendaftar Tasmi',
      description: `Mendaftar untuk Juz ${juzYangDitasmi} dengan target hafalan ${jumlahHafalan} juz`,
      metadata: {
        tasmiId: tasmi.id,
        juzYangDitasmi,
        jumlahHafalan: parseInt(jumlahHafalan),
        tanggalTasmi: tasmi.tanggalTasmi,
        jamTasmi
      }
    }).catch(err => console.error('Activity log error:', err));

    return NextResponse.json(
      { message: 'Pendaftaran Tasmi\' berhasil', tasmi },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tasmi:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
