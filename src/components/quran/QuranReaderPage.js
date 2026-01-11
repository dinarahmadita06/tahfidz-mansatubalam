'use client';

import { useState, useEffect, useRef } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BookOpen,
  Play,
  Pause,
  Volume2,
  Bookmark,
  Search,
  PlayCircle,
  ChevronDown,
  Check,
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import toast, { Toaster } from 'react-hot-toast';
import JumpToAyahModal from '@/components/JumpToAyahModal';

// Tajweed parser utility
const parseTajweedText = (tajweedText) => {
  if (!tajweedText) return null;

  // Parse [h:number[text] format to HTML
  const parsed = tajweedText.replace(/\[([a-z_]+):(\d+)\[([^\]]+)\]/g, (match, rule, id, text) => {
    return `<tajweed class="${rule}" data-id="${id}">${text}</tajweed>`;
  });

  return parsed;
};

// Helper to convert API revelation type to Indonesian
const getRevelationTypeIndonesian = (revelationType) => {
  if (!revelationType) return 'Makkiyah';
  const type = revelationType.toLowerCase();
  if (type === 'mecca' || type === 'makkah' || type === 'meccan') return 'Makkiyah';
  if (type === 'medina' || type === 'madinah' || type === 'medinan') return 'Madaniyah';
  return 'Makkiyah'; // default
};

// Helper to pad numbers to 3 digits for audio URLs
const pad3 = (n) => String(n).padStart(3, '0');

// Helper to clean translation text from footnotes and embedded numbers
const cleanTranslation = (text) => {
  if (!text) return '';

  return text
    // Remove footnote markers like >>1, >>2, >>123
    .replace(/>>\d+/g, '')
    // Remove numbers embedded in words (e.g., "Tuhan3" -> "Tuhan", "bagi1" -> "bagi")
    // Match: letter followed by digit(s), capture the letter, remove the digit(s)
    .replace(/([a-zA-Z])\d+/g, '$1')
    // Remove any remaining double spaces
    .replace(/\s{2,}/g, ' ')
    // Trim whitespace
    .trim();
};

