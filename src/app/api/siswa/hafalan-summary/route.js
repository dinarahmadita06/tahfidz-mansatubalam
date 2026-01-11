export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { surahNameToNumber, getJuzsFromRange } from '@/lib/quranUtils';

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
      include: {
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    if (!siswa) {
      return NextResponse.json(
        { message: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Get all hafalan records for list but use latestJuzAchieved for total
    const [hafalanRecords, currentSiswa] = await Promise.all([
      prisma.hafalan.findMany({
        where: { siswaId: siswa.id },
        select: {
          juz: true,
          surah: true,
          surahNumber: true,
          ayatMulai: true,
          ayatSelesai: true
        }
      }),
      prisma.siswa.findUnique({
        where: { id: siswa.id },
        select: { latestJuzAchieved: true }
      })
    ]);

    // Calculate unique juz for the list with fallback mapping
    const uniqueJuz = new Set();
    hafalanRecords.forEach(h => {
      if (h.juz) {
        uniqueJuz.add(h.juz);
      } else {
        const sNum = h.surahNumber || surahNameToNumber[h.surah];
        if (sNum && h.ayatMulai && h.ayatSelesai) {
          const juzs = getJuzsFromRange(sNum, h.ayatMulai, h.ayatSelesai);
          juzs.forEach(j => uniqueJuz.add(j));
        }
      }
    });

    const totalJuz = currentSiswa?.latestJuzAchieved || uniqueJuz.size;
    const totalHafalan = hafalanRecords.length;
    const juzList = Array.from(uniqueJuz).sort((a, b) => a - b);

    console.log(`[DEBUG/SUMMARY] Student ${siswa.id} Summary Audit:
    - Session ID: ${session.user.id}
    - Student Name: ${siswa.user.name}
    - Total Juz (latestJuzAchieved): ${currentSiswa?.latestJuzAchieved}
    - Total Juz (calculated): ${uniqueJuz.size}
    - Total Setoran: ${totalHafalan}
    - Juz List: [${juzList.join(', ')}]
    `);

    return NextResponse.json({
      totalJuz,
      totalHafalan,
      juzList,
    });
  } catch (error) {
    console.error('Error fetching hafalan summary:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
