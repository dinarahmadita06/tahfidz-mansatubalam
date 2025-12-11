"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  FileText,
  PieChart as PieChartIcon,
  School,
  UserCog,
  ArrowRight,
} from 'lucide-react';

// Color Palette
const colors = {
  emerald: {
    50: '#F0FDF4',
    100: '#D8FBE5',
    200: '#A7F3D0',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FFF9E9',
    100: '#FFF3CD',
    200: '#FDE68A',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
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
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#6B7280',
  },
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  danger: '#FC8181',
};

// Mock data
const mockData = {
  stats: {
    totalSiswa: 142,
    siswaAktif: 136,
    totalGuru: 12,
    totalJuz: 1847,
    rataRataNilai: 85.4,
    totalKelas: 18,
    rataRataKehadiran: 94.2,
  },
  progressKelas: [
    { kelas: 'XII IPA 1', progress: 92, change: 8 },
    { kelas: 'XI IPA 2', progress: 71, change: 15 },
    { kelas: 'XI IPA 1', progress: 68, change: 5 },
    { kelas: 'X IPA 2', progress: 52, change: 3 },
    { kelas: 'X IPA 1', progress: 45, change: -2 },
  ],
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
};

// StatCard Component
function StatCard({ icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorMap = {
    emerald: { 
      bg: colors.emerald[100], 
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700], 
      border: colors.emerald[200] 
    },
    amber: { 
      bg: colors.amber[100], 
      iconBg: `linear-gradient(135deg, ${colors.amber[500]} 0%, ${colors.amber[600]} 100%)`,
      value: colors.amber[600], 
      border: colors.amber[200] 
    },
    blue: { 
      bg: '#E1F2FF', 
      iconBg: `linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)`,
      value: '#1E40AF', 
      border: '#BFDBFE' 
    },
    mint: { 
      bg: '#D1FAE5', 
      iconBg: `linear-gradient(135deg, #10B981 0%, #059669 100%)`,
      value: '#065F46', 
      border: '#D1FAE5' 
    },
    lavender: { 
      bg: '#E9E5FF', 
      iconBg: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
      value: '#6D28D9', 
      border: '#DDD6FE' 
    },
    sky: { 
      bg: '#E0F2FE', 
      iconBg: `linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)`,
      value: '#075985', 
      border: '#BAE6FD' 
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div style={{
      background: scheme.bg,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${scheme.border}`,
      transition: 'all 0.3s ease',
      animation: `slideUp 0.3s ease-out ${delay}s both`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '6px',
            textTransform: 'uppercase',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: scheme.value,
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Chart Placeholder
function ChartPlaceholder({ title }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.emerald[200]}`,
      animation: 'slideUp 0.3s ease-out 0.2s both',
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: colors.text.primary,
        marginBottom: '20px',
      }}>
        {title}
      </h3>
      <div style={{
        width: '100%',
        height: '240px',
        background: colors.gray[100],
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: colors.text.tertiary,
        fontSize: '14px',
      }}>
        Interactive chart (loads on client)
      </div>
    </div>
  );
}

// Progress Kelas Chart
function ProgressKelasChart({ data }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid #DDD6FE`,
      animation: 'slideUp 0.3s ease-out 0.3s both',
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: colors.text.primary,
        marginBottom: '20px',
      }}>
        Perbandingan Hafalan Antar Kelas
      </h3>

      <div style={{ marginBottom: '20px' }}>
        {data.map((kelas, index) => (
          <div key={index} style={{
            marginBottom: '16px',
            paddingBottom: index < data.length - 1 ? '16px' : '0',
            borderBottom: index < data.length - 1 ? `1px solid ${colors.gray[200]}` : 'none'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                minWidth: '80px',
              }}>
                {kelas.kelas}
              </span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: kelas.progress >= 80 ? colors.success : kelas.progress >= 50 ? colors.amber[600] : colors.danger,
                }}>
                  {kelas.progress}%
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: kelas.change >= 0 ? colors.success : colors.danger,
                  padding: '4px 10px',
                  borderRadius: '100px',
                  background: kelas.change >= 0 ? `${colors.success}15` : `${colors.danger}15`,
                }}>
                  {kelas.change >= 0 ? '+' : ''}{kelas.change}%
                </span>
              </div>
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
                  ? colors.emerald[500]
                  : kelas.progress >= 50
                  ? colors.amber[400]
                  : colors.danger,
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

// Jadwal Setoran Card
function JadwalSetoranCard({ jadwalSetoran }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.emerald[200]}`,
      animation: 'slideUp 0.3s ease-out 0.45s both',
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: colors.text.primary,
        marginBottom: '20px',
      }}>
        Jadwal Setoran Hari Ini
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jadwalSetoran.map((jadwal) => {
          const progress = Math.round((jadwal.sudahSetor / jadwal.totalSiswa) * 100);
          const statusConfig = {
            selesai: { bg: `${colors.success}15`, text: colors.success, label: 'Selesai' },
            berlangsung: { bg: `${colors.info}15`, text: colors.info, label: 'Berlangsung' },
          };
          const config = statusConfig[jadwal.status] || statusConfig.belum_mulai;

          return (
            <div key={jadwal.id} style={{
              border: `1px solid ${colors.emerald[200]}`,
              borderRadius: '12px',
              padding: '16px',
              background: colors.emerald[50],
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 600, color: colors.text.primary, fontSize: '14px' }}>
                    {jadwal.waktu}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.text.primary }}>
                    {jadwal.kelas}
                  </span>
                </div>
                <span style={{
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '100px',
                  background: config.bg,
                  color: config.text,
                }}>
                  {config.label}
                </span>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '12px', color: colors.text.secondary }}>
                    Siswa Setor: {jadwal.sudahSetor}/{jadwal.totalSiswa}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: colors.emerald[600] }}>
                    {progress}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: colors.gray[200],
                  borderRadius: '100px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`,
                    borderRadius: '100px',
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

