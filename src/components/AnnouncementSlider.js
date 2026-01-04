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
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md p-5 sm:p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!Array.isArray(announcements) || announcements.length === 0) {
    return (
      <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-full bg-amber-200 flex items-center justify-center">
            <Megaphone size={28} className="text-amber-600" />
          </div>
        </div>
        <p className="text-slate-600 font-medium text-sm">Belum ada pengumuman</p>
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
    <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-md p-5 sm:p-6">
      {/* Header with "Lihat Semua" button */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900">{currentConfig.title}</h3>
            <p className="text-xs text-amber-700">{currentConfig.subtitle}</p>
          </div>
        </div>
        <Link
          href={currentConfig.href}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors flex-shrink-0"
        >
          Lihat Semua
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Carousel Card Container - Overlay Arrows */}
      <div className="relative group">
        {/* Card Content - Full Width */}
        <div className="bg-white rounded-lg p-4 border border-amber-200 w-full">
          {/* Title & Badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-bold text-slate-900 text-sm leading-tight flex-1 line-clamp-2">
              {truncatedTitle}
            </h4>
            {newBadge && (
              <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-xs font-bold flex-shrink-0">
                BARU
              </span>
            )}
          </div>

          {/* Content Summary */}
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
            {truncatedContent}
          </p>

          {/* Footer: Date & CTA */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-500">📅 {publishDate}</p>
            <Link
              href={currentConfig.href}
              className="inline-flex items-center gap-0.5 px-2 py-1 rounded-md bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              Baca
              <ChevronRight size={12} />
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
