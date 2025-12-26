import { prisma } from '@/lib/db';

/**
 * Get all children (siswa) for a parent using orangTuaSiswa pivot relation
 * @param {string} orangTuaId - Parent user ID
 * @returns {Promise<Array>} - Array of siswa objects
 */
export async function getChildrenByParentId(orangTuaId) {
  if (!orangTuaId) {
    return [];
  }

  try {
    const children = await prisma.siswa.findMany({
      where: {
        orangTuaSiswa: {
          some: {
            orangTuaId: orangTuaId,
          },
        },
      },
      select: {
        id: true,
        namaLengkap: true,
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    return children;
  } catch (error) {
    console.error('Error fetching children for parent:', error);
    return [];
  }
}

/**
 * Get a specific child (siswa) for a parent using orangTuaSiswa pivot relation
 * Validates that the siswa belongs to the parent
 * @param {string} siswaId - Student ID
 * @param {string} orangTuaId - Parent user ID
 * @returns {Promise<Object|null>} - Siswa object or null
 */
export async function getChildByParentId(siswaId, orangTuaId) {
  if (!siswaId || !orangTuaId) {
    return null;
  }

  try {
    const siswa = await prisma.siswa.findFirst({
      where: {
        id: siswaId,
        orangTuaSiswa: {
          some: {
            orangTuaId: orangTuaId,
          },
        },
      },
      include: {
        kelas: {
          select: {
            namaKelas: true,
          },
        },
      },
    });

    return siswa;
  } catch (error) {
    console.error('Error fetching child for parent:', error);
    return null;
  }
}

/**
 * Create empty statistics object with default 0 values
 * @returns {Object} - Empty statistics object
 */
export function createEmptyStatistics() {
  return {
    totalHadir: 0,
    totalIzin: 0,
    totalSakit: 0,
    totalAlfa: 0,
    totalHari: 0,
    persentaseKehadiran: 0,
    rataRataNilai: 0,
    totalPenilaian: 0,
    rataRataTajwid: 0,
    rataRataKelancaran: 0,
    rataRataMakhraj: 0,
    rataRataImplementasi: 0,
  };
}