// Quick Action Card
function QuickActionCard({ icon, title, description, href, color }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        padding: '20px',
        borderRadius: '12px',
        background: colors.white,
        border: `1px solid ${colors.gray[200]}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <div>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: colors.text.primary, marginBottom: '4px' }}>
            {title}
          </p>
          <p style={{ fontSize: '12px', color: colors.text.tertiary }}>
            {description}
          </p>
        </div>
        <ArrowRight size={20} color={colors.emerald[600]} />
      </div>
    </Link>
  );
}

export default function DashboardTahfidz() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  const getFirstName = (fullName) => {
    if (!fullName) return 'Admin';
    return fullName.split(' ')[0];
  };

  return (
    <AdminLayout>
      <div style={{
        background: `linear-gradient(180deg, #FAFFF8 0%, #FFFBE9 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 40px 20px',
          zIndex: 1,
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '6px',
          }}>
            Dashboard Tahfidz
          </h1>
          <p style={{
            fontSize: '14px',
            fontWeight: 500,
            color: colors.text.secondary,
          }}>
            {greeting}, {getFirstName(session?.user?.name)} • Analisis dan Statistik Sistem Tahfidz Al-Qur'an
          </p>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '0 40px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <StatCard
                icon={<Users size={22} color={colors.white} />}
                title="Total Siswa"
                value={mockData.stats.totalSiswa}
                subtitle={`${mockData.stats.siswaAktif} siswa aktif`}
                color="emerald"
                delay={0}
              />
              <StatCard
                icon={<UserCog size={22} color={colors.white} />}
                title="Total Guru Tahfidz"
                value={mockData.stats.totalGuru}
                subtitle="Guru aktif mengajar"
                color="amber"
                delay={0.05}
              />
              <StatCard
                icon={<BookOpen size={22} color={colors.white} />}
                title="Total Hafalan"
                value={`${mockData.stats.totalJuz} Juz`}
                subtitle="Keseluruhan siswa"
                color="lavender"
                delay={0.1}
              />
              <StatCard
                icon={<Award size={22} color={colors.white} />}
                title="Rata-rata Nilai"
                value={mockData.stats.rataRataNilai}
                subtitle="Nilai keseluruhan"
                color="blue"
                delay={0.05}
              />
              <StatCard
                icon={<School size={22} color={colors.white} />}
                title="Total Kelas Aktif"
                value={mockData.stats.totalKelas}
                subtitle="Kelas tahfidz aktif"
                color="mint"
                delay={0.1}
              />
              <StatCard
                icon={<CheckCircle2 size={22} color={colors.white} />}
                title="Rata-rata Kehadiran"
                value={`${mockData.stats.rataRataKehadiran}%`}
                subtitle="Kehadiran siswa"
                color="sky"
                delay={0.15}
              />
            </div>

            {/* Charts Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              <ChartPlaceholder title="Analisis Tren Hafalan (6 Bulan)" />
              <ChartPlaceholder title="Distribusi Kehadiran Siswa" />
            </div>

            {/* Progress Kelas */}
            <ProgressKelasChart data={mockData.progressKelas} />

            {/* Charts Grid 2 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              <ChartPlaceholder title="Kinerja Guru Tahfidz" />
              <ChartPlaceholder title="Leaderboard Kelas Terbaik" />
            </div>

            {/* Jadwal & Pengumuman Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              <JadwalSetoranCard jadwalSetoran={mockData.jadwalSetoran} />
              <ChartPlaceholder title="Pengumuman Terbaru" />
            </div>

            {/* Quick Actions */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.emerald[50]} 100%)`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: `1px solid ${colors.gray[200]}`,
              animation: 'slideUp 0.3s ease-out 0.5s both',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '16px',
              }}>
                Navigasi Cepat
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <QuickActionCard
                  icon={<Users size={28} color={colors.emerald[600]} />}
                  title="Kelola Pengguna 👥"
                  description="Tambah, edit, dan kelola data pengguna sistem"
                  href="/admin/siswa"
                  color="emerald"
                />
                <QuickActionCard
                  icon={<BookMarked size={28} color={colors.amber[600]} />}
                  title="Monitoring Hafalan 📖"
                  description="Pantau dan verifikasi hafalan siswa secara real-time"
                  href="/admin/validasi-siswa"
                  color="amber"
                />
                <QuickActionCard
                  icon={<FileText size={28} color="#8B5CF6" />}
                  title="Laporan & Statistik 📊"
                  description="Lihat laporan dan analisis data lengkap"
                  href="/admin/laporan/statistik"
                  color="violet"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </AdminLayout>
  );
}
