'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Users } from 'lucide-react';

// Data kutipan motivasi parenting Islami
const PARENTING_QUOTES = [
  {
    text: 'Setiap anak dilahirkan dalam keadaan fitrah, maka kedua orang tuanyalah yang menjadikannya Yahudi, Nasrani, atau Majusi.',
    source: 'HR. Bukhari',
    icon: '👨‍👩‍👧‍👦'
  },
  {
    text: 'Muliakanlah anak-anakmu dan perbaikilah akhlak mereka, niscaya kalian akan diampuni.',
    source: 'HR. Ibnu Majah',
    icon: '💝'
  },
  {
    text: 'Ajarilah anak-anakmu Al-Qur\'an, karena orang yang mempelajari Al-Qur\'an akan mendapat mahkota cahaya.',
    source: 'Hadis',
    icon: '📖'
  },
  {
    text: 'Harta yang paling berharga adalah anak saleh yang mendoakan orang tuanya.',
    source: 'HR. Muslim',
    icon: '🤲'
  },
  {
    text: 'Apabila meninggal anak Adam, terputuslah amalnya kecuali tiga perkara: sedekah jariyah, ilmu yang bermanfaat, dan anak saleh yang mendoakannya.',
    source: 'HR. Muslim',
    icon: '🌟'
  },
  {
    text: 'Didiklah anakmu dengan mencintai Al-Qur\'an, karena pembaca Al-Qur\'an akan berkumpul bersama para Nabi di surga.',
    source: 'Nasihat Ulama',
    icon: '📚'
  },
  {
    text: 'Barangsiapa yang memiliki tiga anak perempuan, lalu mendidik mereka dengan baik, maka mereka akan menjadi penghalang baginya dari api neraka.',
    source: 'HR. Bukhari',
    icon: '🛡️'
  },
  {
    text: 'Dukungan orang tua adalah kunci keberhasilan anak dalam menghafal Al-Qur\'an.',
    source: 'Kata Bijak',
    icon: '🔑'
  },
];

/**
 * ParentingMotivationalCard - Komponen card motivasi parenting dinamis dengan auto-rotate
 * @param {string} theme - Tema warna: 'mint', 'cream', 'sky', 'lilac'
 * @param {string} className - Additional CSS classes
 */
export default function ParentingMotivationalCard({ theme = 'mint', className = '' }) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Pilih kutipan random saat pertama kali mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * PARENTING_QUOTES.length);
    setCurrentQuoteIndex(randomIndex);
  }, []);

  // Auto-rotate kutipan setiap 60 detik
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // Ganti kutipan setelah fade out
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % PARENTING_QUOTES.length);
        setIsVisible(true);
      }, 300);
    }, 60000); // 60 detik = 1 menit

    return () => clearInterval(interval);
  }, []);

  const currentQuote = PARENTING_QUOTES[currentQuoteIndex];

  // Konfigurasi tema warna (tone lebih lembut untuk orang tua)
  const themeConfig = {
    mint: {
      gradient: 'from-emerald-50 via-teal-50 to-white',
      iconBg: 'bg-emerald-100/70',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-800',
      sourceColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    cream: {
      gradient: 'from-amber-50 via-orange-50 to-white',
      iconBg: 'bg-amber-100/70',
      iconColor: 'text-amber-600',
      textColor: 'text-amber-800',
      sourceColor: 'text-amber-600',
      border: 'border-amber-100',
    },
    sky: {
      gradient: 'from-sky-50 via-blue-50 to-white',
      iconBg: 'bg-sky-100/70',
      iconColor: 'text-sky-600',
      textColor: 'text-sky-800',
      sourceColor: 'text-sky-600',
      border: 'border-sky-100',
    },
    lilac: {
      gradient: 'from-purple-50 via-violet-50 to-white',
      iconBg: 'bg-purple-100/70',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      sourceColor: 'text-purple-600',
      border: 'border-purple-100',
    },
  };

  const colors = themeConfig[theme] || themeConfig.mint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${colors.gradient} rounded-2xl p-6 shadow-sm border ${colors.border} ${className}`}
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
          <div className={`flex-shrink-0 w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
            {currentQuote.icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className={`text-base md:text-lg italic leading-relaxed ${colors.textColor} mb-3 font-medium`}>
              "{currentQuote.text}"
            </p>
            <p className={`text-sm ${colors.sourceColor} font-semibold flex items-center gap-2`}>
              <Heart size={14} className="inline" />
              <span>— {currentQuote.source}</span>
            </p>
          </div>

          {/* Decorative Icon */}
          <div className="flex-shrink-0 hidden sm:block">
            <Users className={`${colors.iconColor} opacity-20`} size={24} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator (subtle dots showing rotation) */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {PARENTING_QUOTES.map((_, index) => (
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
