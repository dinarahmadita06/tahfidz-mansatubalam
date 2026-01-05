import { prisma } from '@/lib/db';

/**
 * Get all children (siswa) for a parent using orangTuaSiswa pivot relation
 * @param {string} userIdOrOrangTuaId - Parent user ID or orangTuaId
 * @returns {Promise<Array>} - Array of siswa objects
 */
export async function getChildrenByParentId(userIdOrOrangTuaId) {
  if (!userIdOrOrangTuaId) {
    return [];
  }

  try {
    // First, check if we need to fetch orangTuaId from userId
    // Try to find orangTua by either userId or by ID directly
    let orangTuaId = userIdOrOrangTuaId;
    
    // Attempt to find orangTua by userId first
    const orangTuaByUser = await prisma.orangTua.findFirst({
      where: { userId: userIdOrOrangTuaId },
      select: { id: true }
    });
    
    if (orangTuaByUser) {
      orangTuaId = orangTuaByUser.id;
    }

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
 * @param {string} userIdOrOrangTuaId - Parent user ID or orangTuaId
 * @returns {Promise<Object|null>} - Siswa object or null
 */
export async function getChildByParentId(siswaId, userIdOrOrangTuaId) {
  if (!siswaId || !userIdOrOrangTuaId) {
    return null;
  }

  try {
    // First, check if we need to fetch orangTuaId from userId
    let orangTuaId = userIdOrOrangTuaId;
    
    // Attempt to find orangTua by userId first
    const orangTuaByUser = await prisma.orangTua.findFirst({
      where: { userId: userIdOrOrangTuaId },
      select: { id: true }
    });
    
    if (orangTuaByUser) {
      orangTuaId = orangTuaByUser.id;
    }

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
