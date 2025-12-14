import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { logActivity, getIpAddress, getUserAgent } from '@/lib/activityLog';

export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nama, tahunAjaranId, targetJuz, guruUtamaId, guruPendampingIds } = body;

    // Validate required fields
    if (!nama || !tahunAjaranId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if tahun ajaran exists
    const tahunAjaran = await prisma.tahunAjaran.findUnique({
      where: { id: tahunAjaranId } // tahunAjaranId is a string (CUID), not a number
    });

    if (!tahunAjaran) {
      return NextResponse.json(
        { error: 'Tahun ajaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create kelas dengan guru menggunakan transaction
    const kelas = await prisma.$transaction(async (tx) => {
      // 1. Create kelas
      const newKelas = await tx.kelas.create({
        data: {
          nama,
          tahunAjaranId: tahunAjaranId, // Keep as string - it's a CUID
          targetJuz: targetJuz ? parseInt(targetJuz) : 1,
        }
      });

      // 2. Add guru utama if provided (non-null, non-empty)
      if (guruUtamaId && guruUtamaId.trim()) {
        await tx.guruKelas.create({
          data: {
            kelasId: newKelas.id,
            guruId: guruUtamaId, // Keep as string - it's a CUID
            peran: 'utama',
            isActive: true,
          },
        });
      }

      // 3. Add guru pendamping if provided (filter out empty values)
      if (guruPendampingIds && Array.isArray(guruPendampingIds) && guruPendampingIds.length > 0) {
        const validGuruIds = guruPendampingIds.filter(id => id && id.trim());
        if (validGuruIds.length > 0) {
          const guruPendampingData = validGuruIds.map((guruId) => ({
            kelasId: newKelas.id,
            guruId: guruId, // Keep as string - it's a CUID
            peran: 'pendamping',
            isActive: true,
          }));

          await tx.guruKelas.createMany({
            data: guruPendampingData,
          });
        }
      }

      // 4. Fetch complete kelas data
      const kelasWithRelations = await tx.kelas.findUnique({
        where: { id: newKelas.id },
        include: {
          tahunAjaran: {
            select: {
              nama: true,
              semester: true
            }
          },
          guruKelas: {
            include: {
              guru: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          _count: {
            select: {
              siswa: true
            }
          }
        }
      });

      return kelasWithRelations;
    });

    // Log activity
    await logActivity({
      userId: session.user.id,
      userName: session.user.name,
      userRole: session.user.role,
      action: 'CREATE',
      module: 'KELAS',
      description: `Menambahkan kelas baru ${kelas.nama}`,
      ipAddress: getIpAddress(request),
      userAgent: getUserAgent(request),
      metadata: {
        kelasId: kelas.id,
        tahunAjaranId: kelas.tahunAjaranId,
        guruUtamaId: guruUtamaId || null,
        guruPendampingCount: guruPendampingIds?.length || 0
      }
    });

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error creating kelas:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kelas', details: error.message },
      { status: 500 }
    );
  }
}
