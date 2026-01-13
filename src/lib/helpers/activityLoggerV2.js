/**
 * Global Activity Logger Helper - Version 2
 * Standardized, reusable activity logging for all roles (SISWA, GURU, ADMIN)
 * 
 * Usage:
 * ```
 * await logActivity({
 *   actorId: userId,
 *   actorRole: 'GURU',
 *   actorName: 'Ahmad Fauzi',
 *   action: 'HAFALAN_SAVE',
 *   title: 'Penilaian Hafalan Disimpan',
 *   description: 'Anda menyimpan penilaian untuk Lakita (Kelas X A3)',
 *   metadata: { siswaId, kelasId, nilaiAkhir, tanggal }
 * })
 * ```
 */

import { prisma } from '@/lib/db';

/**
 * Activity Action Types - Standardized across all roles
 * Format: ROLE_ACTION (e.g., SISWA_DAFTAR_TASMI, GURU_INPUT_PENILAIAN)
 */
export const ACTIVITY_ACTIONS = {
  // SISWA Activities
  SISWA_DAFTAR_TASMI: 'SISWA_DAFTAR_TASMI',
  SISWA_BATAL_TASMI: 'SISWA_BATAL_TASMI',
  SISWA_UBAH_JADWAL_TASMI: 'SISWA_UBAH_JADWAL_TASMI',
  SISWA_SETOR_HAFALAN: 'SISWA_SETOR_HAFALAN',
  SISWA_UBAH_PROFIL: 'SISWA_UBAH_PROFIL',
  SISWA_LIHAT_LAPORAN: 'SISWA_LIHAT_LAPORAN',
  SISWA_BACA_BUKU_DIGITAL: 'SISWA_BACA_BUKU_DIGITAL',
  SISWA_LOGIN: 'SISWA_LOGIN',
  SISWA_LOGOUT: 'SISWA_LOGOUT',
  SISWA_UBAH_PASSWORD: 'SISWA_UBAH_PASSWORD',

  // GURU Activities
  GURU_INPUT_PENILAIAN: 'GURU_INPUT_PENILAIAN',
  GURU_EDIT_PENILAIAN: 'GURU_EDIT_PENILAIAN',
  GURU_HAPUS_PENILAIAN: 'GURU_HAPUS_PENILAIAN',
  GURU_UBAH_PRESENSI: 'GURU_UBAH_PRESENSI',
  GURU_UBAH_PROFIL: 'GURU_UBAH_PROFIL',
  GURU_UPLOAD_TTD: 'GURU_UPLOAD_TTD',
  GURU_JADWAL_TASMI: 'GURU_JADWAL_TASMI',
  GURU_NILAI_TASMI: 'GURU_NILAI_TASMI',
  GURU_BERI_CATATAN: 'GURU_BERI_CATATAN',
  GURU_DOWNLOAD_PDF: 'GURU_DOWNLOAD_PDF',
  GURU_RESET_PASSWORD_SISWA: 'GURU_RESET_PASSWORD_SISWA',
  GURU_LOGIN: 'GURU_LOGIN',
  GURU_LOGOUT: 'GURU_LOGOUT',
  GURU_INPUT_TAHSIN: 'GURU_INPUT_TAHSIN',
  GURU_EDIT_TAHSIN: 'GURU_EDIT_TAHSIN',
  GURU_HAPUS_TAHSIN: 'GURU_HAPUS_TAHSIN',
  GURU_GENERATE_LAPORAN: 'GURU_GENERATE_LAPORAN',
  GURU_EXPORT_PDF: 'GURU_EXPORT_PDF',
  GURU_EXPORT_EXCEL: 'GURU_EXPORT_EXCEL',
  GURU_SET_TARGET: 'GURU_SET_TARGET',
  GURU_UPLOAD_BUKU_DIGITAL: 'GURU_UPLOAD_BUKU_DIGITAL',
  GURU_HAPUS_BUKU_DIGITAL: 'GURU_HAPUS_BUKU_DIGITAL',

  // ORANG_TUA Activities
  ORTU_BUKA_DASHBOARD: 'ORTU_BUKA_DASHBOARD',
  ORTU_GANTI_ANAK: 'ORTU_GANTI_ANAK',
  ORTU_LIHAT_PENGUMUMAN: 'ORTU_LIHAT_PENGUMUMAN',
  ORTU_LIHAT_DETAIL_PENGUMUMAN: 'ORTU_LIHAT_DETAIL_PENGUMUMAN',
  ORTU_LIHAT_NILAI_HAFALAN: 'ORTU_LIHAT_NILAI_HAFALAN',
  ORTU_LIHAT_LAPORAN: 'ORTU_LIHAT_LAPORAN',
  ORTU_LIHAT_PRESENSI: 'ORTU_LIHAT_PRESENSI',
  ORTU_BUKA_PROFIL: 'ORTU_BUKA_PROFIL',
  ORTU_UBAH_PROFIL: 'ORTU_UBAH_PROFIL',
  ORTU_UBAH_PASSWORD: 'ORTU_UBAH_PASSWORD',
  ORTU_LOGIN: 'ORTU_LOGIN',
  ORTU_LOGOUT: 'ORTU_LOGOUT',
  
  // GURU Navigation/View Activities
  GURU_BUKA_KELAS: 'GURU_BUKA_KELAS',
  GURU_BUKA_DETAIL_SISWA: 'GURU_BUKA_DETAIL_SISWA',
  GURU_BUKA_TASMI: 'GURU_BUKA_TASMI',
  GURU_BUKA_TAHSIN: 'GURU_BUKA_TAHSIN',
  GURU_BUKA_PENGUMUMAN: 'GURU_BUKA_PENGUMUMAN',
  GURU_BUAT_PENGUMUMAN: 'GURU_BUAT_PENGUMUMAN',
  GURU_BUKA_LAPORAN: 'GURU_BUKA_LAPORAN',
  GURU_REFRESH_DATA: 'GURU_REFRESH_DATA',
  
  // ALIASES for consistency as requested
  ORANGTUA_UBAH_PROFIL: 'ORTU_UBAH_PROFIL',
  ORANGTUA_UBAH_PASSWORD: 'ORTU_UBAH_PASSWORD',
  ORANGTUA_PILIH_ANAK: 'ORTU_GANTI_ANAK',
  ORANGTUA_LOGIN: 'ORTU_LOGIN',

  // ADMIN Activities
  ADMIN_SET_TARGET: 'ADMIN_SET_TARGET',
  ADMIN_TAMBAH_TAHUN: 'ADMIN_TAMBAH_TAHUN',
  ADMIN_TAMBAH_KELAS: 'ADMIN_TAMBAH_KELAS',
  ADMIN_TAMBAH_SISWA: 'ADMIN_TAMBAH_SISWA',
  ADMIN_TAMBAH_USER: 'ADMIN_TAMBAH_USER',
  ADMIN_RESET_PASSWORD: 'ADMIN_RESET_PASSWORD',
  ADMIN_UBAH_ROLE: 'ADMIN_UBAH_ROLE',
  ADMIN_UBAH_PROFIL: 'ADMIN_UBAH_PROFIL',
  ADMIN_LOGIN: 'ADMIN_LOGIN',
  ADMIN_LOGOUT: 'ADMIN_LOGOUT',
}

