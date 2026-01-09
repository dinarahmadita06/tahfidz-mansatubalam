import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Cek autentikasi dan pastikan ADMIN
    const session = await auth();
    if (!session?.user?.id || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // email, nis, nip, noTelepon
    const query = searchParams.get('query');

    if (!type || !query) {
      return NextResponse.json(
        { error: 'Parameter type dan query harus diisi' },
        { status: 400 }
      );
    }

    let user = null;

    // Search berdasarkan type
    if (type === 'email') {
      user = await prisma.user.findFirst({
        where: {
          email: query,
          role: { not: 'ADMIN' }, // Tidak bisa reset password admin lain
        },
        include: {
          guru: true,
          siswa: true,
          orangTua: {
            include: {
              orangTuaSiswa: {
                include: {
                  siswa: {
                    select: {
                      id: true,
                      nisn: true,
                      tanggalLahir: true
                    }
                  }
                }
              }
            }
          },
        },
      });
    } else if (type === 'nis') {
      const siswa = await prisma.siswa.findFirst({
        where: { nis: query },
        include: {
          user: true,
        },
      });
      if (siswa) {
        user = {
          ...siswa.user,
          siswa,
        };
      }
    } else if (type === 'nip') {
      const guru = await prisma.guru.findFirst({
        where: { nip: query },
        include: {
          user: true,
        },
      });
      if (guru) {
        user = {
          ...guru.user,
          guru,
        };
      }
    } else if (type === 'noTelepon') {
      // Cari di guru, siswa, atau orangtua
      const guru = await prisma.guru.findFirst({
        where: { noTelepon: query },
        include: { user: true },
      });
      const siswa = await prisma.siswa.findFirst({
        where: { noTelepon: query },
        include: { user: true },
      });
      const orangTua = await prisma.orangTua.findFirst({
        where: { noTelepon: query },
        include: { 
          user: true,
          orangTuaSiswa: {
            include: {
              siswa: {
                select: {
                  id: true,
                  nisn: true,
                  tanggalLahir: true
                }
              }
            }
          }
        },
      });

      if (guru) {
        user = { ...guru.user, guru };
      } else if (siswa) {
        user = { ...siswa.user, siswa };
      } else if (orangTua) {
        user = { ...orangTua.user, orangTua };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Hapus data sensitif
    delete user.password;
    delete user.resetToken;
    delete user.resetTokenExpiry;

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Error search user:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
