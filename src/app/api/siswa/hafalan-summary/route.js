import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get total juz hafalan siswa
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'SISWA') {
      return NextResponse.json(
        { message: 'Unauthorized - Hanya siswa yang dapat mengakses' },
        { status: 401 }
      );
    }

    // Get siswa data
    const siswa = await prisma.siswa.findUnique({
      where: { userId: session.user.id },
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get all hafalan records
    const hafalanList = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id,
      },
      select: {
        juz: true,
      },
    });

    // Calculate unique juz
    const uniqueJuz = new Set(hafalanList.map(h => h.juz));
    const totalJuz = uniqueJuz.size;

    // Get total hafalan count
    const totalHafalan = hafalanList.length;

    return NextResponse.json({
      totalJuz,
      totalHafalan,
      juzList: Array.from(uniqueJuz).sort((a, b) => a - b),
    });
  } catch (error) {
    console.error('Error fetching hafalan summary:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
