/**
 * Status Helper Utilities
 * Reusable functions for checking user/student status
 */

import { prisma } from '@/lib/db';

/**
 * Check if a user account is active and can access the system
 * @param {string} userId - User ID
 * @returns {Promise<{isActive: boolean, reason: string|null}>}
 */
export async function checkUserAccess(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      siswa: {
        select: {
          statusSiswa: true,
          tanggalKeluar: true,
        },
      },
      orangTua: {
        include: {
          orangTuaSiswa: {
            include: {
              siswa: {
                select: {
                  statusSiswa: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      isActive: false,
      reason: 'User tidak ditemukan',
    };
  }

  // Admin dan Guru always active based on user.isActive only
  if (user.role === 'ADMIN' || user.role === 'GURU') {
    return {
      isActive: user.isActive,
      reason: user.isActive ? null : 'Akun dinonaktifkan oleh admin',
    };
  }

  // Siswa: check both user.isActive and statusSiswa
  if (user.role === 'SISWA' && user.siswa) {
    if (!user.isActive) {
      const statusMessages = {
        LULUS: 'Akun Anda tidak aktif karena telah lulus. Silakan hubungi admin sekolah.',
        PINDAH: 'Akun Anda tidak aktif karena telah pindah sekolah. Silakan hubungi admin sekolah.',
        KELUAR: 'Akun Anda tidak aktif. Silakan hubungi admin sekolah.',
      };

      return {
        isActive: false,
        reason:
          statusMessages[user.siswa.statusSiswa] ||
          'Akun Anda sudah tidak aktif. Silakan hubungi admin sekolah.',
        statusSiswa: user.siswa.statusSiswa,
        tanggalKeluar: user.siswa.tanggalKeluar,
      };
    }

    return {
      isActive: true,
      reason: null,
    };
  }

  // Orang Tua: check if has at least one active child
  if (user.role === 'ORANG_TUA' && user.orangTua) {
    if (!user.isActive) {
      const hasActiveChild = user.orangTua.orangTuaSiswa.some(
        (relation) => relation.siswa.statusSiswa === 'AKTIF'
      );

      if (!hasActiveChild) {
        return {
          isActive: false,
          reason:
            'Akun Anda tidak aktif karena tidak ada anak yang berstatus aktif. Silakan hubungi admin sekolah.',
        };
      }

      // If has active child but account is inactive, might be admin action
      return {
        isActive: false,
        reason: 'Akun dinonaktifkan oleh admin. Silakan hubungi admin sekolah.',
      };
    }

    return {
      isActive: true,
      reason: null,
    };
  }

  // Fallback to user.isActive
  return {
    isActive: user.isActive,
    reason: user.isActive ? null : 'Akun tidak aktif. Silakan hubungi admin sekolah.',
  };
}

/**
 * Get user status message for display
 * @param {object} user - User object with relations
 * @returns {string} - Status message
 */
export function getUserStatusMessage(user) {
  if (!user.isActive) {
    if (user.role === 'SISWA' && user.siswa) {
      const messages = {
        LULUS: '🎓 Status: Lulus',
        PINDAH: '↗️ Status: Pindah Sekolah',
        KELUAR: '❌ Status: Tidak Aktif',
        AKTIF: '✅ Status: Aktif', // Should not reach here if user.isActive is false
      };
      return messages[user.siswa.statusSiswa] || '❌ Status: Tidak Aktif';
    }

    return '❌ Status: Tidak Aktif';
  }

  return '✅ Status: Aktif';
}

/**
 * Validate if action can be performed on student based on status
 * @param {string} statusSiswa - Student status
 * @param {string} action - Action to perform (e.g., 'add_hafalan', 'update_grade')
 * @returns {boolean} - Whether action is allowed
 */
export function canPerformAction(statusSiswa, action) {
  // Only AKTIF students can perform most actions
  const activeOnlyActions = ['add_hafalan', 'submit_tasmi', 'update_presensi'];

  if (activeOnlyActions.includes(action)) {
    return statusSiswa === 'AKTIF';
  }

  // Some actions allowed for all (view only)
  const viewOnlyActions = ['view_history', 'view_grade', 'view_profile'];

  if (viewOnlyActions.includes(action)) {
    return true;
  }

  // Default: only AKTIF
  return statusSiswa === 'AKTIF';
}

/**
 * Get status badge configuration for UI
 * @param {string} statusSiswa - Student status
 * @returns {object} - Badge config { label, bgColor, textColor, emoji }
 */
export function getStatusBadgeConfig(statusSiswa) {
  const configs = {
    AKTIF: {
      label: 'Aktif',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
      emoji: '✅',
    },
    LULUS: {
      label: 'Lulus',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      emoji: '🎓',
    },
    PINDAH: {
      label: 'Pindah',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
      emoji: '↗️',
    },
    KELUAR: {
      label: 'Keluar',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      emoji: '❌',
    },
  };

  return configs[statusSiswa] || configs.AKTIF;
}

/**
 * Format tanggal keluar for display
 * @param {Date|string|null} tanggalKeluar
 * @returns {string}
 */
export function formatTanggalKeluar(tanggalKeluar) {
  if (!tanggalKeluar) return '-';

  const date = new Date(tanggalKeluar);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