/**
 * Activity Type Categories - For UI display (icons, colors, badges)
 */
export const ACTIVITY_CATEGORIES = {
  PENILAIAN: 'PENILAIAN',
  TASMI: 'TASMI',
  PROFIL: 'PROFIL',
  HAFALAN: 'HAFALAN',
  LAPORAN: 'LAPORAN',
  TARGET: 'TARGET',
  PRESENSI: 'PRESENSI',
  PENGGUNA: 'PENGGUNA',
  SISTEM: 'SISTEM',
};

/**
 * Map action to category for UI display
 */
function getActionCategory(action) {
  const categoryMap = {
    [ACTIVITY_ACTIONS.GURU_INPUT_PENILAIAN]: ACTIVITY_CATEGORIES.PENILAIAN,
    [ACTIVITY_ACTIONS.GURU_EDIT_PENILAIAN]: ACTIVITY_CATEGORIES.PENILAIAN,
    [ACTIVITY_ACTIONS.GURU_HAPUS_PENILAIAN]: ACTIVITY_CATEGORIES.PENILAIAN,
    [ACTIVITY_ACTIONS.GURU_NILAI_TASMI]: ACTIVITY_CATEGORIES.TASMI,
    [ACTIVITY_ACTIONS.SISWA_DAFTAR_TASMI]: ACTIVITY_CATEGORIES.TASMI,
    [ACTIVITY_ACTIONS.SISWA_BATAL_TASMI]: ACTIVITY_CATEGORIES.TASMI,
    [ACTIVITY_ACTIONS.GURU_JADWAL_TASMI]: ACTIVITY_CATEGORIES.TASMI,
    [ACTIVITY_ACTIONS.SISWA_UBAH_PROFIL]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.GURU_UBAH_PROFIL]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.ADMIN_UBAH_PROFIL]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.GURU_UPLOAD_TTD]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.SISWA_SETOR_HAFALAN]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.SISWA_LIHAT_LAPORAN]: ACTIVITY_CATEGORIES.LAPORAN,
    [ACTIVITY_ACTIONS.GURU_DOWNLOAD_PDF]: ACTIVITY_CATEGORIES.LAPORAN,
    [ACTIVITY_ACTIONS.ADMIN_SET_TARGET]: ACTIVITY_CATEGORIES.TARGET,
    [ACTIVITY_ACTIONS.GURU_UBAH_PRESENSI]: ACTIVITY_CATEGORIES.PRESENSI,
    [ACTIVITY_ACTIONS.GURU_INPUT_TAHSIN]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.GURU_EDIT_TAHSIN]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.GURU_HAPUS_TAHSIN]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.GURU_GENERATE_LAPORAN]: ACTIVITY_CATEGORIES.LAPORAN,
    [ACTIVITY_ACTIONS.GURU_EXPORT_PDF]: ACTIVITY_CATEGORIES.LAPORAN,
    [ACTIVITY_ACTIONS.GURU_EXPORT_EXCEL]: ACTIVITY_CATEGORIES.LAPORAN,
    [ACTIVITY_ACTIONS.GURU_SET_TARGET]: ACTIVITY_CATEGORIES.TARGET,
    [ACTIVITY_ACTIONS.GURU_UPLOAD_BUKU_DIGITAL]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.GURU_HAPUS_BUKU_DIGITAL]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.SISWA_BACA_BUKU_DIGITAL]: ACTIVITY_CATEGORIES.HAFALAN,
    [ACTIVITY_ACTIONS.ADMIN_TAMBAH_USER]: ACTIVITY_CATEGORIES.PENGGUNA,
    [ACTIVITY_ACTIONS.ADMIN_TAMBAH_SISWA]: ACTIVITY_CATEGORIES.PENGGUNA,
    [ACTIVITY_ACTIONS.ADMIN_RESET_PASSWORD]: ACTIVITY_CATEGORIES.PENGGUNA,
    [ACTIVITY_ACTIONS.ADMIN_UBAH_ROLE]: ACTIVITY_CATEGORIES.PENGGUNA,
    [ACTIVITY_ACTIONS.SISWA_UBAH_PASSWORD]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.ORTU_UBAH_PROFIL]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.ORTU_UBAH_PASSWORD]: ACTIVITY_CATEGORIES.PROFIL,
    [ACTIVITY_ACTIONS.ORTU_GANTI_ANAK]: ACTIVITY_CATEGORIES.SISTEM,
  };

  return categoryMap[action] || ACTIVITY_CATEGORIES.SISTEM;
}

