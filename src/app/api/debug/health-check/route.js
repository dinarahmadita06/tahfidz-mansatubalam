import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    const counts = {
      users: await prisma.user.count(),
      siswa: await prisma.siswa.count(),
      guru: await prisma.guru.count(),
      orangTua: await prisma.orangTua.count(),
      kelas: await prisma.kelas.count(),
      tahunAjaran: await prisma.tahunAjaran.count(),
      hafalan: await prisma.hafalan.count(),
      presensi: await prisma.presensi.count(),
    };

    // 2. Check Active Tahun Ajaran
    const activeTahunAjaran = await prisma.tahunAjaran.findFirst({
      where: { isActive: true }
    });

    // 3. Session info
    const sessionInfo = session ? {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        guruId: session.user.guruId,
        siswaId: session.user.siswaId,
        orangTuaId: session.user.orangTuaId,
      }
    } : 'no session';

    // 4. Get DB Host (safely)
    const dbUrl = process.env.DATABASE_URL || '';
    const dbHost = dbUrl.split('@')[1]?.split('/')[0] || 'unknown';
    const maskedDbUrl = dbUrl.replace(/:([^@]+)@/, ':****@');

    // 5. Get Sample Data
    const sampleSiswa = await prisma.siswa.findMany({
      take: 2,
      include: { user: true, kelas: true }
    });

    const sampleKelas = await prisma.kelas.findMany({
      take: 2,
      include: { tahunAjaran: true }
    });

    return NextResponse.json({
      status: 'ok',
      database: {
        host: dbHost,
        url: maskedDbUrl,
        counts,
      },
      samples: {
        siswa: sampleSiswa.map(s => ({ id: s.id, name: s.user.name, status: s.status, kelas: s.kelas?.nama })),
        kelas: sampleKelas.map(k => ({ id: k.id, name: k.nama, status: k.status })),
      },
      activeTahunAjaran: activeTahunAjaran || 'none',
      session: sessionInfo,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      }
    });
  } catch (error) {
    console.error('Debug API Error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
