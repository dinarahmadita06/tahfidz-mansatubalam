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
  RefreshCw,
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import SiswaLayout from '@/components/layout/SiswaLayout';
import styles from './referensi.module.css';

// SIMTAQ Modern Color Palette - Green Gradient Theme (kept for JS logic, but styles use Tailwind)
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EE7DF',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
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
  const [currentAudioUrl, setCurrentAudioUrl] = useState('');
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
        // Remove event listeners to prevent errors during cleanup
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

      // Validate data structure
      if (!data || !data.ayahs || !Array.isArray(data.ayahs)) {
        throw new Error('Invalid surah data format');
      }

      // Debug: log first ayah to see structure
      if (data.ayahs.length > 0) {
        console.log('📖 First ayah structure:', data.ayahs[0]);
      }

      setSurahData(data);
      setSelectedSurah(surahNumber);
      setShowSurahContent(true); // Show surah content view on mobile
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

      // Validate parameters
      if (!surahNumber || !ayahNumberInSurah) {
        console.error('❌ Invalid parameters:', { surahNumber, ayahNumberInSurah });
        alert('Error: Nomor surah atau ayat tidak valid');
        return;
      }

      // Cleanup previous audio properly
      if (audioElement) {
        console.log('🧹 Cleaning up previous audio');
        audioElement.pause();
        // Remove event listeners to prevent errors during cleanup
        audioElement.onended = null;
        audioElement.onerror = null;
        audioElement.onpause = null;
        audioElement.onplay = null;
        setAudioElement(null);
      }

      // Format surah and ayah numbers with leading zeros
      const formattedSurah = String(surahNumber).padStart(3, '0');
      const formattedAyah = String(ayahNumberInSurah).padStart(3, '0');

      console.log('📝 Formatted:', { formattedSurah, formattedAyah });

      // Try direct URL first (everyayah.com has CORS enabled)
      const audioUrl = `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      // Alternative: Use proxy (uncomment if direct URL doesn't work)
      // const audioUrl = `/api/audio/Abdul_Basit_Murattal_192kbps/${formattedSurah}${formattedAyah}.mp3`;

      console.log('🎵 URL:', audioUrl);

      // Update state FIRST to show playing UI
      const playingId = `${surahNumber}-${ayahNumberInSurah}`;
      setAudioPlaying(playingId);

      // Create new audio element
      const audio = new Audio();
      audio.preload = 'auto';

      // Set up event listeners
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
        // Ignore errors on empty src (cleanup errors)
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

      // Set source and load
      audio.src = audioUrl;
      audio.load();

      // Save audio element to state
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
      // Remove event listeners to prevent errors during cleanup
      audioElement.onended = null;
      audioElement.onerror = null;
      audioElement.onpause = null;
      audioElement.onplay = null;
      // Don't set src to empty string to avoid error
      // Just pause and remove reference
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
        // Highlight effect
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
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.green[50]} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Subtle Pattern Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%239333EA' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%2322C55E' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 48px 24px',
          borderBottom: `1px solid ${colors.gray[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
              }}>
                <BookOpen size={26} style={{ color: colors.white }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.green[600]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '6px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Referensi Al-Qur'an Digital
                </h1>
                <p style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: colors.text.secondary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Teks Al-Qur'an dengan tajwid, terjemahan, dan audio
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          {/* Tabs */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${colors.gray[200]}`,
            overflow: 'hidden',
          }}>
            <div style={{ borderBottom: `2px solid ${colors.gray[200]}` }}>
              <nav style={{ display: 'flex', marginBottom: '-2px' }}>
                <button
                  onClick={() => setActiveTab('quran')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 28px',
                    borderBottom: activeTab === 'quran' ? `3px solid ${colors.emerald[600]}` : '3px solid transparent',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: activeTab === 'quran' ? colors.emerald[700] : colors.text.tertiary,
                    background: activeTab === 'quran' ? `${colors.emerald[50]}80` : 'transparent',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  className="tab-button"
                >
                  <BookOpen size={18} />
                  Baca Al-Qur'an
                </button>
                <button
                  onClick={() => setActiveTab('tajwid')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 28px',
                    borderBottom: activeTab === 'tajwid' ? `3px solid ${colors.green[600]}` : '3px solid transparent',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: activeTab === 'tajwid' ? colors.green[700] : colors.text.tertiary,
                    background: activeTab === 'tajwid' ? `${colors.green[50]}80` : 'transparent',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    cursor: 'pointer',
                    border: 'none',
                  }}
                  className="tab-button"
                >
                  <BookMarked size={18} />
                  Panduan Tajwid
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div style={{ padding: '28px' }}>
              {activeTab === 'quran' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                }}>
                  {/* Surah List */}
                  <div className={`${showSurahContent ? 'hidden lg:block' : ''}`} style={{ minWidth: '320px' }}>
                    <div style={{ position: 'sticky', top: '24px' }}>
                      {/* Search */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ position: 'relative' }}>
                          <Search
                            size={20}
                            style={{
                              position: 'absolute',
                              left: '16px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: colors.text.tertiary,
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Cari surah atau ayat..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '14px 16px 14px 48px',
                              border: `2px solid ${colors.emerald[200]}`,
                              borderRadius: '12px',
                              fontSize: '14px',
                              fontFamily: '"Poppins", system-ui, sans-serif',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              background: `linear-gradient(135deg, ${colors.white} 0%, ${colors.emerald[50]} 100%)`,
                            }}
                            className="search-input-quran"
                          />
                        </div>
                      </div>

                      {/* Weekly Material Badge */}
                      {weeklyMaterial && weeklyMaterial.length > 0 && (
                        <div style={{
                          marginBottom: '20px',
                          padding: '16px',
                          background: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.green[100]} 100%)`,
                          border: `2px solid ${colors.emerald[300]}`,
                          borderRadius: '14px',
                          boxShadow: '0 3px 10px rgba(168, 85, 247, 0.15)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <Star size={16} style={{ color: colors.emerald[700] }} />
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: colors.emerald[900],
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}>
                              Materi Hafalan Minggu Ini
                            </span>
                          </div>
                          {weeklyMaterial.map((material) => {
                            const surah = surahs.find(
                              (s) => s.number === material.surahNumber
                            );
                            return (
                              <div
                                key={material.id}
                                style={{
                                  fontSize: '12px',
                                  color: colors.emerald[800],
                                  marginTop: '4px',
                                  fontFamily: '"Poppins", system-ui, sans-serif',
                                }}
                              >
                                {surah?.transliteration} ayat {material.ayatMulai}-{material.ayatSelesai}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Surah List */}
                      <div style={{
                        maxHeight: '600px',
                        overflowY: 'auto',
                        border: `2px solid ${colors.emerald[200]}`,
                        borderRadius: '16px',
                        background: `linear-gradient(to bottom, ${colors.white} 0%, ${colors.emerald[50]}40 100%)`,
                      }}>
                        {filteredSurahs && filteredSurahs.length > 0 ? filteredSurahs.map((surah) => (
                          <button
                            key={surah.number}
                            onClick={() => fetchSurahData(surah.number)}
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              textAlign: 'left',
                              borderBottom: `1px solid ${colors.emerald[100]}`,
                              background: selectedSurah === surah.number
                                ? `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.green[100]} 100%)`
                                : 'transparent',
                              transition: 'all 0.2s ease',
                              border: 'none',
                              cursor: 'pointer',
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}
                            className="surah-item"
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%)`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                              }}>
                                <span style={{
                                  color: colors.white,
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  fontFamily: '"Poppins", system-ui, sans-serif',
                                }}>
                                  {surah.number}
                                </span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    color: colors.text.primary,
                                    fontFamily: '"Poppins", system-ui, sans-serif',
                                  }}>
                                    {surah.transliteration}
                                  </span>
                                  <span style={{
                                    fontSize: '14px',
                                    fontFamily: 'Arabic, system-ui',
                                    color: colors.text.secondary,
                                  }}>
                                    {surah.name}
                                  </span>
                                </div>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '12px',
                                  color: colors.text.tertiary,
                                  fontFamily: '"Poppins", system-ui, sans-serif',
                                }}>
                                  <span>{surah.translation}</span>
                                  <span>•</span>
                                  <span>{surah.totalVerses} ayat</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )) : (
                          <div style={{
                            padding: '24px',
                            textAlign: 'center',
                            color: colors.text.tertiary,
                            fontFamily: '"Poppins", system-ui, sans-serif',
                          }}>
                            <p>Tidak ada surah ditemukan</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Surah Content */}
                  <div className={`${!showSurahContent ? 'hidden lg:block' : ''}`} style={{ flex: 1, minWidth: 0 }}>
                    {/* Back button for mobile */}
                    {showSurahContent && surahData && (
                      <button
                        onClick={() => setShowSurahContent(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '16px',
                          color: colors.emerald[600],
                          fontWeight: 600,
                          fontSize: '14px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: '"Poppins", system-ui, sans-serif',
                        }}
                        className="lg:hidden back-button"
                      >
                        <ChevronDown size={20} style={{ transform: 'rotate(90deg)' }} />
                        Kembali ke Daftar Surah
                      </button>
                    )}

                    {loading && (
                      <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          border: `4px solid ${colors.emerald[200]}`,
                          borderTop: `4px solid ${colors.emerald[600]}`,
                          borderRadius: '50%',
                          margin: '0 auto 16px',
                        }} className="spinner" />
                        <p style={{
                          color: colors.text.secondary,
                          fontFamily: '"Poppins", system-ui, sans-serif',
                        }}>
                          Memuat surah...
                        </p>
                      </div>
                    )}

                    {!loading && !surahData && (
                      <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        color: colors.text.tertiary,
                      }}>
                        <BookOpen size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                        <p style={{ fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif' }}>
                          Pilih surah untuk membaca
                        </p>
                      </div>
                    )}

                    {!loading && surahData && (
                      <div>
                        {/* Surah Header */}
                        <div style={{
                          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%)`,
                          borderRadius: '18px',
                          padding: '32px 24px',
                          marginBottom: '24px',
                          color: colors.white,
                          boxShadow: '0 8px 20px rgba(168, 85, 247, 0.25)',
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <h2 style={{
                              fontSize: '36px',
                              fontFamily: 'Arabic, system-ui',
                              marginBottom: '12px',
                              fontWeight: 700,
                            }}>
                              {surahData.name}
                            </h2>
                            <h3 style={{
                              fontSize: '22px',
                              fontWeight: 700,
                              marginBottom: '8px',
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}>
                              {surahData.englishName}
                            </h3>
                            <p style={{
                              fontSize: '14px',
                              opacity: 0.95,
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}>
                              {surahData.englishNameTranslation} • {surahData.numberOfAyahs} Ayat • {surahData.revelationType}
                            </p>
                          </div>
                        </div>

                        {/* Bismillah */}
                        {surahData.number !== 1 && surahData.number !== 9 && (
                          <div style={{
                            textAlign: 'center',
                            marginBottom: '24px',
                            padding: '20px',
                            background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.green[50]} 100%)`,
                            borderRadius: '14px',
                            border: `2px solid ${colors.emerald[200]}`,
                          }}>
                            <p style={{
                              fontSize: '32px',
                              fontFamily: 'Arabic, system-ui',
                              color: colors.text.primary,
                            }}>
                              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                            </p>
                          </div>
                        )}

                        {/* Ayahs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {surahData.ayahs && surahData.ayahs.map((ayah, index) => {
                            // Extract ayah number from verseKey (e.g., "1:1" -> 1)
                            const ayahNumberInSurah = ayah.verseKey ? parseInt(ayah.verseKey.split(':')[1]) : index + 1;
                            const isWeekly = isWeeklyMaterial(surahData.number, ayahNumberInSurah);

                            return (
                              <div
                                key={ayah.number}
                                id={`ayah-${ayahNumberInSurah}`}
                                style={{
                                  padding: '20px',
                                  borderRadius: '16px',
                                  border: isWeekly
                                    ? `2px solid ${colors.emerald[400]}`
                                    : `2px solid ${colors.gray[200]}`,
                                  background: isWeekly
                                    ? `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.green[100]} 100%)`
                                    : `linear-gradient(135deg, ${colors.white} 0%, ${colors.emerald[50]}30 100%)`,
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                }}
                                className="ayah-card"
                              >
                                {isWeekly && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    color: colors.emerald[700],
                                  }}>
                                    <Star size={14} style={{ fill: colors.emerald[700] }} />
                                    <span style={{
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      fontFamily: '"Poppins", system-ui, sans-serif',
                                    }}>
                                      Materi Hafalan Minggu Ini
                                    </span>
                                  </div>
                                )}

                                <div style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  marginBottom: '16px',
                                }}>
                                  <button
                                    onClick={() => setShowJumpModal(true)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      padding: '8px',
                                      borderRadius: '12px',
                                      transition: 'all 0.2s ease',
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                    className="ayah-number-btn"
                                    title="Klik untuk pindah ke ayat lain"
                                  >
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%)`,
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s ease',
                                      boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)',
                                    }}>
                                      <span style={{
                                        color: colors.white,
                                        fontSize: '14px',
                                        fontWeight: 700,
                                        fontFamily: '"Poppins", system-ui, sans-serif',
                                      }}>
                                        {ayahNumberInSurah}
                                      </span>
                                    </div>
                                    <ChevronDown size={16} style={{ color: colors.text.tertiary }} />
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
                                    style={{
                                      padding: '10px',
                                      borderRadius: '12px',
                                      transition: 'all 0.2s ease',
                                      background: `${colors.emerald[100]}80`,
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                    className="audio-btn"
                                  >
                                    {audioPlaying === `${surahData.number}-${ayahNumberInSurah}` ? (
                                      <Pause size={20} style={{ color: colors.emerald[700] }} />
                                    ) : (
                                      <Play size={20} style={{ color: colors.green[700] }} />
                                    )}
                                  </button>
                                </div>

                                <p style={{
                                  fontSize: '26px',
                                  fontFamily: 'Arabic, system-ui',
                                  textAlign: 'right',
                                  lineHeight: '1.8',
                                  marginBottom: '16px',
                                  color: colors.text.primary,
                                }}>
                                  {ayah.text}
                                </p>

                                <p style={{
                                  fontSize: '14px',
                                  color: colors.text.secondary,
                                  lineHeight: '1.6',
                                  fontFamily: '"Poppins", system-ui, sans-serif',
                                }}>
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
              )}

            {activeTab === 'tajwid' && (
              <div>
                <TajwidGuide />
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Jump to Ayah Modal */}
        {showJumpModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px',
          }}>
            <div style={{
              background: colors.white,
              borderRadius: '18px',
              padding: '28px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '12px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                Pindah ke Ayat
              </h3>
              <p style={{
                fontSize: '14px',
                color: colors.text.secondary,
                marginBottom: '20px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
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
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${colors.emerald[200]}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  marginBottom: '20px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  outline: 'none',
                }}
                className="modal-input"
                autoFocus
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowJumpModal(false);
                    setJumpToAyah('');
                  }}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    border: `2px solid ${colors.gray[300]}`,
                    background: colors.white,
                    color: colors.text.primary,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}
                  className="modal-btn-cancel"
                >
                  Batal
                </button>
                <button
                  onClick={handleJumpToAyah}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%)`,
                    color: colors.white,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
                  }}
                  className="modal-btn-submit"
                >
                  Pindah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Styles */}
        <style jsx global>{`
          /* Spinner Animation */
          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          /* Search Input */
          .search-input-quran:focus {
            border-color: ${colors.emerald[500]};
            box-shadow: 0 0 0 3px ${colors.emerald[100]};
          }

          /* Tab Button Hover */
          .tab-button:hover {
            background: ${colors.emerald[50]}60;
          }

          /* Surah Item Hover */
          .surah-item:hover {
            background: linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.green[50]} 100%);
            border-left: 4px solid ${colors.emerald[500]};
          }

          /* Ayah Card Hover */
          .ayah-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(168, 85, 247, 0.15);
            border-color: ${colors.emerald[400]};
          }

          /* Ayah Number Button Hover */
          .ayah-number-btn:hover {
            background: ${colors.emerald[50]}60;
          }

          .ayah-number-btn:hover > div {
            transform: scale(1.1);
            box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
          }

          /* Audio Button Hover */
          .audio-btn:hover {
            background: ${colors.emerald[200]}80;
            transform: scale(1.05);
          }

          /* Back Button Hover */
          .back-button:hover {
            color: ${colors.emerald[700]};
          }

          /* Modal Input Focus */
          .modal-input:focus {
            border-color: ${colors.emerald[500]};
            box-shadow: 0 0 0 3px ${colors.emerald[100]};
          }

          /* Modal Button Hover */
          .modal-btn-cancel:hover {
            background: ${colors.gray[50]};
            border-color: ${colors.emerald[500]};
          }

          .modal-btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(168, 85, 247, 0.4);
          }

          /* Scrollbar Styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          ::-webkit-scrollbar-track {
            background: ${colors.gray[100]};
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, ${colors.emerald[400]} 0%, ${colors.green[400]} 100%);
            border-radius: 10px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.green[500]} 100%);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .ayah-card {
              padding: 16px;
            }
          }
        `}</style>
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
      // Al-Baqarah 2:2 contains "مِنْ قَبْلِ"
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
      // Al-Baqarah 2:5
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
      // Al-Baqarah 2:27
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
      // Al-Baqarah 2:32
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
      // Al-Ikhlas 112:1
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
      // Al-Baqarah 2:30
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
      // Al-Baqarah 2:6
      surah: 2,
      ayah: 6,
    },
  ];

  const playTajwidAudio = (surah, ayah, index) => {
    try {
      // Cleanup previous audio
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
          Al-Qur'an Anda
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
            Materi hafalan minggu ini ditandai dengan bintang dan warna kuning
          </li>
        </ul>
      </div>
    </div>
  );
}