/**
 * Get activity icon emoji based on action
 */
export function getActivityIcon(action) {
  const iconMap = {
    [ACTIVITY_ACTIONS.GURU_INPUT_PENILAIAN]: '📝',
    [ACTIVITY_ACTIONS.GURU_EDIT_PENILAIAN]: '✏️',
    [ACTIVITY_ACTIONS.GURU_HAPUS_PENILAIAN]: '🗑️',
    [ACTIVITY_ACTIONS.GURU_NILAI_TASMI]: '⭐',
    [ACTIVITY_ACTIONS.SISWA_DAFTAR_TASMI]: '📋',
    [ACTIVITY_ACTIONS.SISWA_BATAL_TASMI]: '❌',
    [ACTIVITY_ACTIONS.GURU_JADWAL_TASMI]: '📅',
    [ACTIVITY_ACTIONS.SISWA_UBAH_PROFIL]: '👤',
    [ACTIVITY_ACTIONS.GURU_UBAH_PROFIL]: '👤',
    [ACTIVITY_ACTIONS.ADMIN_UBAH_PROFIL]: '👤',
    [ACTIVITY_ACTIONS.GURU_UPLOAD_TTD]: '✍️',
    [ACTIVITY_ACTIONS.SISWA_SETOR_HAFALAN]: '📖',
    [ACTIVITY_ACTIONS.SISWA_LIHAT_LAPORAN]: '📊',
    [ACTIVITY_ACTIONS.GURU_DOWNLOAD_PDF]: '💾',
    [ACTIVITY_ACTIONS.ADMIN_SET_TARGET]: '🎯',
    [ACTIVITY_ACTIONS.GURU_UBAH_PRESENSI]: '✅',
    [ACTIVITY_ACTIONS.ADMIN_TAMBAH_USER]: '👥',
    [ACTIVITY_ACTIONS.ADMIN_RESET_PASSWORD]: '🔑',
    [ACTIVITY_ACTIONS.ADMIN_UBAH_ROLE]: '🛡️',
    [ACTIVITY_ACTIONS.ADMIN_TAMBAH_SISWA]: '👤',
    [ACTIVITY_ACTIONS.GURU_INPUT_TAHSIN]: '📚',
    [ACTIVITY_ACTIONS.GURU_EDIT_TAHSIN]: '✏️',
    [ACTIVITY_ACTIONS.GURU_HAPUS_TAHSIN]: '🗑️',
    [ACTIVITY_ACTIONS.GURU_GENERATE_LAPORAN]: '📄',
    [ACTIVITY_ACTIONS.GURU_EXPORT_PDF]: '📥',
    [ACTIVITY_ACTIONS.GURU_EXPORT_EXCEL]: '📊',
    [ACTIVITY_ACTIONS.GURU_SET_TARGET]: '🎯',
    [ACTIVITY_ACTIONS.GURU_UPLOAD_BUKU_DIGITAL]: '📖',
    [ACTIVITY_ACTIONS.GURU_HAPUS_BUKU_DIGITAL]: '🗑️',
    [ACTIVITY_ACTIONS.SISWA_BACA_BUKU_DIGITAL]: '👁️',
    [ACTIVITY_ACTIONS.SISWA_UBAH_PASSWORD]: '🔑',
    [ACTIVITY_ACTIONS.ORTU_UBAH_PROFIL]: '👤',
    [ACTIVITY_ACTIONS.ORTU_UBAH_PASSWORD]: '🔑',
    [ACTIVITY_ACTIONS.ORTU_GANTI_ANAK]: '🔄',
    [ACTIVITY_ACTIONS.ORTU_LOGIN]: '🔑',
    [ACTIVITY_ACTIONS.ORTU_BUKA_DASHBOARD]: '🏠',
    [ACTIVITY_ACTIONS.ORTU_LIHAT_PENGUMUMAN]: '📢',
    [ACTIVITY_ACTIONS.ORTU_LIHAT_DETAIL_PENGUMUMAN]: '📄',
    [ACTIVITY_ACTIONS.ORTU_LIHAT_NILAI_HAFALAN]: '📈',
    [ACTIVITY_ACTIONS.ORTU_LIHAT_LAPORAN]: '📊',
    [ACTIVITY_ACTIONS.ORTU_LIHAT_PRESENSI]: '✅',
    [ACTIVITY_ACTIONS.ORTU_BUKA_PROFIL]: '👤',
    [ACTIVITY_ACTIONS.GURU_BUKA_KELAS]: '🏫',
    [ACTIVITY_ACTIONS.GURU_BUKA_DETAIL_SISWA]: '👦',
    [ACTIVITY_ACTIONS.GURU_BUKA_TASMI]: '📋',
    [ACTIVITY_ACTIONS.GURU_BUKA_TAHSIN]: '📚',
    [ACTIVITY_ACTIONS.GURU_BUKA_PENGUMUMAN]: '📢',
    [ACTIVITY_ACTIONS.GURU_BUAT_PENGUMUMAN]: '➕',
    [ACTIVITY_ACTIONS.GURU_BUKA_LAPORAN]: '📊',
    [ACTIVITY_ACTIONS.GURU_REFRESH_DATA]: '🔄',
    [ACTIVITY_ACTIONS.GURU_BUKA_PROFIL]: '👤',
  };

  return iconMap[action] || '📌';
}

