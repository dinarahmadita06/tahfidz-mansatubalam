import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Ambil detail target hafalan anak
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ORANG_TUA') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { siswaId } = params;

    // Cari data orang tua
    const orangTua = await prisma.orangTua.findUnique({
      where: { userId: session.user.id }
    });

    if (!orangTua) {
      return NextResponse.json(
        { success: false, message: 'Data orang tua tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cari data siswa dan pastikan adalah anak dari orang tua ini
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTuaId: orangTua.id,
        status: 'approved'
      },
      include: {
        kelas: {
          include: {
            tahunAjaran: true
          }
        },
        hafalan: {
          include: {
            surah: true
          },
          orderBy: {
            tanggalSetor: 'desc'
          },
          take: 10
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

    // Format riwayat hafalan
    const hafalanHistory = siswa.hafalan.map(h => ({
      id: h.id,
      surahNama: h.surah.nama,
      surahNamaLatin: h.surah.namaLatin,
      ayatMulai: h.ayatMulai,
      ayatSelesai: h.ayatSelesai,
      juz: h.juz,
      halaman: h.halaman,
      tanggalSetor: h.tanggalSetor,
      status: h.status,
      nilaiAkhir: h.nilaiAkhir,
      predikat: h.predikat,
      catatan: h.catatan
    }));

    return NextResponse.json({
      success: true,
      data: {
        target: {
          targetSekolah,
          targetPribadi: targetPribadi?.targetJuz || null,
          capaian: capaianJuz,
          progressPercentage,
          kelasInfo: {
            nama: siswa.kelas.nama,
            tahunAjaran: siswa.kelas.tahunAjaran.nama
          }
        },
        history: hafalanHistory
      }
    });

  } catch (error) {
    console.error('Error fetching target detail:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat detail target hafalan' },
      { status: 500 }
    );
  }
}
