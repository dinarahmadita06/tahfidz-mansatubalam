/**
 * Student Status Management Service
 * Handles business logic for student status lifecycle (AKTIF, LULUS, PINDAH, KELUAR)
 */

import { prisma } from '@/lib/prisma';

/**
 * Check if user account should be active based on student status
 * @param {string} statusSiswa - Status siswa (AKTIF, LULUS, PINDAH, KELUAR)
 * @returns {boolean} - True if user should be active
 */
export function isUserActive(statusSiswa) {
  return statusSiswa === 'AKTIF';
}

/**
 * Check if parent account should be active
 * Parent is active if they have at least ONE child with status AKTIF
 * @param {string} orangTuaId - ID orang tua
 * @returns {Promise<boolean>} - True if parent should be active
 */
export async function isParentActive(orangTuaId) {
  const activeChildren = await prisma.orangTuaSiswa.count({
    where: {
      orangTuaId: orangTuaId,
      siswa: {
        statusSiswa: 'AKTIF',
      },
    },
  });

  return activeChildren > 0;
}

/**
 * Update student status and cascade to user account
 * @param {string} siswaId - ID siswa
 * @param {string} newStatusSiswa - New status (AKTIF, LULUS, PINDAH, KELUAR)
 * @param {string} adminId - ID admin yang melakukan perubahan
 * @returns {Promise<object>} - Updated siswa data
 */
