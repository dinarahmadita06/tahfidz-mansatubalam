import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { getJuzFromSurahAyah } from '@/lib/helpers/quran-mapping';

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

    if (!mappedJuz) {
      console.log(`[AUTO-MAP JUZ] surah="${surah}", surahNumber=${surahNumber}, ayatMulai=${ayatMulai}`);
      
      // Jika ada surahNumber, langsung gunakan untuk mapping
      if (resolvedSurahNumber) {
        mappedJuz = getJuzFromSurahAyah(resolvedSurahNumber, parseInt(ayatMulai));
        if (mappedJuz) {
          console.log(`[AUTO-MAP JUZ] ✅ Mapped: Surah ${resolvedSurahNumber}, Ayah ${ayatMulai} -> Juz ${mappedJuz}`);
        } else {
          console.warn(`[AUTO-MAP JUZ] ⚠️ Mapping gagal: Surah ${resolvedSurahNumber}, Ayah ${ayatMulai}`);
        }
      } else {
        // Fallback: Coba parse surah number dari string surah (e.g., "1. Al-Fatihah" -> 1)
        const match = surah.match(/^(\d+)/);
        if (match) {
          resolvedSurahNumber = parseInt(match[1], 10);
          mappedJuz = getJuzFromSurahAyah(resolvedSurahNumber, parseInt(ayatMulai));
          if (mappedJuz) {
            console.log(`[AUTO-MAP JUZ] ✅ Mapped dari surah string: "${surah}" -> Surah ${resolvedSurahNumber} -> Juz ${mappedJuz}`);
          }
        } else {
          console.warn(`[AUTO-MAP JUZ] ⚠️ Tidak bisa parse surah number dari: "${surah}"`);
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
      if (!Array.isArray(surahArray)) return null;
      
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
      
      return cleaned.length > 0 ? cleaned : null;
    };

    const cleanedSurahTambahan = cleanSurahTambahan(surahTambahan);

    // Create hafalan
    const hafalan = await prisma.hafalan.create({
      data: {
        siswaId,
        guruId: session.user.guruId,
        tanggal: tanggal ? new Date(tanggal) : new Date(),
        juz: mappedJuz, // Use auto-mapped juz
        surah,
        surahNumber: resolvedSurahNumber, // Save numeric surah ID
        ayatMulai: parseInt(ayatMulai),
        ayatSelesai: parseInt(ayatSelesai),
        ...(cleanedSurahTambahan && { surahTambahan: cleanedSurahTambahan }),
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
    let updateData = {
      tanggal: tanggal ? new Date(tanggal) : undefined,
      surah: surah || undefined,
      ayatMulai: ayatMulai ? parseInt(ayatMulai) : undefined,
      ayatSelesai: ayatSelesai ? parseInt(ayatSelesai) : undefined,
      ...(cleanedSurahTambahan && { surahTambahan: cleanedSurahTambahan }),
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
        const finalSurah = surah || currentHafalan.surah;
        const finalSurahNumber = surahNumber || currentHafalan.surahNumber;
        const finalAyatMulai = ayatMulai ? parseInt(ayatMulai) : currentHafalan.ayatMulai;

        if (finalSurahNumber) {
          const mappedJuz = getJuzFromSurahAyah(finalSurahNumber, finalAyatMulai);
          if (mappedJuz) {
            console.log(`[AUTO-MAP JUZ UPDATE] ✅ Mapped: Surah ${finalSurahNumber}, Ayah ${finalAyatMulai} -> Juz ${mappedJuz}`);
            updateData.juz = mappedJuz;
          }
        } else {
          const match = finalSurah.match(/^(\d+)/);
          if (match) {
            const parsedSurahNum = parseInt(match[1], 10);
            const mappedJuz = getJuzFromSurahAyah(parsedSurahNum, finalAyatMulai);
            if (mappedJuz) {
              console.log(`[AUTO-MAP JUZ UPDATE] ✅ Mapped dari surah string: "${finalSurah}" -> Juz ${mappedJuz}`);
              updateData.juz = mappedJuz;
              updateData.surahNumber = parsedSurahNum;
            }
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

    // Delete hafalan (will cascade delete penilaian)
    await prisma.hafalan.delete({
      where: {
        id,
        guruId: session.user.guruId
      }
    });

    return NextResponse.json({ message: 'Hafalan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting hafalan:', error);
    return NextResponse.json(
      { error: 'Failed to delete hafalan' },
      { status: 500 }
    );
  }
}
