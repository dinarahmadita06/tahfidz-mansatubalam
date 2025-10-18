"use client";

import { useState } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { Play, Pause, SkipBack, SkipForward, Volume2, BookOpen, RefreshCw, Clock, Award, Target } from 'lucide-react';

// Islamic Modern Color Palette - Teal & Gold
const colors = {
  // Primary Colors - Teal
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  // Secondary Colors - Gold
  gold: {
    50: '#FEFCE8',
    100: '#FEF9C3',
    200: '#FEF08A',
    300: '#FDE047',
    400: '#FACC15',
    500: '#EAB308',
    600: '#CA8A04',
    700: '#A16207',
    800: '#854D0E',
    900: '#713F12',
  },
  // Accent - Emerald
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  // Accent - Amber
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    400: '#F7C873',
    500: '#F59E0B',
  },
  // Neutral Colors
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
    800: '#1F2937',
    900: '#111827',
  },
  // Text Colors
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
    muted: '#9CA3AF',
  },
};

// Mock data untuk surah
const mockSurahList = [
  { id: 1, nomor: 1, nama: 'Al-Fatihah', namaLatin: 'Al-Fatihah', jumlahAyat: 7, juz: 1, progress: 100, lastPractice: '2025-10-17' },
  { id: 2, nomor: 2, nama: 'Al-Baqarah', namaLatin: 'Al-Baqarah', jumlahAyat: 286, juz: 1, progress: 45, lastPractice: '2025-10-18' },
  { id: 3, nomor: 3, nama: 'Ali \'Imran', namaLatin: 'Ali \'Imran', jumlahAyat: 200, juz: 3, progress: 0, lastPractice: null },
  { id: 4, nomor: 4, nama: 'An-Nisa', namaLatin: 'An-Nisa', jumlahAyat: 176, juz: 4, progress: 80, lastPractice: '2025-10-16' },
  { id: 5, nomor: 18, nama: 'Al-Kahf', namaLatin: 'Al-Kahf', jumlahAyat: 110, juz: 15, progress: 60, lastPractice: '2025-10-15' },
  { id: 6, nomor: 36, nama: 'Yasin', namaLatin: 'Yasin', jumlahAyat: 83, juz: 22, progress: 100, lastPractice: '2025-10-14' },
];

