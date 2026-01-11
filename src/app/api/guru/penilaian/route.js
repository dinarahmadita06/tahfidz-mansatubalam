export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';


export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const penilaian = await prisma.penilaian.findMany({
      where: {
        guruId: session.user.guruId
      },
      include: {
        siswa: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        hafalan: {
          select: {
            id: true,
            // Removed surah: true since surah is a string field, not a relation
            juz: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(penilaian);
  } catch (error) {
    console.error('Error fetching penilaian:', error);
    return NextResponse.json(
      { error: 'Failed to fetch penilaian' },
      { status: 500 }
    );
  }
}

// POST - Create penilaian (dengan hafalan sekaligus)
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      // Data Hafalan
      siswaId,
      tanggal,
      juz,
      surah,
      ayatMulai,
      ayatSelesai,
      keterangan,
      // Data Penilaian
      tajwid,
      kelancaran,
      makhraj,
      adab,
      catatan
    } = data;

    // Validasi input
    if (!siswaId || !juz || !surah || !ayatMulai || !ayatSelesai) {
      return NextResponse.json(
        { error: 'Data hafalan tidak lengkap (siswa, juz, surah, ayat harus diisi)' },
        { status: 400 }
      );
    }

    if (!tajwid || !kelancaran || !makhraj || !adab) {
      return NextResponse.json(
        { error: 'Data penilaian tidak lengkap (semua nilai harus diisi)' },
        { status: 400 }
      );
    }

    // Validasi nilai (1-100)
    const validateScore = (score, field) => {
      const num = parseInt(score);
      if (isNaN(num) || num < 1 || num > 100) {
        throw new Error(`${field} harus bernilai 1-100`);
      }
      return num;
    };

    const tajwidScore = validateScore(tajwid, 'Tajwid');
    const kelancaranScore = validateScore(kelancaran, 'Kelancaran');
    const makhrajScore = validateScore(makhraj, 'Makhraj');
    const adabScore = validateScore(adab, 'Adab');

    // Hitung nilai akhir (rata-rata)
    const nilaiAkhir = (tajwidScore + kelancaranScore + makhrajScore + adabScore) / 4;

    // Create hafalan dan penilaian sekaligus (transaction)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create hafalan
      const hafalan = await tx.hafalan.create({
        data: {
          siswaId,
          guruId: session.user.guruId,
          tanggal: tanggal ? new Date(tanggal) : new Date(),
          juz: parseInt(juz),
          surah,
          ayatMulai: parseInt(ayatMulai),
          ayatSelesai: parseInt(ayatSelesai),
          keterangan: keterangan || null
        }
      });

      // 2. Create penilaian untuk hafalan tersebut
      const penilaian = await tx.penilaian.create({
        data: {
          hafalanId: hafalan.id,
          siswaId,
          guruId: session.user.guruId,
          tajwid: tajwidScore,
          kelancaran: kelancaranScore,
          makhraj: makhrajScore,
          adab: adabScore,
          nilaiAkhir: parseFloat(nilaiAkhir.toFixed(2)),
          catatan: catatan || null
        },
        include: {
          siswa: {
            include: {
              user: {
                select: { name: true }
              }
            }
          },
          hafalan: {
            select: {
              id: true,
              // Removed surah: true since surah is a string field, not a relation
              juz: true,
              ayatMulai: true,
              ayatSelesai: true,
              tanggal: true
            }
          }
        }
      });

      return penilaian;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating penilaian:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create penilaian' },
      { status: 500 }
    );
  }
}

// PUT - Update penilaian
export async function PUT(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      id,
      tajwid,
      kelancaran,
      makhraj,
      adab,
      catatan
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'ID penilaian harus disertakan' },
        { status: 400 }
      );
    }

    // Validasi nilai
    const validateScore = (score, field) => {
      const num = parseInt(score);
      if (isNaN(num) || num < 1 || num > 100) {
        throw new Error(`${field} harus bernilai 1-100`);
      }
      return num;
    };

    const tajwidScore = validateScore(tajwid, 'Tajwid');
    const kelancaranScore = validateScore(kelancaran, 'Kelancaran');
    const makhrajScore = validateScore(makhraj, 'Makhraj');
    const adabScore = validateScore(adab, 'Adab');

    // Hitung nilai akhir
    const nilaiAkhir = (tajwidScore + kelancaranScore + makhrajScore + adabScore) / 4;

    // Update penilaian
    const penilaian = await prisma.penilaian.update({
      where: {
        id,
        guruId: session.user.guruId
      },
      data: {
        tajwid: tajwidScore,
        kelancaran: kelancaranScore,
        makhraj: makhrajScore,
        adab: adabScore,
        nilaiAkhir: parseFloat(nilaiAkhir.toFixed(2)),
        catatan: catatan || null
      },
      include: {
        siswa: {
          include: {
            user: {
              select: { name: true }
            }
          }
        },
        hafalan: {
          select: {
            id: true,
            // Removed surah: true since surah is a string field, not a relation
            juz: true,
            ayatMulai: true,
            ayatSelesai: true,
            tanggal: true
          }
        }
      }
    });

    return NextResponse.json(penilaian);
  } catch (error) {
    console.error('Error updating penilaian:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update penilaian' },
      { status: 500 }
    );
  }
}

// DELETE - Delete penilaian
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
        { error: 'ID penilaian harus disertakan' },
        { status: 400 }
      );
    }

    // Delete penilaian
    await prisma.penilaian.delete({
      where: {
        id,
        guruId: session.user.guruId
      }
    });

    return NextResponse.json({ message: 'Penilaian berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting penilaian:', error);
    return NextResponse.json(
      { error: 'Failed to delete penilaian' },
      { status: 500 }
    );
  }
}