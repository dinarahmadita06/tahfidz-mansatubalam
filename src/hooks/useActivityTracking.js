/**
 * useActivityTracking Hook
 * Tracks menu views and specific actions for Guru and Orang Tua
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const GURU_ROUTES = {
  '/guru': { action: 'GURU_BUKA_DASHBOARD', title: 'Membuka Dashboard', targetUrl: '/guru' },
  '/guru/penilaian-hafalan': { action: 'GURU_BUKA_KELAS', title: 'Membuka Menu Kelas', targetUrl: '/guru/penilaian-hafalan' },
  '/guru/tasmi': { action: 'GURU_BUKA_TASMI', title: 'Membuka Menu Tasmi', targetUrl: '/guru/tasmi' },
  '/guru/tahsin': { action: 'GURU_BUKA_TAHSIN', title: 'Membuka Menu Tahsin', targetUrl: '/guru/tahsin' },
  '/guru/pengumuman': { action: 'GURU_BUKA_PENGUMUMAN', title: 'Membuka Menu Pengumuman', targetUrl: '/guru/pengumuman' },
  '/guru/laporan': { action: 'GURU_BUKA_LAPORAN', title: 'Membuka Menu Laporan', targetUrl: '/guru/laporan' },
  '/guru/profil': { action: 'GURU_BUKA_PROFIL', title: 'Membuka Menu Profil', targetUrl: '/guru/profil' },
  '/guru/kelola-siswa': { action: 'GURU_BUKA_DETAIL_SISWA', title: 'Membuka Kelola Siswa', targetUrl: '/guru/kelola-siswa' },
};

const ORTU_ROUTES = {
  '/orangtua': { action: 'ORTU_BUKA_DASHBOARD', title: 'Membuka Dashboard', targetUrl: '/orangtua' },
  '/orangtua/dashboard': { action: 'ORTU_BUKA_DASHBOARD', title: 'Membuka Dashboard', targetUrl: '/orangtua/dashboard' },
  '/orangtua/perkembangan-anak': { action: 'ORTU_LIHAT_NILAI_HAFALAN', title: 'Membuka Perkembangan Anak', targetUrl: '/orangtua/perkembangan-anak' },
  '/orangtua/pengumuman': { action: 'ORTU_LIHAT_PENGUMUMAN', title: 'Membuka Menu Pengumuman', targetUrl: '/orangtua/pengumuman' },
  '/orangtua/laporan-hafalan': { action: 'ORTU_LIHAT_LAPORAN', title: 'Membuka Laporan Hafalan', targetUrl: '/orangtua/laporan-hafalan' },
  '/orangtua/profil': { action: 'ORTU_BUKA_PROFIL', title: 'Membuka Menu Profil', targetUrl: '/orangtua/profil' },
  '/orangtua/presensi': { action: 'ORTU_LIHAT_PRESENSI', title: 'Membuka Menu Presensi', targetUrl: '/orangtua/presensi' },
};

export function useActivityTracking(role) {
  const pathname = usePathname();
  const lastTrackedPath = useRef(null);

  useEffect(() => {
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    const routes = role === 'GURU' ? GURU_ROUTES : role === 'ORANG_TUA' ? ORTU_ROUTES : {};
    
    // Find matching route (handle sub-paths like /guru/penilaian-hafalan/123)
    let match = routes[pathname];
    
    if (!match) {
      // Try prefix match for dynamic routes
      const matchedKey = Object.keys(routes).find(key => key !== role.toLowerCase() && pathname.startsWith(key + '/'));
      if (matchedKey) {
        match = routes[matchedKey];
      }
    }

    if (!match) return;

    const logToApi = async () => {
      try {
        const endpoint = role === 'GURU' ? '/api/activity-log' : '/api/orangtua/activity/log';
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: match.action,
            title: match.title,
            description: `Anda ${match.title.toLowerCase()}`,
            targetUrl: match.targetUrl,
            metadata: { path: pathname }
          })
        });
      } catch (err) {
        console.error('Failed to log activity:', err);
      }
    };

    logToApi();
  }, [pathname, role]);
}
