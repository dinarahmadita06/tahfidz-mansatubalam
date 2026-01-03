import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { logActivity, ACTIVITY_TYPES } from '@/lib/helpers/activityLogger';

/**
 * GET - Fetch guru profile
 */
export async function GET(request) {
  try {
    const session = await auth();

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
      },
    });

    if (!guru) {
      return NextResponse.json(
        { message: 'Data guru tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(guru);
  } catch (error) {
    console.error('Error fetching guru profile:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update guru profile
 * Updates: name, email, phone, alamat, bidangKeahlian, mulaiMengajar
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
    const { name, email, phone, alamat, bidangKeahlian, mulaiMengajar } = body;

    // Update User profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email })
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
        ...(phone && { noTelepon: phone }),
        ...(alamat && { alamat }),
        ...(bidangKeahlian && { bidangKeahlian }),
        ...(mulaiMengajar && { mulaiMengajar: new Date(mulaiMengajar) })
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

    // Log activity
    await logActivity({
      userId: session.user.id,
      role: 'GURU',
      type: ACTIVITY_TYPES.EDIT_PROFIL,
      title: 'Mengedit profil',
      subtitle: 'Mengubah data profil guru'
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
