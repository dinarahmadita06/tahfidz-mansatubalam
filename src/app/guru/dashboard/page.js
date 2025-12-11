"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LayoutGuruSimple from '@/components/guru/LayoutGuruSimple';
import {
  BookOpen,
  Users,
  TrendingUp,
  Clock,
  Play,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  Award,
  Sparkles,
  BookMarked,
  RefreshCw
} from 'lucide-react';

// Islamic Modern Color Palette - Warm & Soft
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

// Mock data functions
const fetchDashboardStats = () => {
  return {
    kelasAjaran: 5,
    jumlahSiswa: 142,
    progressRataRata: 78,
    totalJuz: 12,
  };
};

const fetchJadwalHariIni = () => {
  return [
    {
      id: 1,
      waktu: "07:30",
      kelas: "XI IPA 1",
      totalSiswa: 32,
      sudahDinilai: 28,
      status: "berlangsung"
    },
    {
      id: 2,
      waktu: "09:15",
      kelas: "XI IPA 2",
      totalSiswa: 30,
      sudahDinilai: 30,
      status: "selesai"
    },
    {
      id: 3,
      waktu: "10:30",
      kelas: "XII IPS 1",
      totalSiswa: 28,
      sudahDinilai: 0,
      status: "belum_mulai"
    },
    {
      id: 4,
      waktu: "13:00",
      kelas: "X MIA 3",
      totalSiswa: 35,
      sudahDinilai: 0,
      status: "belum_mulai"
    }
  ];
};

const fetchAgendaHariIni = () => {
  return [
    { id: 1, waktu: "06:30", kegiatan: "Persiapan Sesi Tahfidz", status: "selesai" },
    { id: 2, waktu: "07:00", kegiatan: "Sholat Dhuha Berjamaah", status: "selesai" },
    { id: 3, waktu: "07:30", kegiatan: "Setoran Kelas XI IPA 1", status: "berlangsung" },
    { id: 4, waktu: "09:15", kegiatan: "Setoran Kelas XI IPA 2", status: "berlangsung" },
    { id: 5, waktu: "10:30", kegiatan: "Evaluasi Hafalan Mingguan", status: "akan_datang" },
    { id: 6, waktu: "13:00", kegiatan: "Rapat Koordinasi Guru", status: "akan_datang" }
  ];
};

const fetchRiwayatPenilaianHariIni = () => {
  return [
    {
      id: 1,
      siswa: "Ahmad Fahmi",
      kelas: "XI IPA 1",
      surat: "Al-Baqarah",
      ayat: "1-15",
      nilai: "A",
      waktu: "08:45"
    },
    {
      id: 2,
      siswa: "Nur Aisyah",
      kelas: "XI IPA 2",
      surat: "Al-Mulk",
      ayat: "1-10",
      nilai: "A-",
      waktu: "09:30"
    },
    {
      id: 3,
      siswa: "Bayu Saputra",
      kelas: "XII IPS 1",
      surat: "Ar-Rahman",
      ayat: "1-25",
      nilai: "B+",
      waktu: "10:15"
    },
    {
      id: 4,
      siswa: "Dewi Kartika",
      kelas: "X MIA 3",
      surat: "Al-Waqiah",
      ayat: "1-20",
      nilai: "A",
      waktu: "11:00"
    }
  ];
};

