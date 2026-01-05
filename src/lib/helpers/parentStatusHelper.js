/**
 * Parent Account Status Helper
 * Determines parent account status based on connected children status
 * 
 * RULE:
 * 1. If parent has at least 1 child with status AKTIF → Parent shows as AKTIF
 * 2. If all connected children have status NOT AKTIF → Parent can be TIDAK AKTIF
 * 3. If parent has NO connected children → Status based on user.isActive field (with "Belum Terhubung" badge)
 * 4. If admin manually deactivated parent → Status stays TIDAK AKTIF with "Dinonaktifkan oleh Admin" label
 */

import { prisma } from '@/lib/db';

/**
 * Calculate parent display status and related metadata
 * @param {Object} orangTua - OrangTua object with user and orangTuaSiswa relations
 * @returns {Object} - { displayStatus, hasActiveChild, childrenCount, childrenInfo, adminDeactivated, badge }
 */
export function calculateParentDisplayStatus(orangTua) {
  if (!orangTua) {
    return {
      displayStatus: 'TIDAK_AKTIF',
      hasActiveChild: false,
      childrenCount: 0,
      childrenInfo: [],
      adminDeactivated: false,
      badge: null,
    };
  }

  // Get connected children from orangTuaSiswa relation
  const connectedChildren = (orangTua.orangTuaSiswa || []).map(rel => rel.siswa).filter(Boolean);
  const childrenCount = connectedChildren.length;

  // Collect children info
  const childrenInfo = connectedChildren.map(siswa => ({
    id: siswa.id,
    name: siswa.user?.name || 'Unknown',
    nisn: siswa.nisn,
    status: siswa.statusSiswa
  }));

  // Check if at least one child is AKTIF
  const hasActiveChild = connectedChildren.some(siswa => siswa.statusSiswa === 'AKTIF');

  // If user.isActive is false but child is AKTIF → admin deactivated parent manually
  const adminDeactivated = hasActiveChild && !orangTua.user.isActive;

  // Determine display status
  let displayStatus = 'TIDAK_AKTIF';
  let badge = null;

  if (childrenCount === 0) {
    // No children connected
    displayStatus = orangTua.user.isActive ? 'AKTIF' : 'TIDAK_AKTIF';
    badge = 'BELUM_TERHUBUNG';
  } else if (hasActiveChild) {
    // Has at least one active child
    displayStatus = 'AKTIF';
    if (adminDeactivated) {
      badge = 'ADMIN_DEACTIVATED';
    }
  } else {
    // All children are not active
    displayStatus = 'TIDAK_AKTIF';
  }

  return {
    displayStatus,
    hasActiveChild,
    childrenCount,
    childrenInfo,
    adminDeactivated,
    badge, // BELUM_TERHUBUNG | ADMIN_DEACTIVATED | null
  };
}

/**
 * Get user-friendly status label and emoji
 * @param {string} displayStatus - Status from calculateParentDisplayStatus
 * @param {string} badge - Badge type from calculateParentDisplayStatus
 * @returns {Object} - { emoji, label, description, bgColor, textColor }
 */
export function getParentStatusDisplay(displayStatus, badge) {
  const configs = {
    AKTIF: {
      emoji: '✅',
      label: 'Aktif',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    TIDAK_AKTIF: {
      emoji: '⛔',
      label: 'Tidak Aktif',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
  };

  const baseConfig = configs[displayStatus] || configs.TIDAK_AKTIF;

  // Add badge-specific information
  if (badge === 'BELUM_TERHUBUNG') {
    return {
      ...baseConfig,
      badgeLabel: 'Belum Terhubung',
      badgeEmoji: '🔗',
      badgeDescription: 'Akun parent belum terhubung dengan siswa manapun',
    };
  }

  if (badge === 'ADMIN_DEACTIVATED') {
    return {
      ...baseConfig,
      emoji: '⛔',
      label: 'Tidak Aktif',
      badgeLabel: 'Dinonaktifkan oleh Admin',
      badgeEmoji: '🔒',
      badgeDescription: 'Admin telah menonaktifkan akun ini meskipun ada anak yang aktif',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
    };
  }

  return baseConfig;
}

/**
 * Get parent status with full context for display
 * Used by frontend to show comprehensive status info
 * @param {Object} orangTua - Full orangTua object with relations
 * @returns {Object} - Complete status info for UI
 */
export function getParentStatusContext(orangTua) {
  const statusCalc = calculateParentDisplayStatus(orangTua);
  const statusDisplay = getParentStatusDisplay(statusCalc.displayStatus, statusCalc.badge);

  return {
    displayStatus: statusCalc.displayStatus,
    statusDisplay,
    hasActiveChild: statusCalc.hasActiveChild,
    childrenCount: statusCalc.childrenCount,
    childrenInfo: statusCalc.childrenInfo,
    adminDeactivated: statusCalc.adminDeactivated,
    badge: statusCalc.badge,
    
    // Helper strings for UI
    statusText: statusDisplay.label,
    badgeText: statusDisplay.badgeLabel || null,
    tooltip: statusDisplay.badgeDescription || statusDisplay.label,
  };
}

/**
 * Get active children count for a parent
 * @param {string} orangTuaId - Parent ID
 * @returns {Promise<number>} - Count of children with status AKTIF
 */
export async function getActiveChildrenCount(orangTuaId) {
  try {
    const count = await prisma.orangTuaSiswa.count({
      where: {
        orangTuaId,
        siswa: {
          statusSiswa: 'AKTIF',
        },
      },
    });
    return count;
  } catch (error) {
    console.error('Error getting active children count:', error);
    return 0;
  }
}

/**
 * Check if parent should be automatically deactivated based on children status
 * Used during student status updates
 * @param {string} orangTuaId - Parent ID
 * @returns {Promise<boolean>} - True if all children are inactive and parent should be auto-deactivated
 */
export async function shouldAutoDeactivateParent(orangTuaId) {
  try {
    const activeChildCount = await getActiveChildrenCount(orangTuaId);
    return activeChildCount === 0;
  } catch (error) {
    console.error('Error checking if parent should be deactivated:', error);
    return false;
  }
}
