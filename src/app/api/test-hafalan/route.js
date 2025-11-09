import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    // Get Fatimah's data directly
    const siswa = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true
      }
    });

    if (!siswa) {
      return NextResponse.json({ error: 'Siswa not found' });
    }

    const hafalan = await prisma.hafalan.findMany({
      where: {
        siswaId: siswa.id
      }
    });

    const uniqueJuz = new Set(hafalan.map(h => h.juz));

    return NextResponse.json({
      siswa: {
        id: siswa.id,
        userId: siswa.userId,
        name: siswa.user.name,
        email: siswa.user.email
      },
      totalHafalan: hafalan.length,
      totalJuz: uniqueJuz.size,
      juzList: Array.from(uniqueJuz).sort((a, b) => a - b)
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
