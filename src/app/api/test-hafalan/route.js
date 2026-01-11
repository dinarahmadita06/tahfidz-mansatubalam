export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const session = await auth();

    // Test 1: Get Fatimah's data directly (no auth)
    const siswaFatimah = await prisma.siswa.findFirst({
      where: {
        user: {
          email: 'fatimah.hakim@siswa.tahfidz.sch.id'
        }
      },
      include: {
        user: true
      }
    });

    const hafalanFatimah = siswaFatimah ? await prisma.hafalan.findMany({
      where: { siswaId: siswaFatimah.id }
    }) : [];

    const uniqueJuzFatimah = new Set(hafalanFatimah.map(h => h.juz));

    // Test 2: Get current logged in user's data (with auth)
    let currentUserData = null;
    if (session && session.user.role === 'SISWA') {
      const siswaLoggedIn = await prisma.siswa.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
      });

      if (siswaLoggedIn) {
        const hafalanLoggedIn = await prisma.hafalan.findMany({
          where: { siswaId: siswaLoggedIn.id }
        });

        const uniqueJuzLoggedIn = new Set(hafalanLoggedIn.map(h => h.juz));

        currentUserData = {
          siswa: {
            id: siswaLoggedIn.id,
            userId: siswaLoggedIn.userId,
            name: siswaLoggedIn.user.name,
            email: siswaLoggedIn.user.email
          },
          totalHafalan: hafalanLoggedIn.length,
          totalJuz: uniqueJuzLoggedIn.size,
          juzList: Array.from(uniqueJuzLoggedIn).sort((a, b) => a - b)
        };
      }
    }

    return NextResponse.json({
      session: {
        exists: !!session,
        userId: session?.user?.id,
        userRole: session?.user?.role,
        userName: session?.user?.name,
      },
      fatimahData: {
        siswa: siswaFatimah ? {
          id: siswaFatimah.id,
          userId: siswaFatimah.userId,
          name: siswaFatimah.user.name,
          email: siswaFatimah.user.email
        } : null,
        totalHafalan: hafalanFatimah.length,
        totalJuz: uniqueJuzFatimah.size,
        juzList: Array.from(uniqueJuzFatimah).sort((a, b) => a - b)
      },
      currentUserData
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
