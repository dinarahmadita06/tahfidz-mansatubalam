'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PengumumanWidget from '@/components/PengumumanWidget';
import {
  BookOpen,
  Users,
  Award,
  UserCog,
  CheckCircle2,
  Target,
  Trophy,
} from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Islamic Modern Color Palette - Emerald & Amber Pastel
const colors = {
  emerald: {
    50: '#F0FDF4',
    100: '#D8FBE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FFF9E9',
    100: '#FFF3CD',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  lavender: {
    100: '#E9E5FF',
    200: '#DDD6FE',
  },
  blue: {
    100: '#E1F2FF',
    200: '#BFDBFE',
  },
  mint: {
    100: '#D1FAE5',
  },
  teal: {
    50: '#F0FDFA',
    100: '#E6FFF4',
    200: '#CCFBF1',
    300: '#99F6E4',
    400: '#5EEAD4',
    500: '#14B8A6',
    600: '#0D9488',
  },
  gold: {
    50: '#FFFBEB',
    100: '#FFF7D1',
    200: '#FEF3C7',
    300: '#FDE68A',
    400: '#FCD34D',
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
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#9CA3AF',
  },
};

// Komponen Skeleton Card untuk loading state
function SkeletonCard({ delay = 0 }) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${colors.gray[100]} 0%, ${colors.gray[200]} 100%)`,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.gray[200]}`,
        animation: `fadeInUp 0.5s ease-out ${delay}s both, pulse 1.5s ease-in-out infinite`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              height: '14px',
              width: '80px',
              background: colors.gray[300],
              borderRadius: '4px',
              marginBottom: '12px',
            }} />
            <div style={{
              height: '32px',
              width: '60px',
              background: colors.gray[300],
              borderRadius: '4px',
            }} />
          </div>
          <div style={{
            background: colors.gray[300],
            borderRadius: '12px',
            width: '46px',
            height: '46px',
          }} />
        </div>
        <div style={{
          height: '12px',
          width: '120px',
          background: colors.gray[300],
          borderRadius: '4px',
        }} />
      </div>
    </div>
  );
}

