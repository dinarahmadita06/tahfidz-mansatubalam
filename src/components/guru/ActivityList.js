'use client';

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  CheckCircle2,
  Volume2,
  BookOpen,
  Award,
  Upload,
  Megaphone,
  FileText,
} from 'lucide-react';

const ACTIVITY_ICONS = {
  presensi: CheckCircle2,
  penilaian_tahsin: Volume2,
  penilaian_hafalan: BookOpen,
  penilaian_tasmi: Award,
  upload_materi: Upload,
  pengumuman: Megaphone,
  lainnya: FileText,
};

const ACTIVITY_COLORS = {
  presensi: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  penilaian_tahsin: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  penilaian_hafalan: {
    bg: 'bg-violet-100',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  penilaian_tasmi: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  upload_materi: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
  pengumuman: {
    bg: 'bg-rose-100',
    text: 'text-rose-600',
    border: 'border-rose-200',
  },
  lainnya: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
};

function ActivityItem({ activity }) {
  const Icon = ACTIVITY_ICONS[activity.type] || FileText;
  const colors = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.lainnya;

  const relativeTime = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: id,
  });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 px-3 -mx-3 rounded-lg transition-colors">
      <div className={`${colors.bg} ${colors.text} p-2 rounded-lg shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 line-clamp-1">
          {activity.title}
        </p>
        {activity.subtitle && (
          <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
            {activity.subtitle}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">{relativeTime}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileText size={32} className="text-slate-400" />
      </div>
      <p className="text-slate-600 font-medium">Belum ada aktivitas</p>
      <p className="text-sm text-slate-500 mt-1">
        Aktivitas Anda akan muncul di sini
      </p>
    </div>
  );
}

export default function ActivityList({ activities = [] }) {
  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
