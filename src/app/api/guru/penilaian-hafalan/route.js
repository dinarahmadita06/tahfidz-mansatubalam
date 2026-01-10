import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { calcAverageScore, calcStatisticAverage, normalizeNilaiAkhir } from '@/lib/helpers/calcAverageScore';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';
import { updateSiswaLatestJuz, surahNameToNumber, getJuzFromSurahAyah } from '@/lib/quranUtils';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    const siswaId = searchParams.get('siswaId');

    // Build where clause for hafalan
    let whereClause = {
      guruId: session.user.guruId
    };

    // Filter by kelas if provided
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    // Filter by specific siswa if provided
    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
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
        },
        penilaian: true
        // Removed surah: true since surah is a string field, not a relation
      },
      orderBy: {
        tanggal: 'desc'  // ✅ Order by hafalan tanggal, not createdAt
      }
    });

    // ✅ Normalize nilaiAkhir in response to 2 decimal places
    const normalizedHafalan = hafalan.map(h => ({
      ...h,
      penilaian: h.penilaian.map(p => ({
        ...p,
        nilaiAkhir: parseFloat((p.nilaiAkhir || 0).toFixed(2)) // Ensure 2 decimal consistency
      }))
    }));

    console.log(`[PENILAIAN GET] Fetched ${normalizedHafalan.length} hafalan records`);
    return NextResponse.json(normalizedHafalan);
  } catch (error) {
    console.error('Error fetching hafalan for penilaian:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// POST - Save penilaian
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      siswaId,
      tanggal,
      surah,
      ayatMulai,
      ayatSelesai,
      surahTambahan = [],
      tajwid,
      kelancaran,
      makhraj,
      implementasi,
      catatan,
    } = body;

    // Validation
    if (!siswaId || !tanggal || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (
      tajwid == null ||
      kelancaran == null ||
      makhraj == null ||
      implementasi == null
    ) {
      return NextResponse.json(
        { error: 'All assessment values are required' },
        { status: 400 }
      );
    }

    // ✅ HELPER: Clean and validate surahTambahan
    const cleanSurahTambahan = (surahArray) => {
      if (!Array.isArray(surahArray)) return [];
      
      return surahArray
        .filter(item => {
          // Only include items where surah is not empty
          if (!item.surah || (typeof item.surah === 'string' && !item.surah.trim())) {
            return false;
          }
          // Validate ayat numbers
          const ayatMulai = Number(item.ayatMulai);
          const ayatSelesai = Number(item.ayatSelesai);
          if (isNaN(ayatMulai) || isNaN(ayatSelesai) || ayatMulai <= 0 || ayatSelesai <= 0) {
            return false;
          }
          // Ensure ayatMulai <= ayatSelesai
          if (ayatMulai > ayatSelesai) {
            return false;
          }
          return true;
        })
        .map(item => ({
          surah: typeof item.surah === 'string' ? item.surah.trim() : item.surah,
          ayatMulai: Number(item.ayatMulai),
          ayatSelesai: Number(item.ayatSelesai)
        }));
    };

    // Clean surahTambahan before processing
    const cleanedSurahTambahan = cleanSurahTambahan(surahTambahan);

    // ✅ Normalize tanggal to YYYY-MM-DD format (start of day, no timezone issues)
    const dateObj = new Date(tanggal);
    const normalizedDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());

    // Get guru data
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru not found' },
        { status: 404 }
      );
    }

    // ✅ Calculate nilai akhir with consistent rounding using shared utility
    const nilaiAkhir = calcAverageScore(tajwid, kelancaran, makhraj, implementasi, 2);

    // ✅ Resolve Surah Number and Juz
    const resolvedSurahNumber = surahNameToNumber[surah] || null;
    const mappedJuz = resolvedSurahNumber ? getJuzFromSurahAyah(resolvedSurahNumber, ayatMulai) : null;

    console.log(`[DEBUG/PENILAIAN] Siswa: ${siswaId}, Surah: ${surah} (${resolvedSurahNumber}), Ayah: ${ayatMulai}-${ayatSelesai}, Mapped Juz: ${mappedJuz}`);

    // ✅ UPSERT: Check if hafalan exists for this siswa + tanggal
    // Query by hafalan.tanggal (not penilaian.createdAt) to prevent duplicates
    const existingHafalan = await prisma.hafalan.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        tanggal: normalizedDate,
      },
      include: {
        penilaian: true,
      },
    });

    if (existingHafalan) {
      // UPDATE existing hafalan + penilaian (UPSERT logic)
      console.log(`[PENILAIAN] UPDATE hafalan ${existingHafalan.id} for siswa ${siswaId} on ${normalizedDate}`);
      
      await prisma.hafalan.update({
        where: { id: existingHafalan.id },
        data: {
          tanggal: normalizedDate,
          surah,
          surahNumber: resolvedSurahNumber,
          juz: mappedJuz || existingHafalan.juz,
          ayatMulai,
          ayatSelesai,
          ...(cleanedSurahTambahan.length > 0 && { surahTambahan: cleanedSurahTambahan }),
        },
      });

      // Update existing penilaian or create if doesn't exist
      if (existingHafalan.penilaian && existingHafalan.penilaian.length > 0) {
        await prisma.penilaian.update({
          where: { id: existingHafalan.penilaian[0].id },
          data: {
            tajwid,
            kelancaran,
            makhraj,
            adab: implementasi,
            nilaiAkhir,
            catatan: catatan || null,
          },
        });
      } else {
        // Create new penilaian for existing hafalan
        await prisma.penilaian.create({
          data: {
            hafalanId: existingHafalan.id,
            siswaId,
            guruId: guru.id,
            tajwid,
            kelancaran,
            makhraj,
            adab: implementasi,
            nilaiAkhir,
            catatan: catatan || null,
          },
        });
      }
    } else {
      // CREATE new hafalan + penilaian (UPSERT logic)
      console.log(`[PENILAIAN] CREATE hafalan for siswa ${siswaId} on ${normalizedDate}`);
      
      const hafalan = await prisma.hafalan.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: normalizedDate,
          juz: mappedJuz,
          surah,
          surahNumber: resolvedSurahNumber,
          ayatMulai,
          ayatSelesai,
          ...(cleanedSurahTambahan.length > 0 && { surahTambahan: cleanedSurahTambahan }),
        },
      });

      // Create penilaian untuk hafalan baru
      await prisma.penilaian.create({
        data: {
          hafalanId: hafalan.id,
          siswaId,
          guruId: guru.id,
          tajwid,
          kelancaran,
          makhraj,
          adab: implementasi,
          nilaiAkhir,
          catatan: catatan || null,
        },
      });
    }

    // Ensure presensi is marked as HADIR if penilaian is created
    const existingPresensi = await prisma.presensi.findFirst({
      where: {
        siswaId,
        guruId: guru.id,
        tanggal: normalizedDate,  // ✅ Use normalized date
      },
    });

    if (!existingPresensi) {
      await prisma.presensi.create({
        data: {
          siswaId,
          guruId: guru.id,
          tanggal: normalizedDate,  // ✅ Use normalized date
          status: 'HADIR',
        },
      });
    }

    // ✅ Log activity - input/edit penilaian
    const siswa = await prisma.siswa.findUnique({
      where: { id: siswaId },
      include: { user: { select: { name: true } } }
    });

    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.GURU_INPUT_PENILAIAN,
      title: 'Menginput penilaian hafalan',
      description: `Penilaian untuk ${siswa?.user.name || 'siswa'} - ${surah}:${ayatMulai}-${ayatSelesai}`,
      targetUserId: siswaId,
      targetRole: 'SISWA',
      targetName: siswa?.user.name,
      metadata: {
        surah,
        ayatMulai,
        ayatSelesai,
        nilaiAkhir,
        tajwid,
        kelancaran,
        makhraj,
        implementasi
      }
    });

    // ✅ 🎯 UPDATE SISWA PROGRESS SUMMARY
    await updateSiswaLatestJuz(prisma, siswaId);

    return NextResponse.json({
      success: true,
      message: 'Penilaian berhasil disimpan',
      nilaiAkhir: nilaiAkhir,  // Explicitly return with 2 decimal precision
      hafalanTambahan: cleanedSurahTambahan.length > 0 ? cleanedSurahTambahan : null
    });
  } catch (error) {
    console.error('Error saving penilaian:', error);
    
    // Detailed error responses for frontend
    let errorMessage = 'Gagal menyimpan penilaian';
    let statusCode = 500;

    if (error.code === 'P2025') {
      errorMessage = 'Data siswa atau guru tidak ditemukan';
      statusCode = 404;
    } else if (error.code === 'P2003') {
      errorMessage = 'Referensi data tidak valid (siswa atau guru tidak ada)';
      statusCode = 400;
    } else if (error.message?.includes('Unknown argument')) {
      errorMessage = 'Format data tidak sesuai - periksa struktur surahTambahan';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}
