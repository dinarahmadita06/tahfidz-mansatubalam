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
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaLayout from '@/components/layout/SiswaLayout';

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      console.log('User authenticated, fetching data...');
      fetchSurahs();
      fetchWeeklyMaterial();
    }
  }, [status]);

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
      console.log('Surahs fetched:', data.length);
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

      if (data.ayahs.length > 0) {
        console.log('📖 First ayah structure:', data.ayahs[0]);
      }

      setSurahData(data);
      setSelectedSurah(surahNumber);
      setShowSurahContent(true);
    } catch (error) {
      console.error('Error fetching surah data:', error);
      alert('Gagal memuat data surah. Silakan coba lagi.');
      setSurahData(null);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (surahNumber, ayahNumberInSurah) => {
    try {
      console.log('🎵 playAudio called:', { surahNumber, ayahNumberInSurah });

      if (!surahNumber || !ayahNumberInSurah) {
        console.error('❌ Invalid parameters:', { surahNumber, ayahNumberInSurah });
        alert('Error: Nomor surah atau ayat tidak valid');
        return;
      }

      if (audioElement) {
        console.log('🧹 Cleaning up previous audio');
        audioElement.pause();
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onpause = null;
        audioElement.onplay = null;
        setAudioElement(null);
      }

      const formattedSurah = String(surahNumber).padStart(3, '0');
      const formattedAyah = String(ayahNumberInSurah).padStart(3, '0');

      console.log('📝 Formatted:', { formattedSurah, formattedAyah });

      const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      console.log('🎵 URL:', audioUrl);

      const playingId = `${surahNumber}-${ayahNumberInSurah}`;
      setAudioPlaying(playingId);

      const audio = new Audio();
      audio.preload = 'auto';

      audio.addEventListener('loadstart', () => {
        console.log('📥 Loading started...');
      });

      audio.addEventListener('loadeddata', () => {
        console.log('📦 Audio data loaded');
      });

      audio.addEventListener('canplay', () => {
        console.log('✅ Can play, attempting to play...');
        audio.play()
          .then(() => {
            console.log('▶️ Playing successfully!');
          })
          .catch(err => {
            console.error('❌ Play error:', err);
            alert('Gagal memutar audio. Error: ' + err.message);
            setAudioPlaying(null);
            setAudioElement(null);
          });
      });

      audio.addEventListener('error', (e) => {
        if (!audio.src || audio.src === '' || audio.src === window.location.href) {
          console.log('⚠️ Error on cleanup audio element (empty src), ignoring');
          return;
        }

        const errorCode = audio.error?.code;
        const errorMessages = {
          1: 'MEDIA_ERR_ABORTED - Loading dibatalkan',
          2: 'MEDIA_ERR_NETWORK - Error network',
          3: 'MEDIA_ERR_DECODE - Error decoding',
          4: 'MEDIA_ERR_SRC_NOT_SUPPORTED - Format tidak didukung'
        };
        console.error('❌ Audio error:', errorMessages[errorCode] || 'Unknown error');
        console.error('❌ Error details:', {
          code: errorCode,
          message: audio.error?.message,
          src: audio.src,
          expectedUrl: audioUrl
        });

        alert(`Gagal memuat audio:\n${errorMessages[errorCode] || 'Unknown error'}\n\nURL: ${audioUrl}`);
        setAudioPlaying(null);
        setAudioElement(null);
      });

      audio.addEventListener('ended', () => {
        console.log('⏹️ Playback ended');
        setAudioPlaying(null);
        setAudioElement(null);
      });

      audio.addEventListener('pause', () => {
        console.log('⏸️ Paused');
      });

      audio.addEventListener('play', () => {
        console.log('▶️ Play event fired');
      });

      audio.src = audioUrl;
      audio.load();

      setAudioElement(audio);

      console.log('🎵 Audio element created and loading...');
    } catch (error) {
      console.error('❌ Error in playAudio:', error);
      setAudioPlaying(null);
      setAudioElement(null);
    }
  };

  const pauseAudio = () => {
    console.log('⏸️ pauseAudio called');
    if (audioElement) {
      audioElement.pause();
      audioElement.onended = null;
      audioElement.onerror = null;
      audioElement.onpause = null;
      audioElement.onplay = null;
      setAudioElement(null);
    }
    setAudioPlaying(null);
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
                          {/* Surah Header */}
                          <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 md:p-8 text-white text-center shadow-lg">
                            <h2 className="text-4xl md:text-5xl font-arabic mb-3">{surahData.name}</h2>
                            <h3 className="text-xl md:text-2xl font-bold mb-2">{surahData.englishName}</h3>
                            <p className="text-sm md:text-base text-green-50">
                              {surahData.englishNameTranslation} • {surahData.numberOfAyahs} Ayat • {surahData.revelationType}
                            </p>
                          </div>

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

                              return (
                                <div
                                  key={ayah.number}
                                  id={`ayah-${ayahNumberInSurah}`}
                                  className={`p-4 md:p-5 rounded-xl border-2 transition-all ${
                                    isWeekly
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

                                  <div className="flex items-start justify-between mb-4">
                                    <button
                                      onClick={() => setShowJumpModal(true)}
                                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-all"
                                      title="Klik untuk pindah ke ayat lain"
                                    >
                                      <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                        <span className="text-white text-sm font-bold">{ayahNumberInSurah}</span>
                                      </div>
                                      <ChevronDown size={16} className="text-gray-400" />
                                    </button>

                                    <button
                                      onClick={() => {
                                        console.log('🖱️ Button clicked, ayahNumberInSurah:', ayahNumberInSurah);
                                        const isPlaying = audioPlaying === `${surahData.number}-${ayahNumberInSurah}`;
                                        if (isPlaying) {
                                          pauseAudio();
                                        } else {
                                          playAudio(surahData.number, ayahNumberInSurah);
                                        }
                                      }}
                                      className="p-2.5 rounded-xl bg-green-100 hover:bg-green-200 transition-all"
                                    >
                                      {audioPlaying === `${surahData.number}-${ayahNumberInSurah}` ? (
                                        <Pause size={20} className="text-green-700" />
                                      ) : (
                                        <Play size={20} className="text-green-700" />
                                      )}
                                    </button>
                                  </div>

                                  <p className="text-2xl md:text-3xl font-arabic text-right leading-loose mb-4 text-gray-900">
                                    {ayah.text}
                                  </p>

                                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                                    {ayah.translation}
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
