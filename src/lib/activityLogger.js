/**
 * Activity Logger - Helper untuk log aktivitas guru
 */

import prisma from '@/lib/prisma';

/**
 * Log aktivitas guru
 * @param {Object} params
 * @param {string} params.userId - ID user guru
 * @param {string} params.type - Tipe aktivitas (presensi, penilaian_tahsin, penilaian_hafalan, upload_materi, pengumuman)
 * @param {string} params.title - Judul aktivitas
 * @param {string} params.subtitle - Subtitle/detail aktivitas (optional)
 * @returns {Promise<Object>} Activity record
 */
export async function logActivity({ userId, type, title, subtitle = null }) {
  try {
    // Validasi required fields
    if (!userId || !type || !title) {
      console.error('logActivity: Missing required fields', { userId, type, title });
      return null;
    }

    // Validasi tipe aktivitas
    const validTypes = [
      'presensi',
      'penilaian_tahsin',
      'penilaian_hafalan',
      'penilaian_tasmi',
      'upload_materi',
      'pengumuman',
      'lainnya'
    ];

    if (!validTypes.includes(type)) {
      console.error('logActivity: Invalid activity type', type);
      return null;
    }

    // Insert activity log
    const activity = await prisma.guruActivity.create({
      data: {
        userId,
        type,
        title,
        subtitle,
        createdAt: new Date(),
      },
    });

    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
}

/**
 * Get aktivitas guru terbaru
 * @param {string} userId - ID user guru
 * @param {number} limit - Jumlah aktivitas yang diambil (default 8)
 * @returns {Promise<Array>} Array of activities
 */
export async function getRecentActivities(userId, limit = 8) {
  try {
    const activities = await prisma.guruActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return activities;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}

/**
 * Icon mapping untuk setiap tipe aktivitas
 */
export const ACTIVITY_ICONS = {
  presensi: 'CheckCircle2',
  penilaian_tahsin: 'Volume2',
  penilaian_hafalan: 'BookOpen',
  penilaian_tasmi: 'Award',
  upload_materi: 'Upload',
  pengumuman: 'Megaphone',
  lainnya: 'FileText',
};

/**
 * Color mapping untuk setiap tipe aktivitas
 */
export const ACTIVITY_COLORS = {
  presensi: 'emerald',
  penilaian_tahsin: 'blue',
  penilaian_hafalan: 'violet',
  penilaian_tasmi: 'amber',
  upload_materi: 'cyan',
  pengumuman: 'rose',
  lainnya: 'slate',
};
