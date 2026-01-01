import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has siswa role
    if (session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Forbidden: Only siswa can access their profile' },
        { status: 403 }
      );
    }

    // Get siswa data based on session user ID
    const siswa = await prisma.siswa.findFirst({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            isActive: true,
          },
        },
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
        orangTuaSiswa: {
          include: {
            orangTua: {
              include: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // If no siswa profile found, return 404
    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa profile not found' },
        { status: 404 }
      );
    }

    // Get the primary guardian if exists
    const primaryGuardian = siswa.orangTuaSiswa?.[0]?.orangTua || null;

    // Format response to match frontend expectations
    const profileData = {
      id: siswa.id,
      userId: siswa.userId,
      nama: siswa.user?.name || '-',
      email: siswa.user?.email || '-',
      nis: siswa.nis || '-',
      nisn: siswa.nisn || '-',
      jenisKelamin: siswa.jenisKelamin || '-',
      tanggalLahir: siswa.tanggalLahir || '-',
      alamat: siswa.alamat || '-',
      kelas: siswa.kelas?.nama || '-',
      kelasId: siswa.kelas?.id || null,
      statusSiswa: siswa.user?.isActive ? 'AKTIF' : 'NONAKTIF',
      namaWali: primaryGuardian?.user?.name || '-',
      phoneWali: primaryGuardian?.noTelepon || '-',
      phone: siswa.noHP || '-',
    };

    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    console.error('Error fetching siswa profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