// Komponen StatCard
function StatCard({ icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorMap = {
    emerald: {
      bg: `linear-gradient(135deg, ${colors.emerald[100]} 0%, ${colors.emerald[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    amber: {
      bg: `linear-gradient(135deg, ${colors.amber[100]} 0%, ${colors.amber[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[600],
      border: colors.amber[200],
    },
    lavender: {
      bg: `linear-gradient(135deg, ${colors.lavender[100]} 0%, ${colors.lavender[200]} 100%)`,
      iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
      value: '#6D28D9',
      border: colors.lavender[200],
    },
    blue: {
      bg: `linear-gradient(135deg, ${colors.blue[100]} 0%, ${colors.blue[200]} 100%)`,
      iconBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      value: '#1E40AF',
      border: colors.blue[200],
    },
    mint: {
      bg: `linear-gradient(135deg, ${colors.mint[100]} 0%, ${colors.emerald[100]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.emerald[400]} 0%, ${colors.emerald[500]} 100%)`,
      value: colors.emerald[600],
      border: colors.emerald[200],
    },
    teal: {
      bg: `linear-gradient(135deg, ${colors.teal[100]} 0%, ${colors.teal[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.teal[500]} 0%, ${colors.teal[600]} 100%)`,
      value: colors.teal[600],
      border: colors.teal[200],
    },
    gold: {
      bg: `linear-gradient(135deg, ${colors.gold[100]} 0%, ${colors.gold[200]} 100%)`,
      iconBg: `linear-gradient(135deg, ${colors.gold[500]} 0%, ${colors.gold[600]} 100%)`,
      value: colors.gold[600],
      border: colors.gold[200],
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      style={{
        background: scheme.bg,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${scheme.border}`,
        transition: 'all 0.3s ease',
        animation: `fadeInUp 0.5s ease-out ${delay}s both`,
      }}
      className="stat-card"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.text.tertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              {title}
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: 700,
              color: scheme.value,
              fontFamily: '"Poppins", system-ui, sans-serif',
              lineHeight: 1.2,
            }}>
              {value}
            </p>
          </div>
          <div style={{
            background: scheme.iconBg,
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}>
            {icon}
          </div>
        </div>
        <p style={{
          fontSize: '12px',
          fontWeight: 500,
          color: colors.text.secondary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState({
    stats: {
      totalSiswa: 0,
      siswaAktif: 0,
      totalGuru: 0,
      totalHafalan: 0,
      totalJuz: 0,
      rataRataNilai: 0,
      rataRataKehadiran: 0,
      siswaMencapaiTarget: 0,
      persentaseSiswaMencapaiTarget: 0,
      kelasMencapaiTarget: 0,
      totalKelas: 0,
    },
  });
  const [chartData, setChartData] = useState({
    donutData: [],
    barData: [],
    siswaStats: {
      mencapai: 0,
      belum: 0,
    },
    kelasStats: {
      mencapai: 0,
      total: 0,
      persentase: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from /api/admin/dashboard
      const response = await fetch('/api/admin/dashboard');

      if (!response.ok) {
        throw new Error('Gagal memuat data dashboard');
      }

      const result = await response.json();
      setData(result);

      // Fetch chart data separately
      await fetchChartData();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Fetch siswa data untuk donut chart
      const siswRes = await fetch('/api/siswa');
      let siswData = siswRes.ok ? await siswRes.json() : [];
      console.log('Siswa API Response:', siswData);
      
      // Handle if response is wrapped in data property
      if (siswData && typeof siswData === 'object' && siswData.data && Array.isArray(siswData.data)) {
        siswData = siswData.data;
      }
      
      // Ensure it's an array
      if (!Array.isArray(siswData)) {
        siswData = [];
      }
      console.log('Processed Siswa Data:', siswData);
      
      // Fetch kelas data untuk bar chart
      const kelasRes = await fetch('/api/kelas');
      let kelasData = kelasRes.ok ? await kelasRes.json() : [];
      console.log('Kelas API Response:', kelasData);
      
      // Ensure it's an array
      if (!Array.isArray(kelasData)) {
        kelasData = [];
      }
      console.log('Processed Kelas Data:', kelasData);
      
      // Hitung statistik siswa mencapai target (≥ 3 juz)
      let siswaMencapai = 0;
      let siswaBelum = 0;
      
      if (Array.isArray(siswData) && siswData.length > 0) {
        siswData.forEach(siswa => {
          try {
            const totalJuzSiswa = siswa.hafalan?.reduce((sum, h) => sum + (h.juz || 0), 0) || 0;
            if (totalJuzSiswa >= 3) {
              siswaMencapai++;
            } else {
              siswaBelum++;
            }
          } catch (e) {
            console.warn('Error processing siswa:', siswa, e);
            siswaBelum++;
          }
        });
      }
      
      // Hitung statistik kelas mencapai target (≥ 50% siswa mencapai target)
      let kelasMencapai = 0;
      let totalKelasAktif = 0;
      
      if (Array.isArray(kelasData) && kelasData.length > 0) {
        kelasData.forEach(kelas => {
          try {
            if (kelas.status === 'AKTIF') {
              totalKelasAktif++;
              const siswaDiKelas = siswData.filter(s => s.kelasId === kelas.id) || [];
              const siswaMencapaiDiKelas = siswaDiKelas.filter(s => {
                const totalJuzSiswa = s.hafalan?.reduce((sum, h) => sum + (h.juz || 0), 0) || 0;
                return totalJuzSiswa >= 3;
              }).length;
              
              const persentaseMencapai = siswaDiKelas.length > 0 
                ? (siswaMencapaiDiKelas / siswaDiKelas.length) * 100 
                : 0;
              
              if (persentaseMencapai >= 50) {
                kelasMencapai++;
              }
            }
          } catch (e) {
            console.warn('Error processing kelas:', kelas, e);
          }
        });
      }
      
      const kelasPersentase = totalKelasAktif > 0 
        ? Math.round((kelasMencapai / totalKelasAktif) * 100) 
        : 0;
      
      // Prepare donut chart data
      const donutChartData = [
        { name: 'Mencapai Target', value: siswaMencapai, fill: colors.emerald[500] },
        { name: 'Belum Mencapai', value: siswaBelum, fill: colors.gray[300] },
      ];
      
      // Prepare bar chart data
      const barChartData = [
        { 
          name: 'Kelas Mencapai Target', 
          value: kelasMencapai, 
          total: totalKelasAktif,
          persentase: kelasPersentase,
        },
      ];
      
      setChartData({
        donutData: donutChartData,
        barData: barChartData,
        siswaStats: { mencapai: siswaMencapai, belum: siswaBelum },
        kelasStats: { mencapai: kelasMencapai, total: totalKelasAktif, persentase: kelasPersentase },
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set default empty chart data
      setChartData({
        donutData: [],
        barData: [],
        siswaStats: { mencapai: 0, belum: 0 },
        kelasStats: { mencapai: 0, total: 0, persentase: 0 },
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Admin';
    return fullName.split(' ')[0];
  };

  const greeting = getGreeting();

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)`,
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
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0l20 20-20 20L0 20z' fill='none' stroke='%2310B981' stroke-width='0.3' opacity='0.03'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          opacity: 0.5,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 40px 20px',
          zIndex: 1,
        }} className="dashboard-header">
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              Dashboard Tahfidz
            </h1>
            <p style={{
              fontSize: '14px',
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              {greeting}, {getFirstName(session?.user?.name)} • Sistem Manajemen Tahfidz Al-Qur&apos;an
            </p>
          </div>
        </div>

        {/* Quote Al-Qur'an */}
        <div style={{
          position: 'relative',
          padding: '0 40px 20px',
          zIndex: 1,
        }} className="dashboard-quote">
          <div style={{
            background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
            border: `1px solid ${colors.emerald[400]}`,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle Light Effect */}
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
              <div style={{
                fontSize: '28px',
                flexShrink: 0,
              }}>
                📖
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: colors.white,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '6px',
                  lineHeight: '1.6',
                }}>
                  &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
                </p>
                <p style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: colors.amber[100],
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pengumuman Widget */}
        <div style={{
          position: 'relative',
          padding: '0 40px 20px',
          zIndex: 1,
        }} className="dashboard-pengumuman">
          <PengumumanWidget limit={3} />
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            position: 'relative',
            padding: '0 40px 20px',
            zIndex: 1,
          }}>
            <div style={{
              background: '#FEE2E2',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #FCA5A5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{
                fontSize: '48px',
              }}>
                ⚠️
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#991B1B',
                  marginBottom: '8px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Gagal Memuat Data
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#DC2626',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  marginBottom: '16px',
                }}>
                  {error}
                </p>
                <button
                  onClick={fetchDashboardData}
                  style={{
                    background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                    color: colors.white,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  Coba Lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!error && (
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '0 40px 40px',
        }} className="dashboard-main-content">
          {/* Stats Cards Grid - 7 Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {loading ? (
              <>
                <SkeletonCard delay={0} />
                <SkeletonCard delay={0.05} />
                <SkeletonCard delay={0.1} />
                <SkeletonCard delay={0.15} />
                <SkeletonCard delay={0.2} />
              </>
            ) : (
              <>
                <StatCard
                  icon={<Users size={22} color={colors.white} />}
                  title="Total Siswa"
                  value={data.stats.totalSiswa}
                  subtitle={`${data.stats.siswaAktif} siswa aktif`}
                  color="emerald"
                  delay={0}
                />
                <StatCard
                  icon={<UserCog size={22} color={colors.white} />}
                  title="Total Guru Tahfidz"
                  value={data.stats.totalGuru}
                  subtitle="Guru aktif mengajar"
                  color="amber"
                  delay={0.05}
                />
                <StatCard
                  icon={<BookOpen size={22} color={colors.white} />}
                  title="Total Hafalan"
                  value={`${data.stats.totalJuz} Juz`}
                  subtitle="Keseluruhan siswa"
                  color="lavender"
                  delay={0.1}
                />
                <StatCard
                  icon={<Award size={22} color={colors.white} />}
                  title="Rata-rata Nilai"
                  value={data.stats.rataRataNilai}
                  subtitle="Nilai keseluruhan"
                  color="blue"
                  delay={0.15}
                />
                <StatCard
                  icon={<CheckCircle2 size={22} color={colors.white} />}
                  title="Rata-rata Kehadiran"
                  value={`${data.stats.rataRataKehadiran}%`}
                  subtitle="Kehadiran siswa"
                  color="mint"
                  delay={0.2}
                />
              </>
            )}
          </div>
        </div>
        {/* Chart Sections - 2 Column Layout */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          padding: '20px 40px 40px',
        }} className="dashboard-charts">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
          }} className="charts-grid">
            {/* Left: Bar Chart - Kelas Mencapai Target */}
            {chartData.kelasStats.total > 0 && (
              <div style={{
                background: colors.white,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: `1px solid ${colors.gray[200]}`,
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  marginBottom: '20px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Statistik Kelas Mencapai Target
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  minHeight: '300px',
                  justifyContent: 'center',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                    }}>
                      <div style={{
                        flex: 1,
                        height: '40px',
                        background: colors.gray[100],
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${chartData.kelasStats.persentase}%`,
                          background: `linear-gradient(90deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                          borderRadius: '8px',
                          transition: 'width 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {chartData.kelasStats.persentase > 0 && (
                            <span style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: colors.white,
                              fontFamily: '"Poppins", system-ui, sans-serif',
                            }}>
                              {chartData.kelasStats.persentase}%
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: colors.text.primary,
                        minWidth: '60px',
                        textAlign: 'right',
                        fontFamily: '"Poppins", system-ui, sans-serif',
                      }}>
                        {chartData.kelasStats.persentase}%
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: colors.text.secondary,
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      marginBottom: '16px',
                    }}>
                      {chartData.kelasStats.mencapai} dari {chartData.kelasStats.total} kelas aktif mencapai target
                    </p>
                  </div>
                </div>
                <div style={{
                  padding: '16px',
                  background: colors.emerald[50],
                  borderRadius: '8px',
                  borderLeft: `4px solid ${colors.emerald[500]}`,
                }}>
                  <p style={{
                    fontSize: '12px',
                    color: colors.text.secondary,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                    margin: 0,
                    lineHeight: '1.5',
                  }}>
                    <span style={{ fontWeight: 700, color: colors.emerald[600] }}>Target:</span> Kelas dianggap mencapai target jika ≥ 50% siswanya telah mencapai target hafalan (≥ 3 juz)
                  </p>
                </div>
              </div>
            )}

            {/* Right: Donut Chart - Siswa Mencapai Target */}
            {chartData.donutData.length > 0 && (chartData.siswaStats.mencapai > 0 || chartData.siswaStats.belum > 0) && (
              <div style={{
                background: colors.white,
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                border: `1px solid ${colors.gray[200]}`,
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  marginBottom: '20px',
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Statistik Siswa Mencapai Target
                </h3>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '300px',
                }}>
                  {typeof window !== 'undefined' && (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData.donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {chartData.donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `${value} siswa`}
                          contentStyle={{
                            background: colors.white,
                            border: `1px solid ${colors.gray[200]}`,
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '30px',
                  marginTop: '20px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.emerald[500],
                      marginBottom: '4px',
                    }}>Mencapai Target</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: colors.text.primary,
                    }}>{chartData.siswaStats.mencapai}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: colors.gray[400],
                      marginBottom: '4px',
                    }}>Belum Mencapai</p>
                    <p style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      color: colors.text.primary,
                    }}>{chartData.siswaStats.belum}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        /* Stat Card Hover */
        .stat-card {
          cursor: default;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08) !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          /* Reduce padding on mobile for wider content */
          .dashboard-header {
            padding: 24px 16px 16px !important;
          }
          
          .dashboard-quote {
            padding: 0 16px 16px !important;
          }
          
          .dashboard-pengumuman {
            padding: 0 16px 16px !important;
          }
          
          .dashboard-main-content {
            padding: 0 16px 24px !important;
          }
          
          .dashboard-charts {
            padding: 16px 16px 24px !important;
          }
          
          .dashboard-stats-grid {
            grid-template-columns: 1fr !important;
          }
          
          .chart-container {
            padding: 16px;
          }
          
          /* Chart Grid Horizontal Scroll on Mobile */
          .charts-grid {
            display: flex !important;
            grid-template-columns: unset !important;
            gap: 24px;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            padding-bottom: 8px;
            /* Hide scrollbar but keep functionality */
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
          }
          
          /* Chrome/Safari scrollbar styling */
          .charts-grid::-webkit-scrollbar {
            height: 6px;
          }
          
          .charts-grid::-webkit-scrollbar-track {
            background: transparent;
          }
          
          .charts-grid::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 3px;
          }
          
          .charts-grid::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
          }
          
          /* Chart items on mobile */
          .charts-grid > div {
            flex-shrink: 0;
            width: min(calc(100vw - 60px), 100%);
            min-width: 350px;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
