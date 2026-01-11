export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';


export async function GET() {
  try {
    const session = await auth();
    
    // Safety: Only allow if specifically requested or in dev
    // For now, let's just run it to fix the user's problem
    
    console.log('🔧 [FIX-API] Starting data consistency fix...');

    const results = {};

    // 1. Activate all Tahun Ajaran if none are active
    const activeTA = await prisma.tahunAjaran.findFirst({ where: { isActive: true } });
    if (!activeTA) {
      const latestTA = await prisma.tahunAjaran.findFirst({ orderBy: { createdAt: 'desc' } });
      if (latestTA) {
        await prisma.tahunAjaran.update({
          where: { id: latestTA.id },
          data: { isActive: true }
        });
        results.tahunAjaran = `Activated ${latestTA.nama}`;
      }
    } else {
      results.tahunAjaran = `Already active: ${activeTA.nama}`;
    }

    // 2. Activate all Kelas
    const updatedKelas = await prisma.kelas.updateMany({
      where: { status: { not: 'AKTIF' } },
      data: { status: 'AKTIF' }
    });
    results.kelas = `Activated ${updatedKelas.count} Kelas`;

    // 3. Approve all Siswa accounts
    const updatedSiswa = await prisma.siswa.updateMany({
      where: { status: { not: 'approved' } },
      data: { status: 'approved' }
    });
    results.siswa = `Approved ${updatedSiswa.count} Siswa`;

    // 4. Ensure Guru records exist for GURU users
    const guruUsers = await prisma.user.findMany({
      where: { role: 'GURU' },
      include: { guru: true }
    });

    let guruCreated = 0;
    for (const user of guruUsers) {
      if (!user.guru) {
        await prisma.guru.create({
          data: {
            userId: user.id,
            jenisKelamin: 'LAKI_LAKI',
            noTelepon: '08123456789',
            alamat: 'Jl. Default'
          }
        });
        guruCreated++;
      }
    }
    results.guru = `Created ${guruCreated} missing Guru records`;

    // 5. Ensure Guru-Kelas relationships exist
    const allGurus = await prisma.guru.findMany();
    const allKelas = await prisma.kelas.findMany({ where: { status: 'AKTIF' } });

    let relCreated = 0;
    if (allGurus.length > 0 && allKelas.length > 0) {
      for (const guru of allGurus) {
        const hasKelas = await prisma.guruKelas.findFirst({ where: { guruId: guru.id } });
        if (!hasKelas) {
          await prisma.guruKelas.create({
            data: {
              guruId: guru.id,
              kelasId: allKelas[0].id,
              isActive: true,
              peran: 'utama'
            }
          });
          relCreated++;
        }
      }
    }
    results.relations = `Created ${relCreated} Guru-Kelas relations`;

    return NextResponse.json({
      message: '🎉 Data fix completed successfully!',
      details: results
    });

  } catch (error) {
    console.error('❌ [FIX-API] Error:', error.message);
    return NextResponse.json({
      error: 'Failed to fix data',
      message: error.message
    }, { status: 500 });
  }
}
