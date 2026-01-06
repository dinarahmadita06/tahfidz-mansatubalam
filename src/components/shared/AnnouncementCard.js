import { Calendar, Bell, BookOpen, Award, Megaphone, ChevronRight } from 'lucide-react';

const CATEGORY_CONFIG = {
  UMUM: { 
    icon: Bell, 
    color: 'text-blue-600', 
    bubbleBg: 'bg-blue-100/70',
    badge: 'bg-blue-100/70 text-blue-700 border-blue-200/50' 
  },
  AKADEMIK: { 
    icon: BookOpen, 
    color: 'text-purple-600', 
    bubbleBg: 'bg-purple-100/70',
    badge: 'bg-purple-100/70 text-purple-700 border-purple-200/50' 
  },
  KEGIATAN: { 
    icon: Award, 
    color: 'text-amber-600', 
    bubbleBg: 'bg-amber-100/70',
    badge: 'bg-amber-100/70 text-amber-700 border-amber-200/50' 
  },
  PENTING: { 
    icon: Megaphone, 
    color: 'text-rose-600', 
    bubbleBg: 'bg-rose-100/70',
    badge: 'bg-rose-100/70 text-rose-700 border-rose-200/50' 
  },
};

export default function AnnouncementCard({ announcement, onClick }) {
  const categoryData = CATEGORY_CONFIG[announcement.kategori] || CATEGORY_CONFIG.UMUM;
  const CategoryIcon = categoryData.icon;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const truncateText = (text, length = 150) => {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  // Check if announcement is "New" (created within last 3 days)
  const isNew = new Date() - new Date(announcement.createdAt) < 3 * 24 * 60 * 60 * 1000;

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-emerald-50/60 backdrop-blur-sm rounded-2xl border border-emerald-200/70 ring-1 ring-emerald-200/60 shadow-[0_12px_30px_-18px_rgba(16,185,129,0.45)] hover:shadow-[0_15px_35px_-15px_rgba(16,185,129,0.55)] hover:-translate-y-[2px] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full`}
    >
      {/* Accent bar kiri */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-l-2xl"></div>

      <div className="p-6 pl-8 flex flex-col h-full">
        {/* Header: Icon + Title */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full ${categoryData.bubbleBg} ${categoryData.color} flex items-center justify-center flex-shrink-0 border border-white/50 shadow-sm transition-transform group-hover:scale-110 duration-300`}>
            <CategoryIcon size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${categoryData.badge}`}>
                {announcement.kategori}
              </span>
              {isNew && (
                <span className="px-2 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold border border-rose-400 shadow-sm animate-pulse">
                  BARU
                </span>
              )}
            </div>
            <h3 className="font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {announcement.judul}
            </h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
          {truncateText(announcement.isi)}
        </p>

        {/* Footer: Date + Action */}
        <div className="mt-auto pt-4 border-t border-emerald-100/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700/70">
            <Calendar size={14} />
            <span>{formatDate(announcement.createdAt)}</span>
            {announcement.tanggalSelesai && (
              <>
                <span className="opacity-30">•</span>
                <span className="text-gray-400">Hingga {formatDate(announcement.tanggalSelesai)}</span>
              </>
            )}
          </div>
          <div className="text-emerald-500 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
