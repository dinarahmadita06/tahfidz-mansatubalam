/**
 * Aktivitas Terkini Widget - Untuk Siswa Dashboard
 * Menampilkan 7 aktivitas terakhir dari siswa dengan format yang rapi
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getActivityDisplay } from '@/lib/helpers/siswaActivityConstants';
import { Clock, ChevronRight } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function AktivitasTerkiniWidget() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

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
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-600 font-medium">Belum ada aktivitas terbaru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => {
              const display = getActivityDisplay(activity.action);
              const cta = getActivityCTA(activity.action);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 rounded-lg bg-white/50 border border-gray-100 hover:bg-white/80 transition-colors"
                >
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0 pt-1">{display.icon}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.relativeTime}</p>
                  </div>

                  {/* CTA */}
                  {cta ? (
                    <Link
                      href={cta.href}
                      className="flex-shrink-0 px-3 py-2 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors whitespace-nowrap"
                    >
                      {cta.text}
                    </Link>
                  ) : (
                    <div className="flex-shrink-0 text-gray-400 pt-1">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
