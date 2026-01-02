import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const formatDate = (date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
};

const formatGender = (gender) => {
  const genderMap = {
    LAKI_LAKI: 'Laki-laki',
    PEREMPUAN: 'Perempuan',
  };
  return genderMap[gender] || '-';
};

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
      jenisKelamin: formatGender(siswa.jenisKelamin),
      tanggalLahir: formatDate(siswa.tanggalLahir),
      alamat: siswa.alamat || '-',
      kelas: siswa.kelas?.nama || '-',
      kelasId: siswa.kelas?.id || null,
      statusSiswa: siswa.user?.isActive ? 'AKTIF' : 'NONAKTIF',
      namaWali: primaryGuardian?.user?.name || '-',
      phoneWali: primaryGuardian?.noTelepon || '-',
      phone: siswa.noTelepon || '-',
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

export async function PATCH(request) {
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
        { error: 'Forbidden: Only siswa can update their profile' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('BODY UPDATE:', body);

    // Get siswa data to update
    const siswa = await prisma.siswa.findFirst({
      where: {
        userId: session.user.id,
      },
    });

    // If no siswa profile found, return 404
    if (!siswa) {
      return NextResponse.json(
        { error: 'Siswa profile not found' },
        { status: 404 }
      );
    }

    // Update siswa data
    const updateData = {};
    if (body.phone !== undefined) {
      updateData.noTelepon = body.phone;  // Use noTelepon not noHP
    }
    if (body.alamat !== undefined) {
      updateData.alamat = body.alamat;
    }

    console.log('Update data:', updateData);

    const updated = await prisma.siswa.update({
      where: {
        id: siswa.id,
      },
      data: updateData,
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

    // Get the primary guardian if exists
    const primaryGuardian = updated.orangTuaSiswa?.[0]?.orangTua || null;

    // Format response to match frontend expectations
    const profileData = {
      id: updated.id,
      userId: updated.userId,
      nama: updated.user?.name || '-',
      email: updated.user?.email || '-',
      nis: updated.nis || '-',
      nisn: updated.nisn || '-',
      jenisKelamin: formatGender(updated.jenisKelamin),
      tanggalLahir: formatDate(updated.tanggalLahir),
      alamat: updated.alamat || '-',
      kelas: updated.kelas?.nama || '-',
      kelasId: updated.kelas?.id || null,
      statusSiswa: updated.user?.isActive ? 'AKTIF' : 'NONAKTIF',
      namaWali: primaryGuardian?.user?.name || '-',
      phoneWali: primaryGuardian?.noTelepon || '-',
      phone: updated.noTelepon || '-',
    };

    console.log('Updated profile response:', profileData);

    return NextResponse.json(profileData, { status: 200 });
  } catch (error) {
    console.error('Error updating siswa profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
