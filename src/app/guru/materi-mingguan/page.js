"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Eye,
  Plus,
  Edit,
  Sparkles,
  BookMarked,
} from 'lucide-react';

// Islamic Modern Color Palette - Sama seperti Dashboard Guru
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

// Mock Data - Materi Mingguan
const mockMateriMingguan = [
  {
    id: 1,
    mingguKe: 1,
    judul: "Hafalan Surah Al-Mulk Ayat 1-10",
    surah: "Al-Mulk",
    ayatMulai: 1,
    ayatSelesai: 10,
    tanggalMulai: "2025-01-06",
    tanggalSelesai: "2025-01-12",
    status: "aktif",
    totalSiswa: 142,
    siswaSelesai: 98,
    catatan: "Fokus pada tajwid huruf Qalqalah dan Mad Wajib Muttashil",
  },
  {
    id: 2,
    mingguKe: 2,
    judul: "Hafalan Surah Al-Mulk Ayat 11-20",
    surah: "Al-Mulk",
    ayatMulai: 11,
    ayatSelesai: 20,
    tanggalMulai: "2025-01-13",
    tanggalSelesai: "2025-01-19",
    status: "akan_datang",
    totalSiswa: 142,
    siswaSelesai: 0,
    catatan: "Perhatikan makhorijul huruf pada ayat 13-15",
  },
  {
    id: 3,
    mingguKe: 3,
    judul: "Muraja'ah Surah Yasin Ayat 1-20",
    surah: "Yasin",
    ayatMulai: 1,
    ayatSelesai: 20,
    tanggalMulai: "2024-12-30",
    tanggalSelesai: "2025-01-05",
    status: "selesai",
    totalSiswa: 142,
    siswaSelesai: 142,
    catatan: "Muraja'ah materi bulan lalu",
  },
  {
    id: 4,
    mingguKe: 4,
    judul: "Hafalan Surah Ar-Rahman Ayat 1-15",
    surah: "Ar-Rahman",
    ayatMulai: 1,
    ayatSelesai: 15,
    tanggalMulai: "2024-12-23",
    tanggalSelesai: "2024-12-29",
    status: "selesai",
    totalSiswa: 142,
    siswaSelesai: 138,
    catatan: "Fokus pada ayat yang berulang",
  },
];