export default function QuranReaderPage({ role = 'siswa', noLayout = false }) {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [expandedSurahMobile, setExpandedSurahMobile] = useState(null); // For mobile accordion
  const [surahData, setSurahData] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRead, setLastRead] = useState(null);
  const [targetAyah, setTargetAyah] = useState(null);
  const [showTajwid, setShowTajwid] = useState(false);

  // Global singleton audio player state
  const [currentPlayingId, setCurrentPlayingId] = useState(null); // Format: "surah-ayah"
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Track if audio is actually playing
  const [audioLoading, setAudioLoading] = useState(false); // Track audio loading state
  const lastTapRef = useRef(0);

  // Singleton audio player ref (created once, never recreated)
  const audioRef = useRef(null);

  // Jump to ayah modal state
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Ref for verses scroll container
  const versesContainerRef = useRef(null);

  // Ref for auto-scrolling to verses panel
  const versesPanelRef = useRef(null);
  const expandedSurahRef = useRef(null);

  // Ref map for ayahs (for jump functionality)
  const ayahRefs = useRef({});

  // Initialize singleton audio player on mount
  useEffect(() => {
    // Create audio element once
    const audio = new Audio();
    audio.preload = 'auto';
    audioRef.current = audio;

    console.log('🎵 Audio player initialized (singleton)');

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
        console.log('🎵 Audio player cleaned up');
      }
    };
  }, []);

  // Fetch surahs on mount
  useEffect(() => {
    fetchSurahs();

    // Load last read from localStorage based on role
    const saved = localStorage.getItem(`last_read_quran_${role}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLastRead(parsed);
      } catch (e) {
        console.error('Error loading last read:', e);
      }
    }
  }, [role]);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs');
      if (!response.ok) throw new Error('Failed to fetch surahs');

      const data = await response.json();
      console.log('Surahs fetched:', data.length);

      if (Array.isArray(data)) {
        setSurahs(data);

        // Auto-select first surah for desktop (only for student role to maintain existing behavior)
        if (data.length > 0 && role === 'siswa') {
          const initialSurah = data[0];
          fetchSurahData(initialSurah.number);
        }
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
      toast.error('Gagal memuat daftar surah');
    }
  };

  // Effect to handle automatic scrolling when verses are loaded
  useEffect(() => {
    if (verses.length > 0 && targetAyah) {
      // Delay to ensure DOM elements are fully rendered
      const timer = setTimeout(() => {
        const success = scrollToAyah(targetAyah);
        if (success) {
          setTargetAyah(null); // Clear target after successful scroll
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [verses, targetAyah]);

  const fetchSurahData = async (surahNumber, isMobileAccordion = false, initialAyah = null) => {
    setLoading(true);
    if (initialAyah) setTargetAyah(initialAyah);

    try {
      const response = await fetch(`/api/quran/surah/${surahNumber}`);
      if (!response.ok) throw new Error('Failed to fetch surah');

      const data = await response.json();

      if (!data || !data.ayahs || !Array.isArray(data.ayahs)) {
        throw new Error('Invalid surah data format');
      }

      setSurahData(data);
      setVerses(data.ayahs || []);
      setSelectedSurah(surahNumber);

      // Stop any playing audio when changing surah (using singleton)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      }
      setCurrentPlayingId(null);
      setIsAudioPlaying(false);
      setAudioLoading(false);

      // Auto-scroll for desktop only
      if (!isMobileAccordion) {
        setTimeout(() => {
          if (versesPanelRef.current) {
            versesPanelRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      } else {
        // For mobile accordion, scroll to the expanded surah card
        setTimeout(() => {
          if (expandedSurahRef.current) {
            expandedSurahRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            });
          }
        }, 300);
      }

    } catch (error) {
      console.error('Error fetching surah data:', error);
      toast.error('Gagal memuat data surah');
    } finally {
      setLoading(false);
    }
  };

  // Handle mobile accordion toggle
  const handleMobileSurahClick = (surahNumber) => {
    if (expandedSurahMobile === surahNumber) {
      // Collapse if already expanded
      setExpandedSurahMobile(null);
      setSurahData(null);
      setVerses([]);
    } else {
      // Expand new surah (auto-collapse previous)
      setExpandedSurahMobile(surahNumber);
      fetchSurahData(surahNumber, true);
    }
  };

  const playAudio = async (ayahNo) => {
    try {
      console.log('🎵 playAudio called with ayahNo:', ayahNo);

      // Validation: ensure all required data exists
      if (!selectedSurah || !ayahNo) {
        console.error('❌ Invalid data:', { selectedSurah, ayahNo });
        toast.error('Data audio tidak valid');
        return;
      }

      if (!audioRef.current) {
        console.error('❌ Audio player not initialized');
        toast.error('Audio player belum siap');
        return;
      }

      const surahNo = selectedSurah;

      // Additional validation: ensure numbers are valid
      if (typeof surahNo !== 'number' || typeof ayahNo !== 'number') {
        console.error('❌ Invalid number types:', { surahNo, ayahNo });
        toast.error('Nomor surah atau ayat tidak valid');
        return;
      }

      // Ensure numbers are positive
      if (surahNo <= 0 || ayahNo <= 0) {
        console.error('❌ Invalid number values:', { surahNo, ayahNo });
        toast.error('Nomor surah atau ayat tidak valid');
        return;
      }

      const playingId = `${surahNo}-${ayahNo}`;
      const audio = audioRef.current;

      // Case 1: Clicking the same ayat - toggle play/pause
      if (currentPlayingId === playingId) {
        if (audio.paused) {
          console.log('▶️ Resume audio');
          setAudioLoading(true);
          try {
            await audio.play();
            setIsAudioPlaying(true);
            setAudioLoading(false);
            toast.success('Audio dilanjutkan', { icon: '▶️' });
          } catch (err) {
            console.error('❌ Resume error:', err);
            setAudioLoading(false);
            // Don't show toast for AbortError (user clicked again quickly)
            if (err.name !== 'AbortError') {
              toast.error('Gagal melanjutkan audio');
            }
          }
        } else {
          console.log('⏸️ Pause audio');
          audio.pause();
          setIsAudioPlaying(false);
          toast.success('Audio dijeda', { icon: '⏸️' });
        }
        return;
      }

      // Case 2: Different ayat - stop previous and play new
      console.log('🧹 Stopping previous audio and loading new');
      audio.pause();
      audio.currentTime = 0;

      // Clear previous state
      setCurrentPlayingId(null);
      setIsAudioPlaying(false);
      setAudioLoading(true);

      // Build audio ID with proper 6-digit format
      const audioId = `${pad3(surahNo)}${pad3(ayahNo)}`;

      // Audio sources to try
      const audioSources = [
        `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${audioId}.mp3`,
        `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${audioId}.mp3`,
      ];

      console.log('🎵 Audio ID:', audioId);

      // Try each source sequentially
      let playSuccess = false;
      for (let i = 0; i < audioSources.length; i++) {
        const audioUrl = audioSources[i];
        console.log(`🎵 Trying source ${i + 1}/${audioSources.length}:`, audioUrl);

        audio.src = audioUrl;

        try {
          // Attempt to play
          await audio.play();

          // Success!
          playSuccess = true;
          setCurrentPlayingId(playingId);
          setIsAudioPlaying(true);
          setAudioLoading(false);
          console.log('✅ Playing successfully!');
          toast.success(`Memutar ayat ${ayahNo}`, { icon: '🔊' });
          break;

        } catch (err) {
          console.error(`❌ Source ${i + 1} failed:`, err.name, err.message);

          // If this is the last source, show error (unless it's AbortError)
          if (i === audioSources.length - 1) {
            setAudioLoading(false);
            setCurrentPlayingId(null);
            setIsAudioPlaying(false);

            // Only show toast for real errors, not AbortError
            if (err.name !== 'AbortError') {
              toast.error('Audio tidak tersedia untuk ayat ini');
            }
          }
          // Otherwise, continue to next source
        }
      }

      // Setup event listeners (only once, not on every play)
      if (!audio.hasAttribute('data-listeners-attached')) {
        audio.setAttribute('data-listeners-attached', 'true');

        audio.addEventListener('ended', () => {
          console.log('⏹️ Playback ended');
          setCurrentPlayingId(null);
          setIsAudioPlaying(false);
        });

        audio.addEventListener('error', (e) => {
          const errorCode = audio.error?.code;
          console.error('❌ Audio error:', errorCode);

          // Only show error toast for real errors (not ABORTED)
          if (errorCode !== 1) { // 1 = MEDIA_ERR_ABORTED
            setAudioLoading(false);
            setIsAudioPlaying(false);

            if (errorCode === 4) { // MEDIA_ERR_SRC_NOT_SUPPORTED
              console.error('Format not supported');
            } else if (errorCode === 2) { // MEDIA_ERR_NETWORK
              console.error('Network error');
            }
          }
        });
      }

    } catch (error) {
      console.error('❌ Error in playAudio:', error);
      setAudioLoading(false);
      setIsAudioPlaying(false);
      // Don't show toast for AbortError
      if (error.name !== 'AbortError') {
        toast.error('Terjadi kesalahan saat memutar audio');
      }
    }
  };

  const handleBookmark = () => {
    if (!selectedSurah || !surahData) return;

    // Get current playing ayah or fallback to first ayah of the loaded surah
    let ayahNo = 1;
    if (currentPlayingId && currentPlayingId.startsWith(`${selectedSurah}-`)) {
      const parts = currentPlayingId.split('-');
      ayahNo = parseInt(parts[1]);
    } else if (verses && verses.length > 0) {
      // If no audio playing, but verses are loaded, use the first one's number
      ayahNo = verses[0]?.numberInSurah || 1;
    }

    saveLastRead(selectedSurah, surahData.englishName, ayahNo);
  };

  /**
   * Standardized function to save last read progress
   * Structure: { surahId, surahName, ayatNumber, updatedAt }
   */
  const saveLastRead = (surahId, surahName, ayatNumber) => {
    // Validation
    const parsedAyat = parseInt(ayatNumber);
    if (!ayatNumber || isNaN(parsedAyat)) {
      toast.error('Nomor ayat tidak ditemukan', {
        icon: '⚠️',
        style: { borderRadius: '12px' }
      });
      return;
    }

    const bookmark = {
      surahId: parseInt(surahId),
      surahName: surahName || 'Unknown',
      ayatNumber: parsedAyat,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage based on role
    localStorage.setItem(`last_read_quran_${role}`, JSON.stringify(bookmark));
    setLastRead(bookmark);

    // Toast with safe fallbacks
    const displaySurah = bookmark.surahName || '-';
    const displayAyat = bookmark.ayatNumber || '-';

    toast.success(`Terakhir dibaca disimpan: ${displaySurah} – Ayat ${displayAyat}`, {
      icon: '🔖',
      style: {
        borderRadius: '12px',
        background: '#059669',
        color: '#fff',
      },
      duration: 2000,
    });
  };

  // Handle jump to last read position
  const handleJumpToLastRead = () => {
    if (!lastRead) return;
    
    const surahId = lastRead.surahId || lastRead.surahNumber;
    const ayatNo = lastRead.ayatNumber || lastRead.verse;

    if (selectedSurah === surahId) {
      scrollToAyah(ayatNo);
    } else {
      // If mobile, expand the accordion first
      if (window.innerWidth < 1024) {
        setExpandedSurahMobile(surahId);
      }
      fetchSurahData(surahId, window.innerWidth < 1024, ayatNo);
    }
  };

  // Double tap/click handler for verses
  const handleVerseInteraction = (verse, explicitNumber) => {
    if (!surahData) return;
    // Use explicit number from map loop if available, fallback to verse object, then fallback to 1
    const ayahNo = explicitNumber || verse?.numberInSurah || 1;
    saveLastRead(selectedSurah, surahData.englishName, ayahNo);
  };

  const handleVerseClick = (verse, explicitNumber) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      handleVerseInteraction(verse, explicitNumber);
    }
    lastTapRef.current = now;
  };

  // Utility function for smooth scroll to ayah - Works on mobile & desktop with nested scroll container
  const scrollToAyah = (ayahNumber) => {
    const container = versesContainerRef.current;
    const target = document.getElementById(`ayat-${ayahNumber}`);
    
    if (container && target) {
      // Calculate position relative to container
      const topPosition = target.offsetTop - container.offsetTop;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        container.scrollTo({
          top: topPosition - 12,
          behavior: 'smooth'
        });
      });
      
      // Highlight briefly with ring effect
      target.classList.add('ring-4', 'ring-emerald-400', 'ring-offset-2');
      setTimeout(() => {
        target.classList.remove('ring-4', 'ring-emerald-400', 'ring-offset-2');
      }, 2000);
      return true;
    }
    return false;
  };

  // Handle jump to ayah from modal
  const handleJumpToAyah = (ayahNumber) => {
    const success = scrollToAyah(ayahNumber);
    if (success) {
      toast.success(`Pindah ke ayat ${ayahNumber}`, { icon: '📍' });
    } else {
      toast.error('Ayat tidak ditemukan');
    }
  };

  const filteredSurahs = surahs.filter(surah =>
    surah.transliteration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.number.toString().includes(searchTerm)
  );

  // Determine layout based on role
  const Layout = noLayout ? ({ children }) => <>{children}</> : (role === 'guru' ? GuruLayout : SiswaLayout);

  return (
    <Layout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full space-y-6">

          {/* Header - SIMTAQ Green Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <BookOpen size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Al-Qur'an Digital</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Baca, dengarkan, dan pahami ayat suci Al-Qur'an dengan mudah
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
              <input
                type="text"
                placeholder="Cari surah..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none bg-white shadow-sm transition-all"
              />
            </div>
          </div>

          {/* MOBILE VIEW: Accordion Style */}
          <div className="lg:hidden space-y-3">
            {filteredSurahs.length === 0 ? (
              <div className="text-center py-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60">
                <p className="text-gray-500">
                  {surahs.length === 0 ? 'Memuat daftar surah...' : 'Surah tidak ditemukan'}
                </p>
              </div>
            ) : (
              filteredSurahs.map((surah) => {
                const isExpanded = expandedSurahMobile === surah.number;
                const isLoading = loading && selectedSurah === surah.number;
                const revelationType = getRevelationTypeIndonesian(surah.revelation);

                return (
                  <div
                    key={surah.number}
                    ref={isExpanded ? expandedSurahRef : null}
                    className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border-2 transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_20px_rgba(16,185,129,0.15)]'
                        : 'border-slate-200/60 hover:border-emerald-200'
                    }`}
                  >
                    {/* Surah Card Header - Clickable */}
                    <button
                      onClick={() => handleMobileSurahClick(surah.number)}
                      className="w-full p-4 text-left transition-all"
                    >
                      <div className="flex items-center gap-4">
                        {/* Number Circle */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                          isExpanded
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                            : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                        }`}>
                          <span>{surah.number}</span>
                        </div>

                        {/* Surah Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-base">
                              {surah.transliteration}
                            </h3>
                            <span className="text-xl text-emerald-600 flex-shrink-0 font-arabic">
                              {surah.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{surah.totalVerses} ayat</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              revelationType === 'Makkiyah'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-sky-100 text-sky-700'
                            }`}>
                              {revelationType}
                            </span>
                          </div>
                        </div>

                        {/* Expand Icon */}
                        <ChevronDown
                          size={20}
                          className={`flex-shrink-0 text-emerald-600 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Expanded Content - Verses with smooth animation */}
                    <div
                      className={`transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-[100000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {isExpanded && (
                        <div className="border-t border-emerald-100">
                          {/* Surah Header with Meta Info and Buttons */}
                          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-5 text-white">
                            {/* 1. Nama Surah (Arab + Latin) */}
                            <div className="mb-3">
                              <h2 className="text-3xl font-bold mb-1 font-arabic leading-tight">
                                {surahData?.name}
                              </h2>
                              <p className="text-lg font-semibold text-green-50">
                                {surahData?.englishName}
                              </p>
                            </div>

                            {/* 2. Meta Info (Jumlah Ayat & Kategori) - WAJIB TAMPIL */}
                            <div className="flex items-center gap-3 text-sm text-green-50 flex-wrap mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Jumlah Ayat:</span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {surahData?.numberOfAyahs || surah.totalVerses}
                                </span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">Kategori:</span>
                                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                  {getRevelationTypeIndonesian(surahData?.revelationType || surah.revelation)}
                                </span>
                              </div>
                            </div>

                            {/* 3. Tombol Mode Tajwid & Tandai */}
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowTajwid(!showTajwid);
                                }}
                                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all text-sm shadow-md ${
                                  showTajwid
                                    ? 'bg-white text-emerald-600'
                                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                                }`}
                              >
                                Mode Tajwid
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBookmark();
                                }}
                                className="flex-1 px-4 py-2 bg-white/30 backdrop-blur-sm hover:bg-white/40 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                              >
                                <Bookmark size={16} />
                                Tandai
                              </button>
                            </div>
                          </div>

                          {/* Tajweed Legend */}
                          {showTajwid && (
                            <div className="px-4 py-3 bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100">
                              <h3 className="text-xs font-bold text-gray-700 mb-2">Panduan Warna Tajwid:</h3>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#9400A8'}}></span>
                                  <span>Ikhfa</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#26BFFD'}}></span>
                                  <span>Iqlab</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#169777'}}></span>
                                  <span>Idgham+</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#DD0008'}}></span>
                                  <span>Qalqalah</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Loading State */}
                          {isLoading ? (
                            <LoadingIndicator text="Memuat ayat..." />
                          ) : (
                            /* Verses List */
                            <div className="p-4 space-y-3 bg-gradient-to-br from-white via-emerald-50/20 to-sky-50/20 max-h-[600px] overflow-y-auto">
                              {verses.map((verse, index) => {
                                const ayahNo = verse?.numberInSurah ?? (index + 1);
                                const playingId = `${selectedSurah}-${ayahNo}`;
                                const isCurrentAyat = currentPlayingId === playingId;

                                return (
                                  <div
                                    key={verse.number || index}
                                    ref={(el) => (ayahRefs.current[ayahNo] = el)}
                                    onClick={() => handleVerseClick(verse)}
                                    onDoubleClick={() => handleVerseInteraction(verse)}
                                    className={`p-4 rounded-xl border-2 bg-white/90 backdrop-blur-sm transition-all cursor-pointer select-none ${
                                      isCurrentAyat && isAudioPlaying
                                        ? 'border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_8px_20px_rgba(16,185,129,0.2)]'
                                        : 'border-gray-100 hover:border-emerald-200 shadow-sm'
                                    }`}
                                  >
                                    {/* Ayah Header */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-2">
                                        {/* Circular Number Badge - Like Guru Page */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowJumpModal(true);
                                          }}
                                          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                                          title="Klik untuk pindah ke ayat"
                                        >
                                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                            <span className="text-white text-sm font-bold leading-none">{ayahNo}</span>
                                          </div>
                                          <ChevronDown size={14} className="text-gray-400" />
                                        </button>

                                        {isCurrentAyat && isAudioPlaying && (
                                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                                            <Volume2 size={14} className="animate-pulse" />
                                            <span>Diputar</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Audio Button - Always Visible Like Guru Page */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playAudio(ayahNo);
                                        }}
                                        disabled={audioLoading}
                                        className={`p-2 rounded-xl bg-green-100 hover:bg-green-200 transition-all ${
                                          audioLoading ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        title={audioLoading ? 'Memuat audio...' : 'Putar audio'}
                                      >
                                        {audioLoading ? (
                                          <LoadingIndicator text="" size="small" className="!py-0" />
                                        ) : isCurrentAyat && isAudioPlaying ? (
                                          <Pause size={16} className="text-green-700" />
                                        ) : (
                                          <Play size={16} className="text-green-700" />
                                        )}
                                      </button>
                                    </div>

                                    {/* Arabic Text */}
                                    <div className="text-right mb-3 leading-loose text-2xl text-gray-900 font-arabic">
                                      {showTajwid && verse.textTajweed ? (
                                        <div
                                          className="tajweed-text"
                                          dangerouslySetInnerHTML={{ __html: parseTajweedText(verse.textTajweed) }}
                                        />
                                      ) : (
                                        verse.text
                                      )}
                                    </div>

                                    {/* Translation */}
                                    {verse.translation && (
                                      <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border border-emerald-100">
                                        <p className="text-gray-700 leading-relaxed text-xs">
                                          {cleanTranslation(verse.translation)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {verses.length === 0 && !isLoading && (
                                <div className="text-center py-8">
                                  <p className="text-gray-500 text-sm">Tidak ada ayat untuk ditampilkan</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP VIEW: Two Column Layout */}
          <div className="hidden lg:flex gap-6 h-[calc(100vh-200px)]">

            {/* LEFT COLUMN - Surah List (35%) */}
            <div className="w-[35%] flex flex-col">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 flex flex-col h-full overflow-hidden">

                {/* Surah List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {filteredSurahs.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">
                        {surahs.length === 0 ? 'Memuat daftar surah...' : 'Surah tidak ditemukan'}
                      </p>
                    </div>
                  ) : (
                    filteredSurahs.map((surah) => {
                      const isActive = selectedSurah === surah.number;
                      const revelationType = getRevelationTypeIndonesian(surah.revelation);

                      return (
                        <button
                          key={surah.number}
                          onClick={() => fetchSurahData(surah.number)}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-emerald-50/80 border-2 border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_20px_rgba(16,185,129,0.15)]'
                              : 'bg-white/70 hover:bg-white border border-gray-200/60 hover:border-emerald-200 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            {/* Number Circle */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                              isActive
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                            }`}>
                              <span>{surah.number}</span>
                            </div>

                            {/* Surah Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between gap-2">
                                <h3 className="font-bold text-gray-900 text-sm truncate">
                                  {surah.transliteration}
                                </h3>
                                <span className="text-xl text-emerald-600 flex-shrink-0 font-arabic">
                                  {surah.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600">
                                  {surah.totalVerses} ayat
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  revelationType === 'Makkiyah'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-sky-100 text-sky-700'
                                }`}>
                                  {revelationType}
                                </span>
                              </div>
                            </div>
                          </div>

                          {isActive && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                              <Check size={14} />
                              <span>Sedang dibaca</span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Surah Detail (65%) */}
            <div className="w-[65%] flex flex-col">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/60 flex flex-col h-full overflow-hidden">

                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <LoadingIndicator text="Memuat surah..." />
                  </div>
                ) : !surahData ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center px-8">
                      <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
                      <p className="text-xl font-bold text-gray-700 mb-2">Pilih Surah</p>
                      <p className="text-gray-500">Pilih surah dari daftar di sebelah kiri untuk mulai membaca</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Surah Header - Desktop: Row 1 (Nama) + Row 2 (Meta + Buttons) */}
                    <div ref={versesPanelRef} className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 p-8 text-white rounded-t-2xl shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_8px_24px_rgba(16,185,129,0.15)]">

                      {/* Row 1: Nama Surah (Arab + Latin) - Paling Atas */}
                      <div className="mb-4">
                        <h2 className="text-5xl font-bold mb-2 font-arabic leading-tight">
                          {surahData.name}
                        </h2>
                        <p className="text-2xl font-semibold text-green-50">
                          {surahData.englishName}
                        </p>
                      </div>

                      {/* Row 2: Meta Info (Left) + Buttons (Right) */}
                      <div className="flex items-center justify-between gap-4">
                        {/* Meta Info - WAJIB TAMPIL */}
                        <div className="flex items-center gap-4 text-sm text-green-50">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Jumlah Ayat:</span>
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                              {surahData.numberOfAyahs}
                            </span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Kategori:</span>
                            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                              {getRevelationTypeIndonesian(surahData.revelationType)}
                            </span>
                          </div>
                        </div>

                        {/* Buttons - Right Aligned */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setShowTajwid(!showTajwid)}
                            className={`px-4 py-2.5 rounded-xl font-semibold transition-all text-sm shadow-md ${
                              showTajwid
                                ? 'bg-white text-emerald-600'
                                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                            }`}
                          >
                            Mode Tajwid
                          </button>

                          <button
                            onClick={handleBookmark}
                            className="px-4 py-2.5 bg-white/30 backdrop-blur-sm hover:bg-white/40 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                          >
                            <Bookmark size={16} />
                            Tandai
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tajweed Legend */}
                    {showTajwid && (
                      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border-b border-emerald-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Panduan Warna Tajwid:</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#9400A8'}}></span>
                            <span>Ikhfa (Samar)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#26BFFD'}}></span>
                            <span>Iqlab (Penukaran)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#169777'}}></span>
                            <span>Idgham + Ghunnah</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#169200'}}></span>
                            <span>Idgham - Ghunnah</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#DD0008'}}></span>
                            <span>Qalqalah</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#FF7E1E'}}></span>
                            <span>Ghunnah</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#537FFF'}}></span>
                            <span>Mad Normal (2)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{backgroundColor: '#4050FF'}}></span>
                            <span>Mad Jaiz (2,4,6)</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mt-2 italic">
                          Hover pada huruf berwarna untuk melihat highlight
                        </p>
                      </div>
                    )}

                    {/* Verses List */}
                    <div ref={versesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-white via-emerald-50/20 to-sky-50/20">
                      {verses.map((verse, index) => {
                        const ayahNo = verse?.numberInSurah ?? (index + 1);
                        const playingId = `${selectedSurah}-${ayahNo}`;
                        const isCurrentAyat = currentPlayingId === playingId;

                        return (
                          <div
                            key={verse.number || index}
                            id={`ayat-${ayahNo}`}
                            ref={(el) => (ayahRefs.current[ayahNo] = el)}
                            onClick={() => handleVerseClick(verse, ayahNo)}
                            onDoubleClick={() => handleVerseInteraction(verse, ayahNo)}
                            className={`p-6 rounded-2xl border-2 bg-white/90 backdrop-blur-sm transition-all relative cursor-pointer select-none ${
                              isCurrentAyat && isAudioPlaying
                                ? 'border-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.3),0_12px_28px_rgba(16,185,129,0.2)]'
                                : 'border-gray-100 hover:border-emerald-200 shadow-sm hover:shadow-md'
                            }`}
                          >
                            {/* Ayah Header */}
                            <div className="flex items-center justify-between mb-5">
                              <div className="flex items-center gap-3">
                                {/* Circular Number Badge - Like Guru Page */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowJumpModal(true);
                                  }}
                                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                  title="Klik untuk pindah ke ayat"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                    <span className="text-white text-sm font-bold leading-none">{ayahNo}</span>
                                  </div>
                                  <ChevronDown size={16} className="text-gray-400" />
                                </button>

                                {isCurrentAyat && isAudioPlaying && (
                                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                                    <Volume2 size={16} className="animate-pulse" />
                                    <span>Sedang diputar</span>
                                  </div>
                                )}
                              </div>

                              {/* Audio Button - Always Visible Like Guru Page */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playAudio(ayahNo);
                                }}
                                disabled={audioLoading}
                                className={`p-2.5 rounded-xl bg-green-100 hover:bg-green-200 transition-all ${
                                  audioLoading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title={audioLoading ? 'Memuat audio...' : 'Putar audio'}
                              >
                                {audioLoading ? (
                                  <LoadingIndicator text="" size="small" className="!py-0" />
                                ) : isCurrentAyat && isAudioPlaying ? (
                                  <Pause size={20} className="text-green-700" />
                                ) : (
                                  <Play size={20} className="text-green-700" />
                                )}
                              </button>
                            </div>

                            {/* Arabic Text */}
                            <div className="text-right mb-5 leading-loose text-3xl text-gray-900 font-arabic">
                              {showTajwid && verse.textTajweed ? (
                                <div
                                  className="tajweed-text"
                                  dangerouslySetInnerHTML={{ __html: parseTajweedText(verse.textTajweed) }}
                                />
                              ) : (
                                verse.text
                              )}
                            </div>

                            {/* Translation */}
                            {verse.translation && (
                              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/80 to-sky-50/80 border border-emerald-100">
                                <p className="text-gray-700 leading-relaxed text-sm">
                                  {cleanTranslation(verse.translation)}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {verses.length === 0 && !loading && (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Tidak ada ayat untuk ditampilkan</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Last Read Toast - Bottom Right (Pastel) */}
        {lastRead && (
          <div 
            onClick={handleJumpToLastRead}
            className="fixed bottom-6 right-6 bg-emerald-50/95 backdrop-blur-sm border-2 border-emerald-200 text-emerald-900 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 z-50 max-w-xs transition-all animate-in fade-in slide-in-from-bottom-4 cursor-pointer hover:bg-emerald-100 hover:scale-105 active:scale-95 group"
          >
            <Bookmark size={18} className="flex-shrink-0 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-800 flex items-center gap-2">
                Terakhir dibaca:
                <span className="text-[10px] bg-emerald-200 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Lanjutkan</span>
              </p>
              <p className="text-emerald-700">
                {(lastRead.surahName || lastRead.surah) || '-'} – Ayat {(lastRead.ayatNumber || lastRead.verse) || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Jump to Ayah Modal */}
        <JumpToAyahModal
          isOpen={showJumpModal}
          onClose={() => setShowJumpModal(false)}
          surahName={surahData?.englishName || ''}
          totalAyahs={surahData?.numberOfAyahs || 0}
          onJump={handleJumpToAyah}
        />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap');

        .font-arabic {
          font-family: 'Scheherazade New', 'Amiri', serif;
        }

        /* Tajweed rules colors based on AlQuran.cloud */
        tajweed.ham_wasl, tajweed.silent, tajweed.laam_shamsiyah {
          color: #AAAAAA;
        }

        tajweed.madda_normal {
          color: #537FFF;
        }

        tajweed.madda_permissible {
          color: #4050FF;
        }

        tajweed.madda_necessary {
          color: #000EBC;
        }

        tajweed.madda_obligatory {
          color: #2144C1;
        }

        tajweed.qalqalah {
          color: #DD0008;
          font-weight: 600;
        }

        tajweed.ikhafa_shafawi {
          color: #D500B7;
        }

        tajweed.ikhafa {
          color: #9400A8;
        }

        tajweed.idgham_shafawi {
          color: #58B800;
        }

        tajweed.iqlab {
          color: #26BFFD;
        }

        tajweed.idgham_ghunnah {
          color: #169777;
        }

        tajweed.idgham_wo_ghunnah {
          color: #169200;
        }

        tajweed.idgham_mutajanisayn, tajweed.idgham_mutaqaribayn {
          color: #A1A1A1;
        }

        tajweed.ghunnah {
          color: #FF7E1E;
        }

        .tajweed-text tajweed {
          padding: 1px 2px;
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .tajweed-text tajweed:hover {
          background-color: rgba(16, 185, 129, 0.1);
          transform: scale(1.05);
        }
      `}</style>
    </Layout>
  );
}