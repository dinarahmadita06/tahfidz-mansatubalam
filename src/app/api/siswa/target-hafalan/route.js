import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Ambil data target hafalan siswa
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari data siswa
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: {
        kelas: {
          include: {
            tahunAjaran: true
          }
        },
        hafalan: {
          select: {
            juz: true
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { success: false, message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hitung capaian hafalan (distinct juz)
    const uniqueJuz = [...new Set(siswa.hafalan.map(h => h.juz))];
    const capaianJuz = uniqueJuz.length;

    // Ambil target pribadi dari database (jika ada)
    const targetPribadi = await prisma.targetHafalan.findFirst({
      where: {
        siswaId: siswa.id,
        tahun: new Date().getFullYear()
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const targetSekolah = siswa.kelas.targetJuz || 2;
    const targetAktif = targetPribadi?.targetJuz || targetSekolah;

    // Hitung progress percentage
    const progressPercentage = targetAktif > 0
      ? Math.round((capaianJuz / targetAktif) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        targetSekolah,
        targetPribadi: targetPribadi?.targetJuz || null,
        capaian: capaianJuz,
        progressPercentage,
        kelasInfo: {
          namaKelas: siswa.kelas.nama,
          tahunAjaran: siswa.kelas.tahunAjaran.nama
        }
      }
    });

  } catch (error) {
    console.error('Error fetching target hafalan siswa:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat data target hafalan' },
      { status: 500 }
    );
  }
}

// POST - Tambah/Update target pribadi siswa
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetPribadi } = body;

    if (!targetPribadi || targetPribadi <= 0) {
      return NextResponse.json(
        { success: false, message: 'Target pribadi harus lebih dari 0' },
        { status: 400 }
      );
    }

    // Validasi target maksimal 30 juz
    if (targetPribadi > 30) {
      return NextResponse.json(
        { success: false, message: 'Target maksimal 30 juz' },
        { status: 400 }
      );
    }

    // Cari data siswa
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id }
    });

    if (!siswa) {
      return NextResponse.json(
        { success: false, message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Cek apakah sudah ada target tahun ini
    const existingTarget = await prisma.targetHafalan.findFirst({
      where: {
        siswaId: siswa.id,
        tahun: currentYear
      }
    });

    let result;

    if (existingTarget) {
      // Update target yang ada
      result = await prisma.targetHafalan.update({
        where: { id: existingTarget.id },
        data: {
          targetJuz: Math.round(targetPribadi)
        }
      });
    } else {
      // Buat target baru
      result = await prisma.targetHafalan.create({
        data: {
          siswaId: siswa.id,
          targetJuz: Math.round(targetPribadi),
          bulan: currentMonth,
          tahun: currentYear,
          keterangan: 'Target pribadi siswa'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Target pribadi berhasil disimpan',
      data: result
    });

  } catch (error) {
    console.error('Error saving target pribadi:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menyimpan target pribadi' },
      { status: 500 }
    );
  }
}
