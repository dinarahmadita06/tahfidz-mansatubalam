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
      bg: 'bg-white/70 backdrop-blur-md',
      border: 'border-blue-200/60',
      badge: 'bg-blue-100/70 text-blue-700 border-blue-200/50',
      iconBg: 'bg-blue-100/60',
      iconText: 'text-blue-600',
      button: 'bg-blue-500/10 text-blue-700 border border-blue-300/40 hover:bg-blue-500/15',
      buttonSecondary: 'bg-blue-50/50 hover:bg-blue-100/70 text-blue-600',
      glow: 'shadow-lg shadow-blue-200/25',
      gradient: 'from-blue-500/15 to-white/0'
    },
    YOUTUBE: {
      bg: 'bg-white/70 backdrop-blur-md',
      border: 'border-rose-200/50',
      badge: 'bg-rose-100/70 text-rose-700 border-rose-200/50',
      iconBg: 'bg-rose-100/60',
      iconText: 'text-rose-600',
      button: 'bg-rose-500/10 text-rose-700 border border-rose-300/40 hover:bg-rose-500/15',
      buttonSecondary: 'bg-rose-50/50 hover:bg-rose-100/70 text-rose-600',
      glow: 'shadow-rose-500/5',
      gradient: 'from-rose-500/15 to-white/0'
    }
  };
  return variants[type] || variants.PDF;
}
