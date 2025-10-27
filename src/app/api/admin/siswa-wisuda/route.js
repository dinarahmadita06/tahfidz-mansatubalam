import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

// GET - Mengambil daftar siswa yang eligible untuk wisuda (lulus ujian juz 1 dan juz 2)
export async function GET(request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua siswa dengan hafalan
    const siswaWithHafalan = await prisma.siswa.findMany({
      where: {
        status: 'approved'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        kelas: {
          select: {
            nama: true,
            tingkat: true
          }
        },
        hafalan: {
          select: {
            juz: true,
            status: true
          }
        }
      }
    });

    // Filter siswa yang sudah lulus ujian juz 1 dan juz 2
    const siswaEligible = siswaWithHafalan
      .map(siswa => {
        // Hitung juz unique yang sudah LANCAR
        const juzLancar = new Set(
          siswa.hafalan
            .filter(h => h.status === 'LANCAR')
            .map(h => h.juz)
        );

        // Cek apakah juz 1 dan juz 2 sudah LANCAR
        const lulusJuz1Dan2 = juzLancar.has(1) && juzLancar.has(2);

        return {
          id: siswa.id,
          nama: siswa.user.name,
          email: siswa.user.email,
          kelas: siswa.kelas,
          totalJuzLancar: juzLancar.size,
          eligible: lulusJuz1Dan2
        };
      })
      .filter(s => s.eligible)
      .sort((a, b) => b.totalJuzLancar - a.totalJuzLancar);

    return NextResponse.json({ siswa: siswaEligible });
  } catch (error) {
    console.error('Error fetching siswa wisuda:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data siswa' },
      { status: 500 }
    );
  }
}
