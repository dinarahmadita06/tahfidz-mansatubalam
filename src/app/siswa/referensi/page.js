'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BookOpen,
  Play,
  Pause,
  Volume2,
  Bookmark,
  Search,
  PlayCircle,
  ChevronLeft,
  Loader2,
  Check,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Tajweed parser utility
const parseTajweedText = (tajweedText) => {
  if (!tajweedText) return null;

  // Parse [h:number[text] format to HTML
  const parsed = tajweedText.replace(/\[([a-z_]+):(\d+)\[([^\]]+)\]/g, (match, rule, id, text) => {
    return `<tajweed class="${rule}" data-id="${id}">${text}</tajweed>`;
  });

  return parsed;
};

export default function ReferensiQuranPage() {
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRead, setLastRead] = useState(null);
  const [showTajwid, setShowTajwid] = useState(false);

  // Single audio state management
  const [currentPlayingId, setCurrentPlayingId] = useState(null); // Format: "surah-ayah"
  const [currentAudio, setCurrentAudio] = useState(null); // Audio element reference
  const [isAudioPlaying, setIsAudioPlaying] = useState(false); // Track if audio is actually playing (not paused)

  // Fetch surahs on mount
  useEffect(() => {
    fetchSurahs();

    // Load last read from localStorage
    const saved = localStorage.getItem('last_read_quran');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLastRead(parsed);
      } catch (e) {
        console.error('Error loading last read:', e);
      }
    }
  }, []);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs');
      if (!response.ok) throw new Error('Failed to fetch surahs');

      const data = await response.json();
      console.log('Surahs fetched:', data.length);

      if (Array.isArray(data)) {
        setSurahs(data);

        // Auto-select first surah or last read
        if (data.length > 0) {
          const initialSurah = data[0];
          fetchSurahData(initialSurah.number);
        }
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
      toast.error('Gagal memuat daftar surah');
    }
  };

  const fetchSurahData = async (surahNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quran/surah/${surahNumber}`);
      if (!response.ok) throw new Error('Failed to fetch surah');

      const data = await response.json();

      if (!data || !data.ayahs || !Array.isArray(data.ayahs)) {
        throw new Error('Invalid surah data format');
      }

      setSurahData(data);
      setVerses(data.ayahs || []);
      setSelectedSurah(surahs.find(s => s.number === surahNumber) || {
        number: surahNumber,
        englishName: data.englishName,
        name: data.name,
        numberOfAyahs: data.numberOfAyahs,
        revelationType: data.revelationType
      });

      // Stop any playing audio when changing surah
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = '';
        currentAudio.load();
        setCurrentAudio(null);
      }
      setCurrentPlayingId(null);
      setIsAudioPlaying(false);

    } catch (error) {
      console.error('Error fetching surah data:', error);
      toast.error('Gagal memuat data surah');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (ayah) => {
    try {
      console.log('🎵 playAudio called:', ayah);

      if (!selectedSurah || !ayah) {
        toast.error('Data tidak valid');
        return;
      }

      const surahNumber = selectedSurah.number;
      const ayahNumberInSurah = ayah.numberInSurah;
      const playingId = `${surahNumber}-${ayahNumberInSurah}`;

      console.log('📌 State SEBELUM playAudio:', {
        currentPlayingId,
        playingId,
        isAudioPlaying,
        hasCurrentAudio: !!currentAudio
      });

      // Case 1: Clicking the same ayat - toggle play/pause
      if (currentPlayingId === playingId && currentAudio) {
        if (currentAudio.paused) {
          console.log('▶️ Resume audio');
          currentAudio.play()
            .then(() => {
              setIsAudioPlaying(true);
              toast.success('Audio dilanjutkan', { icon: '▶️' });
            })
            .catch(err => {
              console.error('❌ Resume error:', err);
              toast.error('Gagal melanjutkan audio');
            });
        } else {
          console.log('⏸️ Pause audio');
          currentAudio.pause();
          setIsAudioPlaying(false);
          toast.success('Audio dijeda', { icon: '⏸️' });
        }
        return;
      }

      // Case 2: Different ayat - stop previous audio completely
      if (currentAudio) {
        console.log('🧹 Stopping previous audio');
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.src = '';
        currentAudio.load();
      }

      // Clear previous state
      setCurrentAudio(null);
      setCurrentPlayingId(null);
      setIsAudioPlaying(false);

      // Format with leading zeros
      const formattedSurah = String(surahNumber).padStart(3, '0');
      const formattedAyah = String(ayahNumberInSurah).padStart(3, '0');

      // DON'T set currentPlayingId here - wait until audio actually starts playing
      // This prevents UI from showing "playing" state before audio loads

      // Audio sources to try
      const audioSources = [
        `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`,
        `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${formattedSurah}${formattedAyah}.mp3`,
        `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`,
      ];

      console.log('🎵 Audio URLs to try:', audioSources);

      let currentSourceIndex = 0;

      const tryNextSource = () => {
        if (currentSourceIndex >= audioSources.length) {
          console.error('❌ All audio sources failed');
          toast.error('Audio tidak tersedia. Coba ayat lain atau refresh halaman.');
          setCurrentPlayingId(null);
          setCurrentAudio(null);
          setIsAudioPlaying(false);
          return;
        }

        const audioUrl = audioSources[currentSourceIndex];
        console.log(`🎵 Trying audio source ${currentSourceIndex + 1}/${audioSources.length}:`, audioUrl);

        // Create new audio element
        const audio = new Audio();
        audio.preload = 'auto';

        let loadTimeout = setTimeout(() => {
          console.warn('⏱️ Loading timeout, trying next source...');
          currentSourceIndex++;
          tryNextSource();
        }, 10000);

        audio.addEventListener('loadstart', () => {
          console.log('📥 Loading started...');
        });

        audio.addEventListener('loadeddata', () => {
          console.log('📦 Audio data loaded');
          clearTimeout(loadTimeout);
        });

        audio.addEventListener('canplay', () => {
          console.log('✅ Can play, attempting to play...');
          clearTimeout(loadTimeout);
          audio.play()
            .then(() => {
              console.log('▶️ Playing successfully!');
              // Set currentAudio dan currentPlayingId HANYA ketika audio benar-benar berhasil diputar
              setCurrentAudio(audio);
              setCurrentPlayingId(playingId);
              setIsAudioPlaying(true);
              console.log('✅ State SETELAH berhasil play:', {
                playingId,
                message: 'State updated: currentAudio, currentPlayingId, isAudioPlaying = true'
              });
              toast.success(`Memutar ayat ${ayahNumberInSurah}`, { icon: '🔊' });
            })
            .catch(err => {
              console.error('❌ Play error:', err);
              currentSourceIndex++;
              console.log(`⏭️ Trying next source (${currentSourceIndex + 1}/${audioSources.length})...`);
              tryNextSource();
            });
        });

        audio.addEventListener('error', (e) => {
          clearTimeout(loadTimeout);

          if (!audio.src || audio.src === '' || audio.src === window.location.href) {
            console.log('⚠️ Error on cleanup audio element (empty src), ignoring');
            return;
          }

          const errorCode = audio.error?.code;
          const errorMessages = {
            1: 'MEDIA_ERR_ABORTED - Loading dibatalkan',
            2: 'MEDIA_ERR_NETWORK - Error jaringan',
            3: 'MEDIA_ERR_DECODE - Error decoding',
            4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format tidak didukung'
          };

          console.error(`❌ Audio error from source ${currentSourceIndex + 1}:`, errorMessages[errorCode] || 'Unknown error');

          currentSourceIndex++;
          if (currentSourceIndex < audioSources.length) {
            console.log(`⏭️ Trying next source (${currentSourceIndex + 1}/${audioSources.length})...`);
            tryNextSource();
          } else {
            toast.error('Audio tidak tersedia untuk ayat ini');
            setCurrentPlayingId(null);
            setCurrentAudio(null);
            setIsAudioPlaying(false);
          }
        });

        audio.addEventListener('ended', () => {
          console.log('⏹️ Playback ended - clearing state');
          setCurrentPlayingId(null);
          setCurrentAudio(null);
          setIsAudioPlaying(false);
        });

        audio.addEventListener('pause', () => {
          console.log('⏸️ Paused');
          setIsAudioPlaying(false);
        });

        audio.addEventListener('play', () => {
          console.log('▶️ Play event fired');
          // State sudah di-set di canplay callback, ini hanya untuk logging
          setIsAudioPlaying(true);
        });

        // Set source and load
        audio.src = audioUrl;
        audio.load();

        // DON'T set currentAudio here - wait until audio.play() succeeds in canplay callback
        // setCurrentAudio(audio); // REMOVED - moved to canplay callback

        console.log('🎵 Audio element created and loading...');
      };

      // Start trying sources
      tryNextSource();

    } catch (error) {
      console.error('❌ Error in playAudio:', error);
      toast.error('Terjadi kesalahan saat memutar audio');
      setCurrentPlayingId(null);
      setCurrentAudio(null);
      setIsAudioPlaying(false);
    }
  };

  const handleBookmark = () => {
    if (!selectedSurah) return;

    const bookmark = {
      surah: selectedSurah.englishName,
      surahNumber: selectedSurah.number,
      verse: currentPlayingId?.split('-')[1] || 1,
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

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.number.toString().includes(searchTerm)
  );

  // Cleanup audio on unmount or surah change
  useEffect(() => {
    return () => {
      if (currentAudio) {
        console.log('🧹 Cleanup: Stopping audio on unmount');
        currentAudio.pause();
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.onpause = null;
        currentAudio.onplay = null;
      }
    };
  }, [currentAudio, selectedSurah]);

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Scheherazade+New:wght@400;700&display=swap');

        .arabic-text {
          font-family: 'Scheherazade New', 'Amiri', serif;
        }

        .latin-text {
          font-family: 'Poppins', 'Inter', sans-serif;
        }

        /* Smooth scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #ECFDF5;
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10B981, #FBBF24);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #059669, #F59E0B);
        }

        /* Card hover effect */
        .surah-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .surah-card:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.2), 0 8px 10px -6px rgba(251, 191, 36, 0.1);
        }

        .ayah-card {
          transition: all 0.3s ease;
        }

        .ayah-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(16, 185, 129, 0.15);
        }

        .ayah-card-playing {
          box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.4), 0 8px 20px -4px rgba(251, 191, 36, 0.3);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.4), 0 8px 20px -4px rgba(251, 191, 36, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.2), 0 12px 28px -6px rgba(251, 191, 36, 0.4);
          }
        }

        /* Islamic pattern overlay */
        .islamic-pattern {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(251, 191, 36, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(219, 234, 254, 0.03) 0%, transparent 50%);
        }

        /* Tajweed color coding */
        .tajweed-text {
          font-family: 'Scheherazade New', 'Amiri', serif;
        }

        /* Tajweed rules colors based on AlQuran.cloud */
        tajweed.ham_wasl, tajweed.silent, tajweed.laam_shamsiyah {
          color: #AAAAAA; /* Gray - Hamza wasl, silent, lam shamsiyyah */
        }

        tajweed.madda_normal {
          color: #537FFF; /* Blue - Normal elongation (2 vowels) */
        }

        tajweed.madda_permissible {
          color: #4050FF; /* Dark blue - Permissible elongation (2,4,6 vowels) */
        }

        tajweed.madda_necessary {
          color: #000EBC; /* Very dark blue - Necessary elongation (6 vowels) */
        }

        tajweed.madda_obligatory {
          color: #2144C1; /* Medium blue - Obligatory elongation (4-5 vowels) */
        }

        tajweed.qalaqah {
          color: #DD0008; /* Red - Qalqalah */
          font-weight: 600;
        }

        tajweed.ikhafa_shafawi {
          color: #D500B7; /* Pink - Ikhafa Shafawi (with Meem) */
        }

        tajweed.ikhafa {
          color: #9400A8; /* Purple - Ikhafa (concealment) */
        }

        tajweed.idgham_shafawi {
          color: #58B800; /* Light green - Idgham Shafawi (with Meem) */
        }

        tajweed.iqlab {
          color: #26BFFD; /* Cyan - Iqlab (transformation) */
        }

        tajweed.idgham_ghunnah {
          color: #169777; /* Teal - Idgham with Ghunnah */
        }

        tajweed.idgham_wo_ghunnah {
          color: #169200; /* Green - Idgham without Ghunnah */
        }

        tajweed.idgham_mutajanisayn, tajweed.idgham_mutaqaribayn {
          color: #A1A1A1; /* Gray - Similar/close articulation */
        }

        tajweed.ghunnah {
          color: #FF7E1E; /* Orange - Ghunnah (2 vowels) */
        }

        /* Add subtle background highlight for better visibility */
        .tajweed-text tajweed {
          padding: 1px 2px;
          border-radius: 2px;
          transition: all 0.2s ease;
        }

        .tajweed-text tajweed:hover {
          background-color: rgba(251, 191, 36, 0.1);
          transform: scale(1.05);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-referensi islamic-pattern animate-fade-in">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#ECFDF5] via-[#DBEAFE] to-[#E9D5FF] py-8 px-8 border-b border-emerald-100/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-white rounded-2xl shadow-md">
                <BookOpen className="text-emerald-600" size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-emerald-800 latin-text">
                  📘 Referensi Al-Qur'an
                </h1>
                <p className="text-emerald-600 mt-1 latin-text">
                  Baca, dengarkan, dan pahami ayat suci Al-Qur'an dengan mudah.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="max-w-7xl mx-auto p-6 flex gap-6 h-[calc(100vh-180px)]">

          {/* LEFT COLUMN - Surah List (35%) */}
          <div className="w-[35%] flex flex-col">
            <div className="bg-gradient-to-br from-[#ECFDF5] to-[#FEFCE8] rounded-3xl shadow-lg border border-emerald-100/50 flex flex-col h-full overflow-hidden">

              {/* Search Bar */}
              <div className="p-6 border-b border-emerald-100/50">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={20} />
                  <input
                    type="text"
                    placeholder="Cari surah atau ayat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 focus:outline-none bg-white/80 backdrop-blur-sm latin-text text-sm transition-all"
                  />
                </div>
              </div>

              {/* Surah List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {filteredSurahs.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 latin-text">
                      {surahs.length === 0 ? 'Memuat daftar surah...' : 'Surah tidak ditemukan'}
                    </p>
                  </div>
                ) : (
                  filteredSurahs.map((surah) => {
                    const isActive = selectedSurah?.number === surah.number;

                    return (
                      <button
                        key={surah.number}
                        onClick={() => fetchSurahData(surah.number)}
                        className={`surah-card w-full p-4 rounded-2xl text-left transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-100 to-amber-50 border-2 border-amber-400 shadow-md'
                            : 'bg-white/70 hover:bg-white border border-emerald-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Number Circle */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md ${
                            isActive
                              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                              : 'bg-gradient-to-br from-emerald-400 to-emerald-500'
                          }`}>
                            <span className="latin-text">{surah.number}</span>
                          </div>

                          {/* Surah Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="font-bold text-gray-900 latin-text text-sm truncate">
                                {surah.englishName || surah.name}
                              </h3>
                              <span className="text-xl text-emerald-600 arabic-text flex-shrink-0">
                                {surah.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-600 latin-text">
                                {surah.numberOfAyahs} ayat
                              </span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full latin-text ${
                                surah.revelationType === 'Meccan'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-sky-100 text-sky-700'
                              }`}>
                                {surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isActive && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 latin-text font-medium">
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
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden">

              {loading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 latin-text">Memuat surah...</p>
                  </div>
                </div>
              ) : !selectedSurah ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-8">
                    <BookOpen className="text-gray-300 mx-auto mb-4" size={64} />
                    <p className="text-xl font-bold text-gray-700 mb-2 latin-text">Pilih Surah</p>
                    <p className="text-gray-500 latin-text">Pilih surah dari daftar di sebelah kiri untuk mulai membaca</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Surah Header */}
                  <div className="bg-gradient-to-br from-emerald-500 via-emerald-400 to-amber-400 p-8 text-white relative overflow-hidden">
                    {/* Islamic pattern overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='white' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                      }} />
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-5xl font-bold arabic-text mb-3 drop-shadow-lg">
                            {selectedSurah.name}
                          </h2>
                          <p className="text-xl font-semibold latin-text text-emerald-50">
                            {selectedSurah.englishName}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowTajwid(!showTajwid)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all latin-text text-sm ${
                              showTajwid
                                ? 'bg-white text-emerald-600'
                                : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                          >
                            Mode Tajwid
                          </button>

                          <button
                            onClick={handleBookmark}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl font-semibold transition-all flex items-center gap-2 latin-text text-sm shadow-lg"
                          >
                            <Bookmark size={16} />
                            Tandai
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm latin-text text-emerald-50">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Jumlah Ayat:</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full">{selectedSurah.numberOfAyahs}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Kategori:</span>
                          <span className="bg-white/20 px-3 py-1 rounded-full">
                            {selectedSurah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tajweed Legend */}
                  {showTajwid && (
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 border-b border-emerald-100">
                      <h3 className="text-sm font-bold text-gray-700 mb-3 latin-text">📚 Panduan Warna Tajwid:</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs latin-text">
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
                        💡 Hover pada huruf berwarna untuk melihat highlight
                      </p>
                    </div>
                  )}

                  {/* Verses List */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 bg-gradient-to-br from-white via-sky-50/30 to-lilac-50/30">
                    {verses.map((verse) => {
                      const playingId = `${selectedSurah.number}-${verse.numberInSurah}`;
                      const isCurrentAyat = currentPlayingId === playingId;

                      return (
                        <div
                          key={verse.number}
                          className={`ayah-card p-6 rounded-2xl border-2 bg-white ${
                            isCurrentAyat && isAudioPlaying
                              ? 'ayah-card-playing border-amber-400'
                              : 'border-gray-100 hover:border-emerald-200'
                          }`}
                        >
                          {/* Ayah Header */}
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md latin-text">
                                {verse.numberInSurah}
                              </div>
                              {/* HANYA tampilkan "Sedang diputar" jika ayat INI yang sedang diputar DAN audio benar-benar playing */}
                              {isCurrentAyat && isAudioPlaying && (
                                <div className="flex items-center gap-2 text-amber-600 latin-text text-sm font-semibold">
                                  <Volume2 size={16} className="animate-pulse" />
                                  <span>Sedang diputar</span>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                playAudio(verse);
                              }}
                              className={`p-3 rounded-xl transition-all shadow-md hover:scale-110 ${
                                isCurrentAyat && isAudioPlaying
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-600'
                              }`}
                            >
                              {isCurrentAyat ? (
                                isAudioPlaying ? <Pause size={20} /> : <Play size={20} />
                              ) : (
                                <PlayCircle size={20} />
                              )}
                            </button>
                          </div>

                          {/* Arabic Text */}
                          <div className="text-right mb-5 leading-loose arabic-text text-3xl text-gray-900">
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
                            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-lilac-50 border border-sky-100">
                              <p className="text-gray-700 leading-relaxed latin-text text-sm">
                                {verse.translation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {verses.length === 0 && !loading && (
                      <div className="text-center py-12">
                        <p className="text-gray-500 latin-text">Tidak ada ayat untuk ditampilkan</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Last Read Indicator (Bottom Right) */}
        {lastRead && (
          <div className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-2xl shadow-2xl border-2 border-amber-300 flex items-center gap-3 z-50">
            <Bookmark size={20} className="flex-shrink-0" />
            <div className="latin-text text-sm">
              <p className="font-semibold">Terakhir dibaca:</p>
              <p className="text-amber-50">{lastRead.surah} - Ayat {lastRead.verse}</p>
            </div>
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}
