import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nis, tanggalLahir } = body;

    // Validate required fields
    if (!nis || !tanggalLahir) {
      return NextResponse.json(
        { error: 'NIS dan tanggal lahir harus diisi' },
        { status: 400 }
      );
    }

    // Find student by NIS and tanggalLahir
    const siswa = await prisma.siswa.findFirst({
      where: {
        nis: nis.toString(),
        tanggalLahir: new Date(tanggalLahir)
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'NIS atau tanggal lahir tidak cocok' },
        { status: 404 }
      );
    }

    // Check if parent has already registered
    const existingParent = await prisma.orangTuaSiswa.findFirst({
      where: {
        siswaId: siswa.id
      }
    });

    if (existingParent) {
      return NextResponse.json(
        { error: 'Akun orang tua untuk siswa ini sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        siswaId: siswa.id,
        siswaName: siswa.user.name,
        message: 'Verifikasi berhasil'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error verifying student:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat verifikasi' },
      { status: 500 }
    );
  }
}
