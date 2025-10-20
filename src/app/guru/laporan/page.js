'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  FileText, Download, Calendar, Users, TrendingUp,
  BarChart3, PieChart, FileSpreadsheet, Sparkles,
  Filter
} from 'lucide-react';

// Islamic Modern Color Palette - Sama seperti Dashboard Guru
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
    700: '#B45309',
  },
  gold: {
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
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
    muted: '#9CA3AF',
  },
};

export default function LaporanPage() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('pdf');

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  const laporanTypes = [
    {
      id: 1,
      title: 'Laporan Progress Hafalan',
      description: 'Laporan detail progress hafalan per siswa atau kelas',
      icon: TrendingUp,
      colorScheme: 'emerald',
      formats: ['PDF', 'Excel'],
    },
    {
      id: 2,
      title: 'Laporan Setoran Harian',
      description: 'Rekap setoran hafalan per hari',
      icon: Calendar,
      colorScheme: 'amber',
      formats: ['PDF', 'Excel'],
    },
    {
      id: 3,
      title: 'Laporan Per Siswa',
      description: 'Laporan lengkap per siswa untuk raport',
      icon: Users,
      colorScheme: 'emerald',
      formats: ['PDF'],
    },
    {
      id: 4,
      title: 'Statistik Kelas',
      description: 'Analisis statistik per kelas dengan grafik',
      icon: BarChart3,
      colorScheme: 'amber',
      formats: ['PDF', 'Excel'],
    },
  ];

  const getColorScheme = (scheme) => {
    if (scheme === 'emerald') {
      return {
        bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
        iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
        border: colors.emerald[200],
        hover: colors.emerald[300],
      };
    } else {
      return {
        bg: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`,
        iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
        border: colors.amber[200],
        hover: colors.amber[300],
      };
    }
  };

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
        {/* Islamic Pattern Background */}
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
              }}>
                Laporan & Statistik
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Generate dan unduh laporan hafalan dalam berbagai format
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div style={{
          position: 'relative',
          padding: '24px 48px',
          zIndex: 2,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 6px 20px rgba(247, 200, 115, 0.25)',
            border: `2px solid ${colors.amber[300]}`,
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
                  color: colors.amber[50],
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '32px 48px 48px', zIndex: 2 }}>
          {/* Filter Section */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: `2px solid ${colors.emerald[100]}`,
            marginBottom: '32px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
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
                <Filter size={20} color={colors.white} />
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Pengaturan Laporan
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Periode Laporan
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="hari-ini">Hari Ini</option>
                  <option value="minggu-ini">Minggu Ini</option>
                  <option value="bulan-ini">Bulan Ini</option>
                  <option value="semester-ini">Semester Ini</option>
                  <option value="tahun-ini">Tahun Ajaran Ini</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Kelas
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Semua Kelas</option>
                  <option value="xii-ipa-1">XII IPA 1</option>
                  <option value="xi-ipa-2">XI IPA 2</option>
                  <option value="x-mia-3">X MIA 3</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Format Export
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="both">PDF & Excel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Jenis Laporan */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: colors.text.primary,
            fontFamily: 'Poppins, system-ui, sans-serif',
            marginBottom: '20px',
          }}>
            Jenis Laporan
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {laporanTypes.map((laporan) => {
              const Icon = laporan.icon;
              const scheme = getColorScheme(laporan.colorScheme);

              return (
                <div
                  key={laporan.id}
                  style={{
                    background: scheme.bg,
                    borderRadius: '16px',
                    padding: '18px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    border: `2px solid ${scheme.border}`,
                    transition: 'all 0.3s ease',
                  }}
                  className="laporan-card"
                >
                  <div style={{ marginBottom: '14px', textAlign: 'center' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: scheme.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}>
                      <Icon size={22} color={colors.white} />
                    </div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: colors.text.primary,
                      marginBottom: '6px',
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      lineHeight: '1.3',
                    }}>
                      {laporan.title}
                    </h3>
                    <p style={{
                      fontSize: '11px',
                      color: colors.text.secondary,
                      fontFamily: 'Poppins, system-ui, sans-serif',
                      lineHeight: '1.4',
                    }}>
                      {laporan.description}
                    </p>
                  </div>

                  <div style={{
                    paddingTop: '12px',
                    borderTop: `1px solid ${scheme.border}`,
                  }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {laporan.formats.map((format) => (
                        <span
                          key={format}
                          style={{
                            padding: '3px 10px',
                            background: colors.white,
                            color: colors.text.secondary,
                            fontSize: '10px',
                            borderRadius: '100px',
                            fontWeight: 600,
                            fontFamily: 'Poppins, system-ui, sans-serif',
                          }}
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                        color: colors.white,
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'Poppins, system-ui, sans-serif',
                        boxShadow: '0 4px 12px rgba(26, 147, 111, 0.3)',
                        width: '100%',
                      }}
                      className="generate-btn"
                    >
                      <Download size={14} />
                      Generate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div style={{
            background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: `2px solid ${colors.emerald[100]}`,
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: colors.text.primary,
              fontFamily: 'Poppins, system-ui, sans-serif',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <PieChart size={22} color={colors.emerald[600]} />
              Statistik Cepat ({selectedPeriod.replace('-', ' ')})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px',
            }}>
              <div style={{
                background: colors.white,
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                border: `2px solid ${colors.emerald[100]}`,
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.emerald[600],
                  marginBottom: '6px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>-</p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontWeight: 600,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>Total Setoran</p>
              </div>
              <div style={{
                background: colors.white,
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                border: `2px solid ${colors.amber[100]}`,
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.amber[600],
                  marginBottom: '6px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>-</p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontWeight: 600,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>Siswa Aktif</p>
              </div>
              <div style={{
                background: colors.white,
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                border: `2px solid ${colors.emerald[100]}`,
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.emerald[600],
                  marginBottom: '6px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>-%</p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontWeight: 600,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>Rata-rata Nilai</p>
              </div>
              <div style={{
                background: colors.white,
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
                border: `2px solid ${colors.amber[100]}`,
              }}>
                <p style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.amber[600],
                  marginBottom: '6px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>-</p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontWeight: 600,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>Ayat Dihafal</p>
              </div>
            </div>
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              marginTop: '16px',
              textAlign: 'center',
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              💡 Pilih periode dan kelas untuk melihat statistik detail
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .laporan-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 147, 111, 0.4);
        }
      `}</style>
    </GuruLayout>
  );
}
