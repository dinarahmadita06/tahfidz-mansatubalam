'use client';

import { X, Calendar, Paperclip, FileText, ExternalLink, Download, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

function PDFPreview({ announcement }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Use the proxy URL instead of direct blob URL to ensure correct headers
  const previewUrl = `/api/attachments/${announcement.id}`;

  useEffect(() => {
    setLoading(true);
    setError(false);
    
    // Safety timeout: if it takes > 10s, show fallback
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [announcement.id]);

  return (
    <div className="mt-6 rounded-2xl border border-emerald-100 overflow-hidden bg-white shadow-inner aspect-[3/4] sm:aspect-[16/10] relative group">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
          <p className="text-xs font-medium text-gray-500">Memuat preview...</p>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-500 mb-3" />
          <h4 className="text-sm font-bold text-gray-800 mb-1">Preview tidak tersedia</h4>
          <p className="text-xs text-gray-500 mb-4">
            Klik tombol "Buka" untuk melihat dokumen PDF secara lengkap.
          </p>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm active:scale-95"
          >
            Buka PDF
          </a>
        </div>
      ) : (
        <iframe
          src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title="PDF Preview"
          onLoad={() => setLoading(false)}
          onError={() => {
            setError(true);
            setLoading(false);
          }}
        />
      )}
      
      {/* Overlay info */}
      {!loading && !error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Tampilan Preview
        </div>
      )}
    </div>
  );
}

export default function AnnouncementDetailModal({ announcement, isOpen, onClose }) {
  if (!announcement) return null;

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white p-6 sm:p-8 flex-shrink-0">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="pr-10">
                <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-3">
                  {announcement.judul}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-white/90">
                  <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-lg">
                    <Calendar size={14} />
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                  {announcement.kategori && (
                    <span className="px-3 py-1 bg-white/20 rounded-lg font-bold uppercase tracking-wider text-[10px]">
                      {announcement.kategori}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
              {/* Description */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Isi Pengumuman</p>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base sm:text-lg">
                  {announcement.isi}
                </div>
              </div>

              {/* Attachment Section */}
              {announcement.attachmentUrl && (
                <div className="pt-8 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Lampiran Terlampir</p>
                  
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 sm:p-6 ring-1 ring-emerald-500/5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
                        <FileText size={28} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate mb-0.5">
                          {announcement.attachmentName || 'Lampiran Pengumuman'}
                        </p>
                        <p className="text-xs text-emerald-600 font-medium">
                          {announcement.attachmentSize 
                            ? `${(announcement.attachmentSize / (1024 * 1024)).toFixed(2)} MB • PDF Document` 
                            : 'File PDF'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={announcement.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-emerald-200 text-emerald-700 text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                        >
                          <ExternalLink size={18} />
                          Buka
                        </a>
                        <a
                          href={announcement.attachmentUrl}
                          download={announcement.attachmentName || 'lampiran.pdf'}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-95 shadow-emerald-600/20"
                        >
                          <Download size={18} />
                          Unduh
                        </a>
                      </div>
                    </div>

                    {/* PDF Preview Embed */}
                    <PDFPreview announcement={announcement} />
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-all active:scale-95"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
