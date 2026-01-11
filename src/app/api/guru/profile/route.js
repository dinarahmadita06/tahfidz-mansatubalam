export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/helpers/activityLoggerV2';

/**
 * GET - Fetch guru profile
 */
export async function GET(request) {
  console.time('[API /guru/profile]');
  try {
    const session = await auth();
    console.log('[GURU PROFILE GET] Session:', session?.user?.id, 'Role:', session?.user?.role);

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get guru data based on session user id
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        guruKelas: {
          include: {
            kelas: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
        // Include nip and jenisKelamin fields directly in the main query
      },
    });

    if (!guru) {
      console.error('[GURU PROFILE GET] Guru not found for userId:', session.user.id);
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    console.log('[GURU PROFILE GET] Success, returning guru data');
    console.timeEnd('[API /guru/profile]');
    return NextResponse.json(guru);
  } catch (error) {
    console.error('[GURU PROFILE GET] Error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update guru profile
 * Updates: name, email, tanggalLahir
 */
export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'GURU') {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya guru yang dapat mengakses' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, nip, jenisKelamin, tanggalLahir } = body;

    // Update User profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name })
      }
    });

    // Update Guru profile
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedGuru = await prisma.guru.update({
      where: { id: guru.id },
      data: {
        ...(nip !== undefined && { nip: nip || null }),
        ...(jenisKelamin && { jenisKelamin }),
        ...(tanggalLahir && { tanggalLahir: new Date(tanggalLahir) })
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

    // ✅ Log activity
    await logActivity({
      actorId: session.user.id,
      actorRole: 'GURU',
      actorName: updatedUser.name,
      action: ACTIVITY_ACTIONS.GURU_UBAH_PROFIL,
      title: 'Mengubah profil pribadi',
      description: 'Update profil',
      metadata: {
        updatedFields: [
          name && 'nama',
          nip !== undefined && 'nip',
          jenisKelamin && 'jenisKelamin',
          tanggalLahir && 'tanggalLahir'
        ].filter(Boolean)
      }
    });

    console.log(`[GURU PROFILE] Updated profile for guru ${guru.id}`);

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: updatedGuru
    });

  } catch (error) {
    console.error('Error updating guru profile:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui profil', details: error.message },
      { status: 500 }
    );
  }
}
