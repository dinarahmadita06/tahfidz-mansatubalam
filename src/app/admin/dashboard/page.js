"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  BookMarked,
  GraduationCap,
  UserCheck,
  Sparkles,
  Bell,
  ArrowRight,
  BarChart3,
  FileText
} from 'lucide-react';

// Islamic Modern Color Palette
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
  },
  violet: {
    50: '#F5F3FF',
    100: '#E9D5FF',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
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
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
  },
  success: '#1A936F',
  warning: '#F7C873',
  info: '#3B82F6',
};

// Mock data untuk demo
const mockData = {
  stats: {
    totalSiswa: 142,
    siswaAktif: 136,
    totalJuz: 1847,
    rataRataNilai: 85.4,
    setoranHariIni: 45,
  },
  jadwalSetoran: [
    {
      id: 1,
      waktu: "07:30",
      kelas: "XI IPA 1",
      totalSiswa: 32,
      sudahSetor: 28,
      status: "berlangsung"
    },
    {
      id: 2,
      waktu: "09:15",
      kelas: "XI IPA 2",
      totalSiswa: 30,
      sudahSetor: 30,
      status: "selesai"
    },
    {
      id: 3,
      waktu: "10:30",
      kelas: "XII IPS 1",
      totalSiswa: 28,
      sudahSetor: 12,
      status: "berlangsung"
    },
  ],
  pengumuman: [
    {
      id: 1,
      judul: "Evaluasi Tahfidz Semester Ganjil",
      tanggal: "2025-10-20",
      kategori: "Penting",
      preview: "Evaluasi tahfidz semester ganjil akan dilaksanakan minggu depan..."
    },
    {
      id: 2,
      judul: "Wisuda Tahfidz 30 Juz",
      tanggal: "2025-11-05",
      kategori: "Acara",
      preview: "Selamat kepada 5 siswa yang telah menyelesaikan hafalan 30 juz..."
    },
    {
      id: 3,
      judul: "Lomba Tahfidz Antar Kelas",
      tanggal: "2025-10-25",
      kategori: "Lomba",
      preview: "Pendaftaran lomba tahfidz antar kelas dibuka hingga 23 Oktober..."
    },
  ],
  progressKelas: [
    { kelas: "X IPA 1", progress: 45, siswa: 32, target: 15 },
    { kelas: "X IPA 2", progress: 52, siswa: 30, target: 15 },
    { kelas: "XI IPA 1", progress: 68, siswa: 32, target: 20 },
    { kelas: "XI IPA 2", progress: 71, siswa: 30, target: 20 },
    { kelas: "XII IPA 1", progress: 92, siswa: 28, target: 30 },
  ],
};

