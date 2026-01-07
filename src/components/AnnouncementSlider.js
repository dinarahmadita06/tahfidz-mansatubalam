'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

/**
 * Reusable Announcement Slider Component
 * Used across all dashboards (Guru, Admin, Siswa, Orang Tua)
 * 
 * @param {Array} announcements - List of announcement objects
 * @param {Boolean} loading - Loading state
 * @param {String} variant - One of: 'guru', 'admin', 'siswa', 'orangtua'
 */
export default function AnnouncementSlider({ announcements = [], loading = false, variant = 'guru' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const maxItems = 5;

  // Configuration per variant
  const config = {
    guru: {
      title: 'Pengumuman Terbaru',
      subtitle: 'Informasi penting untuk Anda',
      href: '/guru/pengumuman',
    },
    admin: {
      title: 'Pengumuman Terbaru',
      subtitle: 'Informasi penting untuk Anda',
      href: '/admin/pengumuman',
    },
    siswa: {
      title: 'Pengumuman Terbaru',
      subtitle: 'Informasi untuk siswa',
      href: '/siswa/pengumuman',
    },
    orangtua: {
      title: 'Pengumuman Terbaru',
      subtitle: 'Informasi penting untuk orang tua',
      href: '/orangtua/pengumuman',
    },
  };

  const currentConfig = config[variant] || config.guru;

  if (loading) {
    return (
      <div className="rounded-2xl bg-amber-50/70 backdrop-blur-md border border-amber-200 shadow-md shadow-amber-500/10 p-3 lg:p-4">
        <div className="animate-pulse">
          <div className="h-3.5 bg-amber-200/50 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-amber-200/30 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(announcements) || announcements.length === 0) {
    return (
      <div className="rounded-2xl bg-amber-50/70 backdrop-blur-md border border-amber-200 shadow-md shadow-amber-500/10 p-4 lg:p-5 text-center">
        <div className="flex justify-center mb-2">
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm">
            <Megaphone size={22} className="text-amber-600" />
          </div>
        </div>
        <p className="text-amber-800 font-bold text-xs lg:text-sm">Belum ada pengumuman</p>
      </div>
    );
  }

  // Get max 5 announcements
  const displayedAnnouncements = announcements.slice(0, maxItems);
  const currentAnnouncement = displayedAnnouncements[currentIndex];

  // Helper: check if announcement is "new" (created in last 24 hours)
  const isNew = (createdAt) => {
    if (!createdAt) return false;
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  };

  // Format title (max 50 chars)
  const title = currentAnnouncement.judul?.trim() || '(Tanpa Judul)';
  const truncatedTitle = title.length > 50 ? title.substring(0, 50) + '...' : title;

  // Format content (max 100 chars for 2-3 lines)
  const contentSummary = currentAnnouncement.isi?.trim() || '-';
  const truncatedContent = contentSummary.length > 100
    ? contentSummary.substring(0, 100) + '...'
    : contentSummary;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const publishDate = formatDate(currentAnnouncement.createdAt);
  const newBadge = isNew(currentAnnouncement.createdAt);

  // Navigation handlers
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayedAnnouncements.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayedAnnouncements.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="rounded-2xl bg-amber-50/70 backdrop-blur-md border border-amber-200 shadow-md shadow-amber-500/10 p-3 lg:p-4 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300">
      {/* Header with "Lihat Semua" button */}
      <div className="flex items-start justify-between gap-3 lg:gap-4 mb-2.5 lg:mb-3">
        <div className="flex items-center gap-2.5 lg:gap-3">
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Megaphone className="text-amber-600 w-4 h-4 lg:w-[18px] lg:h-[18px]" />
          </div>
          <div>
            <h3 className="text-sm lg:text-base font-bold text-amber-900 leading-tight">{currentConfig.title}</h3>
            <p className="text-[10px] lg:text-xs text-amber-700 font-medium">{currentConfig.subtitle}</p>
          </div>
        </div>
        <Link
          href={currentConfig.href}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600 text-white text-[10px] lg:text-xs font-bold hover:bg-amber-700 shadow-sm transition-colors flex-shrink-0"
        >
          Lihat Semua
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Carousel Card Container - Overlay Arrows */}
      <div className="relative group">
        {/* Card Content - Full Width */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-amber-200/60 w-full shadow-sm">
          {/* Title & Badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight flex-1 line-clamp-2">
              {truncatedTitle}
            </h4>
            {newBadge && (
              <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-[10px] font-bold flex-shrink-0">
                BARU
              </span>
            )}
          </div>

          {/* Content Summary */}
          <p className="text-[10px] lg:text-xs text-slate-600 mb-2 line-clamp-2">
            {truncatedContent}
          </p>

          {/* Footer: Date & CTA */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] lg:text-xs text-slate-500">📅 {publishDate}</p>
            <Link
              href={currentConfig.href}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 lg:py-1 rounded-md bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-700 transition-colors"
            >
              Baca
              <ChevronRight size={10} />
            </Link>
          </div>
        </div>

        {/* Navigation Arrows - Overlay (Floating) */}
        {displayedAnnouncements.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={handlePrev}
              className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 rounded-full bg-amber-600/70 hover:bg-amber-600 text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Pengumuman sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            {/* Right Arrow */}
            <button
              onClick={handleNext}
              className="absolute -right-6 top-1/2 -translate-y-1/2 p-1 rounded-full bg-amber-600/70 hover:bg-amber-600 text-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
              aria-label="Pengumuman berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {/* Dot Indicators - Compact */}
      {displayedAnnouncements.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <div className="flex gap-1.5">
            {displayedAnnouncements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all ${
                  idx === currentIndex
                    ? 'bg-amber-600 w-2 h-2'
                    : 'bg-amber-300 w-1.5 h-1.5 hover:bg-amber-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-amber-700 font-medium ml-1">
            {currentIndex + 1}/{displayedAnnouncements.length}
          </span>
        </div>
      )}
    </div>
  );
}
