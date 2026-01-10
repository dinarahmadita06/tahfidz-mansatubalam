import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getJuzFromSurahAyah } from '@/lib/helpers/quran-mapping';
import { updateSiswaLatestJuz, parseSurahRange } from '@/lib/quranUtils';

// GET - Fetch hafalan
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const siswaId = searchParams.get('siswaId');
    const kelasId = searchParams.get('kelasId');

    let whereClause = {
      guruId: session.user.guruId
    };

    if (siswaId) {
      whereClause.siswaId = siswaId;
    }

    // If kelasId provided, filter by kelas
    if (kelasId) {
      whereClause.siswa = {
        kelasId: kelasId
      };
    }

    const hafalan = await prisma.hafalan.findMany({
      where: whereClause,
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true,
                email: true
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
        penilaian: {
          select: {
            id: true,
            tajwid: true,
            kelancaran: true,
            makhraj: true,
            adab: true,
            nilaiAkhir: true,
            catatan: true
          }
        }
      },
      orderBy: {
        tanggal: 'desc'
      }
    });

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('Error fetching hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hafalan' },
      { status: 500 }
    );
  }
}

// POST - Create hafalan
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      siswaId,
      tanggal,
      juz,
      surah,
      surahNumber,
      ayatMulai,
      ayatSelesai,
      surahTambahan = [],
      keterangan
    } = data;

    // Validasi input
    if (!siswaId || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json(
        { error: 'Data tidak lengkap (siswaId, surah, ayatMulai, ayatSelesai wajib)' },
        { status: 400 }
      );
    }

    // 🎯 AUTO-MAP JUZ: Jika juz tidak disediakan, hitung otomatis
    let mappedJuz = juz ? parseInt(juz) : null;
    let resolvedSurahNumber = surahNumber ? parseInt(surahNumber) : null;
    let finalSurahName = surah;
    let finalAyatMulai = parseInt(ayatMulai);
    let finalAyatSelesai = parseInt(ayatSelesai);

    // 🎯 PARSE SURAH STRING: Jika surah mengandung range (e.g. "Ali Imran (1-198)")
    const parsedRanges = parseSurahRange(surah);
    let extraSurahsFromParsing = [];
    
    if (parsedRanges.length > 0) {
      // First range goes to main fields
      const firstRange = parsedRanges[0];
      resolvedSurahNumber = firstRange.surahNumber || resolvedSurahNumber;
      if (firstRange.ayatMulai) finalAyatMulai = firstRange.ayatMulai;
      if (firstRange.ayatSelesai) finalAyatSelesai = firstRange.ayatSelesai;
      finalSurahName = firstRange.surahName || finalSurahName;
      
      // Additional ranges go to surahTambahan
      if (parsedRanges.length > 1) {
        extraSurahsFromParsing = parsedRanges.slice(1).map(r => ({
          surah: r.surahName,
          surahNumber: r.surahNumber,
          ayatMulai: r.ayatMulai || 1,
          ayatSelesai: r.ayatSelesai || 1
        }));
      }
    } else {
      // Fallback: If parsing fails and it's not a simple surah name from the list
      // Check if it's a known surah name. If not, maybe it was a malformed range.
      console.warn(`[PARSE WARNING] Surah string "${surah}" could not be parsed as a range.`);
    }

    if (!resolvedSurahNumber && !mappedJuz) {
       return NextResponse.json(
         { error: 'Format setoran tidak valid (Nama surah tidak dikenali atau range tidak sesuai)' },
         { status: 400 }
       );
    }

    if (!mappedJuz) {
      console.log(`[AUTO-MAP JUZ] surah="${finalSurahName}", surahNumber=${resolvedSurahNumber}, ayatMulai=${finalAyatMulai}`);
      
      // Jika ada surahNumber, langsung gunakan untuk mapping
      if (resolvedSurahNumber) {
        mappedJuz = getJuzFromSurahAyah(resolvedSurahNumber, finalAyatMulai);
        if (mappedJuz) {
          console.log(`[AUTO-MAP JUZ] ✅ Mapped: Surah ${resolvedSurahNumber}, Ayah ${finalAyatMulai} -> Juz ${mappedJuz}`);
        } else {
          console.warn(`[AUTO-MAP JUZ] ⚠️ Mapping gagal: Surah ${resolvedSurahNumber}, Ayah ${finalAyatMulai}`);
        }
      }
    }

    // Jika mapping gagal, gunakan default (akan menyebabkan error atau null)
    if (!mappedJuz) {
      console.warn(`[AUTO-MAP JUZ] ⚠️ FINAL WARNING: Juz tidak termap untuk ${surah} ayat ${ayatMulai}, akan menjadi NULL`);
      // Jangan throw error, biarkan juz NULL jika mapping gagal (bisa di-backfill nanti)
    }

    // ✅ HELPER: Clean and validate surahTambahan
    const cleanSurahTambahan = (surahArray) => {
      if (!Array.isArray(surahArray)) return [];
      
      return surahArray
        .filter(item => {
          if (!item.surah || (typeof item.surah === 'string' && !item.surah.trim())) {
            return false;
          }
          const ayatMulai = Number(item.ayatMulai);
          const ayatSelesai = Number(item.ayatSelesai);
          if (isNaN(ayatMulai) || isNaN(ayatSelesai) || ayatMulai <= 0 || ayatSelesai <= 0) {
            return false;
          }
          return true;
        })
        .map(item => ({
          surah: typeof item.surah === 'string' ? item.surah.trim() : item.surah,
          surahNumber: item.surahNumber || null,
          ayatMulai: Number(item.ayatMulai),
          ayatSelesai: Number(item.ayatSelesai)
        }));
    };

    const initialSurahTambahan = Array.isArray(surahTambahan) ? surahTambahan : [];
    const combinedSurahTambahan = cleanSurahTambahan([...extraSurahsFromParsing, ...initialSurahTambahan]);

    // Create hafalan
    const hafalan = await prisma.hafalan.create({
      data: {
        siswaId,
        guruId: session.user.guruId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        juz: mappedJuz, // Use auto-mapped juz
        surah: finalSurahName,
        surahNumber: resolvedSurahNumber, // Save numeric surah ID
        ayatMulai: finalAyatMulai,
        ayatSelesai: finalAyatSelesai,
        surahTambahan: combinedSurahTambahan,
        keterangan: keterangan || null
      },
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    // 🎯 UPDATE SISWA LATEST JUZ
    await updateSiswaLatestJuz(prisma, siswaId);

    return NextResponse.json(hafalan, { status: 201 });
  } catch (error) {
    console.error('Error creating hafalan:', error);
    
    let errorMessage = 'Gagal membuat hafalan';
    let statusCode = 500;
    
    if (error.code === 'P2025') {
      errorMessage = 'Data siswa atau guru tidak ditemukan';
      statusCode = 404;
    } else if (error.code === 'P2003') {
      errorMessage = 'Referensi data tidak valid';
      statusCode = 400;
    } else if (error.message?.includes('Unknown argument')) {
      errorMessage = 'Format data tidak sesuai';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}

// PUT - Update hafalan
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      id,
      tanggal,
      juz,
      surah,
      surahNumber,
      ayatMulai,
      ayatSelesai,
      surahTambahan = [],
      keterangan
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID hafalan harus disertakan' },
        { status: 400 }
      );
    }

    // ✅ HELPER: Clean and validate surahTambahan
    const cleanSurahTambahan = (surahArray) => {
      if (!Array.isArray(surahArray)) return undefined;
      
      const cleaned = surahArray
        .filter(item => {
          if (!item.surah || (typeof item.surah === 'string' && !item.surah.trim())) {
            return false;
          }
          const ayatMulai = Number(item.ayatMulai);
          const ayatSelesai = Number(item.ayatSelesai);
          if (isNaN(ayatMulai) || isNaN(ayatSelesai) || ayatMulai <= 0 || ayatSelesai <= 0) {
            return false;
          }
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
      
      return cleaned.length > 0 ? cleaned : undefined;
    };

    const cleanedSurahTambahan = cleanSurahTambahan(surahTambahan);

    // 🎯 AUTO-MAP JUZ for UPDATE: Jika ada perubahan surah/ayat tapi juz tidak disertakan
    let finalSurahName = surah;
    let finalSurahNumber = surahNumber;
    let finalAyatMulai = ayatMulai ? parseInt(ayatMulai) : undefined;
    let finalAyatSelesai = ayatSelesai ? parseInt(ayatSelesai) : undefined;

    // 🎯 PARSE SURAH STRING: Jika surah mengandung range (e.g. "Ali Imran (1-198)")
    let extraSurahsFromParsing = [];
    if (surah) {
      const parsedRanges = parseSurahRange(surah);
      if (parsedRanges.length > 0) {
        const firstRange = parsedRanges[0];
        finalSurahNumber = firstRange.surahNumber || finalSurahNumber;
        if (firstRange.ayatMulai) finalAyatMulai = firstRange.ayatMulai;
        if (firstRange.ayatSelesai) finalAyatSelesai = firstRange.ayatSelesai;
        finalSurahName = firstRange.surahName || finalSurahName;

        // Additional ranges go to surahTambahan
        if (parsedRanges.length > 1) {
          extraSurahsFromParsing = parsedRanges.slice(1).map(r => ({
            surah: r.surahName,
            surahNumber: r.surahNumber,
            ayatMulai: r.ayatMulai || 1,
            ayatSelesai: r.ayatSelesai || 1
          }));
        }
      }
    }

    const initialSurahTambahan = Array.isArray(surahTambahan) ? surahTambahan : [];
    const combinedSurahTambahan = cleanSurahTambahan([...extraSurahsFromParsing, ...initialSurahTambahan]);

    let updateData = {
      tanggal: tanggal ? new Date(tanggal) : undefined,
      surah: finalSurahName || undefined,
      surahNumber: finalSurahNumber ? parseInt(finalSurahNumber) : undefined,
      ayatMulai: finalAyatMulai,
      ayatSelesai: finalAyatSelesai,
      surahTambahan: combinedSurahTambahan.length > 0 ? combinedSurahTambahan : undefined,
      keterangan: keterangan || null
    };

    // Jika ada perubahan surah atau ayat, dan juz tidak disertakan, hitung otomatis
    if ((surah || ayatMulai || ayatSelesai) && !juz) {
      // Ambil data hafalan current untuk fallback
      const currentHafalan = await prisma.hafalan.findUnique({
        where: { id },
        select: { surah: true, surahNumber: true, ayatMulai: true }
      });

      if (currentHafalan) {
        const activeSurahNum = finalSurahNumber || currentHafalan.surahNumber;
        const activeAyatMulai = finalAyatMulai || currentHafalan.ayatMulai;

        if (activeSurahNum) {
          const mappedJuz = getJuzFromSurahAyah(activeSurahNum, activeAyatMulai);
          if (mappedJuz) {
            console.log(`[AUTO-MAP JUZ UPDATE] ✅ Mapped: Surah ${activeSurahNum}, Ayah ${activeAyatMulai} -> Juz ${mappedJuz}`);
            updateData.juz = mappedJuz;
          }
        }
      }
    } else if (juz) {
      // Jika juz disertakan, gunakan juz yang diberikan
      updateData.juz = parseInt(juz);
    }

    // Jika surahNumber disertakan, simpan juga
    if (surahNumber) {
      updateData.surahNumber = parseInt(surahNumber);
    }

    // Update hafalan
    const hafalan = await prisma.hafalan.update({
      where: {
        id,
        guruId: session.user.guruId
      },
      data: updateData,
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    });

    // 🎯 UPDATE SISWA LATEST JUZ
    await updateSiswaLatestJuz(prisma, hafalan.siswaId);

    return NextResponse.json(hafalan);
  } catch (error) {
    console.error('Error updating hafalan:', error);
    
    let errorMessage = 'Gagal mengupdate hafalan';
    let statusCode = 500;
    
    if (error.code === 'P2025') {
      errorMessage = 'Hafalan tidak ditemukan';
      statusCode = 404;
    } else if (error.message?.includes('Unknown argument')) {
      errorMessage = 'Format data tidak sesuai';
      statusCode = 400;
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}

// DELETE - Delete hafalan
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID hafalan harus disertakan' },
        { status: 400 }
      );
    }

    // Get siswaId before deletion
    const hafalan = await prisma.hafalan.findUnique({
      where: { id },
      select: { siswaId: true }
    });

    if (!hafalan) {
      return NextResponse.json({ error: 'Hafalan tidak ditemukan' }, { status: 404 });
    }

    // Delete hafalan (will cascade delete penilaian)
    await prisma.hafalan.delete({
      where: {
        id,
        guruId: session.user.guruId
      }
    });

    // 🎯 UPDATE SISWA LATEST JUZ
    await updateSiswaLatestJuz(prisma, hafalan.siswaId);

    return NextResponse.json({ message: 'Hafalan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to delete hafalan' },
      { status: 500 }
    );
  }
}
