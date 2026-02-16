'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatTimeAgo } from '@/lib/helpers/activityLoggerV2';
import EmptyState from '@/components/shared/EmptyState';
import {
  CheckCircle2,
  Volume2,
  BookOpen,
  Award,
  Upload,
  Megaphone,
  FileText,
  ChevronRight,
  UserCircle,
  Key,
  LayoutDashboard,
  Calendar,
  Zap,
} from 'lucide-react';

// Map new action names to icons
const ACTION_ICONS = {
  // Guru actions
  GURU_INPUT_PENILAIAN: BookOpen,
  GURU_EDIT_PENILAIAN: BookOpen,
  GURU_UBAH_PROFIL: UserCircle,
  GURU_BUKA_PROFIL: UserCircle,
  GURU_UPLOAD_TTD: Upload,
  GURU_BUKA_DETAIL_SISWA: UserCircle,
  GURU_BUKA_KELAS: BookOpen,
  GURU_BUKA_TASMI: Award,
  GURU_BUKA_TAHSIN: BookOpen,
  GURU_BUKA_PENGUMUMAN: Megaphone,
  GURU_BUAT_PENGUMUMAN: Megaphone,
  GURU_BUKA_LAPORAN: FileText,
  GURU_LOGIN: Key,
  GURU_LOGOUT: Key,
  GURU_BUKA_DASHBOARD: LayoutDashboard,
  GURU_REFRESH_DATA: Zap,
  
  // Siswa actions
  SISWA_DAFTAR_TASMI: Award,
  SISWA_LIHAT_PENILAIAN: BookOpen,
  SISWA_UBAH_PROFIL: UserCircle,

  // Ortu actions
  ORTU_BUKA_DASHBOARD: LayoutDashboard,
  ORTU_GANTI_ANAK: Zap,
  ORTU_LIHAT_PENGUMUMAN: Megaphone,
  ORTU_LIHAT_DETAIL_PENGUMUMAN: FileText,
  ORTU_LIHAT_NILAI_HAFALAN: Award,
  ORTU_LIHAT_LAPORAN: FileText,
  ORTU_LIHAT_PRESENSI: Calendar,
  ORTU_BUKA_PROFIL: UserCircle,
  ORTU_LOGIN: Key,
  ORTU_LOGOUT: Key,
  
  // Default
  lainnya: FileText,
};

// Map actions to colors
const ACTION_COLORS = {
  GURU_INPUT_PENILAIAN: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
  GURU_EDIT_PENILAIAN: { bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-200' },
  GURU_BUKA_KELAS: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  GURU_BUKA_TASMI: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
  GURU_BUKA_LAPORAN: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
  GURU_BUKA_PROFIL: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
  GURU_BUKA_DETAIL_SISWA: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-200' },
  GURU_REFRESH_DATA: { bg: 'bg-rose-100', text: 'text-rose-600', border: 'border-rose-200' },
  GURU_LOGIN: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  ORTU_LOGIN: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  ORTU_GANTI_ANAK: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  ORTU_LIHAT_NILAI_HAFALAN: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  ORTU_LIHAT_PENGUMUMAN: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  ORTU_LIHAT_DETAIL_PENGUMUMAN: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
  ORTU_LIHAT_LAPORAN: { bg: 'bg-sky-100', text: 'text-sky-600', border: 'border-sky-200' },
  SISWA_DAFTAR_TASMI: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200' },
  lainnya: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
};

function ActivityItem({ activity }) {
  const router = useRouter();
  // ✅ Real-time timeAgo: re-render every minute to update relative time
  const [, setTriggerUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTriggerUpdate(prev => prev + 1);
    }, 60000); // Update every 1 minute

    return () => clearInterval(interval);
  }, []);
  // Handle both old (type) and new (action) format
  const activityType = activity.action || activity.type || 'lainnya';
  const Icon = ACTION_ICONS[activityType] || ACTION_ICONS.lainnya;
  const colors = ACTION_COLORS[activityType] || ACTION_COLORS.lainnya;

  const relativeTime = formatTimeAgo(activity.createdAt);

  // Determine navigation
  const isDashboard = activity.title?.toLowerCase().includes('membuka dashboard');
  
  // Safe metadata parsing helper
  const getPathFromMetadata = (metadata) => {
    if (!metadata) return null;
    if (typeof metadata === 'object') return metadata.path;
    try {
      const parsed = JSON.parse(metadata);
      return parsed?.path;
    } catch (e) {
      return null;
    }
  };

  const targetUrl = activity.targetUrl || activity.metadata?.path || getPathFromMetadata(activity.metadata);
  const isNavigable = activity.isNavigable === true || (!!targetUrl && !isDashboard);

  const content = (
    <>
      <div className={`${colors.bg} ${colors.text} p-2 rounded-lg shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
          {activity.title}
        </p>
        {(activity.subtitle || activity.description) && (
          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
            {activity.subtitle || activity.description}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1" suppressHydrationWarning>
          {relativeTime}
        </p>
      </div>
      {isNavigable && (
        <div className="shrink-0 text-slate-400 self-center">
          <ChevronRight size={16} />
        </div>
      )}
    </>
  );

  if (isNavigable && targetUrl) {
    return (
      <button 
        onClick={() => router.push(targetUrl)}
        className="w-full flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/50 px-3 -mx-3 rounded-lg transition-all group"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-b-0 px-3 -mx-3 rounded-lg transition-colors">
      {content}
    </div>
  );
}

export default function ActivityList({ activities = [] }) {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // State to trigger re-filtering
  const [, setTrigger] = useState(0);
  
  // Filter activities: only show items from last 24 hours
  const filtered24h = activities
    .filter((activity) => {
      const createdAt = new Date(activity.createdAt).getTime();
      const now = Date.now();
      return (now - createdAt) <= ONE_DAY_MS;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort newest first
    .slice(0, 10); // Limit to 10 most recent
  
  // Auto-refresh: Re-filter every 1 minute to remove items that exceed 24h
  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger(prev => prev + 1);
    }, 60000); // Re-filter every 1 minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Empty state when no activities in last 24 hours
  if (filtered24h.length === 0) {
    return (
      <EmptyState
        title="Belum ada aktivitas dalam 24 jam terakhir"
        description="Aktivitas Anda dalam 24 jam terakhir akan muncul di sini."
        icon={<FileText size={28} />}
        className="py-6"
      />
    );
  }

  return (
    <div className="space-y-1">
      {filtered24h.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
