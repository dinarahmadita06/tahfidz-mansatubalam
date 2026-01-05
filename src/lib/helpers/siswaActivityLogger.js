/**
 * Siswa Activity Logger - Helper dengan anti-spam untuk menu views
 * Format yang sama dengan guru activity untuk consistency
 */

import { prisma } from '@/lib/db';
import { isViewEvent } from './siswaActivityConstants';

/**
 * Log activity untuk siswa dengan anti-spam untuk view events
 * @param {Object} params
 * @param {string} params.siswaId - ID siswa (target)
 * @param {string} params.actionType - Tipe aktivitas (dari SISWA_ACTIVITY_TYPES)
 * @param {string} params.title - Judul aktivitas
 * @param {string} params.description - Deskripsi aktivitas
 * @param {Object} params.metadata - Data tambahan (optional)
 * @param {string} params.actorId - ID actor (who performed), default: siswaId
 * @param {string} params.actorName - Nama actor, default: Siswa
 * @returns {Promise<Object|null>} Activity record atau null jika di-spam
 */
export async function logSiswaActivity({
  siswaId,
  actionType,
  title,
  description,
  metadata = null,
  actorId = null,
  actorName = 'Siswa'
}) {
  try {
    // Validasi required fields
    if (!siswaId || !actionType || !title) {
      console.error('[logSiswaActivity] Missing required fields', { siswaId, actionType, title });
      return null;
    }

    // Anti-spam check untuk VIEW events
    if (isViewEvent(actionType)) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Cek apakah sudah ada activity type yang sama hari ini
      const existingToday = await prisma.activityLog.findFirst({
        where: {
          targetUserId: siswaId,
          action: actionType,
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        select: { id: true }
      });

      // Jika sudah ada, jangan log lagi (anti-spam)
      if (existingToday) {
        console.log(`[logSiswaActivity] SPAM PREVENTED: ${actionType} already logged today for siswa ${siswaId}`);
        return null;
      }
    }

    // Create activity log
    const activity = await prisma.activityLog.create({
      data: {
        actorId: actorId || siswaId,
        actorRole: 'SISWA',
        actorName: actorName,
        targetUserId: siswaId,
        targetRole: 'SISWA',
        action: actionType,
        title: title,
        description: description,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    console.log(`[logSiswaActivity] ✅ Logged ${actionType} for siswa ${siswaId}`);
    return activity;

  } catch (error) {
    console.error('[logSiswaActivity] Error logging activity:', error);
    // Don't throw error - activity logging should not break main operation
    return null;
  }
}

/**
 * Log system event untuk siswa (e.g., nilai masuk, presensi, pengumuman)
 * Tidak ada anti-spam untuk system events - dicatat setiap kali terjadi
 * @param {Object} params
 * @param {string} params.siswaId - ID siswa (target)
 * @param {string} params.actionType - Tipe aktivitas sistem
 * @param {string} params.title - Judul aktivitas
 * @param {string} params.description - Deskripsi aktivitas
 * @param {Object} params.metadata - Data tambahan
 * @param {string} params.actorId - ID actor (guru/admin), default: 'SYSTEM'
 * @param {string} params.actorName - Nama actor, default: 'Sistem'
 */
export async function logSistemActivity({
  siswaId,
  actionType,
  title,
  description,
  metadata = null,
  actorId = 'SYSTEM',
  actorName = 'Sistem'
}) {
  try {
    if (!siswaId || !actionType || !title) {
      console.error('[logSistemActivity] Missing required fields', { siswaId, actionType, title });
      return null;
    }

    const activity = await prisma.activityLog.create({
      data: {
        actorId: actorId,
        actorRole: 'SISTEM',
        actorName: actorName,
        targetUserId: siswaId,
        targetRole: 'SISWA',
        action: actionType,
        title: title,
        description: description,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    console.log(`[logSistemActivity] ✅ Logged ${actionType} for siswa ${siswaId}`);
    return activity;

  } catch (error) {
    console.error('[logSistemActivity] Error logging system activity:', error);
    return null;
  }
}

/**
 * Fetch recent activities untuk siswa (untuk widget)
 * @param {string} siswaId - ID siswa
 * @param {number} limit - Jumlah aktivitas (default: 7)
 * @returns {Promise<Array>} Array of activities
 */
export async function getSiswaRecentActivities(siswaId, limit = 7) {
  try {
    const activities = await prisma.activityLog.findMany({
      where: {
        targetUserId: siswaId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        actorName: true,
        metadata: true,
        createdAt: true
      }
    });

    return activities;
  } catch (error) {
    console.error('[getSiswaRecentActivities] Error fetching activities:', error);
    return [];
  }
}

/**
 * Format relative time (e.g., "Hari ini", "Kemarin")
 */
export function getRelativeTime(date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const daysDiff = Math.floor((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) return 'Hari ini';
  if (daysDiff === 1) return 'Kemarin';
  if (daysDiff < 7) return `${daysDiff} hari lalu`;
  if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} minggu lalu`;
  return `${Math.floor(daysDiff / 30)} bulan lalu`;
}
