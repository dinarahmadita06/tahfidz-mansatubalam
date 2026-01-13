/**
 * Aktivitas Terkini Widget - Untuk Siswa Dashboard
 * Menampilkan 7 aktivitas terakhir dari siswa dengan format yang rapi
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getActivityDisplay } from '@/lib/helpers/siswaActivityConstants';
import { Clock, ChevronRight } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import EmptyState from '@/components/shared/EmptyState';

export default function AktivitasTerkiniWidget({ initialData = null }) {
  const router = useRouter();
  const [activities, setActivities] = useState(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialData) {
      fetchActivities();
    }
  }, [initialData]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/siswa/activity/recent?limit=5');

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('[AktivitasTerkiniWidget] Error fetching activities:', err);
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Get CTA based on action type
  const getActivityCTA = (action) => {
    if (action === 'SISWA_VIEW_PENGUMUMAN' || action === 'SISTEM_PENGUMUMAN_BARU') {
      return { text: 'Baca', href: '/siswa/pengumuman' };
    }
    if (action === 'SISTEM_NILAI_HAFALAN_MASUK' || action === 'SISWA_VIEW_PENILAIAN_HAFALAN') {
      return { text: 'Lihat Nilai', href: '/siswa/penilaian-hafalan' };
    }
    if (
      action === 'SISWA_DAFTAR_TASMI' ||
      action === 'SISTEM_JADWAL_TASMI_DITETAPKAN' ||
      action === 'SISTEM_JADWAL_TASMI_DIUBAH' ||
      action === 'SISWA_VIEW_TASMI'
    ) {
      return { text: 'Lihat Jadwal', href: '/siswa/tasmi' };
    }
    if (action === 'SISWA_VIEW_LAPORAN_HAFALAN') {
      return { text: 'Lihat Laporan', href: '/siswa/laporan' };
    }
    return null;
  };

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden">
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 lg:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
        <div className="flex items-center gap-3">
          <Clock size={22} className="text-white" />
          <div>
            <h2 className="text-base lg:text-lg font-bold text-white">Aktivitas Terkini</h2>
            <p className="text-xs text-green-50 mt-0.5">Riwayat aktivitas Anda</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {loading ? (
          <div className="py-8">
            <LoadingIndicator size="small" text="Memuat aktivitas..." />
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-sm text-red-600 mb-2">⚠️ Gagal memuat aktivitas</p>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            title="Belum ada aktivitas"
            description="Aktivitas Anda akan muncul di sini setelah melakukan pengisian data."
            icon={Clock}
            className="py-6"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const display = getActivityDisplay(activity.action);
              const cta = getActivityCTA(activity.action);
              
              // Determine if item is navigable based on data or title
              const isDashboard = activity.title?.toLowerCase().includes('membuka dashboard');
              const isNavigable = activity.isNavigable === true || (!!cta && !isDashboard);
              const targetUrl = activity.targetUrl || cta?.href;

              const content = (
                <>
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 pt-1">{display.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                      {activity.relativeTime}
                    </p>
                  </div>

                  {/* Chevron only for navigable items */}
                  {isNavigable && (
                    <div className="flex-shrink-0 text-emerald-500 pt-1">
                      <ChevronRight size={18} />
                    </div>
                  )}
                </>
              );

              if (isNavigable && targetUrl) {
                return (
                  <button
                    key={activity.id}
                    onClick={() => router.push(targetUrl)}
                    className="w-full flex items-start text-left gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg bg-white/50 border border-gray-100 hover:bg-white/80 hover:border-emerald-200 hover:shadow-sm transition-all group"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg bg-gray-50/50 border border-transparent"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
