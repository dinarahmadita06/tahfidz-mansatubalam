import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { guruId, peran, isActive } = await request.json();

    // Validasi input
    if (!guruId || !peran) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    if (!['utama', 'pengganti'].includes(peran)) {
      return NextResponse.json({ error: 'Peran harus utama atau pengganti' }, { status: 400 });
    }

    // Cek apakah guru sudah ada di kelas ini
    const existingGuruKelas = await prisma.guruKelas.findUnique({
      where: {
        guruId_kelasId: {
          guruId,
          kelasId: id
        }
      }
    });

    if (existingGuruKelas) {
      return NextResponse.json({ error: 'Guru sudah terdaftar di kelas ini' }, { status: 400 });
    }

    // Jika peran utama, nonaktifkan guru utama yang lama (jika ada)
    if (peran === 'utama' && isActive !== false) {
      await prisma.guruKelas.updateMany({
        where: {
          kelasId: id,
          peran: 'utama',
          isActive: true
        },
        data: {
          isActive: false,
          tanggalSelesai: new Date()
        }
      });
    }

    // Tambahkan guru ke kelas
    const guruKelas = await prisma.guruKelas.create({
      data: {
        guruId,
        kelasId: id,
        peran,
        isActive: isActive !== undefined ? isActive : true,
        tanggalMulai: new Date()
      },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      }
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'ADD_GURU',
      module: 'KELAS',
      description: `Menambahkan guru ${guruKelas.guru.user.name} sebagai ${peran} di kelas ${guruKelas.kelas.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: id,
        guruId: guruId,
        peran: peran
      }
    });

    return NextResponse.json(guruKelas, { status: 201 });
  } catch (error) {
    console.error('Error adding guru to kelas:', error);
    return NextResponse.json(
      { error: 'Failed to add guru to kelas' },
      { status: 500 }
    );
  }
}
