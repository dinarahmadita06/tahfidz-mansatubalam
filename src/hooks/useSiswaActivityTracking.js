/**
 * Hook untuk track menu views secara client-side
 * Mengintegrasikan dengan logging system
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SISWA_ACTIVITY_TYPES, getActivityDisplay } from '@/lib/helpers/siswaActivityConstants';

// Mapping route ke activity type
const ROUTE_TO_ACTIVITY = {
  '/siswa': SISWA_ACTIVITY_TYPES.SISWA_VIEW_DASHBOARD,
  '/siswa/penilaian-hafalan': SISWA_ACTIVITY_TYPES.SISWA_VIEW_PENILAIAN_HAFALAN,
  '/siswa/tasmi': SISWA_ACTIVITY_TYPES.SISWA_VIEW_TASMI,
  '/siswa/buku-digital': SISWA_ACTIVITY_TYPES.SISWA_VIEW_BUKU_DIGITAL,
  '/siswa/referensi': SISWA_ACTIVITY_TYPES.SISWA_VIEW_REFERENSI_QURAN,
  '/siswa/presensi': SISWA_ACTIVITY_TYPES.SISWA_VIEW_PRESENSI,
  '/siswa/laporan': SISWA_ACTIVITY_TYPES.SISWA_VIEW_LAPORAN_HAFALAN,
  '/siswa/pengumuman': SISWA_ACTIVITY_TYPES.SISWA_VIEW_PENGUMUMAN,
  '/siswa/profil': SISWA_ACTIVITY_TYPES.SISWA_VIEW_PROFIL,
};

/**
 * Hook untuk track menu views
 */
export function useSiswaActivityTracking() {
  const pathname = usePathname();
  const lastTrackedRoute = useRef(null);

  useEffect(() => {
    // Jangan track jika route belum berubah (prevent double tracking)
    if (lastTrackedRoute.current === pathname) {
      return;
    }

    lastTrackedRoute.current = pathname;

    // Check jika route cocok dengan activity type
    const activityType = ROUTE_TO_ACTIVITY[pathname];
    if (!activityType) {
      return;
    }

    // Get activity display info
    const display = getActivityDisplay(activityType);

    // Log activity ke server
    const logActivity = async () => {
      try {
        const response = await fetch('/api/siswa/activity/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actionType: activityType,
            title: display.title,
            description: display.description,
            metadata: {
              routePath: pathname,
              timestamp: new Date().toISOString()
            }
          })
        });

        if (!response.ok) {
          console.error('[useSiswaActivityTracking] Failed to log activity:', response.status);
        }
      } catch (error) {
        console.error('[useSiswaActivityTracking] Error logging activity:', error);
        // Silent fail - jangan interrupt user experience
      }
    };

    logActivity();
  }, [pathname]);
}

export default useSiswaActivityTracking;