// Materi Card Component
function MateriCard({ materi }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'aktif':
        return {
          bg: `${colors.success}15`,
          text: colors.success,
          label: 'Aktif',
          icon: <Clock size={14} />,
        };
      case 'selesai':
        return {
          bg: `${colors.info}15`,
          text: colors.info,
          label: 'Selesai',
          icon: <CheckCircle2 size={14} />,
        };
      case 'akan_datang':
        return {
          bg: `${colors.warning}15`,
          text: colors.warning,
          label: 'Akan Datang',
          icon: <Calendar size={14} />,
        };
      default:
        return {
          bg: colors.gray[100],
          text: colors.text.tertiary,
          label: 'Draft',
        };
    }
  };

  const statusConfig = getStatusConfig(materi.status);
  const progress = Math.round((materi.siswaSelesai / materi.totalSiswa) * 100);

  // Format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      style={{
        background: colors.white,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        border: `2px solid ${colors.emerald[100]}`,
        transition: 'all 0.3s ease',
      }}
      className="materi-card"
    >
      {/* Header Card */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        marginBottom: '16px',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '100px',
              background: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.amber[100]} 100%)`,
              color: colors.emerald[700],
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Minggu ke-{materi.mingguKe}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '100px',
              background: statusConfig.bg,
              color: statusConfig.text,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: colors.text.primary,
            fontFamily: 'Poppins, system-ui, sans-serif',
            marginBottom: '8px',
          }}>
            {materi.judul}
          </h3>
        </div>
      </div>

      {/* Info Surah & Ayat */}
      <div style={{
        padding: '16px',
        background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        borderRadius: '14px',
        marginBottom: '16px',
        border: `1px solid ${colors.emerald[100]}`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BookOpen size={20} color={colors.white} />
          </div>
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Surah {materi.surah}
            </p>
            <p style={{
              fontSize: '13px',
              color: colors.text.tertiary,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Ayat {materi.ayatMulai} - {materi.ayatSelesai}
            </p>
          </div>
        </div>
      </div>

      {/* Tanggal */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        padding: '12px',
        background: colors.gray[50],
        borderRadius: '10px',
      }}>
        <Calendar size={16} color={colors.text.tertiary} />
        <span style={{
          fontSize: '13px',
          color: colors.text.secondary,
          fontFamily: 'Poppins, system-ui, sans-serif',
        }}>
          {formatDate(materi.tanggalMulai)} - {formatDate(materi.tanggalSelesai)}
        </span>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <span style={{
            fontSize: '13px',
            color: colors.text.secondary,
            fontFamily: 'Poppins, system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Users size={14} color={colors.text.tertiary} />
            Siswa Selesai: {materi.siswaSelesai}/{materi.totalSiswa}
          </span>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.emerald[600],
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}>
            {progress}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: colors.gray[200],
          borderRadius: '100px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`,
            borderRadius: '100px',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Catatan */}
      {materi.catatan && (
        <div style={{
          padding: '12px',
          background: colors.amber[50],
          borderRadius: '10px',
          borderLeft: `4px solid ${colors.amber[400]}`,
          marginBottom: '16px',
        }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.amber[700],
            marginBottom: '4px',
            fontFamily: 'Poppins, system-ui, sans-serif',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Catatan Guru
          </p>
          <p style={{
            fontSize: '13px',
            color: colors.text.secondary,
            lineHeight: '1.6',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}>
            {materi.catatan}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
      }}>
        <Link
          href={`/guru/materi-mingguan/${materi.id}`}
          style={{
            flex: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            color: colors.white,
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'Poppins, system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(26, 147, 111, 0.2)',
            textDecoration: 'none',
          }}
          className="action-btn"
        >
          <Eye size={16} />
          Lihat Detail Materi
        </Link>
        <button
          style={{
            padding: '12px 16px',
            background: colors.white,
            color: colors.text.secondary,
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '12px',
            border: `2px solid ${colors.gray[300]}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}
          className="edit-btn"
        >
          <Edit size={16} />
        </button>
      </div>
    </div>
  );
}

export default function MateriMingguan() {
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('semua');

  useEffect(() => {
    // Simulasi loading data
    setTimeout(() => {
      setMateriList(mockMateriMingguan);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter materi berdasarkan status
  const filteredMateri = filterStatus === 'semua'
    ? materiList
    : materiList.filter(materi => materi.status === filterStatus);

  if (loading) {
    return (
      <GuruLayout>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: `4px solid ${colors.emerald[200]}`,
              borderTopColor: colors.emerald[500],
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{
              fontSize: '16px',
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Memuat data...
            </p>
          </div>
        </div>
      </GuruLayout>
    );
  }

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
            <path d="M100,20 L120,80 L180,80 L130,120 L150,180 L100,140 L50,180 L70,120 L20,80 L80,80 Z" fill="#1A936F" opacity="0.3" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="#F7C873" strokeWidth="3" opacity="0.4" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="#1A936F" strokeWidth="2" opacity="0.3" />
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
                Materi Mingguan Tahfidz
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-subtitle">
                Kelola target hafalan dan pantau progress siswa setiap minggu
              </p>
            </div>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                color: colors.white,
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Poppins, system-ui, sans-serif',
                boxShadow: '0 2px 8px rgba(26, 147, 111, 0.3)',
              }}
              className="action-btn"
            >
              <Plus size={16} />
              Tambah Materi
            </button>
          </div>
        </div>

        {/* Motivasi Quote */}
        <div
          className="motivasi-container"
          style={{
            position: 'relative',
            padding: '24px 48px',
            zIndex: 2,
          }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 6px 20px rgba(247, 200, 115, 0.15)',
            border: `2px solid ${colors.amber[400]}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${colors.white}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={22} color={colors.white} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.white,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.6',
                }}>
                  &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.amber[100],
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className="main-content"
          style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>

          {/* Filter Tabs */}
          <div style={{
            background: colors.white,
            borderRadius: '16px',
            padding: '8px',
            marginBottom: '24px',
            display: 'inline-flex',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          }}>
            {[
              { value: 'semua', label: 'Semua' },
              { value: 'aktif', label: 'Aktif' },
              { value: 'akan_datang', label: 'Akan Datang' },
              { value: 'selesai', label: 'Selesai' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  background: filterStatus === filter.value
                    ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                    : 'transparent',
                  color: filterStatus === filter.value ? colors.white : colors.text.secondary,
                }}
                className="filter-btn"
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Materi Grid */}
          {filteredMateri.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '24px',
            }}>
              {filteredMateri.map((materi) => (
                <MateriCard key={materi.id} materi={materi} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: colors.white,
              borderRadius: '24px',
              border: `2px dashed ${colors.gray[300]}`,
            }}>
              <BookMarked size={48} color={colors.text.muted} style={{ marginBottom: '16px' }} />
              <p style={{
                fontSize: '16px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Tidak ada materi untuk filter ini
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .materi-card {
          animation: fadeIn 0.5s ease-out;
        }

        .materi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.35);
        }

        .action-btn:active {
          transform: translateY(0) scale(1);
        }

        .edit-btn:hover {
          background: ${colors.gray[50]};
          border-color: ${colors.emerald[400]};
          color: ${colors.emerald[600]};
        }

        .filter-btn:hover {
          background: ${colors.gray[50]};
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

          .motivasi-container {
            padding: 20px !important;
          }

          .main-content {
            padding: 24px 20px 32px !important;
          }

          .materi-card {
            padding: 20px !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-title {
            font-size: 24px !important;
          }
        }
      `}</style>
    </GuruLayout>
  );
}
