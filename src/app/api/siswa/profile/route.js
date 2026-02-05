export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

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

// Helper: Convert UI gender string to Prisma enum
const parseGenderToEnum = (genderString) => {
  const genderMap = {
    'Laki-laki': 'LAKI_LAKI',
    'Perempuan': 'PEREMPUAN',
    'laki-laki': 'LAKI_LAKI',
    'perempuan': 'PEREMPUAN',
  };
  return genderMap[genderString] || null;
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
      nis: siswa.nis || '-',
      nisn: siswa.nisn || '-',
      jenisKelamin: formatGender(siswa.jenisKelamin),
      tanggalLahir: formatDate(siswa.tanggalLahir),
      alamat: siswa.alamat || '-',
      kelas: siswa.kelas?.nama || '-',
      kelasId: siswa.kelas?.id || null,
      statusSiswa: siswa.user?.isActive ? 'AKTIF' : 'NONAKTIF',
      namaWali: primaryGuardian?.user?.name || '-',
      phoneWali: '-', // field noTelepon dropped
      phone: '-',     // field noTelepon dropped
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

    // Prepare update data for Siswa table
    const siswaUpdateData = {};
    
    // Convert jenisKelamin UI string to Prisma enum
    if (body.jenisKelamin !== undefined) {
      const enumValue = parseGenderToEnum(body.jenisKelamin);
      if (enumValue) {
        siswaUpdateData.jenisKelamin = enumValue;
      } else {
        console.warn('[API SISWA PROFILE] Invalid jenisKelamin value:', body.jenisKelamin);
      }
    }
    
    // Convert tanggalLahir string to DateTime object
    if (body.tanggalLahir !== undefined && body.tanggalLahir !== '') {
      try {
        // Accept ISO format (YYYY-MM-DD or full ISO-8601)
        siswaUpdateData.tanggalLahir = new Date(body.tanggalLahir);
      } catch (err) {
        console.warn('[API SISWA PROFILE] Invalid tanggalLahir format:', body.tanggalLahir);
      }
    }
    
    if (body.alamat !== undefined) siswaUpdateData.alamat = body.alamat;
    // Note: namaWali tidak ada di Siswa model - field ini read-only dari relasi OrangTua

    // Prepare update data for User table (nama)
    const userUpdateData = {};
    if (body.nama !== undefined && body.nama.trim() !== '') {
      userUpdateData.name = body.nama.trim();
    }

    console.log('[API SISWA PROFILE] Siswa update data:', siswaUpdateData);
    console.log('[API SISWA PROFILE] User update data:', userUpdateData);

    // Update User table first if name changed
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: siswa.userId },
        data: userUpdateData,
      });
      console.log('[API SISWA PROFILE] User.name updated successfully');
    }

    // Update Siswa table
    const updated = await prisma.siswa.update({
      where: {
        id: siswa.id,
      },
      data: siswaUpdateData,
      include: {
        user: {
          select: {
            name: true,
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

    // Log the activity
    const fieldsUpdated = [];
    if (body.nama !== undefined) fieldsUpdated.push('nama');
    if (body.jenisKelamin !== undefined) fieldsUpdated.push('jenisKelamin');
    if (body.tanggalLahir !== undefined) fieldsUpdated.push('tanggalLahir');
    if (body.alamat !== undefined) fieldsUpdated.push('alamat');
    // namaWali is read-only from OrangTua relation

    await logActivity({
      actorId: session.user.id,
      actorRole: 'SISWA',
      actorName: updated.user?.name,
      action: ACTIVITY_ACTIONS.SISWA_UBAH_PROFIL,
      title: 'Mengubah Profil',
      description: 'Anda memperbarui informasi profil siswa.',
      metadata: {
        fieldsUpdated
      }
    });

    // Get the primary guardian if exists
    const primaryGuardian = updated.orangTuaSiswa?.[0]?.orangTua || null;

    // Format response to match frontend expectations
    const profileData = {
      id: updated.id,
      userId: updated.userId,
      nama: updated.user?.name || '-',
      nis: updated.nis || '-',
      nisn: updated.nisn || '-',
      jenisKelamin: formatGender(updated.jenisKelamin),
      tanggalLahir: formatDate(updated.tanggalLahir),
      alamat: updated.alamat || '-',
      kelas: updated.kelas?.nama || '-',
      kelasId: updated.kelas?.id || null,
      statusSiswa: updated.user?.isActive ? 'AKTIF' : 'NONAKTIF',
      namaWali: primaryGuardian?.user?.name || '-',
      phoneWali: '-', // noTelepon dropped
      phone: '-',     // noTelepon dropped
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
