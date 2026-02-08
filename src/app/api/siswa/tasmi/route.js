export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
import { calculateStudentProgress, isEligibleForTasmi } from '@/lib/services/siswaProgressService';

// GET - Fetch siswa's own tasmi history with pagination
export async function GET(request) {
  console.time('TASMI_GET_Total');
  try {
    console.time('TASMI_GET_Auth');
    const session = await auth();
    console.timeEnd('TASMI_GET_Auth');

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

    // Get siswa data with current class info
    console.time('TASMI_GET_SiswaData');
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      select: { 
        id: true, 
        latestJuzAchieved: true,
        kelas: {
          select: {
            id: true,
            nama: true,
            tahunAjaran: {
              select: {
                id: true,
                isActive: true
              }
            }
          }
        }
      }
    });
    console.timeEnd('TASMI_GET_SiswaData');

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify if the student is in a class belonging to the active school year
    const activeClass = (siswa.kelas && siswa.kelas.tahunAjaran?.isActive) ? {
      id: siswa.kelas.id,
      nama: siswa.kelas.nama
    } : null;

    // Parallel fetch for independent data
    console.time('TASMI_GET_ParallelQueries');
    const [tasmi, totalCount] = await Promise.all([
      // Fetch tasmi history with pagination
      // NOTE: Explicitly EXCLUDE nilai fields from siswa view (security)
      prisma.tasmi.findMany({
        where: {
          siswaId: siswa.id,
        },
        select: {
          id: true,
          statusPendaftaran: true,
          tanggalTasmi: true,
          jamTasmi: true,
          juzYangDitasmi: true,
          jumlahHafalan: true,
          tanggalDaftar: true,
          catatan: true,
          // EXCLUDED FOR SECURITY: nilaiAkhir, nilaiKelancaran, nilaiAdab, nilaiTajwid, nilaiIrama, catatanPenguji, predikat, publishedAt, pdfUrl
          siswa: {
            select: {
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
            select: {
              id: true, // Add id for edit functionality
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
    ]);
    console.timeEnd('TASMI_GET_ParallelQueries');

    const totalPages = Math.ceil(totalCount / limit);

    // Get school year for active progress calculation
    console.time('TASMI_GET_SchoolYear');
    const schoolYear = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { id: true, targetHafalan: true, nama: true }
    });
    console.timeEnd('TASMI_GET_SchoolYear');

    // Use centralized service for progress calculation (active school year)
    console.time('TASMI_GET_ProgressCalculation');
    const progressData = await calculateStudentProgress(prisma, siswa.id, schoolYear?.id);
    console.timeEnd('TASMI_GET_ProgressCalculation');
    const totalJuzHafalan = progressData.totalJuz;
    const highestJuzAchieved = progressData.highestJuzAchieved;
    const completedJuzCount = progressData.completedJuzCount; // NEW: Only juz with 100% progress
    const targetJuzSekolah = progressData.targetJuzMinimal;
    const eligibilityResult = isEligibleForTasmi(completedJuzCount, targetJuzSekolah); // Use completedJuzCount

    console.log(`[DEBUG/TASMI] Student ${siswa.id} GET:
    - Target Juz: ${targetJuzSekolah}
    - Highest Juz Achieved (any progress): ${highestJuzAchieved}
    - Completed Juz Count (100%): ${completedJuzCount}
    - Total Juz (float): ${totalJuzHafalan}
    - Eligible: ${eligibilityResult.isEligible}
    - Remaining: ${eligibilityResult.remainingJuz}
    - School Year: ${schoolYear?.nama || 'None'}
    `);

    // Simplified response structure for the frontend
    const displayKelas = siswa.kelas ? siswa.kelas.nama : '-';
    const kelasId = siswa.kelas ? siswa.kelas.id : null;

    console.timeEnd('TASMI_GET_Total');
    return NextResponse.json({
      tasmi,
      totalJuzHafalan,
      highestJuzAchieved: completedJuzCount, // Send completedJuzCount as highestJuzAchieved for frontend compatibility
      targetJuzSekolah,
      isEligible: eligibilityResult.isEligible,
      eligibilityMessage: eligibilityResult.message,
      remainingJuz: eligibilityResult.remainingJuz,
      displayKelas,
      kelasId,
      siswa: {
        id: siswa.id,
        activeClass,
        kelas: siswa.kelas ? {
          id: siswa.kelas.id,
          nama: siswa.kelas.nama
        } : null
      },
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

    // Check already has active tasmi (MENUNGGU or DISETUJUI)
    const activeTasmi = await prisma.tasmi.findFirst({
      where: {
        siswaId: siswa.id,
        statusPendaftaran: {
          in: ['MENUNGGU', 'DISETUJUI']
        },
      },
    });

    if (activeTasmi) {
      const statusText = activeTasmi.statusPendaftaran === 'MENUNGGU' 
        ? 'menunggu verifikasi' 
        : 'sudah disetujui/terjadwal';
      return NextResponse.json(
        { message: `Anda masih memiliki pendaftaran yang ${statusText}. Selesaikan atau batalkan terlebih dahulu.` },
        { status: 400 }
      );
    }

    // Validasi minimal hafalan (Gunakan Centralized Service)
    const schoolYear = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { id: true, targetHafalan: true }
    });

    const progressData = await calculateStudentProgress(prisma, siswa.id, schoolYear?.id);
    const completedJuzCount = progressData.completedJuzCount; // Use completedJuzCount
    const minimalHafalan = Number(progressData.targetJuzMinimal) || 0;
    const eligibilityResult = isEligibleForTasmi(completedJuzCount, minimalHafalan); // Use completedJuzCount
    
    if (!eligibilityResult.isEligible) {
      return NextResponse.json(
        { 
          message: eligibilityResult.message,
          details: {
            completedJuzCount,
            targetJuzMinimal: minimalHafalan,
            remainingJuz: eligibilityResult.remainingJuz
          }
        },
        { status: 400 }
      );
    }

    // Create tasmi registration
    const tasmi = await prisma.tasmi.create({
      data: {
        siswa: { connect: { id: siswa.id } },
        jumlahHafalan: completedJuzCount, // ✅ Store completed juz count (100% only)
        juzYangDitasmi,
        jamTasmi,
        tanggalTasmi: new Date(tanggalTasmi),
        guruPengampu: { connect: { id: guruId } },
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
                id: true,
                nama: true,
              },
            },
          },
        },
        guruPengampu: {
          select: {
            id: true, // Add id for edit functionality
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`[DEBUG/TASMI] Success Create Tasmi:
    - Siswa: ${siswa.id} (${session.user.name})
    - Guru Pengampu: ${guruId}
    - Kelas: ${siswa.kelas?.nama || '-'}
    - Status: ${tasmi.statusPendaftaran}
    `);

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
