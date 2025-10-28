'use client';

import { useState, useEffect, useRef } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BookOpen,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Moon,
  Sun,
  Bookmark,
  Search,
  ChevronDown,
  Sparkles,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';

// Sample Surah List (abbreviated)
const SURAH_LIST = [
  { number: 1, name: 'Al-Fatihah', arabic: 'الفاتحة', verses: 7, type: 'Makkiyah' },
  { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286, type: 'Madaniyah' },
  { number: 18, name: 'Al-Kahf', arabic: 'الكهف', verses: 110, type: 'Makkiyah' },
  { number: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83, type: 'Makkiyah' },
  { number: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30, type: 'Makkiyah' },
  { number: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4, type: 'Makkiyah' },
  { number: 113, name: 'Al-Falaq', arabic: 'الفلق', verses: 5, type: 'Makkiyah' },
  { number: 114, name: 'An-Nas', arabic: 'الناس', verses: 6, type: 'Makkiyah' },
];

// Sample verses for Al-Fatihah
const SAMPLE_VERSES = {
  1: [
    {
      number: 1,
      arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      transliteration: 'Bismillāhir-Raḥmānir-Raḥīm',
      translation: 'Dengan nama Allah Yang Maha Pengasih, Maha Penyayang',
    },
    {
      number: 2,
      arabic: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
      transliteration: 'Alḥamdu lillāhi rabbil-'ālamīn',
      translation: 'Segala puji bagi Allah, Tuhan seluruh alam',
    },
    {
      number: 3,
      arabic: 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
      transliteration: 'Ar-Raḥmānir-Raḥīm',
      translation: 'Yang Maha Pengasih, Maha Penyayang',
    },
    {
      number: 4,
      arabic: 'مَٰلِكِ يَوْمِ ٱلدِّينِ',
      transliteration: 'Māliki yawmid-dīn',
      translation: 'Pemilik hari pembalasan',
    },
    {
      number: 5,
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'Iyyāka na'budu wa iyyāka nasta'īn',
      translation: 'Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami mohon pertolongan',
    },
    {
      number: 6,
      arabic: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
      transliteration: 'Ihdinaṣ-ṣirāṭal-mustaqīm',
      translation: 'Tunjukilah kami jalan yang lurus',
    },
    {
      number: 7,
      arabic: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
      transliteration: 'Ṣirāṭallażīna an'amta 'alayhim ghayril-maghḍụ̄bi 'alayhim wa laḍ-ḍāllīn',
      translation: '(Yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat',
    },
  ],
};

