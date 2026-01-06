"use client";

import { useState } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { Search, Filter, Play, Award, CheckCircle2, Clock, Volume2, RefreshCw } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// Islamic Modern Color Palette - Warm & Soft (sama dengan dashboard guru)
const colors = {
  // Primary Colors - Emerald
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Secondary Colors - Golden Amber Soft
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Accent - Violet Pastel
  violet: {
    50: '#F5F3FF',
    100: '#E9D5FF',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
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
  // Status Colors
  success: '#1A936F',
  warning: '#F7C873',
  error: '#EF4444',
  info: '#3B82F6',
};

// Mock verification data
const mockVerificationData = [
  {
    id: 1,
    nama: "Ahmad Fadli Rahman",
    kelas: "XI IPA 1",
    surah: "Al-Baqarah",
    ayat: "1-10",
    juz: 1,
    tanggalSetor: "2025-10-18",
    status: "belum_verifikasi",
    nilaiTajwid: null,
    nilaiMakhraj: null,
    nilaiKelancaran: null,
    audioUrl: "/audio/sample.mp3"
  },
  {
    id: 2,
    nama: "Siti Nurhaliza",
    kelas: "X IPA 2",
    surah: "Al-Imran",
    ayat: "1-20",
    juz: 3,
    tanggalSetor: "2025-10-18",
    status: "belum_verifikasi",
    nilaiTajwid: null,
    nilaiMakhraj: null,
    nilaiKelancaran: null,
    audioUrl: "/audio/sample.mp3"
  },
  {
    id: 3,
    nama: "Muhammad Rizki",
    kelas: "XI IPA 1",
    surah: "An-Nisa",
    ayat: "1-15",
    juz: 4,
    tanggalSetor: "2025-10-17",
    status: "terverifikasi",
    nilaiTajwid: 85,
    nilaiMakhraj: 88,
    nilaiKelancaran: 90,
    audioUrl: "/audio/sample.mp3"
  },
  {
    id: 4,
    nama: "Fatimah Zahra",
    kelas: "X IPS 1",
    surah: "Al-Maidah",
    ayat: "1-25",
    juz: 6,
    tanggalSetor: "2025-10-17",
    status: "terverifikasi",
    nilaiTajwid: 92,
    nilaiMakhraj: 90,
    nilaiKelancaran: 88,
    audioUrl: "/audio/sample.mp3"
  },
  {
    id: 5,
    nama: "Abdullah Hasan",
    kelas: "XI IPA 2",
    surah: "Al-An'am",
    ayat: "1-30",
    juz: 7,
    tanggalSetor: "2025-10-18",
    status: "belum_verifikasi",
    nilaiTajwid: null,
    nilaiMakhraj: null,
    nilaiKelancaran: null,
    audioUrl: "/audio/sample.mp3"
  },
];

// Stats Card Component
function StatsCard({ icon, title, value, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      text: colors.text.primary,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    amber: {
      bg: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      text: colors.text.primary,
      value: colors.amber[700],
      border: colors.amber[200],
    },
    violet: {
      bg: `linear-gradient(135deg, ${colors.violet[100]} 0%, ${colors.violet[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
      text: colors.text.primary,
      value: colors.violet[700],
      border: colors.violet[200],
    },
    blue: {
      bg: `linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.info} 0%, #2563EB 100%)`,
      text: colors.text.primary,
      value: '#1D4ED8',
      border: '#BFDBFE',
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

export default function VerifikasiHafalanPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [scores, setScores] = useState({
    tajwid: '',
    makhraj: '',
    kelancaran: '',
  });

  const itemsPerPage = 5;

  // Filter data
  const filteredData = mockVerificationData.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.surah.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchFilter;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Statistics
  const stats = {
    total: mockVerificationData.length,
    pending: mockVerificationData.filter(d => d.status === 'belum_verifikasi').length,
    verified: mockVerificationData.filter(d => d.status === 'terverifikasi').length,
    avgScore: Math.round(
      mockVerificationData
        .filter(d => d.nilaiTajwid !== null)
        .reduce((acc, d) => acc + (d.nilaiTajwid + d.nilaiMakhraj + d.nilaiKelancaran) / 3, 0) /
      mockVerificationData.filter(d => d.nilaiTajwid !== null).length || 0
    ),
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDengarSetoran = (student) => {
    console.log('Playing audio for:', student.nama);
    alert(`Memutar setoran ${student.nama}\nSurah: ${student.surah} (${student.ayat})\n\nNote: Audio player belum diimplementasikan`);
  };

  const handleNilai = (student) => {
    setSelectedStudent(student);
    setScores({
      tajwid: student.nilaiTajwid || '',
      makhraj: student.nilaiMakhraj || '',
      kelancaran: student.nilaiKelancaran || '',
    });
    setShowModal(true);
  };

  const handleSelesai = (student) => {
    if (student.nilaiTajwid === null) {
      alert('Harap berikan nilai terlebih dahulu!');
      return;
    }
    console.log('Marking as complete:', student.nama);
    alert(`Setoran ${student.nama} telah diselesaikan!`);
  };

  const handleSaveScores = () => {
    console.log('Saving scores for:', selectedStudent.nama, scores);
    alert(`Nilai tersimpan!\nTajwid: ${scores.tajwid}\nMakhraj: ${scores.makhraj}\nKelancaran: ${scores.kelancaran}`);
    setShowModal(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      terverifikasi: {
        bg: `${colors.success}15`,
        text: colors.success,
        label: 'Terverifikasi',
      },
      belum_verifikasi: {
        bg: `${colors.warning}15`,
        text: colors.warning,
        label: 'Belum Verifikasi',
      },
    };
    return configs[status] || configs.belum_verifikasi;
  };

  return (
    <GuruLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
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
            <path d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z" fill="#1A936F" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#F7C873" strokeWidth="3" opacity="0.4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#1A936F" strokeWidth="2" opacity="0.3" />
            {/* Dome/Arch Shape */}
            <path d="M60,100 Q60,60 100,60 Q140,60 140,100" fill="none" stroke="#F7C873" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>

        {/* Subtle Pattern Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%231A936F' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23F7C873' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
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
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-title">
                Verifikasi Hafalan
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-subtitle">
                Dengarkan dan verifikasi setoran hafalan siswa
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
                background: refreshing ? colors.gray[300] : `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
                color: colors.white,
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                cursor: refreshing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, system-ui, sans-serif',
                boxShadow: '0 2px 8px rgba(247, 200, 115, 0.3)',
              }}
            >
              {refreshing ? (
                <LoadingIndicator size="small" text="Memuat..." inline className="text-white" />
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Refresh Data</span>
                </>
              )}
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
                icon={<Volume2 size={20} color={colors.white} />}
                title="Total Setoran"
                value={stats.total}
                color="violet"
              />
              <StatsCard
                icon={<Clock size={20} color={colors.white} />}
                title="Menunggu Verifikasi"
                value={stats.pending}
                color="amber"
              />
              <StatsCard
                icon={<CheckCircle2 size={20} color={colors.white} />}
                title="Terverifikasi"
                value={stats.verified}
                color="emerald"
              />
              <StatsCard
                icon={<Award size={20} color={colors.white} />}
                title="Rata-rata Nilai"
                value={stats.avgScore}
                color="blue"
              />
            </div>

            {/* Filter Card */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.emerald[100]}`,
            }}
            className="card-container">
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                {/* Search */}
                <div style={{ flex: '1 1 300px', position: 'relative' }}>
                  <Search
                    size={18}
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
                    placeholder="Cari siswa, kelas, atau surah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 20px 14px 48px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    className="search-input"
                  />
                </div>

                {/* Filter */}
                <div style={{ position: 'relative' }}>
                  <Filter
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.text.tertiary,
                    }}
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{
                      padding: '14px 48px 14px 48px',
                      border: `2px solid ${colors.gray[200]}`,
                      borderRadius: '14px',
                      fontSize: '14px',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      fontWeight: 500,
                      outline: 'none',
                      cursor: 'pointer',
                      background: colors.white,
                    }}
                  >
                    <option value="all">Semua Status</option>
                    <option value="belum_verifikasi">Belum Verifikasi</option>
                    <option value="terverifikasi">Terverifikasi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.violet[100]}`,
            }}
            className="card-container">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{
                      borderBottom: `2px solid ${colors.gray[200]}`,
                    }}>
                      <th style={tableHeaderStyle}>No</th>
                      <th style={tableHeaderStyle}>Siswa</th>
                      <th style={tableHeaderStyle}>Surah & Ayat</th>
                      <th style={tableHeaderStyle}>Tanggal</th>
                      <th style={tableHeaderStyle}>Tajwid</th>
                      <th style={tableHeaderStyle}>Makhraj</th>
                      <th style={tableHeaderStyle}>Kelancaran</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          style={{
                            textAlign: 'center',
                            padding: '48px',
                            color: colors.text.tertiary,
                            fontSize: '14px',
                            fontFamily: 'Poppins, system-ui, sans-serif',
                          }}
                        >
                          Tidak ada data setoran yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((item, index) => {
                        const statusConfig = getStatusConfig(item.status);

                        return (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: `1px solid ${colors.gray[200]}`,
                              transition: 'all 0.2s ease',
                            }}
                            className="table-row"
                          >
                            <td style={tableCellStyle}>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td style={tableCellStyle}>
                              <div>
                                <div style={{ fontWeight: 600, color: colors.text.primary, fontSize: '14px', fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '2px' }}>
                                  {item.nama}
                                </div>
                                <div style={{ fontSize: '13px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                                  {item.kelas}
                                </div>
                              </div>
                            </td>
                            <td style={tableCellStyle}>
                              <div>
                                <div style={{ fontWeight: 600, color: colors.text.primary, fontSize: '14px', fontFamily: 'Poppins, system-ui, sans-serif', marginBottom: '2px' }}>
                                  {item.surah}
                                </div>
                                <div style={{ fontSize: '13px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                                  Ayat {item.ayat} • Juz {item.juz}
                                </div>
                              </div>
                            </td>
                            <td style={tableCellStyle}>
                              <div style={{ fontSize: '13px', fontFamily: 'Poppins, system-ui, sans-serif', color: colors.text.secondary }}>
                                {new Date(item.tanggalSetor).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                              {item.nilaiTajwid !== null ? (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: `${colors.success}15`,
                                    color: colors.success,
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                  }}
                                >
                                  {item.nilaiTajwid}
                                </span>
                              ) : (
                                <span style={{ color: colors.text.muted, fontSize: '14px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                                  -
                                </span>
                              )}
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                              {item.nilaiMakhraj !== null ? (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: `${colors.success}15`,
                                    color: colors.success,
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                  }}
                                >
                                  {item.nilaiMakhraj}
                                </span>
                              ) : (
                                <span style={{ color: colors.text.muted, fontSize: '14px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                                  -
                                </span>
                              )}
                            </td>
                            <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                              {item.nilaiKelancaran !== null ? (
                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: `${colors.success}15`,
                                    color: colors.success,
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                  }}
                                >
                                  {item.nilaiKelancaran}
                                </span>
                              ) : (
                                <span style={{ color: colors.text.muted, fontSize: '14px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
                                  -
                                </span>
                              )}
                            </td>
                            <td style={tableCellStyle}>
                              <span style={{
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 600,
                                borderRadius: '100px',
                                background: statusConfig.bg,
                                color: statusConfig.text,
                                fontFamily: 'Poppins, system-ui, sans-serif',
                              }}>
                                {statusConfig.label}
                              </span>
                            </td>
                            <td style={tableCellStyle}>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => handleDengarSetoran(item)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: `linear-gradient(135deg, ${colors.info} 0%, #2563EB 100%)`,
                                    color: colors.white,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
                                  }}
                                  className="action-btn"
                                >
                                  <Play size={14} />
                                  Dengar
                                </button>
                                <button
                                  onClick={() => handleNilai(item)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
                                    color: colors.white,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                    boxShadow: '0 2px 8px rgba(247, 200, 115, 0.3)',
                                  }}
                                  className="action-btn"
                                >
                                  <Award size={14} />
                                  Nilai
                                </button>
                                <button
                                  onClick={() => handleSelesai(item)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 16px',
                                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                                    color: colors.white,
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    fontFamily: 'Poppins, system-ui, sans-serif',
                                    boxShadow: '0 2px 8px rgba(26, 147, 111, 0.2)',
                                  }}
                                  className="action-btn"
                                >
                                  <CheckCircle2 size={14} />
                                  Selesai
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: `1px solid ${colors.gray[200]}`,
                }}>
                  <div style={{ fontSize: '14px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} setoran
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '10px',
                        background: currentPage === 1 ? colors.gray[100] : colors.white,
                        color: currentPage === 1 ? colors.text.muted : colors.text.primary,
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Poppins, system-ui, sans-serif',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{
                          padding: '8px 16px',
                          border: `2px solid ${currentPage === i + 1 ? colors.emerald[500] : colors.gray[200]}`,
                          borderRadius: '10px',
                          background: currentPage === i + 1
                            ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                            : colors.white,
                          color: currentPage === i + 1 ? colors.white : colors.text.primary,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 600,
                          fontFamily: 'Poppins, system-ui, sans-serif',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${colors.gray[200]}`,
                        borderRadius: '10px',
                        background: currentPage === totalPages ? colors.gray[100] : colors.white,
                        color: currentPage === totalPages ? colors.text.muted : colors.text.primary,
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        fontFamily: 'Poppins, system-ui, sans-serif',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Scoring */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: `2px solid ${colors.emerald[100]}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
            >
              Penilaian Hafalan
            </h2>
            <p style={{ fontSize: '14px', color: colors.text.tertiary, marginBottom: '24px', fontFamily: 'Poppins, system-ui, sans-serif' }}>
              {selectedStudent?.nama} - {selectedStudent?.surah} ({selectedStudent?.ayat})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  Nilai Tajwid (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.tajwid}
                  onChange={(e) => setScores({ ...scores, tajwid: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Masukkan nilai"
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  Nilai Makhraj (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.makhraj}
                  onChange={(e) => setScores({ ...scores, makhraj: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Masukkan nilai"
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}
                >
                  Nilai Kelancaran (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.kelancaran}
                  onChange={(e) => setScores({ ...scores, kelancaran: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: `2px solid ${colors.gray[200]}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    outline: 'none',
                  }}
                  placeholder="Masukkan nilai"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '12px',
                  background: colors.white,
                  color: colors.text.secondary,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  transition: 'all 0.2s ease',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSaveScores}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                  color: colors.white,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  boxShadow: '0 2px 8px rgba(26, 147, 111, 0.2)',
                  transition: 'all 0.2s ease',
                }}
                className="action-btn"
              >
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}

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
          box-shadow: 0 12px 28px rgba(26, 147, 111, 0.15);
        }

        /* Card Container Animations */
        .card-container {
          transition: all 0.3s ease;
        }

        .card-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        /* Search Input Focus */
        .search-input:focus {
          border-color: ${colors.emerald[500]};
          box-shadow: 0 0 0 3px ${colors.emerald[100]};
        }

        /* Table Row Hover */
        .table-row:hover {
          background: ${colors.gray[50]};
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

const tableHeaderStyle = {
  padding: '16px',
  textAlign: 'left',
  fontSize: '13px',
  fontWeight: 700,
  color: colors.text.secondary,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  fontFamily: 'Poppins, system-ui, sans-serif',
};

const tableCellStyle = {
  padding: '20px 16px',
  fontSize: '14px',
  color: colors.text.primary,
  fontFamily: 'Poppins, system-ui, sans-serif',
};
