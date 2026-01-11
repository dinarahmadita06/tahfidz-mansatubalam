export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Get single kelas detail
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const kelas = await prisma.kelas.findUnique({
      where: { id },
      include: {
        tahunAjaran: {
          select: {
            id: true,
            nama: true,
            semester: true,
            tanggalMulai: true,
            tanggalSelesai: true,
            isActive: true
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
                    email: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: {
            siswa: true
          }
        }
      }
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(kelas);
  } catch (error) {
    console.error('Error fetching kelas detail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kelas detail' },
      { status: 500 }
    );
  }
}
