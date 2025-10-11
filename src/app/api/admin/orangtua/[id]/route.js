import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

// GET - Get single orang tua detail
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const orangTua = await prisma.orangTua.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isActive: true,
            createdAt: true
          }
        },
        siswa: {
          include: {
            user: {
              select: {
                name: true
              }
            },
            kelas: {
              select: {
                nama: true
              }
            }
          }
        }
      }
    });

    if (!orangTua) {
      return NextResponse.json({ error: 'Orang tua tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(orangTua);
  } catch (error) {
    console.error('Error fetching orang tua detail:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data orang tua' },
      { status: 500 }
    );
  }
}

// PUT - Update orang tua
export async function PUT(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      email,
      password,
      noHP,
      pekerjaan,
      alamat,
      image,
      isActive
    } = body;

    // Find orang tua
    const orangTua = await prisma.orangTua.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!orangTua) {
      return NextResponse.json({ error: 'Orang tua tidak ditemukan' }, { status: 404 });
    }

    // Check for duplicate email (excluding current user)
    if (email && email !== orangTua.user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email, id: { not: orangTua.userId } }
      });
      if (existingEmail) {
        return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
      }
    }

    // Validate phone number if provided
    if (noHP) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      if (!phoneRegex.test(noHP.replace(/[-\s]/g, ''))) {
        return NextResponse.json({ error: 'Format nomor HP tidak valid' }, { status: 400 });
      }
    }

    // Validate password length if provided
    if (password && password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    // Prepare update data
    const orangTuaUpdateData = {};
    if (noHP !== undefined) orangTuaUpdateData.noHP = noHP;
    if (pekerjaan !== undefined) orangTuaUpdateData.pekerjaan = pekerjaan || null;
    if (alamat !== undefined) orangTuaUpdateData.alamat = alamat || null;

    const userUpdateData = {};
    if (name !== undefined) userUpdateData.name = name;
    if (email !== undefined) userUpdateData.email = email;
    if (image !== undefined) userUpdateData.image = image || null;
    if (isActive !== undefined) userUpdateData.isActive = isActive;

    // Update password if provided
    if (password) {
      userUpdateData.password = await bcrypt.hash(password, 10);
    }

    // Update orang tua and user
    const updatedOrangTua = await prisma.orangTua.update({
      where: { id },
      data: {
        ...orangTuaUpdateData,
        user: {
          update: userUpdateData
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isActive: true
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'UPDATE',
      module: 'ORANG_TUA',
      description: `Mengupdate data orang tua ${updatedOrangTua.user.name}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        orangTuaId: updatedOrangTua.id
      }
    });

    return NextResponse.json(updatedOrangTua);
  } catch (error) {
    console.error('Error updating orang tua:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Gagal mengupdate orang tua' },
      { status: 500 }
    );
  }
}

// DELETE - Delete orang tua
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if orang tua exists
    const orangTua = await prisma.orangTua.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true
          }
        },
        siswa: true
      }
    });

    if (!orangTua) {
      return NextResponse.json({ error: 'Orang tua tidak ditemukan' }, { status: 404 });
    }

    // Store data for logging
    const orangTuaName = orangTua.user.name;
    const orangTuaNoHP = orangTua.noHP;

    // If has children, unlink them (set orangTuaId to null)
    if (orangTua.siswa.length > 0) {
      await prisma.siswa.updateMany({
        where: { orangTuaId: id },
        data: { orangTuaId: null }
      });
    }

    // Delete orang tua (will cascade delete user)
    await prisma.orangTua.delete({
      where: { id }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'DELETE',
      module: 'ORANG_TUA',
      description: `Menghapus orang tua ${orangTuaName} (No HP: ${orangTuaNoHP})`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        deletedOrangTuaId: id,
        deletedOrangTuaName: orangTuaName,
        unlinkedChildren: orangTua.siswa.length
      }
    });

    return NextResponse.json({
      message: 'Orang tua berhasil dihapus',
      unlinkedChildren: orangTua.siswa.length
    });
  } catch (error) {
    console.error('Error deleting orang tua:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus orang tua' },
      { status: 500 }
    );
  }
}