// Stats Card Component - Compact Style (like Student Dashboard)
function StatsCard({ icon, title, value, subtitle, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      bgFrom: colors.emerald[50],
      bgTo: '#D1FAE5',
      iconBg: colors.emerald[500],
      border: colors.emerald[100],
      text: colors.emerald[600],
    },
    amber: {
      bgFrom: colors.amber[50],
      bgTo: '#FFEDD5',
      iconBg: colors.amber[500],
      border: colors.amber[100],
      text: colors.amber[700],
    },
    sky: {
      bgFrom: '#F0F9FF',
      bgTo: '#E0F2FE',
      iconBg: '#0EA5E9',
      border: '#BAE6FD',
      text: '#0284C7',
    },
    violet: {
      bgFrom: colors.violet[50],
      bgTo: '#EDE9FE',
      iconBg: colors.violet[500],
      border: colors.violet[100],
      text: colors.violet[700],
    },
  };

  const scheme = colorMap[color];

  return (
    <div style={{
      background: `linear-gradient(to bottom right, ${scheme.bgFrom} 0%, ${scheme.bgTo} 100%)`,
      borderRadius: '24px',
      padding: '32px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }}
    className="stats-card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
        }}>
          {icon}
        </div>
      </div>
      <div>
        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: colors.text.secondary,
          marginBottom: '8px',
          fontFamily: 'Poppins, system-ui, sans-serif',
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '36px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: 'Poppins, system-ui, sans-serif',
          lineHeight: '1',
          marginBottom: '4px',
        }}>
          {value}
        </p>
        {subtitle && (
          <p style={{
            fontSize: '13px',
            fontWeight: 500,
            color: scheme.text,
            fontFamily: 'Poppins, system-ui, sans-serif',
            marginTop: '8px',
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Jadwal Sesi Card Component
function JadwalSesiCard({ jadwalHariIni }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'selesai':
        return {
          bg: `${colors.success}15`,
          text: colors.success,
          label: 'Selesai',
        };
      case 'berlangsung':
        return {
          bg: `${colors.info}15`,
          text: colors.info,
          label: 'Berlangsung',
        };
      case 'belum_mulai':
        return {
          bg: colors.gray[100],
          text: colors.text.tertiary,
          label: 'Belum Dimulai',
        };
      default:
        return {
          bg: colors.gray[100],
          text: colors.text.tertiary,
          label: 'Belum Dimulai',
        };
    }
  };

  return (
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
          fontFamily: 'Poppins, system-ui, sans-serif',
        }}>
          Jadwal Setoran Hari Ini
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {jadwalHariIni.map((jadwal) => {
          const statusConfig = getStatusConfig(jadwal.status);
          const progress = Math.round((jadwal.sudahDinilai / jadwal.totalSiswa) * 100);

          return (
            <div
              key={jadwal.id}
              style={{
                border: `2px solid ${colors.emerald[100]}`,
                borderRadius: '18px',
                padding: '22px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color={colors.text.secondary} />
                    <span style={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontFamily: 'Poppins, system-ui, sans-serif',
                    }}>
                      {jadwal.waktu}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    {jadwal.kelas}
                  </span>
                </div>
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
              </div>

              {/* Progress Bar */}
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
                  }}>
                    Siswa Dinilai: {jadwal.sudahDinilai}/{jadwal.totalSiswa}
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

              {/* Action Button */}
              {jadwal.status !== 'selesai' && (
                <Link href={`/guru/penilaian?kelas=${jadwal.kelas}&jadwal=${jadwal.id}`}>
                  <button style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    color: colors.white,
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    boxShadow: '0 2px 8px rgba(0, 166, 126, 0.2)',
                  }}
                  className="action-btn">
                    <Play size={16} />
                    {jadwal.status === 'berlangsung' ? 'Lanjutkan Sesi' : 'Mulai Sesi'}
                  </button>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Agenda Card Component
function AgendaCard({ agendaHariIni }) {
  const getAgendaConfig = (status) => {
    const configs = {
      selesai: {
        iconBg: `${colors.success}20`,
        iconColor: colors.success,
        badgeBg: `${colors.success}15`,
        badgeText: colors.success,
        label: 'Selesai',
      },
      berlangsung: {
        iconBg: `${colors.info}20`,
        iconColor: colors.info,
        badgeBg: `${colors.info}15`,
        badgeText: colors.info,
        label: 'Berlangsung',
      },
      akan_datang: {
        iconBg: colors.gray[100],
        iconColor: colors.text.tertiary,
        badgeBg: colors.gray[100],
        badgeText: colors.text.tertiary,
        label: 'Akan Datang',
      },
    };
    return configs[status] || configs.akan_datang;
  };

  return (
    <div style={{
      background: colors.white,
      borderRadius: '24px',
      padding: '28px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
      border: `2px solid ${colors.amber[100]}`,
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
          <BookMarked size={22} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: 'Poppins, system-ui, sans-serif',
        }}>
          Agenda Hari Ini
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {agendaHariIni.map((agenda, index) => {
          const config = getAgendaConfig(agenda.status);

          return (
            <div
              key={agenda.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 0',
                borderBottom: index < agendaHariIni.length - 1 ? `1px solid ${colors.gray[200]}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: config.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Clock size={16} color={config.iconColor} />
                </div>
                <div>
                  <p style={{
                    fontWeight: 500,
                    color: colors.text.primary,
                    fontSize: '14px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    marginBottom: '2px',
                  }}>
                    {agenda.kegiatan}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: colors.text.tertiary,
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    {agenda.waktu}
                  </p>
                </div>
              </div>
              <span style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '100px',
                background: config.badgeBg,
                color: config.badgeText,
                fontFamily: 'Poppins, system-ui, sans-serif',
                whiteSpace: 'nowrap',
              }}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.gray[200]}`,
      }}>
        <Link
          href="/guru/agenda"
          style={{
            color: colors.emerald[600],
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}
        >
          Lihat Agenda Lengkap →
        </Link>
      </div>
    </div>
  );
}

// Riwayat Penilaian Card Component
function RiwayatPenilaianCard({ riwayatPenilaian }) {
  const getNilaiConfig = (nilai) => {
    if (nilai.includes('A')) return {
      bg: `${colors.success}15`,
      text: colors.success,
    };
    if (nilai.includes('B')) return {
      bg: `${colors.amber[500]}15`,
      text: colors.amber[700],
    };
    if (nilai.includes('C')) return {
      bg: `${colors.warning}15`,
      text: colors.warning,
    };
    return {
      bg: `${colors.error}15`,
      text: colors.error,
    };
  };

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
          <CheckCircle2 size={22} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: colors.text.primary,
          fontFamily: 'Poppins, system-ui, sans-serif',
        }}>
          Riwayat Penilaian Hari Ini
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {riwayatPenilaian.map((riwayat, index) => {
          const nilaiConfig = getNilaiConfig(riwayat.nilai);

          return (
            <div
              key={riwayat.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 0',
                borderBottom: index < riwayatPenilaian.length - 1 ? `1px solid ${colors.gray[200]}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: `${colors.emerald[500]}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <User size={20} color={colors.emerald[600]} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontSize: '15px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    marginBottom: '4px',
                  }}>
                    {riwayat.siswa}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: colors.text.tertiary,
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    {riwayat.kelas}
                  </p>
                </div>
                <div className="hidden-mobile" style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: colors.text.primary,
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    marginBottom: '2px',
                  }}>
                    {riwayat.surat}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: colors.text.tertiary,
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Ayat {riwayat.ayat}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  padding: '6px 14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  background: nilaiConfig.bg,
                  color: nilaiConfig.text,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  minWidth: '48px',
                  textAlign: 'center',
                }}>
                  {riwayat.nilai}
                </span>
                <span style={{
                  fontSize: '13px',
                  color: colors.text.tertiary,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  minWidth: '50px',
                }}>
                  {riwayat.waktu}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.gray[200]}`,
      }}>
        <Link
          href="/guru/laporan"
          style={{
            color: colors.emerald[600],
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none',
            fontFamily: 'Poppins, system-ui, sans-serif',
          }}
        >
          Lihat Laporan Lengkap →
        </Link>
      </div>
    </div>
  );
}

export default function DashboardGuru() {
  const [stats, setStats] = useState(null);
  const [jadwalHariIni, setJadwalHariIni] = useState([]);
  const [agendaHariIni, setAgendaHariIni] = useState([]);
  const [riwayatPenilaian, setRiwayatPenilaian] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setTimeout(() => {
      setStats(fetchDashboardStats());
      setJadwalHariIni(fetchJadwalHariIni());
      setAgendaHariIni(fetchAgendaHariIni());
      setRiwayatPenilaian(fetchRiwayatPenilaianHariIni());
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }, 1000);
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <LayoutGuruSimple>
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
              Memuat dashboard...
            </p>
          </div>
        </div>
      </LayoutGuruSimple>
    );
  }

  return (
    <LayoutGuruSimple>
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
                Dashboard Guru Tahfidz
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}
              className="dashboard-subtitle">
                Selamat datang kembali! Berikut adalah ringkasan aktivitas tahfidz hari ini.
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
              <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {refreshing ? 'Memuat...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Motivasi Harian (Hadits/Ayat) */}
        <div
          className="motivasi-container"
          style={{
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
                  fontFamily: 'Poppins, system-ui, sans-serif',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stats Cards - Compact 4 Column Grid */}
            <div
              className="stats-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
              }}>
              <StatsCard
                icon={<GraduationCap size={28} color={colors.white} />}
                title="Kelas Diampu"
                value={stats?.kelasAjaran}
                subtitle="kelas aktif"
                color="emerald"
              />
              <StatsCard
                icon={<Users size={28} color={colors.white} />}
                title="Jumlah Siswa"
                value={stats?.jumlahSiswa}
                subtitle="siswa terdaftar"
                color="amber"
              />
              <StatsCard
                icon={<Award size={28} color={colors.white} />}
                title="Progres Rata-rata"
                value={`${stats?.progressRataRata}%`}
                subtitle="dari target"
                color="sky"
              />
              <StatsCard
                icon={<BookOpen size={28} color={colors.white} />}
                title="Total Juz"
                value={stats?.totalJuz}
                subtitle="juz diampu"
                color="violet"
              />
            </div>

            {/* Main Grid Layout */}
            <div
              className="cards-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
              }}>
              <JadwalSesiCard jadwalHariIni={jadwalHariIni} />
              <AgendaCard agendaHariIni={agendaHariIni} />
            </div>

            {/* Riwayat Penilaian - Full Width */}
            <RiwayatPenilaianCard riwayatPenilaian={riwayatPenilaian} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Fade-in Animations */
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
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        /* Card Container Animations */
        .card-container {
          animation: fadeIn 0.6s ease-out;
          animation-fill-mode: both;
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

        /* Button Animations */
        .action-btn {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .action-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.35);
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
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }

          .cards-grid {
            grid-template-columns: 1fr !important;
          }
        }

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

          .stats-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .stats-card {
            min-width: 100%;
          }

          .cards-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .card-container {
            padding: 20px !important;
          }

          .hidden-mobile {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .dashboard-title {
            font-size: 24px !important;
          }

          .stats-card {
            padding: 18px !important;
          }

          .stats-card > div {
            gap: 12px !important;
          }

          .stats-card h2 {
            font-size: 24px !important;
          }
        }

        @media (min-width: 769px) {
          .hidden-desktop {
            display: none !important;
          }
        }
      `}</style>
    </LayoutGuruSimple>
  );
}