export default function ReferensiQuranPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState(SURAH_LIST[0]);
  const [verses, setVerses] = useState(SAMPLE_VERSES[1]);
  const [activeVerse, setActiveVerse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSurahList, setShowSurahList] = useState(false);
  const [searchSurah, setSearchSurah] = useState('');
  const [lastRead, setLastRead] = useState(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load last read from localStorage
    const saved = localStorage.getItem('last_read_quran');
    if (saved) {
      try {
        setLastRead(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading last read:', e);
      }
    }
  }, []);

  const handleSurahSelect = (surah) => {
    setSelectedSurah(surah);
    setShowSurahList(false);
    setSearchSurah('');

    // Load verses for selected surah (using sample data for now)
    if (surah.number === 1) {
      setVerses(SAMPLE_VERSES[1]);
    } else {
      // For other surahs, show placeholder
      setVerses([]);
    }

    setActiveVerse(null);
    setIsPlaying(false);
  };

  const handleVerseClick = (verse) => {
    setActiveVerse(verse.number);
    // In production, this would play actual audio
    toast.success(`Memutar ayat ${verse.number}`, {
      icon: '🔊',
    });
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && activeVerse === null && verses.length > 0) {
      setActiveVerse(1);
    }
  };

  const handlePrevVerse = () => {
    if (activeVerse && activeVerse > 1) {
      setActiveVerse(activeVerse - 1);
      toast.success(`Ayat ${activeVerse - 1}`);
    }
  };

  const handleNextVerse = () => {
    if (activeVerse && activeVerse < verses.length) {
      setActiveVerse(activeVerse + 1);
      toast.success(`Ayat ${activeVerse + 1}`);
    }
  };

  const handleBookmark = () => {
    const bookmark = {
      surah: selectedSurah.name,
      surahNumber: selectedSurah.number,
      verse: activeVerse || 1,
      date: new Date().toISOString(),
    };
    localStorage.setItem('last_read_quran', JSON.stringify(bookmark));
    setLastRead(bookmark);
    toast.success('Ayat terakhir berhasil ditandai!', {
      icon: '📖',
      style: {
        borderRadius: '12px',
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const filteredSurahs = SURAH_LIST.filter(surah =>
    surah.name.toLowerCase().includes(searchSurah.toLowerCase()) ||
    surah.number.toString().includes(searchSurah)
  );

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900'
          : 'bg-gradient-to-br from-emerald-50/30 via-white to-amber-50/30'
      }`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className={`rounded-3xl p-6 shadow-lg ${
            darkMode
              ? 'bg-gradient-to-br from-emerald-800 to-teal-900'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <BookOpen className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Referensi Al-Qur'an
                  </h1>
                  <p className="text-emerald-100 flex items-center gap-2">
                    <Sparkles size={16} />
                    Baca dan dengarkan ayat suci Al-Qur'an
                  </p>
                </div>
              </div>

              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-colors"
              >
                {darkMode ? (
                  <Sun className="text-amber-300" size={24} />
                ) : (
                  <Moon className="text-white" size={24} />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Surah Selector & Last Read */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Surah Dropdown */}
          <div className="lg:col-span-2">
            <div className="relative">
              <button
                onClick={() => setShowSurahList(!showSurahList)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl shadow-lg transition-all ${
                  darkMode
                    ? 'bg-gray-800 text-white border-2 border-emerald-700 hover:border-emerald-500'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    darkMode ? 'bg-emerald-700' : 'bg-emerald-100'
                  }`}>
                    <BookOpen className={darkMode ? 'text-emerald-300' : 'text-emerald-600'} size={20} />
                  </div>
                  <div className="text-left">
                    <p className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSurah.number}. {selectedSurah.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {selectedSurah.arabic} • {selectedSurah.verses} ayat
                    </p>
                  </div>
                </div>
                <ChevronDown
                  className={`transition-transform ${showSurahList ? 'rotate-180' : ''} ${
                    darkMode ? 'text-emerald-400' : 'text-gray-500'
                  }`}
                  size={24}
                />
              </button>

              {/* Surah List Dropdown */}
              <AnimatePresence>
                {showSurahList && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute z-20 w-full mt-2 rounded-2xl shadow-2xl overflow-hidden ${
                      darkMode ? 'bg-gray-800 border-2 border-emerald-700' : 'bg-white border-2 border-gray-200'
                    }`}
                  >
                    {/* Search */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} size={18} />
                        <input
                          type="text"
                          placeholder="Cari surah..."
                          value={searchSurah}
                          onChange={(e) => setSearchSurah(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2 rounded-xl outline-none transition-colors ${
                            darkMode
                              ? 'bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600'
                              : 'bg-gray-100 text-gray-900 placeholder-gray-500 focus:bg-gray-50'
                          }`}
                        />
                      </div>
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                      {filteredSurahs.map((surah) => (
                        <button
                          key={surah.number}
                          onClick={() => handleSurahSelect(surah)}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            selectedSurah.number === surah.number
                              ? darkMode
                                ? 'bg-emerald-700 text-white'
                                : 'bg-emerald-50 text-emerald-900'
                              : darkMode
                                ? 'hover:bg-gray-700 text-gray-200'
                                : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                {surah.number}. {surah.name}
                              </p>
                              <p className={`text-sm ${
                                selectedSurah.number === surah.number
                                  ? darkMode ? 'text-emerald-200' : 'text-emerald-700'
                                  : darkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                                {surah.verses} ayat • {surah.type}
                              </p>
                            </div>
                            <p className={`text-xl ${
                              darkMode ? 'text-emerald-300' : 'text-emerald-600'
                            }`}>
                              {surah.arabic}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Last Read Card */}
          {lastRead && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-4 rounded-2xl shadow-lg ${
                darkMode
                  ? 'bg-gradient-to-br from-amber-800 to-orange-900'
                  : 'bg-gradient-to-br from-amber-400 to-orange-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Bookmark className="text-white" size={18} />
                <p className="text-sm font-semibold text-white">Terakhir Dibaca:</p>
              </div>
              <p className="text-white font-bold text-lg">
                {lastRead.surah}
              </p>
              <p className="text-white/80 text-sm">
                Ayat {lastRead.verse}
              </p>
            </motion.div>
          )}
        </div>

        {/* Display Options */}
        <div className={`p-4 rounded-2xl shadow-lg mb-6 flex items-center justify-between flex-wrap gap-4 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTransliteration}
                onChange={(e) => setShowTransliteration(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Transliterasi
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                className="w-5 h-5 rounded accent-emerald-500"
              />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Terjemahan
              </span>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBookmark}
            disabled={!activeVerse}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              activeVerse
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : darkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Bookmark size={18} />
            <span className="text-sm">Tandai Ayat</span>
          </motion.button>
        </div>

        {/* Verses Display */}
        <div className={`rounded-3xl shadow-xl p-8 mb-6 ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {verses.length > 0 ? (
            <div className="space-y-6">
              {verses.map((verse, index) => (
                <motion.div
                  key={verse.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleVerseClick(verse)}
                  className={`p-6 rounded-2xl transition-all cursor-pointer ${
                    activeVerse === verse.number
                      ? darkMode
                        ? 'bg-emerald-900/50 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20'
                        : 'bg-emerald-50 border-2 border-emerald-400 shadow-lg'
                      : darkMode
                        ? 'hover:bg-gray-700 border-2 border-transparent'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  {/* Verse Number */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      activeVerse === verse.number
                        ? 'bg-emerald-500 text-white'
                        : darkMode
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <span className="font-bold">{verse.number}</span>
                    </div>
                    {activeVerse === verse.number && (
                      <div className="flex items-center gap-2 text-emerald-500">
                        <Volume2 size={20} className="animate-pulse" />
                        <span className="text-sm font-semibold">Sedang Diputar</span>
                      </div>
                    )}
                  </div>

                  {/* Arabic Text */}
                  <p className={`text-right text-3xl leading-loose mb-4 ${
                    darkMode ? 'text-emerald-100' : 'text-gray-900'
                  }`} style={{ fontFamily: 'Amiri, serif' }}>
                    {verse.arabic}
                  </p>

                  {/* Transliteration */}
                  {showTransliteration && (
                    <p className={`text-sm italic mb-2 ${
                      darkMode ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      {verse.transliteration}
                    </p>
                  )}

                  {/* Translation */}
                  {showTranslation && (
                    <p className={`text-base leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {verse.translation}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Info className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={40} />
              </div>
              <p className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Ayat belum tersedia
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Pilih Al-Fatihah untuk melihat contoh tampilan
              </p>
            </div>
          )}
        </div>

        {/* Audio Player */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`sticky bottom-6 rounded-2xl shadow-2xl p-6 ${
            darkMode
              ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600'
          }`}
        >
          <div className="flex items-center justify-between gap-6">
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg truncate">
                {selectedSurah.name}
              </p>
              <p className="text-emerald-100 text-sm">
                {activeVerse ? `Ayat ${activeVerse}` : 'Pilih ayat untuk diputar'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevVerse}
                disabled={!activeVerse || activeVerse === 1}
                className={`p-3 rounded-xl transition-colors ${
                  activeVerse && activeVerse > 1
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                <SkipBack size={24} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlayPause}
                className="p-4 bg-white text-emerald-600 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextVerse}
                disabled={!activeVerse || activeVerse === verses.length}
                className={`p-3 rounded-xl transition-colors ${
                  activeVerse && activeVerse < verses.length
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
              >
                <SkipForward size={24} />
              </motion.button>
            </div>

            {/* Volume */}
            <div className="hidden md:flex items-center gap-3">
              <Volume2 className="text-white" size={24} />
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="75"
                className="w-24 accent-white"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
      `}</style>
    </SiswaLayout>
  );
}