/**
 * Get activity color (Tailwind) based on category
 */
export function getActivityColor(action) {
  const category = getActionCategory(action);

  const colorMap = {
    [ACTIVITY_CATEGORIES.PENILAIAN]: 'bg-blue-50 border-blue-200 text-blue-700',
    [ACTIVITY_CATEGORIES.TASMI]: 'bg-purple-50 border-purple-200 text-purple-700',
    [ACTIVITY_CATEGORIES.PROFIL]: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    [ACTIVITY_CATEGORIES.HAFALAN]: 'bg-amber-50 border-amber-200 text-amber-700',
    [ACTIVITY_CATEGORIES.LAPORAN]: 'bg-orange-50 border-orange-200 text-orange-700',
    [ACTIVITY_CATEGORIES.TARGET]: 'bg-rose-50 border-rose-200 text-rose-700',
    [ACTIVITY_CATEGORIES.PRESENSI]: 'bg-green-50 border-green-200 text-green-700',
    [ACTIVITY_CATEGORIES.PENGGUNA]: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    [ACTIVITY_CATEGORIES.SISTEM]: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return colorMap[category] || colorMap[ACTIVITY_CATEGORIES.SISTEM];
}

/**
 * Convert DateTime to human-readable relative time or fixed format
 * <= 24h: "X menit/jam lalu"
 * > 24h: "DD MMM YYYY • HH:mm"
 */
export function formatTimeAgo(date) {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInSeconds = Math.floor((now - activityDate) / 1000);

  // If more than 24 hours, return fixed format
  if (diffInSeconds >= 86400) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const d = activityDate.getDate();
    const m = months[activityDate.getMonth()];
    const y = activityDate.getFullYear();
    const h = activityDate.getHours().toString().padStart(2, '0');
    const min = activityDate.getMinutes().toString().padStart(2, '0');
    return `${d} ${m} ${y} • ${h}:${min}`;
  }

  // Relative time for <= 24 hours
  const intervals = {
    jam: 3600,
    menit: 60,
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name} lalu`;
    }
  }

  return 'Baru saja';
}

/**
 * Main Activity Logger Function
 * 
 * @param {Object} params
 * @param {String} params.actorId - User ID who performed the action
 * @param {String} params.actorRole - Role of actor (SISWA, GURU, ADMIN)
 * @param {String} params.actorName - Display name of actor (optional)
 * @param {String} params.action - Action code (from ACTIVITY_ACTIONS enum)
 * @param {String} params.title - Short title for display
 * @param {String} params.description - Detailed description (optional)
 * @param {String} params.targetUserId - ID of affected user (optional)
 * @param {String} params.targetRole - Role of affected user (optional)
 * @param {String} params.targetName - Name of affected user (optional)
 * @param {Object} params.metadata - Additional context data as JSON (optional)
 * @returns {Promise<Object>} Created activity log record
 */
export async function logActivity({
  actorId,
  actorRole,
  actorName = null,
  action,
  title,
  description = null,
  targetUserId = null,
  targetRole = null,
  targetName = null,
  metadata = null,
}) {
  try {
    // Validate required fields
    if (!actorId || !actorRole || !action || !title) {
      console.error('[ACTIVITY LOG] Missing required fields:', {
        actorId,
        actorRole,
        action,
        title,
      });
      return null;
    }

    // Create activity log entry
    const activity = await prisma.activityLog.create({
      data: {
        actorId,
        actorRole,
        actorName: actorName || null,
        action,
        title,
        description: description || null,
        targetUserId: targetUserId || null,
        targetRole: targetRole || null,
        targetName: targetName || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    console.log('[ACTIVITY LOG] Logged:', action, 'by', actorRole);
    return activity;
  } catch (error) {
    console.error('[ACTIVITY LOG ERROR]', error);
    // Don't throw - logging shouldn't break main operation
    return null;
  }
}

/**
 * Bulk log multiple activities
 * Useful for complex operations with multiple steps
 */
export async function logActivitiesBulk(activities) {
  try {
    const results = await Promise.all(activities.map(logActivity));
    return results.filter((r) => r !== null);
  } catch (error) {
    console.error('[ACTIVITY LOG BULK ERROR]', error);
    return [];
  }
}
