import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { getOrangTuaProfile } from '@/lib/utils/parentHelpers';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/orangtua/profile
 * Fetch parent profile data based on session.user.id
 * SECURITY: Parent can only see their own profile
 */
export async function GET(request) {
  try {
    const session = await auth();

    // SECURITY: Validate parent is authenticated
    if (!session || (session.user.role !== 'ORANGTUA' && session.user.role !== 'ORANG_TUA')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // SECURITY: Fetch parent data based on session.user.id
    // This ensures parent can only see their own profile
    const orangTuaProfile = await getOrangTuaProfile(session.user.id);

    if (!orangTuaProfile) {
      return NextResponse.json(
        {
          error: 'Profile tidak ditemukan',
          message: 'Data orang tua tidak ditemukan. Hubungi admin.'
        },
        { status: 404 }
      );
    }

    // Return profile with cache: 'no-store' to ensure fresh data
    return NextResponse.json(orangTuaProfile, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    return NextResponse.json(
      {
        error: 'Gagal memuat profil',
        message: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orangtua/profile
 * Update parent profile data based on session.user.id
 * SECURITY: Parent can only update their own profile
 */
export async function PATCH(request) {
  try {
    const session = await auth();

    // SECURITY: Validate parent is authenticated
    if (!session || (session.user.role !== 'ORANGTUA' && session.user.role !== 'ORANG_TUA')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { namaLengkap, noTelepon, alamat } = body;

    // SECURITY: Find orangTua by userId to ensure we update the right parent
    const orangTua = await prisma.orangTua.findFirst({
      where: { userId: session.user.id },
      include: { user: true }
    });

    if (!orangTua) {
      return NextResponse.json(
        {
          error: 'Profile tidak ditemukan',
          message: 'Data orang tua tidak ditemukan'
        },
        { status: 404 }
      );
    }

    // Prepare update data (only allow editable fields)
    const userUpdateData = {};
    if (namaLengkap !== undefined && namaLengkap.trim()) {
      userUpdateData.name = namaLengkap;
    }

    const orangTuaUpdateData = {};
    if (noTelepon !== undefined && noTelepon.trim()) {
      // Validate phone format
      const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
      if (!phoneRegex.test(noTelepon)) {
        return NextResponse.json(
          { error: 'Format nomor telepon tidak valid' },
          { status: 400 }
        );
      }
      orangTuaUpdateData.noTelepon = noTelepon;
    }

    if (alamat !== undefined) {
      orangTuaUpdateData.alamat = alamat || null;
    }

    // Update both User and OrangTua tables
    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdateData
      });
    }

    if (Object.keys(orangTuaUpdateData).length > 0) {
      await prisma.orangTua.update({
        where: { id: orangTua.id },
        data: orangTuaUpdateData
      });
    }

    // Log the activity
    await logActivity({
      actorId: session.user.id,
      actorRole: 'ORANG_TUA',
      actorName: session.user.name,
      action: ACTIVITY_ACTIONS.ORANGTUA_UBAH_PROFIL,
      title: 'Mengubah Profil',
      description: 'Anda memperbarui informasi profil orang tua.',
      metadata: {
        fieldsUpdated: [
          namaLengkap !== undefined ? 'name' : null,
          noTelepon !== undefined ? 'noTelepon' : null,
          alamat !== undefined ? 'alamat' : null
        ].filter(Boolean)
      }
    });

    // Fetch and return updated profile
    const updatedProfile = await getOrangTuaProfile(session.user.id);

    return NextResponse.json(updatedProfile, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Error updating parent profile:', error);
    return NextResponse.json(
      {
        error: 'Gagal memperbarui profil',
        message: error.message
      },
      { status: 500 }
    );
  }
}