export async function updateStudentStatus(siswaId, newStatusSiswa, adminId) {
  // Validasi status
  const validStatuses = ['AKTIF', 'LULUS', 'PINDAH', 'KELUAR'];
  if (!validStatuses.includes(newStatusSiswa)) {
    throw new Error(`Invalid status: ${newStatusSiswa}. Valid: ${validStatuses.join(', ')}`);
  }

  // Get current siswa data and admin info
  const siswa = await prisma.siswa.findUnique({
    where: { id: siswaId },
    include: {
      user: true,
      orangTuaSiswa: {
        include: {
          orangTua: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });

  if (!siswa) {
    throw new Error('Siswa tidak ditemukan');
  }

  // Get admin user data for role field in ActivityLog
  const adminUser = await prisma.user.findUnique({
    where: { id: adminId },
    select: { role: true, name: true },
  });

  if (!adminUser) {
    throw new Error('Admin tidak ditemukan');
  }

  const isBecomingActive = newStatusSiswa === 'AKTIF';
  const isLeavingActive = siswa.statusSiswa === 'AKTIF' && newStatusSiswa !== 'AKTIF';

  // Start transaction
  const result = await prisma.$transaction(async (trx) => {
    // 1. Update siswa status
    const updatedSiswa = await trx.siswa.update({
      where: { id: siswaId },
      data: {
        statusSiswa: newStatusSiswa,
        tanggalKeluar: isBecomingActive ? null : new Date(),
      },
      include: {
        user: true,
        kelas: true,
      },
    });

    // 2. Update user.isActive based on new status
    await trx.user.update({
      where: { id: siswa.userId },
      data: {
        isActive: isUserActive(newStatusSiswa),
      },
    });

    // 3. Update parent accounts if this student status change affects them
    if (isLeavingActive || isBecomingActive) {
      for (const relation of siswa.orangTuaSiswa) {
        const parentShouldBeActive = await isParentActiveInTransaction(
          trx,
          relation.orangTuaId
        );

        await trx.user.update({
          where: { id: relation.orangTua.userId },
          data: {
            isActive: parentShouldBeActive,
          },
        });
      }
    }

    // 4. Log activity with correct fields
    await trx.activityLog.create({
      data: {
        actorId: adminId,
        actorRole: adminUser.role,
        actorName: adminUser.name,
        action: 'SISWA_UPDATE_STATUS',
        title: 'Update Status Siswa',
        description: `Mengubah status siswa ${siswa.user.name} (${siswa.nis}) dari ${siswa.statusSiswa} ke ${newStatusSiswa}`,
        targetUserId: siswa.userId,
        targetRole: 'SISWA',
        targetName: siswa.user.name,
        metadata: {
          siswaId,
          oldStatus: siswa.statusSiswa,
          newStatus: newStatusSiswa,
        },
      },
    });

    return updatedSiswa;
  });

  return result;
}

/**
 * Helper function to check parent active status within a transaction
 * @private
 */
async function isParentActiveInTransaction(tx, orangTuaId) {
  const activeChildren = await tx.orangTuaSiswa.count({
    where: {
      orangTuaId: orangTuaId,
      siswa: {
        statusSiswa: 'AKTIF',
      },
    },
  });

  return activeChildren > 0;
}

/**
 * Get student status badge info for UI
 * @param {string} statusSiswa - Status siswa
 * @returns {object} - Badge info { label, color, icon }
 */
export function getStudentStatusBadge(statusSiswa) {
  const badges = {
    AKTIF: {
      label: 'Aktif',
      color: 'green',
      emoji: '✅',
      description: 'Siswa aktif bersekolah',
    },
    LULUS: {
      label: 'Lulus',
      color: 'gray',
      emoji: '🎓',
      description: 'Siswa telah lulus',
    },
    PINDAH: {
      label: 'Pindah',
      color: 'yellow',
      emoji: '↗️',
      description: 'Siswa pindah sekolah',
    },
    KELUAR: {
      label: 'Keluar',
      color: 'red',
      emoji: '❌',
      description: 'Siswa keluar/non-aktif',
    },
  };

  return badges[statusSiswa] || badges.AKTIF;
}

/**
 * Bulk update student status (for graduation, etc)
 * @param {string[]} siswaIds - Array of siswa IDs
 * @param {string} newStatusSiswa - New status
 * @param {string} adminId - ID admin
 * @returns {Promise<object>} - Summary of updates
 */
export async function bulkUpdateStudentStatus(siswaIds, newStatusSiswa, adminId) {
  const results = {
    success: [],
    failed: [],
  };

  for (const siswaId of siswaIds) {
    try {
      const updated = await updateStudentStatus(siswaId, newStatusSiswa, adminId);
      results.success.push({
        siswaId,
        name: updated.user.name,
        nis: updated.nis,
      });
    } catch (error) {
      results.failed.push({
        siswaId,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Get students by status
 * @param {string} statusSiswa - Status to filter
 * @param {object} options - Query options
 * @returns {Promise<Array>} - List of students
 */
export async function getStudentsByStatus(statusSiswa, options = {}) {
  const { includeUser = true, includeKelas = true, limit, offset } = options;

  const students = await prisma.siswa.findMany({
    where: {
      statusSiswa,
    },
    include: {
      user: includeUser,
      kelas: includeKelas,
    },
    take: limit,
    skip: offset,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return students;
}

/**
 * Get student status statistics
 * @returns {Promise<object>} - Status counts
 */
export async function getStudentStatusStats() {
  const [aktif, lulus, pindah, keluar, total] = await Promise.all([
    prisma.siswa.count({ where: { statusSiswa: 'AKTIF' } }),
    prisma.siswa.count({ where: { statusSiswa: 'LULUS' } }),
    prisma.siswa.count({ where: { statusSiswa: 'PINDAH' } }),
    prisma.siswa.count({ where: { statusSiswa: 'KELUAR' } }),
    prisma.siswa.count(),
  ]);

  return {
    AKTIF: aktif,
    LULUS: lulus,
    PINDAH: pindah,
    KELUAR: keluar,
    total,
    percentage: {
      AKTIF: total > 0 ? (aktif / total) * 100 : 0,
      LULUS: total > 0 ? (lulus / total) * 100 : 0,
      PINDAH: total > 0 ? (pindah / total) * 100 : 0,
      KELUAR: total > 0 ? (keluar / total) * 100 : 0,
    },
  };
}
