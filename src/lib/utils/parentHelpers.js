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
        user: {
          select: { name: true }
        },
        kelas: {
          select: {
            nama: true,
          },
        },
      },
    });

    return children.map(child => ({
      id: child.id,
      namaLengkap: child.user.name,
      kelas: {
        namaKelas: child.kelas?.nama || 'N/A'
      }
    }));
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
    console.log('❌ getChildByParentId: missing siswaId or userId', { siswaId, userIdOrOrangTuaId });
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
    
    console.log('🔍 orangTuaByUser:', orangTuaByUser, 'for userId:', userIdOrOrangTuaId);
    
    if (orangTuaByUser) {
      orangTuaId = orangTuaByUser.id;
    }

    console.log('🔎 Searching for siswa:', siswaId, 'connected to orangTuaId:', orangTuaId);

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

    console.log('✅ Found siswa:', siswa?.id, 'with namaLengkap:', siswa?.namaLengkap);

    return siswa;
  } catch (error) {
    console.error('❌ Error fetching child for parent:', error);
    return null;
  }
}

/**
 * Get parent profile data by session userId
 * SECURITY: Query by userId (from session) to ensure logged-in parent only sees their own data
 * @param {string} userId - User ID from session.user.id
 * @returns {Promise<Object|null>} - Parent profile with user data and children list
 */
export async function getOrangTuaProfile(userId) {
  if (!userId) {
    return null;
  }

  try {
    // SECURITY: Query orangTua by userId to ensure we get the right parent
    const orangTua = await prisma.orangTua.findFirst({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true
          }
        },
        orangTuaSiswa: {
          include: {
            siswa: {
              select: {
                id: true,
                user: {
                  select: { name: true }
                },
                kelas: {
                  select: {
                    nama: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!orangTua) {
      return null;
    }

    // Transform to frontend format
    return {
      id: orangTua.id,
      userId: orangTua.userId,
      namaLengkap: orangTua.user.name,
      noTelepon: '-', // noTelepon dropped from schema
      alamat: orangTua.alamat,
      status: 'Aktif', // Parent status now depends on children status
      jenisKelamin: orangTua.jenisKelamin,
      children: orangTua.orangTuaSiswa.map(relation => ({
        id: relation.siswa.id,
        namaLengkap: relation.siswa.user.name,
        kelas: relation.siswa.kelas?.nama || 'N/A'
      }))
    };
  } catch (error) {
    console.error('Error fetching orang tua profile:', error);
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
