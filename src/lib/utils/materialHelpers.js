import { Play, FileText } from 'lucide-react';

export function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getYouTubeThumbnail(videoId) {
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getMaterialIcon(jenisMateri, className = 'w-12 h-12') {
  switch (jenisMateri) {
    case 'YOUTUBE':
      return <Play className={className} />;
    default: // PDF
      return <FileText className={className} />;
  }
}

export function getMaterialVariant(type) {
  const variants = {
    PDF: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/70',
      badge: 'bg-emerald-100/70 text-emerald-700 border-emerald-200/50',
      iconBg: 'bg-emerald-100/60',
      iconText: 'text-emerald-600',
      button: 'bg-emerald-500/90 hover:bg-emerald-600',
      buttonSecondary: 'bg-emerald-100/70 hover:bg-emerald-200/80 text-emerald-700',
      glow: 'shadow-emerald-500/10'
    },
    YOUTUBE: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-200/70',
      badge: 'bg-rose-100/70 text-rose-700 border-rose-200/50',
      iconBg: 'bg-rose-100/60',
      iconText: 'text-rose-600',
      button: 'bg-rose-500/80 hover:bg-rose-500',
      buttonSecondary: 'bg-rose-100/70 hover:bg-rose-200/80 text-rose-700',
      glow: 'shadow-rose-500/10'
    }
  };
  return variants[type] || variants.PDF;
}
