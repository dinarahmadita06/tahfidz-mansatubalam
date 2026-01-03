import { prisma } from '@/lib/db';

/**
 * Log activity untuk Siswa/Guru/Admin
 * 
 * @param {Object} params
 * @param {string} params.userId - ID user yang melakukan action
 * @param {string} params.role - Role user ('SISWA' | 'GURU' | 'ADMIN')
 * @param {string} params.type - Tipe aktivitas (e.g., 'DAFTAR_TASMI', 'INPUT_PENILAIAN_HAFALAN')
 * @param {string} params.title - Judul aktivitas (e.g., 'Mendaftar Tasmi\'')
 * @param {string} [params.subtitle] - Deskripsi tambahan (e.g., 'Juz 1, Juz 2')
 * @param {string} [params.targetUserId] - ID user yang terdampak (optional)
 * @param {string} [params.targetRole] - Role user yang terdampak (optional)
 * 
 * @returns {Promise<Object>} Activity log yang baru dibuat
 * 
 * @example
 * // Siswa mendaftar Tasmi'
 * await logActivity({
 *   userId: siswaUserId,
 *   role: 'SISWA',
 *   type: 'DAFTAR_TASMI',
 *   title: 'Mendaftar ujian Tasmi\'',
 *   subtitle: 'Mengajukan Juz 1, Juz 2'
 * });
 * 
 * @example
 * // Guru input penilaian hafalan
 * await logActivity({
 *   userId: guruUserId,
 *   role: 'GURU',
 *   type: 'INPUT_PENILAIAN_HAFALAN',
 *   title: 'Input penilaian hafalan',
 *   subtitle: 'Menilai Lakita (Kelas X A3)',
 *   targetUserId: siswaUserId,
 *   targetRole: 'SISWA'
 * });
 */
export async function logActivity({
  userId,
  role,
  type,
  title,
  subtitle = null,
  targetUserId = null,
  targetRole = null
}) {
  try {
    // Validate input
    if (!userId || !role || !type || !title) {
      console.error('[logActivity] Missing required fields', {
        userId,
        role,
        type,
        title
      });
      return null;
    }

    // Create activity log in GuruActivity model (reusable for all roles)
    const activity = await prisma.guruActivity.create({
      data: {
        userId,
        type,
        title,
        subtitle
      }
    });

    console.log(`[logActivity] Logged ${role} activity: ${type} for user ${userId}`);
    return activity;

  } catch (error) {
    console.error('[logActivity] Error logging activity:', error);
    // Don't throw error - activity logging should not break main operation
    return null;
  }
}

/**
 * Activity type constants untuk consistency
 */
export const ACTIVITY_TYPES = {
  // Siswa activities
  DAFTAR_TASMI: 'DAFTAR_TASMI',
  EDIT_PROFIL: 'EDIT_PROFIL',
  UBAH_PASSWORD: 'UBAH_PASSWORD',
  BACA_PENGUMUMAN: 'BACA_PENGUMUMAN',
  LIHAT_NILAI: 'LIHAT_NILAI',
  HAPUS_TASMI: 'HAPUS_TASMI',

  // Guru activities
  INPUT_PENILAIAN_HAFALAN: 'INPUT_PENILAIAN_HAFALAN',
  EDIT_PENILAIAN_HAFALAN: 'EDIT_PENILAIAN_HAFALAN',
  VALIDASI_TASMI: 'VALIDASI_TASMI',
  JADWAL_TASMI: 'JADWAL_TASMI',
  INPUT_NILAI_TASMI: 'INPUT_NILAI_TASMI',
  UNDUH_LAPORAN: 'UNDUH_LAPORAN',
  BUAT_PENGUMUMAN: 'BUAT_PENGUMUMAN',

  // Admin activities
  KELOLA_SISWA: 'KELOLA_SISWA',
  KELOLA_GURU: 'KELOLA_GURU',
  KELOLA_KELAS: 'KELOLA_KELAS',
  SET_TARGET_HAFALAN: 'SET_TARGET_HAFALAN'
};

/**
 * Helper: Get icon for activity type
 */
export function getActivityIcon(type) {
  const iconMap = {
    // Siswa activities
    DAFTAR_TASMI: '✓',
    EDIT_PROFIL: '👤',
    UBAH_PASSWORD: '🔐',
    BACA_PENGUMUMAN: '📢',
    LIHAT_NILAI: '📊',
    HAPUS_TASMI: '❌',

    // Guru activities
    INPUT_PENILAIAN_HAFALAN: '📝',
    EDIT_PENILAIAN_HAFALAN: '✏️',
    VALIDASI_TASMI: '✅',
    JADWAL_TASMI: '📅',
    INPUT_NILAI_TASMI: '⭐',
    UNDUH_LAPORAN: '📥',
    BUAT_PENGUMUMAN: '📢',

    // Admin activities
    KELOLA_SISWA: '👥',
    KELOLA_GURU: '👨‍🏫',
    KELOLA_KELAS: '🏫',
    SET_TARGET_HAFALAN: '🎯'
  };

  return iconMap[type] || '•';
}

/**
 * Helper: Get color for activity type (Tailwind CSS)
 */
export function getActivityColor(type) {
  const colorMap = {
    // Siswa activities
    DAFTAR_TASMI: 'emerald',
    EDIT_PROFIL: 'blue',
    UBAH_PASSWORD: 'purple',
    BACA_PENGUMUMAN: 'amber',
    LIHAT_NILAI: 'cyan',
    HAPUS_TASMI: 'red',

    // Guru activities
    INPUT_PENILAIAN_HAFALAN: 'green',
    EDIT_PENILAIAN_HAFALAN: 'blue',
    VALIDASI_TASMI: 'emerald',
    JADWAL_TASMI: 'violet',
    INPUT_NILAI_TASMI: 'yellow',
    UNDUH_LAPORAN: 'indigo',
    BUAT_PENGUMUMAN: 'rose',

    // Admin activities
    KELOLA_SISWA: 'slate',
    KELOLA_GURU: 'slate',
    KELOLA_KELAS: 'slate',
    SET_TARGET_HAFALAN: 'slate'
  };

  return colorMap[type] || 'gray';
}
