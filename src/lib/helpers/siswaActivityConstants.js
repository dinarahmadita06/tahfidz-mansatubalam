/**
 * Activity Constants for Siswa Role
 * Standardized activity types for menu views, actions, and system updates
 */

export const SISWA_ACTIVITY_TYPES = {
  // Menu View Events
  SISWA_VIEW_DASHBOARD: 'SISWA_VIEW_DASHBOARD',
  SISWA_VIEW_PENILAIAN_HAFALAN: 'SISWA_VIEW_PENILAIAN_HAFALAN',
  SISWA_VIEW_TASMI: 'SISWA_VIEW_TASMI',
  SISWA_VIEW_BUKU_DIGITAL: 'SISWA_VIEW_BUKU_DIGITAL',
  SISWA_VIEW_REFERENSI_QURAN: 'SISWA_VIEW_REFERENSI_QURAN',
  SISWA_VIEW_PRESENSI: 'SISWA_VIEW_PRESENSI',
  SISWA_VIEW_LAPORAN_HAFALAN: 'SISWA_VIEW_LAPORAN_HAFALAN',
  SISWA_VIEW_PENGUMUMAN: 'SISWA_VIEW_PENGUMUMAN',
  SISWA_VIEW_PROFIL: 'SISWA_VIEW_PROFIL',

  // Action Events
  SISWA_DAFTAR_TASMI: 'SISWA_DAFTAR_TASMI',
  SISWA_BATAL_TASMI: 'SISWA_BATAL_TASMI',
  SISWA_UBAH_PROFIL: 'SISWA_UBAH_PROFIL',
  SISWA_UBAH_PASSWORD: 'SISWA_UBAH_PASSWORD',
  SISWA_UPDATE_LAST_READ_QURAN: 'SISWA_UPDATE_LAST_READ_QURAN',

  // System Update Events
  SISTEM_NILAI_HAFALAN_MASUK: 'SISTEM_NILAI_HAFALAN_MASUK',
  SISTEM_PRESENSI_DICATAT: 'SISTEM_PRESENSI_DICATAT',
  SISTEM_PENGUMUMAN_BARU: 'SISTEM_PENGUMUMAN_BARU',
  SISTEM_JADWAL_TASMI_DITETAPKAN: 'SISTEM_JADWAL_TASMI_DITETAPKAN',
  SISTEM_JADWAL_TASMI_DIUBAH: 'SISTEM_JADWAL_TASMI_DIUBAH',
  SISTEM_TASMI_DIBATALKAN: 'SISTEM_TASMI_DIBATALKAN',
};

export const SISWA_ACTIVITY_TITLES = {
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_DASHBOARD]: {
    icon: '🏠',
    title: 'Membuka Dashboard',
    description: 'Anda melihat ringkasan hafalan & nilai.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_PENILAIAN_HAFALAN]: {
    icon: '⭐',
    title: 'Melihat Nilai Hafalan',
    description: 'Anda melihat daftar nilai dari guru.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_TASMI]: {
    icon: '🎤',
    title: 'Membuka Menu Tasmi',
    description: 'Anda melihat jadwal dan daftar tasmi.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_BUKU_DIGITAL]: {
    icon: '📚',
    title: 'Membuka Buku Digital',
    description: 'Anda membuka materi pembelajaran digital.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_REFERENSI_QURAN]: {
    icon: '📖',
    title: 'Membuka Referensi Al-Qur\'an',
    description: 'Anda membuka referensi Al-Qur\'an.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_PRESENSI]: {
    icon: '✅',
    title: 'Melihat Riwayat Presensi',
    description: 'Anda mengecek riwayat kehadiran.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_LAPORAN_HAFALAN]: {
    icon: '📊',
    title: 'Melihat Laporan Hafalan',
    description: 'Anda melihat statistik progres hafalan.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_PENGUMUMAN]: {
    icon: '📢',
    title: 'Melihat Pengumuman',
    description: 'Anda melihat pengumuman terbaru.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_VIEW_PROFIL]: {
    icon: '👤',
    title: 'Membuka Pengaturan Profil',
    description: 'Anda membuka pengaturan akun.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_DAFTAR_TASMI]: {
    icon: '🗓️',
    title: 'Mendaftar Tasmi',
    description: 'Anda mendaftar ujian tasmi.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_BATAL_TASMI]: {
    icon: '❌',
    title: 'Membatalkan Tasmi',
    description: 'Anda membatalkan pendaftaran tasmi.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_UBAH_PROFIL]: {
    icon: '👤',
    title: 'Mengubah Profil',
    description: 'Anda memperbarui data profil pribadi.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_UBAH_PASSWORD]: {
    icon: '🔐',
    title: 'Mengubah Password',
    description: 'Anda memperbarui password akun.'
  },
  [SISWA_ACTIVITY_TYPES.SISWA_UPDATE_LAST_READ_QURAN]: {
    icon: '📌',
    title: 'Memperbarui Terakhir Dibaca',
    description: 'Anda memperbarui posisi bacaan Al-Qur\'an.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_NILAI_HAFALAN_MASUK]: {
    icon: '⭐',
    title: 'Nilai Hafalan Masuk',
    description: 'Guru menyimpan penilaian hafalan Anda.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_PRESENSI_DICATAT]: {
    icon: '✅',
    title: 'Presensi Dicatat',
    description: 'Guru mencatat presensi Anda.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_PENGUMUMAN_BARU]: {
    icon: '📢',
    title: 'Pengumuman Baru',
    description: 'Ada pengumuman baru untuk Anda.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_JADWAL_TASMI_DITETAPKAN]: {
    icon: '📅',
    title: 'Jadwal Tasmi Ditetapkan',
    description: 'Jadwal ujian tasmi Anda telah ditetapkan.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_JADWAL_TASMI_DIUBAH]: {
    icon: '🔄',
    title: 'Jadwal Tasmi Diubah',
    description: 'Jadwal ujian tasmi Anda telah diubah.'
  },
  [SISWA_ACTIVITY_TYPES.SISTEM_TASMI_DIBATALKAN]: {
    icon: '❌',
    title: 'Tasmi Dibatalkan',
    description: 'Jadwal tasmi Anda telah dibatalkan.'
  },
};

/**
 * Get activity display info
 */
export function getActivityDisplay(actionType) {
  return SISWA_ACTIVITY_TITLES[actionType] || {
    icon: '📝',
    title: 'Aktivitas',
    description: 'Aktivitas siswa'
  };
}

/**
 * Determine if activity is a view event
 */
export function isViewEvent(actionType) {
  return actionType.startsWith('SISWA_VIEW_');
}

/**
 * Determine if activity is a system event
 */
export function isSystemEvent(actionType) {
  return actionType.startsWith('SISTEM_');
}

/**
 * Determine if activity is an action event
 */
export function isActionEvent(actionType) {
  return !isViewEvent(actionType) && !isSystemEvent(actionType) && actionType.startsWith('SISWA_');
}
