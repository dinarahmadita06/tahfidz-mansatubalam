'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Volume2,
  BookMarked,
  Search,
  Play,
  Pause,
  Star,
  ChevronDown,
  Bookmark,
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaLayout from '@/components/layout/SiswaLayout';
import toast, { Toaster } from 'react-hot-toast';
import { sanitizeTranslation } from '@/lib/utils';

// Tajweed parser utility
const parseTajweedText = (tajweedText) => {
  if (!tajweedText) return null;

  // Parse [h:number[text] format to HTML
  const parsed = tajweedText.replace(/\[([a-z_]+):(\d+)\[([^\]]+)\]/g, (match, rule, id, text) => {
    return `<tajweed class="${rule}" data-id="${id}">${text}</tajweed>`;
  });

  return parsed;
};

export default function ReferensiQuran() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('quran');
  const [surahs, setSurahs] = useState([]);
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [weeklyMaterial, setWeeklyMaterial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpToAyah, setJumpToAyah] = useState('');
  const [showSurahContent, setShowSurahContent] = useState(false);

  // NEW: State untuk fitur baru
  const [showTajwid, setShowTajwid] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState(null);
  const [lastBookmark, setLastBookmark] = useState(null);

  // State untuk anti spam toast dan loading
  const [audioLoading, setAudioLoading] = useState(false);
  const [lastToastTime, setLastToastTime] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSurahs();
      fetchWeeklyMaterial();

      // Load last bookmark from localStorage
      const saved = localStorage.getItem('guru_last_bookmark_quran');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLastBookmark(parsed);
        } catch (e) {
          console.error('Error loading last bookmark:', e);
        }
      }
    }
  }, [status, router]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onpause = null;
        audioElement.onplay = null;
      }
    };
  }, [audioElement]);

  const fetchSurahs = async () => {
    try {
      const response = await fetch('/api/quran/surahs');
      if (!response.ok) {
        throw new Error('Failed to fetch surahs');
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setSurahs(data);
      } else {
        console.error('Surahs data is not an array:', data);
        setSurahs([]);
      }
    } catch (error) {
      console.error('Error fetching surahs:', error);
      setSurahs([]);
    }
  };

  const fetchWeeklyMaterial = async () => {
    try {
      const response = await fetch('/api/weekly-material');
      const data = await response.json();
      setWeeklyMaterial(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching weekly material:', error);
    }
  };

  const fetchSurahData = async (surahNumber) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/quran/surah/${surahNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch surah');
      }
      const data = await response.json();

      if (!data || !data.ayahs || !Array.isArray(data.ayahs)) {
        throw new Error('Invalid surah data format');
      }

      setSurahData(data);
      setSelectedSurah(surahNumber);
      setShowSurahContent(true);
      setSelectedAyah(null); // Reset selected ayah when changing surah
    } catch (error) {
      console.error('Error fetching surah data:', error);
      alert('Gagal memuat data surah. Silakan coba lagi.');
      setSurahData(null);
    } finally {
      setLoading(false);
    }
  };

  // Builder function untuk URL audio via proxy (bypass CSP)
  const buildAudioUrl = (reciter, surahNumber, ayahNumber) => {
    try {
      // Gunakan proxy endpoint internal untuk bypass CSP
      const params = new URLSearchParams({
        reciter: reciter,
        surah: String(surahNumber),
        ayah: String(ayahNumber),
      });

      const proxyUrl = `/api/audio/proxy?${params.toString()}`;
      return proxyUrl;
    } catch (error) {
      console.error('Error building audio URL:', error);
      return null;
    }
  };

  // Helper untuk throttle toast (maksimal 1 toast per 3 detik)
  const showToastThrottled = (message, type = 'error') => {
    const now = Date.now();
    if (now - lastToastTime < 3000) {
      return; // Skip jika belum 3 detik sejak toast terakhir
    }

    setLastToastTime(now);

    if (type === 'error') {
      toast.error(message, {
        icon: '🔇',
        duration: 3000,
        style: { borderRadius: '12px', background: '#EF4444', color: '#fff' },
      });
    } else if (type === 'success') {
      toast.success(message, {
        icon: '🔊',
        duration: 2000,
        style: { borderRadius: '12px', background: '#10B981', color: '#fff' },
      });
    }
  };

  const playAudio = async (surahNumber, ayahNumberInSurah) => {
    try {
      // Validasi parameter
      if (!surahNumber || !ayahNumberInSurah) {
        showToastThrottled('Nomor surah atau ayat tidak valid', 'error');
        return;
      }

      // Prevent spam - jika sedang loading, return
      if (audioLoading) {
        return;
      }

      // Stop dan cleanup audio sebelumnya (hanya 1 instance)
      if (audioElement) {
        audioElement.pause();
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onloadstart = null;
        audioElement.oncanplaythrough = null;
        setAudioElement(null);
      }

      const playingId = `${surahNumber}-${ayahNumberInSurah}`;
      setAudioPlaying(playingId);
      setAudioLoading(true); // Set loading state

      // Daftar reciter dengan fallback
      const reciters = [
        'Abdul_Basit_Murattal_192kbps',
        'Abdurrahmaan_As-Sudais_192kbps',
        'Mishari_Rashid_al_Afasy_128kbps',
      ];

      let audioLoaded = false;

      // Coba reciter satu per satu
      for (const reciter of reciters) {
        if (audioLoaded) break;

        const audioUrl = buildAudioUrl(reciter, surahNumber, ayahNumberInSurah);

        if (!audioUrl) {
          continue;
        }

        const audio = new Audio();
        audio.preload = 'auto';

        await new Promise((resolve) => {
          let resolved = false;

          const cleanup = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };

          audio.addEventListener('canplaythrough', () => {
            audio.play()
              .then(() => {
                audioLoaded = true;
                setAudioLoading(false);
                showToastThrottled(`Memutar ayat ${ayahNumberInSurah}`, 'success');

                // Set event listeners untuk playback
                audio.addEventListener('ended', () => {
                  setAudioPlaying(null);
                  setAudioElement(null);
                });

                setAudioElement(audio);
                cleanup();
              })
              .catch((err) => {
                console.error('Play error:', err);
                cleanup();
              });
          });

          audio.addEventListener('error', (e) => {
            console.error('Audio load error:', audio.error);
            cleanup();
          });

          // Set timeout 5 detik untuk coba reciter berikutnya
          setTimeout(cleanup, 5000);

          audio.src = audioUrl;
          audio.load();
        });
      }

      // Jika semua reciter gagal
      if (!audioLoaded) {
        setAudioLoading(false);
        setAudioPlaying(null);
        showToastThrottled('Audio tidak tersedia untuk ayat ini', 'error');
      }

    } catch (error) {
      console.error('Error in playAudio:', error);
      setAudioLoading(false);
      setAudioPlaying(null);
      showToastThrottled('Terjadi kesalahan saat memutar audio', 'error');
    }
  };

  const pauseAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.onended = null;
      audioElement.onerror = null;
      audioElement.onloadstart = null;
      audioElement.oncanplaythrough = null;
      setAudioElement(null);
    }
    setAudioPlaying(null);
    setAudioLoading(false); // Reset loading state
  };

  const handleJumpToAyah = () => {
    const ayahNumber = parseInt(jumpToAyah);
    if (ayahNumber && ayahNumber >= 1 && ayahNumber <= surahData?.numberOfAyahs) {
      const element = document.getElementById(`ayah-${ayahNumber}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-green-400');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-green-400');
        }, 2000);
      }
      setShowJumpModal(false);
      setJumpToAyah('');
    } else {
      alert(`Masukkan nomor ayat antara 1-${surahData?.numberOfAyahs}`);
    }
  };

  // NEW: Handle bookmark
  const handleBookmark = () => {
    if (!selectedAyah || !surahData) {
      toast.error('Pilih ayat terlebih dahulu', {
        icon: '⚠️',
        style: {
          borderRadius: '12px',
          background: '#EF4444',
          color: '#fff',
        },
      });
      return;
    }

    const bookmark = {
      surah: surahData.englishName,
      surahNumber: surahData.number,
      ayah: selectedAyah,
      date: new Date().toISOString(),
    };

    localStorage.setItem('guru_last_bookmark_quran', JSON.stringify(bookmark));
    setLastBookmark(bookmark);

    toast.success('Bacaan ayat berhasil ditandai', {
      icon: '📖',
      style: {
        borderRadius: '12px',
        background: '#10B981',
        color: '#fff',
      },
    });
  };

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.transliteration.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.translation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surah.number.toString().includes(searchTerm)
  );

  const isWeeklyMaterial = (surahNumber, ayahNumber) => {
    return weeklyMaterial.some(
      (material) =>
        material.surahNumber === surahNumber &&
        ayahNumber >= material.ayatMulai &&
        ayahNumber <= material.ayatSelesai &&
        material.isActive
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const Layout = session?.user?.role === 'GURU' ? GuruLayout : SiswaLayout;

  return (
    <Layout>
      <Toaster position="top-right" />

      {/* Tajweed CSS Styles */}
      <style jsx global>{`
        /* Tajweed color coding */
        .tajweed-text {
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

        tajweed.qalaqah {
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

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
        {/* Header Gradient Hijau - Mirip Tasmi */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 md:p-8 text-white mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <BookOpen size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Referensi Al-Qur&apos;an Digital</h1>
              <p className="text-green-50 text-base md:text-lg">Teks Al-Qur&apos;an dengan tajwid, terjemahan, dan audio</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('quran')}
                className={`flex items-center gap-2 px-6 md:px-8 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'quran'
                    ? 'border-b-3 border-green-600 text-green-700 bg-green-50'
                    : 'border-b-3 border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <BookOpen size={18} />
                Baca Al-Qur&apos;an
              </button>
              <button
                onClick={() => setActiveTab('tajwid')}
                className={`flex items-center gap-2 px-6 md:px-8 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'tajwid'
                    ? 'border-b-3 border-green-600 text-green-700 bg-green-50'
                    : 'border-b-3 border-transparent text-gray-500 hover:bg-gray-50'
                }`}
              >
                <BookMarked size={18} />
                Panduan Tajwid
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'quran' && (
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari surah atau ayat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Main Container: 2 Kolom */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {/* Kolom Kiri: Daftar Surah */}
                    <div className={`${showSurahContent ? 'hidden md:block' : ''} p-4`}>
                      {/* Weekly Material Badge */}
                      {weeklyMaterial && weeklyMaterial.length > 0 && (
                        <div className="mb-4 p-4 bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Star size={16} className="text-green-700" />
                            <span className="text-sm font-bold text-green-900">
                              Materi Hafalan Minggu Ini
                            </span>
                          </div>
                          {weeklyMaterial.map((material) => {
                            const surah = surahs.find((s) => s.number === material.surahNumber);
                            return (
                              <div key={material.id} className="text-xs text-green-800 mt-1">
                                {surah?.transliteration} ayat {material.ayatMulai}-{material.ayatSelesai}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Surah List */}
                      <div className="max-h-[600px] overflow-y-auto space-y-1">
                        {filteredSurahs && filteredSurahs.length > 0 ? (
                          filteredSurahs.map((surah) => (
                            <button
                              key={surah.number}
                              onClick={() => fetchSurahData(surah.number)}
                              className={`w-full p-3 rounded-xl text-left transition-all ${
                                selectedSurah === surah.number
                                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300'
                                  : 'border-2 border-transparent hover:bg-gray-50 hover:border-l-4 hover:border-l-green-500'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-white text-xs font-bold">{surah.number}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-gray-900 truncate">
                                      {surah.transliteration}
                                    </span>
                                    <span className="text-sm font-arabic text-gray-600">{surah.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{surah.translation}</span>
                                    <span>•</span>
                                    <span>{surah.totalVerses} ayat</span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <p>Tidak ada surah ditemukan</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kolom Kanan: Detail Surah */}
                    <div className={`${!showSurahContent ? 'hidden md:block' : ''} p-4 md:p-6`}>
                      {/* Back button for mobile */}
                      {showSurahContent && surahData && (
                        <button
                          onClick={() => setShowSurahContent(false)}
                          className="flex md:hidden items-center gap-2 mb-4 text-green-600 font-semibold text-sm hover:text-green-700"
                        >
                          <ChevronDown size={20} className="rotate-90" />
                          Kembali ke Daftar Surah
                        </button>
                      )}

                      {loading && (
                        <div className="text-center py-16">
                          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Memuat surah...</p>
                        </div>
                      )}

                      {!loading && !surahData && (
                        <div className="text-center py-16 text-gray-400">
                          <BookOpen size={48} className="mx-auto mb-3 opacity-50" />
                          <p>Pilih surah untuk membaca</p>
                        </div>
                      )}

                      {!loading && surahData && (
                        <div className="space-y-6">
                          {/* Surah Header - Nama Arab di kiri atas, tombol di kanan atas */}
                          <div className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 rounded-3xl px-4 py-5 md:px-6 md:py-6 text-white shadow-xl relative overflow-hidden">
                            {/* Tombol floating di pojok kanan atas - TIDAK mempengaruhi layout judul */}
                            <div className="absolute top-4 right-4 md:top-5 md:right-6 flex gap-2 z-10">
                              <button
                                onClick={() => setShowTajwid(!showTajwid)}
                                className={`px-4 py-2 rounded-xl font-semibold transition-all text-xs md:text-sm shadow-lg hover:scale-105 ${
                                  showTajwid
                                    ? 'bg-white text-green-600'
                                    : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                                }`}
                              >
                                Mode Tajwid
                              </button>

                              <button
                                onClick={handleBookmark}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl font-semibold transition-all flex items-center gap-2 text-xs md:text-sm shadow-lg text-white hover:scale-105"
                              >
                                <Bookmark size={14} />
                                Tandai
                              </button>
                            </div>

                            {/* Area Judul - Align KIRI dengan flex flex-col items-start */}
                            <div className="flex flex-col items-start space-y-2 pr-40 md:pr-48">
                              {/* Baris 1: Nama Arab - KIRI ATAS */}
                              <h2 className="text-4xl md:text-6xl font-arabic leading-tight drop-shadow-md text-left">
                                {surahData.name}
                              </h2>

                              {/* Baris 2: Nama Latin - KIRI, di bawah Arab */}
                              <h3 className="text-2xl md:text-4xl font-bold text-white text-left">
                                {surahData.englishName}
                              </h3>

                              {/* Baris 3: Info Jumlah Ayat + Kategori - KIRI, sejajar dalam 1 baris */}
                              <div className="flex items-center gap-2 text-sm md:text-base text-green-50 font-medium">
                                <span>Jumlah Ayat: {surahData.numberOfAyahs}</span>
                                <span>•</span>
                                <span>
                                  Kategori: {surahData.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                                </span>
                              </div>
                            </div>

                            {/* Last Bookmark Indicator */}
                            {lastBookmark && lastBookmark.surahNumber === surahData.number && (
                              <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center gap-2 text-xs md:text-sm text-green-100 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-full inline-flex">
                                  <Bookmark size={14} className="fill-green-100" />
                                  <span className="font-medium">Terakhir ditandai: Ayat {lastBookmark.ayah}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tajweed Legend */}
                          {showTajwid && (
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl">
                              <h3 className="text-sm font-bold text-gray-700 mb-3">📚 Panduan Warna Tajwid:</h3>
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
                                💡 Hover pada huruf berwarna untuk melihat highlight
                              </p>
                            </div>
                          )}

                          {/* Bismillah */}
                          {surahData.number !== 1 && surahData.number !== 9 && (
                            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                              <p className="text-3xl md:text-4xl font-arabic text-gray-900">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                              </p>
                            </div>
                          )}

                          {/* Ayahs */}
                          <div className="space-y-4">
                            {surahData.ayahs && surahData.ayahs.map((ayah, index) => {
                              const ayahNumberInSurah = ayah.verseKey ? parseInt(ayah.verseKey.split(':')[1]) : index + 1;
                              const isWeekly = isWeeklyMaterial(surahData.number, ayahNumberInSurah);
                              const isSelected = selectedAyah === ayahNumberInSurah;

                              return (
                                <div
                                  key={ayah.number}
                                  id={`ayah-${ayahNumberInSurah}`}
                                  onClick={() => setSelectedAyah(ayahNumberInSurah)}
                                  className={`p-4 md:p-5 rounded-xl border-2 transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-gradient-to-br from-amber-100 to-yellow-100 border-amber-400 ring-2 ring-amber-300'
                                      : isWeekly
                                      ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
                                      : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-md'
                                  }`}
                                >
                                  {isWeekly && (
                                    <div className="flex items-center gap-2 mb-3 text-green-700">
                                      <Star size={14} className="fill-green-700" />
                                      <span className="text-xs font-bold">Materi Hafalan Minggu Ini</span>
                                    </div>
                                  )}

                                  {isSelected && (
                                    <div className="flex items-center gap-2 mb-3 text-amber-700">
                                      <Bookmark size={14} className="fill-amber-700" />
                                      <span className="text-xs font-bold">Ayat Dipilih - Klik &quot;Tandai&quot; untuk menyimpan</span>
                                    </div>
                                  )}

                                  <div className="flex items-start justify-between mb-4">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowJumpModal(true);
                                      }}
                                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-all"
                                      title="Klik untuk pindah ke ayat lain"
                                    >
                                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                        <span className="text-white text-sm font-bold">{ayahNumberInSurah}</span>
                                      </div>
                                      <ChevronDown size={16} className="text-gray-400" />
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const isPlaying = audioPlaying === `${surahData.number}-${ayahNumberInSurah}`;
                                        if (isPlaying) {
                                          pauseAudio();
                                        } else {
                                          playAudio(surahData.number, ayahNumberInSurah);
                                        }
                                      }}
                                      disabled={audioLoading}
                                      className={`p-2.5 rounded-xl bg-green-100 hover:bg-green-200 transition-all ${audioLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      title={audioLoading ? 'Memuat audio...' : 'Putar audio'}
                                    >
                                      {audioPlaying === `${surahData.number}-${ayahNumberInSurah}` ? (
                                        <Pause size={20} className="text-green-700" />
                                      ) : (
                                        <Play size={20} className="text-green-700" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Arabic Text with Tajwid */}
                                  <div className="text-2xl md:text-3xl font-arabic text-right leading-loose mb-4 text-gray-900">
                                    {showTajwid && ayah.textTajweed ? (
                                      <div
                                        className="tajweed-text"
                                        dangerouslySetInnerHTML={{ __html: parseTajweedText(ayah.textTajweed) }}
                                      />
                                    ) : (
                                      ayah.text
                                    )}
                                  </div>

                                  {/* Translation with Sanitization */}
                                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {sanitizeTranslation(ayah.translation)}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tajwid' && (
              <div>
                <TajwidGuide />
              </div>
            )}
          </div>
        </div>

        {/* Jump to Ayah Modal */}
        {showJumpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pindah ke Ayat</h3>
              <p className="text-sm text-gray-600 mb-5">
                {surahData ? `${surahData.englishName} memiliki ${surahData.numberOfAyahs} ayat` : 'Pilih nomor ayat yang ingin dituju'}
              </p>
              <input
                type="number"
                min="1"
                max={surahData?.numberOfAyahs || 1}
                value={jumpToAyah}
                onChange={(e) => setJumpToAyah(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJumpToAyah();
                  }
                }}
                placeholder={`Masukkan nomor ayat (1-${surahData?.numberOfAyahs || 1})`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm mb-5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowJumpModal(false);
                    setJumpToAyah('');
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleJumpToAyah}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                >
                  Pindah
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

// Tajwid Guide Component
function TajwidGuide() {
  const [playingTajwid, setPlayingTajwid] = useState(null);
  const [tajwidAudio, setTajwidAudio] = useState(null);

  const tajwidRules = [
    {
      title: 'Ikhfa (الإخفاء)',
      description: 'Menyembunyikan bunyi nun sukun atau tanwin',
      color: 'bg-purple-100 border-purple-300',
      textColor: 'text-purple-900',
      huruf: 'ت، ث، ج، د، ذ، ز، س، ش، ص، ض، ط، ظ، ف، ق، ك',
      example: 'مِنْ قَبْلِ',
      surah: 2,
      ayah: 2,
    },
    {
      title: 'Idgham (الإدغام)',
      description: 'Memasukkan bunyi nun sukun atau tanwin ke huruf berikutnya',
      color: 'bg-green-100 border-green-300',
      textColor: 'text-green-900',
      huruf: 'ي، ر، م، ل، و، ن',
      example: 'مِنْ رَبِّهِمْ',
      surah: 2,
      ayah: 5,
    },
    {
      title: 'Iqlab (الإقلاب)',
      description: 'Mengubah nun sukun atau tanwin menjadi bunyi mim',
      color: 'bg-orange-100 border-orange-300',
      textColor: 'text-orange-900',
      huruf: 'ب',
      example: 'مِنْ بَعْدِ',
      surah: 2,
      ayah: 27,
    },
    {
      title: 'Izhar (الإظهار)',
      description: 'Membaca nun sukun atau tanwin dengan jelas',
      color: 'bg-blue-100 border-blue-300',
      textColor: 'text-blue-900',
      huruf: 'أ، ه، ع، ح، غ، خ',
      example: 'مِنْ عِلْمٍ',
      surah: 2,
      ayah: 32,
    },
    {
      title: 'Qalqalah (القلقلة)',
      description: 'Bunyi memantul pada huruf qalqalah yang sukun',
      color: 'bg-red-100 border-red-300',
      textColor: 'text-red-900',
      huruf: 'ق، ط، ب، ج، د',
      example: 'أَحَدْ',
      surah: 112,
      ayah: 1,
    },
    {
      title: 'Mad (المد)',
      description: 'Panjang bacaan huruf mad (alif, waw, ya)',
      color: 'bg-yellow-100 border-yellow-300',
      textColor: 'text-yellow-900',
      huruf: 'ا، و، ي',
      example: 'قَالَ',
      surah: 2,
      ayah: 30,
    },
    {
      title: 'Ghunnah (الغنة)',
      description: 'Dengung pada huruf nun dan mim yang bertasydid',
      color: 'bg-pink-100 border-pink-300',
      textColor: 'text-pink-900',
      huruf: 'نّ، مّ',
      example: 'إِنَّ',
      surah: 2,
      ayah: 6,
    },
  ];

  const playTajwidAudio = (surah, ayah, index) => {
    try {
      if (tajwidAudio) {
        tajwidAudio.pause();
        tajwidAudio.onended = null;
        tajwidAudio.onerror = null;
        setTajwidAudio(null);
      }

      const formattedSurah = String(surah).padStart(3, '0');
      const formattedAyah = String(ayah).padStart(3, '0');
      const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      setPlayingTajwid(index);

      const audio = new Audio();
      audio.src = audioUrl;

      audio.addEventListener('ended', () => {
        setPlayingTajwid(null);
        setTajwidAudio(null);
      });

      audio.addEventListener('error', () => {
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
          return;
        }
        alert('Gagal memuat audio contoh tajwid');
        setPlayingTajwid(null);
        setTajwidAudio(null);
      });

      audio.play().catch(err => {
        console.error('Error playing tajwid audio:', err);
        setPlayingTajwid(null);
        setTajwidAudio(null);
      });

      setTajwidAudio(audio);
    } catch (error) {
      console.error('Error in playTajwidAudio:', error);
      setPlayingTajwid(null);
    }
  };

  const pauseTajwidAudio = () => {
    if (tajwidAudio) {
      tajwidAudio.pause();
      tajwidAudio.onended = null;
      tajwidAudio.onerror = null;
      setTajwidAudio(null);
    }
    setPlayingTajwid(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Panduan Hukum Tajwid
        </h2>
        <p className="text-sm text-gray-600">
          Pelajari hukum-hukum tajwid dengan kode warna untuk membantu bacaan
          Al-Qur&apos;an Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tajwidRules.map((rule, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${rule.color}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className={`text-lg font-semibold ${rule.textColor}`}>
                {rule.title}
              </h3>
              <button
                onClick={() => {
                  const isPlaying = playingTajwid === index;
                  if (isPlaying) {
                    pauseTajwidAudio();
                  } else {
                    playTajwidAudio(rule.surah, rule.ayah, index);
                  }
                }}
                className="p-2 hover:bg-white/50 rounded-lg transition flex-shrink-0"
                title="Dengar contoh pelafalan"
              >
                {playingTajwid === index ? (
                  <Pause size={18} className={rule.textColor.replace('text-', 'text-')} />
                ) : (
                  <Volume2 size={18} className={rule.textColor.replace('text-', 'text-')} />
                )}
              </button>
            </div>
            <p className="text-sm text-gray-700 mb-3">{rule.description}</p>
            <div className="mb-2">
              <span className="text-xs font-semibold text-gray-700">
                Huruf:
              </span>
              <p className="text-lg font-arabic mt-1 text-gray-800">
                {rule.huruf}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-gray-700">
                Contoh:
              </span>
              <p className="text-2xl font-arabic mt-1 text-gray-900">
                {rule.example}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Catatan Penting
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Perhatikan warna pada setiap ayat untuk mengenali hukum tajwid</li>
          <li>Gunakan audio untuk mendengar bacaan yang benar</li>
          <li>Praktikkan dengan guru untuk hasil terbaik</li>
          <li>
            Materi hafalan minggu ini ditandai dengan bintang dan warna hijau
          </li>
        </ul>
      </div>
    </div>
  );
}