// Komponen StatCard
function StatCard({ icon, title, value, subtitle, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    amber: {
      bg: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[600],
      border: colors.amber[200],
    },
    violet: {
      bg: `linear-gradient(135deg, ${colors.violet[100]} 0%, ${colors.violet[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
      value: colors.violet[700],
      border: colors.violet[200],
    },
    blue: {
      bg: `linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)`,
      iconBg: `linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)`,
      value: '#1E40AF',
      border: '#BFDBFE',
    },
  };

  const scheme = colorMap[color];

  return (
    <div style={{
      background: scheme.bg,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
    }}
    className="stats-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '6px',
            fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            letterSpacing: '0.3px',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '32px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            lineHeight: '1.1',
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen JadwalSetoranCard
function JadwalSetoranCard({ jadwalSetoran }) {
  const getStatusConfig = (status) => {
    const configs = {
      selesai: {
        bg: `${colors.success}15`,
        text: colors.success,
        label: 'Selesai',
      },
      berlangsung: {
        bg: `${colors.info}15`,
        text: colors.info,
        label: 'Berlangsung',
      },
      belum_mulai: {
        bg: colors.gray[100],
        text: colors.text.tertiary,
        label: 'Belum Dimulai',
      },
    };
    return configs[status] || configs.belum_mulai;
  };

  return (
    <div style={{
      background: colors.white,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.emerald[100]}`,
      height: '100%',
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
          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(26, 147, 111, 0.2)',
        }}>
          <Calendar size={22} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
        }}>
          Jadwal Setoran Hari Ini
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {jadwalSetoran.map((jadwal) => {
          const statusConfig = getStatusConfig(jadwal.status);
          const progress = Math.round((jadwal.sudahSetor / jadwal.totalSiswa) * 100);

          return (
            <div
              key={jadwal.id}
              style={{
                border: `2px solid ${colors.emerald[100]}`,
                borderRadius: '18px',
                padding: '20px',
                background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.white} 100%)`,
              }}
              className="jadwal-item"
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color={colors.text.secondary} />
                    <span style={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                      fontSize: '14px',
                    }}>
                      {jadwal.waktu}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                  }}>
                    {jadwal.kelas}
                  </span>
                </div>
                <span style={{
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '100px',
                  background: statusConfig.bg,
                  color: statusConfig.text,
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                }}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <span style={{
                    fontSize: '13px',
                    color: colors.text.secondary,
                    fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                  }}>
                    Siswa Setor: {jadwal.sudahSetor}/{jadwal.totalSiswa}
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.emerald[600],
                    fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Komponen PengumumanCard
function PengumumanCard({ pengumuman }) {
  const getKategoriConfig = (kategori) => {
    const configs = {
      Penting: { bg: `${colors.warning}20`, text: colors.amber[700] },
      Acara: { bg: `${colors.success}20`, text: colors.success },
      Lomba: { bg: `${colors.info}20`, text: colors.info },
    };
    return configs[kategori] || configs.Penting;
  };

  return (
    <div style={{
      background: colors.white,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.amber[100]}`,
      height: '100%',
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
          background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(247, 200, 115, 0.3)',
        }}>
          <Bell size={22} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
        }}>
          Pengumuman Terbaru
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {pengumuman.map((item) => {
          const kategoriConfig = getKategoriConfig(item.kategori);

          return (
            <div
              key={item.id}
              style={{
                padding: '18px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.white} 100%)`,
                border: `1px solid ${colors.gray[200]}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="pengumuman-item"
            >
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: kategoriConfig.bg,
                  color: kategoriConfig.text,
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                }}>
                  {item.kategori}
                </span>
              </div>
              <h4 style={{
                fontSize: '15px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '8px',
                fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
              }}>
                {item.judul}
              </h4>
              <p style={{
                fontSize: '13px',
                color: colors.text.tertiary,
                marginBottom: '10px',
                fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                lineHeight: '1.5',
              }}>
                {item.preview}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: colors.text.tertiary,
                fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
              }}>
                <Clock size={14} />
                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Komponen ProgressKelasCard
function ProgressKelasCard({ progressKelas }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.violet[100]}`,
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
          background: `linear-gradient(135deg, ${colors.violet[500]} 0%, ${colors.violet[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
        }}>
          <BarChart3 size={22} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
        }}>
          Progress Kelas
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {progressKelas.map((kelas, index) => (
          <div key={index} style={{ paddingBottom: index < progressKelas.length - 1 ? '18px' : '0', borderBottom: index < progressKelas.length - 1 ? `1px solid ${colors.gray[200]}` : 'none' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}>
              <div>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                  marginBottom: '2px',
                }}>
                  {kelas.kelas}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                }}>
                  {kelas.siswa} siswa • Target: {kelas.target} juz
                </p>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: kelas.progress >= 80 ? colors.success : kelas.progress >= 50 ? colors.amber[600] : colors.text.tertiary,
                fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
              }}>
                {kelas.progress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: colors.gray[200],
              borderRadius: '100px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${kelas.progress}%`,
                background: kelas.progress >= 80
                  ? `linear-gradient(90deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`
                  : kelas.progress >= 50
                  ? `linear-gradient(90deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`
                  : `linear-gradient(90deg, ${colors.gray[400]} 0%, ${colors.gray[500]} 100%)`,
                borderRadius: '100px',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Komponen QuickActionCard
function QuickActionCard({ icon, title, description, href, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      iconBg: `${colors.emerald[500]}20`,
      iconColor: colors.emerald[600],
      hoverBg: `${colors.emerald[500]}10`,
    },
    amber: {
      iconBg: `${colors.amber[400]}20`,
      iconColor: colors.amber[600],
      hoverBg: `${colors.amber[400]}10`,
    },
    violet: {
      iconBg: `${colors.violet[500]}20`,
      iconColor: colors.violet[600],
      hoverBg: `${colors.violet[500]}10`,
    },
  };

  const scheme = colorMap[color];

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: colors.white,
        border: `2px solid ${colors.gray[200]}`,
        borderRadius: '18px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      className="quick-action-card">
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
        }}>
          {icon}
        </div>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: colors.text.primary,
          marginBottom: '6px',
          fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
        }}>
          {title}
        </h4>
        <p style={{
          fontSize: '13px',
          color: colors.text.tertiary,
          fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
          lineHeight: '1.5',
        }}>
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function DashboardTahfidz() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%231A936F' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23F7C873' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
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
          <div>
            <h1 style={{
              fontSize: '36px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px',
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            }}>
              Dashboard Tahfidz
            </h1>
            <p style={{
              fontSize: '15px',
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
            }}>
              Sistem Manajemen Tahfidz - Ringkasan dan Statistik Hafalan Siswa
            </p>
          </div>
        </div>

        {/* Motivasi Harian */}
        <div style={{
          position: 'relative',
          padding: '24px 48px',
          zIndex: 2,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            borderRadius: '20px',
            padding: '24px 28px',
            boxShadow: '0 8px 24px rgba(26, 147, 111, 0.15)',
            border: `2px solid ${colors.emerald[400]}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: `${colors.white}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={24} color={colors.amber[100]} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  color: colors.white,
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '10px',
                  lineHeight: '1.6',
                }}>
                  &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.amber[100],
                  fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '24px',
            }}>
              <StatCard
                icon={<Users size={24} color={colors.white} />}
                title="Total Siswa"
                value={data.stats.totalSiswa}
                subtitle={`${data.stats.siswaAktif} siswa aktif`}
                color="emerald"
              />
              <StatCard
                icon={<BookOpen size={24} color={colors.white} />}
                title="Total Hafalan"
                value={`${data.stats.totalJuz} Juz`}
                subtitle="Keseluruhan siswa"
                color="amber"
              />
              <StatCard
                icon={<Award size={24} color={colors.white} />}
                title="Rata-rata Nilai"
                value={data.stats.rataRataNilai}
                subtitle="Nilai keseluruhan"
                color="violet"
              />
              <StatCard
                icon={<CheckCircle2 size={24} color={colors.white} />}
                title="Setoran Hari Ini"
                value={data.stats.setoranHariIni}
                subtitle="Total setoran masuk"
                color="blue"
              />
            </div>

            {/* Jadwal & Pengumuman */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '24px',
            }}>
              <JadwalSetoranCard jadwalSetoran={data.jadwalSetoran} />
              <PengumumanCard pengumuman={data.pengumuman} />
            </div>

            {/* Progress Kelas */}
            <ProgressKelasCard progressKelas={data.progressKelas} />

            {/* Quick Actions */}
            <div style={{
              background: colors.white,
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
              border: `2px solid ${colors.gray[200]}`,
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 700,
                color: colors.text.primary,
                marginBottom: '20px',
                fontFamily: '"Nunito", "Nunito Rounded", system-ui, sans-serif',
              }}>
                Navigasi Cepat
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '20px',
              }}>
                <QuickActionCard
                  icon={<Users size={24} color={colors.emerald[600]} />}
                  title="Kelola Siswa"
                  description="Tambah, edit, dan kelola data siswa"
                  href="/admin/data-siswa-example"
                  color="emerald"
                />
                <QuickActionCard
                  icon={<UserCheck size={24} color={colors.amber[600]} />}
                  title="Verifikasi Hafalan"
                  description="Periksa dan verifikasi hafalan siswa"
                  href="/admin/validasi-siswa"
                  color="amber"
                />
                <QuickActionCard
                  icon={<FileText size={24} color={colors.violet[600]} />}
                  title="Laporan"
                  description="Lihat laporan dan statistik lengkap"
                  href="/admin/laporan"
                  color="violet"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap');

        /* Stats Card Animations */
        .stats-card {
          transition: all 0.3s ease;
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

        /* Jadwal Item Hover */
        .jadwal-item {
          transition: all 0.3s ease;
        }

        .jadwal-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(26, 147, 111, 0.12);
        }

        /* Pengumuman Item Hover */
        .pengumuman-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: ${colors.amber[200]} !important;
        }

        /* Quick Action Card Hover */
        .quick-action-card:hover {
          transform: translateY(-4px);
          border-color: ${colors.emerald[400]} !important;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
