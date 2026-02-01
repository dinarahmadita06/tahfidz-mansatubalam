export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export const fetchCache = 'force-no-store';

// Target hafalan minimum - DYNAMICALLY fetched from active tahun ajaran
// This will be set at runtime
let TARGET_JUZ = 3; // fallback default
// Target kelas = 50% siswa mencapai target
const TARGET_KELAS_PERCENTAGE = 50;

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch active tahun ajaran to get dynamic target
    const tahunAjaranAktif = await prisma.tahunAjaran.findFirst({
      where: { isActive: true },
      select: { 
        id: true,
        targetHafalan: true 
      }
    });

    // Use dynamic target from tahun ajaran, fallback to 3
    TARGET_JUZ = tahunAjaranAktif?.targetHafalan || 3;

    // Validate prisma connection
    if (!prisma || !prisma.siswa) {
      return NextResponse.json({
        success: true,
        kelasTop5: [],
        siswa: { mencapai: 0, belum: 0, total: 0, persen: 0 }
      });
    }

    // ========================================
    // 1. AMBIL DATA SEMUA SISWA AKTIF DARI KELAS AKTIF
    // ========================================
    // CRITICAL FIX: Only count siswa from ACTIVE classes in ACTIVE tahun ajaran
    const allSiswa = await prisma.siswa.findMany({
      where: { 
        status: 'approved',
        statusSiswa: 'AKTIF', // Only active students
        kelas: {
          status: 'AKTIF', // Only from active classes
          tahunAjaranId: tahunAjaranAktif?.id // Only from active tahun ajaran
        }
      },
      select: {
        id: true,
        kelasId: true,
        kelas: {
          select: {
            id: true,
            nama: true,
            status: true
          },
        },
      },
    });

    // ========================================
    // 2. HITUNG TOTAL JUZ PER SISWA
    // ========================================
    // Get distinct juz count for each siswa
    const hafalanData = await prisma.hafalan.groupBy({
      by: ['siswaId'],
      _min: {
        juz: true
      },
      _max: {
        juz: true
      }
    });

    // Build map of siswaId to max juz
    const siswaJuzMap = {};
    for (const hafalan of hafalanData) {
      const maxJuz = hafalan._max.juz || 0;
      siswaJuzMap[hafalan.siswaId] = maxJuz; // Take the max juz completed
    }

    // ========================================
    // 3. HITUNG SISWA MENCAPAI TARGET
    // ========================================
    const siswaMencapai = allSiswa.filter((s) => (siswaJuzMap[s.id] || 0) >= TARGET_JUZ);
    const siswaBelum = allSiswa.length - siswaMencapai.length;
    const persenSiswa = allSiswa.length > 0 
      ? Math.round((siswaMencapai.length / allSiswa.length) * 1000) / 10 
      : 0;

    // ========================================
    // 4. HITUNG STATISTIK PER KELAS
    // ========================================
    const kelasStats = {};
    
    allSiswa.forEach((siswa) => {
      if (!siswa.kelasId) return;
      
      const kelasId = siswa.kelasId;
      const kelasNama = siswa.kelas?.nama || 'Unknown';
      
      if (!kelasStats[kelasId]) {
        kelasStats[kelasId] = {
          id: kelasId,
          nama: kelasNama,
          total: 0,
          mencapai: 0,
        };
      }
      
      kelasStats[kelasId].total += 1;
      if ((siswaJuzMap[siswa.id] || 0) >= TARGET_JUZ) {
        kelasStats[kelasId].mencapai += 1;
      }
    });

    // ========================================
    // 5. KONVERSI KE ARRAY DAN HITUNG PERSEN
    // ========================================
    const kelasArray = Object.values(kelasStats).map((kelas) => ({
      id: kelas.id,
      nama: kelas.nama,
      total: kelas.total,
      mencapai: kelas.mencapai,
      persen: kelas.total > 0 
        ? Math.round((kelas.mencapai / kelas.total) * 1000) / 10 
        : 0,
    }));

    // ========================================
    // 6. SORT DESCENDING BY PERSEN & AMBIL TOP 5
    // ========================================
    const kelasTop5 = kelasArray
      .sort((a, b) => b.persen - a.persen)
      .slice(0, 5);

    // ========================================
    // 6. RETURN RESPONSE
    // ========================================
    return NextResponse.json({
      success: true,
      kelasTop5,
      siswa: {
        mencapai: siswaMencapai.length,
        belum: siswaBelum,
        total: allSiswa.length,
        persen: persenSiswa,
      },
    });
  } catch (error) {
    console.error('[Statistik Target] Error:', error.message);
    // Return default data instead of error to prevent UI crash
    return NextResponse.json({
      success: true,
      kelasTop5: [],
      siswa: { mencapai: 0, belum: 0, total: 0, persen: 0 },
      error: error.message // Include error for debugging
    });
  }
}
