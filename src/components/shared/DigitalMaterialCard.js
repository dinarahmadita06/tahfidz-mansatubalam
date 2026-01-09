import { Eye, Download, Trash2, Play } from 'lucide-react';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  getMaterialIcon, 
  getMaterialVariant 
} from '@/lib/utils/materialHelpers';

export default function DigitalMaterialCard({ 
  materi, 
  onOpen, 
  onDownload, 
  onDelete, 
  showActions = true,
  canDelete = false,
  showDownload = true
}) {
  const variant = getMaterialVariant(materi.jenisMateri);
  const isYouTube = materi.jenisMateri === 'YOUTUBE';
  const isPDF = materi.jenisMateri === 'PDF';
  
  const videoId = isYouTube ? extractYouTubeId(materi.youtubeUrl) : null;
  const thumbnail = isYouTube ? getYouTubeThumbnail(videoId) : null;

  return (
    <div className={`group relative rounded-2xl shadow-sm ${variant.bg} ${variant.border} border overflow-hidden hover:shadow-xl ${variant.glow} ${isPDF ? 'hover:border-blue-300/80' : ''} transition-all duration-300 flex flex-col h-full`}>
      {/* Background Gradient Tint */}
      <div className={`absolute inset-0 bg-gradient-to-br ${variant.gradient} pointer-events-none`} />
      
      {/* Material Type Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className={`px-2 py-1 ${variant.badge} text-[10px] font-bold rounded-lg border uppercase backdrop-blur-md`}>
          {materi.jenisMateri}
        </span>
      </div>
      
      {/* Thumbnail/Icon Area */}
      <div className="h-44 flex items-center justify-center bg-gray-100 relative overflow-hidden">
        {isYouTube ? (
          <div className="relative w-full h-full">
            {thumbnail ? (
              <>
                <img 
                  src={thumbnail}
                  alt={materi.judul}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = e.target.nextSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="fallback hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100">
                  <Play className="w-16 h-16 text-rose-300/50" />
                </div>
                {/* Play Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform group-hover:scale-110 transition-transform">
                    <Play className="w-7 h-7 text-white fill-white" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100">
                <Play className="w-16 h-16 text-rose-300/50" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 relative group-hover:bg-blue-200/20 transition-colors duration-300">
            {/* Pattern Overlay - Pure CSS Subtle Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none [background-image:linear-gradient(#3b82f6_1px,transparent_1px),linear-gradient(90deg,#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
            
            {/* Mock PDF Page */}
            <div className="relative w-28 h-36 bg-white rounded-lg shadow-xl border border-blue-100/50 p-3 transform group-hover:-translate-y-1.5 transition-transform duration-500 ease-out">
              {/* Fake Lines */}
              <div className="w-full h-2 bg-blue-50 rounded mb-2" />
              <div className="w-3/4 h-1 bg-gray-50 rounded mb-1.5" />
              <div className="w-full h-1 bg-gray-50 rounded mb-1.5" />
              <div className="w-5/6 h-1 bg-gray-50 rounded mb-1.5" />
              <div className="w-full h-1 bg-gray-50 rounded mb-4" />
              
              <div className="flex justify-center mt-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 shadow-inner">
                  {getMaterialIcon('PDF', 'w-6 h-6 text-blue-500')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Material Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className={`text-base font-bold text-gray-900 line-clamp-1 mb-1 group-hover:${variant.iconText} transition-colors`}>
            {materi.judul || 'Untitled'}
          </h3>

          <p className="text-sm text-gray-500 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
            {materi.deskripsi || 'Tidak ada deskripsi'}
          </p>
        </div>

        {/* Upload Date & Action */}
        <div className="mt-auto space-y-4">
          <div className="flex items-center justify-between">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               {new Date(materi.createdAt || materi.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
             </p>
             <div className={`${variant.iconBg} ${variant.iconText} p-1.5 rounded-lg border ${variant.border}`}>
               {getMaterialIcon(materi.jenisMateri, 'w-4 h-4')}
             </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onOpen(materi)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 ${variant.button}`}
              >
                <Eye size={18} />
                {isYouTube ? 'Buka Video' : 'Lihat'}
              </button>

              {isPDF && showDownload && (
                <button
                  onClick={() => onDownload(materi)}
                  className={`flex items-center justify-center px-4 py-2.5 ${variant.buttonSecondary} rounded-xl border ${variant.border} transition-all active:scale-95`}
                  title="Download PDF"
                >
                  <Download size={18} />
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => onDelete(materi.id)}
                  className="flex items-center justify-center px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-100 transition-all active:scale-95"
                  title="Hapus Materi"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