// Stats Card Component
function StatsCard({ icon, title, value, color = 'teal' }) {
  const colorMap = {
    teal: {
      bg: `linear-gradient(135deg, ${colors.teal[100]} 0%, ${colors.teal[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
      text: colors.text.primary,
      value: colors.teal[700],
      border: colors.teal[200],
    },
    gold: {
      bg: `linear-gradient(135deg, ${colors.gold[100]} 0%, ${colors.gold[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.gold[500]} 0%, ${colors.gold[600]} 100%)`,
      text: colors.text.primary,
      value: colors.gold[700],
      border: colors.gold[200],
    },
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      text: colors.text.primary,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
  };

  const scheme = colorMap[color];

  return (
    <div style={{
      background: scheme.bg,
      borderRadius: '16px',
      padding: '18px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      border: `2px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
    }}
    className="stats-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '4px',
            fontFamily: 'Poppins, system-ui, sans-serif',
            letterSpacing: '0.3px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '24px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: 'Poppins, system-ui, sans-serif',
            lineHeight: '1.1',
          }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// Surah Card Component
function SurahCard({ surah, onStart, onContinue }) {
  const progressColor = surah.progress === 100 ? colors.teal[500] :
                       surah.progress > 0 ? colors.gold[500] : colors.gray[300];

  return (
    <div style={{
      background: colors.white,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.teal[100]}`,
      transition: 'all 0.3s ease',
    }}
    className="surah-card">
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.white,
                fontWeight: 700,
                fontSize: '14px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {surah.nomor}
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  marginBottom: '2px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  {surah.namaLatin}
                </h3>
                <p style={{
                  fontSize: '13px',
                  color: colors.text.tertiary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  {surah.jumlahAyat} Ayat • Juz {surah.juz}
                </p>
              </div>
            </div>
          </div>
          <span style={{
            padding: '6px 12px',
            borderRadius: '100px',
            background: surah.progress === 100 ? `${colors.teal[500]}15` :
                       surah.progress > 0 ? `${colors.gold[500]}15` : `${colors.gray[300]}15`,
            color: surah.progress === 100 ? colors.teal[700] :
                  surah.progress > 0 ? colors.gold[700] : colors.gray[600],
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}>
            {surah.progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            background: colors.gray[200],
            borderRadius: '100px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${surah.progress}%`,
              background: `linear-gradient(90deg, ${progressColor} 0%, ${progressColor}dd 100%)`,
              borderRadius: '100px',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {surah.lastPractice && (
          <p style={{
            fontSize: '12px',
            color: colors.text.tertiary,
            fontFamily: 'Poppins, system-ui, sans-serif',
            marginBottom: '16px',
          }}>
            Terakhir latihan: {new Date(surah.lastPractice).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {surah.progress > 0 && surah.progress < 100 ? (
          <button
            onClick={() => onContinue(surah)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: `linear-gradient(135deg, ${colors.gold[500]} 0%, ${colors.gold[600]} 100%)`,
              color: colors.white,
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Poppins, system-ui, sans-serif',
              boxShadow: '0 2px 8px rgba(234, 179, 8, 0.3)',
            }}
            className="action-btn"
          >
            <Play size={16} />
            Lanjutkan
          </button>
        ) : (
          <button
            onClick={() => onStart(surah)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              background: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
              color: colors.white,
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'Poppins, system-ui, sans-serif',
              boxShadow: '0 2px 8px rgba(20, 184, 166, 0.3)',
            }}
            className="action-btn"
          >
            <Play size={16} />
            {surah.progress === 100 ? 'Ulang Latihan' : 'Mulai Latihan'}
          </button>
        )}
      </div>
    </div>
  );
}

// Audio Player Component
function AudioPlayer({ surah }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // Mock duration 3 minutes

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div style={{
      background: colors.white,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.teal[100]}`,
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          background: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(20, 184, 166, 0.2)',
        }}>
          <Volume2 size={22} color={colors.white} />
        </div>
        <div>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: colors.text.primary,
            fontFamily: 'Poppins, system-ui, sans-serif',
            marginBottom: '2px',
          }}>
            Pemutar Audio
          </h3>
          <p style={{
            fontSize: '14px',
            color: colors.text.tertiary,
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}>
            {surah ? surah.namaLatin : 'Pilih surah untuk memulai'}
          </p>
        </div>
      </div>

      {surah && (
        <>
          {/* Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '100%',
              height: '8px',
              background: colors.gray[200],
              borderRadius: '100px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}>
              <div style={{
                height: '100%',
                width: `${(currentTime / duration) * 100}%`,
                background: `linear-gradient(90deg, ${colors.teal[400]} 0%, ${colors.teal[600]} 100%)`,
                borderRadius: '100px',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '8px',
            }}>
              <span style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {formatTime(currentTime)}
              </span>
              <span style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <button
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: colors.gray[100],
                border: `2px solid ${colors.gray[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="control-btn"
            >
              <SkipBack size={20} color={colors.text.secondary} />
            </button>

            <button
              onClick={handlePlayPause}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(20, 184, 166, 0.3)',
              }}
              className="play-btn"
            >
              {isPlaying ? (
                <Pause size={28} color={colors.white} />
              ) : (
                <Play size={28} color={colors.white} style={{ marginLeft: '3px' }} />
              )}
            </button>

            <button
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: colors.gray[100],
                border: `2px solid ${colors.gray[200]}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="control-btn"
            >
              <SkipForward size={20} color={colors.text.secondary} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function LatihanTahfidzPage() {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const stats = {
    totalSurah: mockSurahList.length,
    completed: mockSurahList.filter(s => s.progress === 100).length,
    inProgress: mockSurahList.filter(s => s.progress > 0 && s.progress < 100).length,
    avgProgress: Math.round(mockSurahList.reduce((acc, s) => acc + s.progress, 0) / mockSurahList.length),
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleStart = (surah) => {
    setSelectedSurah(surah);
    console.log('Mulai latihan:', surah.namaLatin);
  };

  const handleContinue = (surah) => {
    setSelectedSurah(surah);
    console.log('Lanjutkan latihan:', surah.namaLatin);
  };

  return (
    <GuruLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.teal[50]} 0%, ${colors.gold[50]} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Islamic Geometric Pattern Background - Top Right */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '500px',
          height: '500px',
          opacity: 0.06,
          pointerEvents: 'none',
          zIndex: 1,
        }}>
          <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
            {/* Islamic Star Pattern */}
            <path d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z" fill="#14B8A6" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#EAB308" strokeWidth="3" opacity="0.4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#14B8A6" strokeWidth="2" opacity="0.3" />
            {/* Dome/Arch Shape */}
            <path d="M60,100 Q60,60 100,60 Q140,60 140,100" fill="none" stroke="#EAB308" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>

        {/* Subtle Pattern Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%2314B8A6' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23EAB308' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* Header */}
        <div
          className="dashboard-header"
          style={{
            position: 'relative',
            padding: '32px 48px 24px',
            borderBottom: `1px solid ${colors.gray[200]}`,
            background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
            backdropFilter: 'blur(10px)',
            zIndex: 2,
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.teal[600]} 0%, ${colors.teal[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-title">
                Mode Latihan Tahfidz
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-subtitle">
                Muroja'ah mandiri untuk memperkuat hafalan Al-Qur'an
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: refreshing ? colors.gray[300] : `linear-gradient(135deg, ${colors.gold[500]} 0%, ${colors.gold[600]} 100%)`,
                color: colors.white,
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, system-ui, sans-serif',
                boxShadow: '0 2px 8px rgba(234, 179, 8, 0.3)',
              }}
            >
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="main-content"
          style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards */}
            <div
              className="stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
              }}>
              <StatsCard
                icon={<BookOpen size={20} color={colors.white} />}
                title="Total Surah"
                value={stats.totalSurah}
                color="teal"
              />
              <StatsCard
                icon={<Award size={20} color={colors.white} />}
                title="Selesai"
                value={stats.completed}
                color="emerald"
              />
              <StatsCard
                icon={<Clock size={20} color={colors.white} />}
                title="Dalam Proses"
                value={stats.inProgress}
                color="gold"
              />
              <StatsCard
                icon={<Target size={20} color={colors.white} />}
                title="Rata-rata Progress"
                value={`${stats.avgProgress}%`}
                color="teal"
              />
            </div>

            {/* Audio Player */}
            <AudioPlayer surah={selectedSurah} />

            {/* Surah List */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.gold[100]}`,
            }}
            className="card-container">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '24px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: `linear-gradient(135deg, ${colors.gold[500]} 0%, ${colors.gold[600]} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(234, 179, 8, 0.3)',
                }}>
                  <BookOpen size={22} color={colors.white} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Pilih Surah untuk Latihan
                </h3>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
              }}>
                {mockSurahList.map((surah) => (
                  <SurahCard
                    key={surah.id}
                    surah={surah}
                    onStart={handleStart}
                    onContinue={handleContinue}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Fade-in Animations */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Stats Card Animations */
        .stats-card {
          animation: fadeInScale 0.5s ease-out;
          animation-fill-mode: both;
        }

        .stats-card:nth-child(1) {
          animation-delay: 0.1s;
        }

        .stats-card:nth-child(2) {
          animation-delay: 0.2s;
        }

        .stats-card:nth-child(3) {
          animation-delay: 0.3s;
        }

        .stats-card:nth-child(4) {
          animation-delay: 0.4s;
        }

        .stats-card:hover {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 12px 28px rgba(20, 184, 166, 0.15);
        }

        /* Card Container Animations */
        .card-container {
          transition: all 0.3s ease;
        }

        .card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        /* Surah Card */
        .surah-card {
          transition: all 0.3s ease;
        }

        .surah-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(20, 184, 166, 0.12);
          border-color: ${colors.teal[300]};
        }

        /* Button Animations */
        .action-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.05);
        }

        .action-btn:active {
          transform: translateY(0) scale(1);
        }

        /* Control Buttons */
        .control-btn:hover {
          background: ${colors.gray[200]};
          transform: scale(1.1);
        }

        .play-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(20, 184, 166, 0.4);
        }

        /* Spin Animation */
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 24px 20px 20px !important;
          }

          .dashboard-title {
            font-size: 28px !important;
          }

          .dashboard-subtitle {
            font-size: 14px !important;
          }

          .main-content {
            padding: 24px 20px 32px !important;
          }

          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          .card-container {
            padding: 20px !important;
          }
        }
      `}</style>
    </GuruLayout>
  );
}
