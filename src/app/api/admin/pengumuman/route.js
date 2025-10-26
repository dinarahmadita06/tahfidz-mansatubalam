import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil daftar pengumuman
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pengumuman = await prisma.pengumuman.findMany({
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
        wisuda: {
          include: {
            siswa: {
              include: {
                siswa: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    },
                    kelas: {
                      select: {
                        nama: true,
                        tingkat: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ pengumuman });
  } catch (error) {
    console.error('Error fetching pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pengumuman' },
      { status: 500 }
    );
  }
}

// POST - Membuat pengumuman baru
export async function POST(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      judul,
      isi,
      isPenting,
      targetRole,
      tipePengumuman,
      wisudaId,
      siswaIds  // Array of siswa IDs untuk wisuda
    } = body;

    // Validasi
    if (!judul || !isi || !targetRole || targetRole.length === 0) {
      return NextResponse.json(
        { error: 'Judul, isi, dan target role harus diisi' },
        { status: 400 }
      );
    }

    // Jika tipe wisuda, generate judul dan isi otomatis
    let finalJudul = judul;
    let finalIsi = isi;
    let finalWisudaId = wisudaId;

    if (tipePengumuman === 'WISUDA' && siswaIds && siswaIds.length > 0) {
      // Ambil data siswa
      const siswaData = await prisma.siswa.findMany({
        where: {
          id: { in: siswaIds }
        },
        include: {
          user: {
            select: {
              name: true
            }
          },
          kelas: {
            select: {
              nama: true,
              tingkat: true
            }
          }
        }
      });

      // Generate judul otomatis
      finalJudul = `Pengumuman Wisuda Tahfidz - ${new Date().getFullYear()}`;

      // Generate isi otomatis dengan format template
      const siswaList = siswaData
        .map((s, idx) => `${idx + 1}. ${s.user.name} - Kelas ${s.kelas.tingkat} ${s.kelas.nama}`)
        .join('\n');

      finalIsi = `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم

السَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ

Dengan mengucap puji syukur kehadirat Allah SWT, kami mengumumkan bahwa santri/santriah berikut telah menyelesaikan hafalan Al-Qur'an 30 juz dan akan mengikuti Wisuda Tahfidz:

${siswaList}

Semoga Allah SWT memberikan keberkahan ilmu dan menjadikan Al-Qur'an sebagai syafa'at di hari kiamat kelak.

جَزَاكُمُ اللّهُ خَيْرًا
وَالسَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ`;

      // Jika wisudaId tidak ada, buat wisuda baru
      if (!finalWisudaId) {
        // Dapatkan guru ID dari session
        const guru = await prisma.guru.findUnique({
          where: { userId: session.user.id }
        });

        if (!guru) {
          return NextResponse.json(
            { error: 'Guru tidak ditemukan' },
            { status: 404 }
          );
        }

        const wisuda = await prisma.wisuda.create({
          data: {
            guruId: guru.id,
            tanggalWisuda: new Date(),
            lokasiWisuda: 'MAN 1 Bandar Lampung',
            keterangan: 'Wisuda Tahfidz Angkatan ' + new Date().getFullYear(),
            status: 'upcoming',
            siswa: {
              create: siswaIds.map(siswaId => ({
                siswaId,
                totalJuz: 30
              }))
            }
          }
        });

        finalWisudaId = wisuda.id;
      }
    }

    // Dapatkan guru ID dari session
    const guru = await prisma.guru.findUnique({
      where: { userId: session.user.id }
    });

    if (!guru) {
      return NextResponse.json(
        { error: 'Guru tidak ditemukan' },
        { status: 404 }
      );
    }

    // Buat pengumuman
    const pengumuman = await prisma.pengumuman.create({
      data: {
        guruId: guru.id,
        judul: finalJudul,
        isi: finalIsi,
        isPenting: isPenting || false,
        targetRole,
        tipePengumuman: tipePengumuman || 'UMUM',
        wisudaId: finalWisudaId,
        createdBy: session.user.id,
        publishedAt: new Date()
      },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        },
        wisuda: {
          include: {
            siswa: {
              include: {
                siswa: {
                  include: {
                    user: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Log aktivitas
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'CREATE',
        module: 'PENGUMUMAN',
        description: `Membuat pengumuman: ${finalJudul}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dibuat',
      pengumuman
    });
  } catch (error) {
    console.error('Error creating pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pengumuman' },
      { status: 500 }
    );
  }
}

// DELETE - Menghapus pengumuman
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID pengumuman harus diisi' },
        { status: 400 }
      );
    }

    await prisma.pengumuman.delete({
      where: { id }
    });

    // Log aktivitas
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        action: 'DELETE',
        module: 'PENGUMUMAN',
        description: `Menghapus pengumuman ID: ${id}`,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pengumuman berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting pengumuman:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengumuman' },
      { status: 500 }
    );
  }
}
