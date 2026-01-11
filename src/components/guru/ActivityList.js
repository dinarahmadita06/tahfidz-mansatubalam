'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import EmptyState from '@/components/shared/EmptyState';
import {
  CheckCircle2,
  Volume2,
  BookOpen,
  Award,
  Upload,
  Megaphone,
  FileText,
} from 'lucide-react';

// Map new action names to icons
const ACTION_ICONS = {
  // Guru actions
  GURU_INPUT_PENILAIAN: BookOpen,
  GURU_EDIT_PENILAIAN: BookOpen,
  GURU_UBAH_PROFIL: FileText,
  GURU_UPLOAD_TTD: Upload,
  GURU_LIHAT_SISWA: Volume2,
  
  // Siswa actions
  SISWA_DAFTAR_TASMI: Award,
  SISWA_LIHAT_PENILAIAN: BookOpen,
  SISWA_UBAH_PROFIL: FileText,
  
  // Default
  lainnya: FileText,
};

// Map actions to colors
const ACTION_COLORS = {
  GURU_INPUT_PENILAIAN: {
    bg: 'bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  GURU_EDIT_PENILAIAN: {
    bg: 'bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  GURU_UBAH_PROFIL: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  GURU_UPLOAD_TTD: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  SISWA_DAFTAR_TASMI: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  SISWA_LIHAT_PENILAIAN: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  SISWA_UBAH_PROFIL: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  lainnya: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

function ActivityItem({ activity }) {
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

  const relativeTime = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: id,
  });

  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 px-3 -mx-3 rounded-lg transition-colors">
      <div className={`${colors.bg} ${colors.text} p-2 rounded-lg shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
          {activity.title}
        </p>
        {(activity.subtitle || activity.description) && (
          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
            {activity.subtitle || activity.description}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">{relativeTime}</p>
      </div>
    </div>
  );
}

export default function ActivityList({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        title="Belum ada aktivitas terbaru"
        description="Aktivitas Anda akan muncul di sini setelah melakukan pengisian data."
        icon={<FileText size={28} />}
        className="py-6"
      />
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
