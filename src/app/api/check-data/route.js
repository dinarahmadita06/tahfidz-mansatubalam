export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const siswaCount = await prisma.siswa.count();
    const guruCount = await prisma.guru.count();
    const orangTuaCount = await prisma.orangTua.count();
    const kelasCount = await prisma.kelas.count();
    const tahunAjaranCount = await prisma.tahunAjaran.count();

    // Get list of users (email only for privacy)
    const users = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          users: userCount,
          siswa: siswaCount,
          guru: guruCount,
          orangTua: orangTuaCount,
          kelas: kelasCount,
          tahunAjaran: tahunAjaranCount,
        },
        users: users,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check data', details: error.message },
      { status: 500 }
    );
  }
}
