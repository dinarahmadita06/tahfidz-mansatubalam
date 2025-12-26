import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { error: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get siswa data with kelas info
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
      include: {
        kelas: {
          include: {
            guruKelas: {
              where: { isActive: true },
              include: {
                guru: {
                  select: {
                    id: true,
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
        },
      },
    });

    if (!siswa) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get list of guru IDs from siswa's kelas
    const guruIds = siswa.kelas?.guruKelas?.map((gk) => gk.guruId) || [];

    if (guruIds.length === 0) {
      // No guru pengampu, return empty array
      return NextResponse.json({
        books: [],
        message: 'Belum ada guru pengampu di kelas Anda',
      });
    }

    // Fetch books uploaded by guru pengampu
    const books = await prisma.bukuDigital.findMany({
      where: {
        guruId: {
          in: guruIds,
        },
      },
      include: {
        guru: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedBooks = books.map((book) => ({
      id: book.id,
      title: book.judul,
      description: book.deskripsi || 'Tidak ada deskripsi',
      category: book.kategori,
      fileUrl: book.fileUrl,
      fileName: book.fileName,
      fileSize: book.fileSize,
      uploadDate: book.createdAt,
      guruName: book.guru?.user?.name || 'Unknown',
      downloadCount: book.downloadCount,
    }));

    return NextResponse.json({
      books: formattedBooks,
      totalBooks: formattedBooks.length,
    });
  } catch (error) {
    console.error('Error fetching buku digital:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buku digital', details: error.message },
      { status: 500 }
    );
  }
}
