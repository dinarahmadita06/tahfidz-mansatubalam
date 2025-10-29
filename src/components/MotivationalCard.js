'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BookOpen, Heart } from 'lucide-react';

// Data kutipan motivasi Islami
const MOTIVATIONAL_QUOTES = [
  {
    text: 'Sebaik-baik kalian adalah yang mempelajari Al-Qur\'an dan mengajarkannya.',
    source: 'HR. Bukhari',
    icon: '📖'
  },
  {
    text: 'Bacalah Al-Qur\'an, karena ia akan datang memberi syafaat bagi pembacanya.',
    source: 'HR. Muslim',
    icon: '✨'
  },
  {
    text: 'Barangsiapa membaca satu huruf dari Al-Qur\'an, maka baginya satu kebaikan.',
    source: 'HR. Tirmidzi',
    icon: '🕊️'
  },
  {
    text: 'Dekatkan dirimu pada Al-Qur\'an, karena di dalamnya terdapat cahaya kehidupan.',
    source: 'Nasihat Ulama',
    icon: '💫'
  },
  {
    text: 'Hafalan yang dijaga dengan amal, akan melekat hingga akhir hayat.',
    source: 'Kata Bijak',
    icon: '🌟'
  },
  {
    text: 'Orang yang membaca Al-Qur\'an dan menghafalkannya, Allah akan memasukkannya ke surga.',
    source: 'HR. Tirmidzi',
    icon: '🌺'
  },
  {
    text: 'Al-Qur\'an adalah pedoman hidup yang sempurna, jadikanlah ia sahabat setiamu.',
    source: 'Kata Bijak',
    icon: '📚'
  },
  {
    text: 'Setiap huruf yang kamu hafal, adalah investasi untuk kehidupan abadi.',
    source: 'Nasihat Ulama',
    icon: '💎'
  },
];

/**
 * MotivationalCard - Komponen card motivasi dinamis dengan auto-rotate
 * @param {string} theme - Tema warna: 'amber', 'mint', 'sky', 'purple', 'emerald'
 * @param {string} className - Additional CSS classes
 */
export default function MotivationalCard({ theme = 'amber', className = '' }) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Pilih kutipan random saat pertama kali mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    setCurrentQuoteIndex(randomIndex);
  }, []);

  // Auto-rotate kutipan setiap 60 detik
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Ganti kutipan setelah fade out
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % MOTIVATIONAL_QUOTES.length);
        setIsVisible(true);
      }, 300);
    }, 60000); // 60 detik = 1 menit

    return () => clearInterval(interval);
  }, []);

  const currentQuote = MOTIVATIONAL_QUOTES[currentQuoteIndex];

  // Konfigurasi tema warna
  const themeConfig = {
    amber: {
      gradient: 'from-amber-100 via-amber-50 to-white',
      iconBg: 'bg-amber-200/50',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
      sourceColor: 'text-amber-700',
      border: 'border-amber-200/50',
    },
    mint: {
      gradient: 'from-emerald-100 via-emerald-50 to-white',
      iconBg: 'bg-emerald-200/50',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      sourceColor: 'text-emerald-700',
      border: 'border-emerald-200/50',
    },
    sky: {
      gradient: 'from-sky-100 via-sky-50 to-white',
      iconBg: 'bg-sky-200/50',
      iconColor: 'text-sky-600',
      textColor: 'text-sky-900',
      sourceColor: 'text-sky-700',
      border: 'border-sky-200/50',
    },
    purple: {
      gradient: 'from-purple-100 via-purple-50 to-white',
      iconBg: 'bg-purple-200/50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-900',
      sourceColor: 'text-purple-700',
      border: 'border-purple-200/50',
    },
    emerald: {
      gradient: 'from-emerald-100 via-teal-50 to-white',
      iconBg: 'bg-emerald-200/50',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900',
      sourceColor: 'text-emerald-700',
      border: 'border-emerald-200/50',
    },
  };

  const colors = themeConfig[theme] || themeConfig.amber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 shadow-md border ${colors.border} ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-4"
        >
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center text-2xl`}>
            {currentQuote.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className={`text-base md:text-lg italic leading-relaxed ${colors.textColor} mb-3 font-medium`}>
              "{currentQuote.text}"
            </p>
            <p className={`text-sm ${colors.sourceColor} font-semibold flex items-center gap-2`}>
              <span>— {currentQuote.source}</span>
            </p>
          </div>

          {/* Decorative Icon */}
          <div className="flex-shrink-0 hidden sm:block">
            <Sparkles className={`${colors.iconColor} opacity-30`} size={24} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator (subtle dots showing rotation) */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {MOTIVATIONAL_QUOTES.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentQuoteIndex
                ? `w-8 ${colors.iconBg}`
                : `w-1.5 bg-gray-300`
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
