'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone,
  ChevronRight,
  ChevronLeft,
  FileText
} from 'lucide-react';
import PushNotificationManager from './shared/PushNotificationManager';

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
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);

  // Gunakan semua data yang diterima tanpa batasan hardcoded
  const displayedAnnouncements = announcements;
  const hasMultiple = displayedAnnouncements.length > 1;

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev === displayedAnnouncements.length - 1 ? 0 : prev + 1));
  }, [hasMultiple, displayedAnnouncements.length]);

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? displayedAnnouncements.length - 1 : prev - 1));
  }, [hasMultiple, displayedAnnouncements.length]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Autoplay: 5000ms interval
  useEffect(() => {
    if (!hasMultiple || isPaused) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [hasMultiple, isPaused, handleNext]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Reset index if data changes
  useEffect(() => {
    if (currentIndex >= displayedAnnouncements.length && displayedAnnouncements.length > 0) {
      setCurrentIndex(0);
    }
  }, [displayedAnnouncements.length, currentIndex]);

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

  const currentAnnouncement = displayedAnnouncements[currentIndex];

  // Helper: check if announcement is "new" (created in last 24 hours)
  const isNew = (createdAt) => {
    if (!createdAt) return false;
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = (now - created) / (1000 * 60 * 60);
    return diffHours < 24;
  };

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

  // Variants for Framer Motion slider
  const sliderVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }, { duration: 0.2 }),
  };

  return (
    <div 
      className="rounded-2xl bg-amber-50/70 backdrop-blur-md border border-amber-200 shadow-md shadow-amber-500/10 p-3 lg:p-4 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
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

      {/* Carousel Container */}
      <div className="relative group min-h-[110px] sm:min-h-[120px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={sliderVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              if (offset.x > 50) {
                handlePrev();
              } else if (offset.x < -50) {
                handleNext();
              }
            }}
            className="w-full"
          >
            {/* Slide Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 lg:p-4 border border-amber-200/60 w-full shadow-sm cursor-grab active:cursor-grabbing">
              {/* Title & Badge */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-bold text-slate-900 text-xs lg:text-sm leading-tight flex-1 line-clamp-2">
                  {currentAnnouncement.judul?.trim() || '(Tanpa Judul)'}
                </h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {currentAnnouncement.attachmentUrl && (
                    <span className="p-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100" title="Ada lampiran PDF">
                      <FileText size={10} />
                    </span>
                  )}
                  {isNew(currentAnnouncement.createdAt) && (
                    <span className="px-1.5 py-0.5 rounded-sm bg-red-100 text-red-700 text-[10px] font-bold">
                      BARU
                    </span>
                  )}
                </div>
              </div>

              {/* Content Summary */}
              <p className="text-[10px] lg:text-xs text-slate-600 mb-2 line-clamp-2">
                {currentAnnouncement.isi?.trim() || '-'}
              </p>

              {/* Footer: Date & CTA */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] lg:text-xs text-slate-500">📅 {formatDate(currentAnnouncement.createdAt)}</p>
                <Link
                  href={`${currentConfig.href}`}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 lg:py-1 rounded-md bg-amber-600 text-white text-[10px] font-semibold hover:bg-amber-700 transition-colors"
                >
                  Baca
                  <ChevronRight size={10} />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Only if Multiple */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-amber-200 text-amber-600 shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-amber-600 hover:text-white z-10 hidden sm:block"
              aria-label="Pengumuman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/90 border border-amber-200 text-amber-600 shadow-md transition-all opacity-0 group-hover:opacity-100 hover:bg-amber-600 hover:text-white z-10 hidden sm:block"
              aria-label="Pengumuman berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots - Only if Multiple */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="flex gap-1.5">
            {displayedAnnouncements.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'bg-amber-600 w-4 h-1.5'
                    : 'bg-amber-200 w-1.5 h-1.5 hover:bg-amber-300'
                }`}
                aria-label={`Ke slide ${idx + 1}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-amber-700 font-bold ml-1 tabular-nums">
            {currentIndex + 1}/{displayedAnnouncements.length}
          </span>
        </div>
      )}
    </div>
  );
}
