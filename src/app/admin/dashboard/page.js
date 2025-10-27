"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  BarChart3 as BarChart3Icon,
  FileText,
  PieChart as PieChartIcon,
  TrendingDown,
  School,
  UserCog,
  Target
} from 'lucide-react';

// Dynamic import untuk Recharts - mengurangi bundle size dan mempercepat initial load
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div> }
);
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div> }
);
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
);
const RechartsPieChart = dynamic(
  () => import('recharts').then(mod => mod.PieChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div> }
);
const Pie = dynamic(
  () => import('recharts').then(mod => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then(mod => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
);

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
    50: '#FAF5FF',
    100: '#E9E5FF',
    200: '#DDD6FE',
  },
  blue: {
    50: '#EFF6FF',
    100: '#E1F2FF',
    200: '#BFDBFE',
  },
  mint: {
    50: '#F0FFF4',
    100: '#D1FAE5',
  },
  coral: {
    100: '#FFE4E6',
    400: '#FB7185',
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
    primary: '#1F2937',
    secondary: '#4B5563',
    tertiary: '#6B7280',
  },
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  danger: '#FC8181',
};

// Mock data untuk demo
const mockData = {
  stats: {
    totalSiswa: 142,
    siswaAktif: 136,
    totalGuru: 12,
    totalJuz: 1847,
    rataRataNilai: 85.4,
    setoranHariIni: 45,
    totalKelas: 18,
    rataRataKehadiran: 94.2,
  },
  trendHafalan: [
    { bulan: 'Mei', aktual: 1520, target: 1500 },
    { bulan: 'Jun', aktual: 1580, target: 1600 },
    { bulan: 'Jul', aktual: 1650, target: 1680 },
    { bulan: 'Agu', aktual: 1720, target: 1750 },
    { bulan: 'Sep', aktual: 1790, target: 1810 },
    { bulan: 'Okt', aktual: 1847, target: 1860 },
  ],
  distribusiKehadiran: [
    { name: 'Hadir', value: 128, color: colors.emerald[500], percent: 90.1 },
    { name: 'Izin', value: 8, color: colors.amber[400], percent: 5.6 },
    { name: 'Absen', value: 6, color: colors.coral[400], percent: 4.3 },
  ],
  progressKelas: [
    { kelas: 'X IPA 1', progress: 45, target: 15, change: -2 },
    { kelas: 'X IPA 2', progress: 52, target: 15, change: 3 },
    { kelas: 'XI IPA 1', progress: 68, target: 20, change: 5 },
    { kelas: 'XI IPA 2', progress: 71, target: 20, change: 15 },
    { kelas: 'XII IPA 1', progress: 92, target: 30, change: 8 },
  ],
  kinerjaguru: [
    { nama: 'Ust. Ahmad', rataJuz: 14.2 },
    { nama: 'Ust. Budi', rataJuz: 12.8 },
    { nama: 'Ustz. Rina', rataJuz: 15.6 },
    { nama: 'Ust. Fajar', rataJuz: 13.4 },
    { nama: 'Ustz. Siti', rataJuz: 14.9 },
  ],
  leaderboardKelas: [
    { rank: 1, kelas: 'XII IPA 1', progress: 92, icon: '🥇' },
    { rank: 2, kelas: 'XI IPA 2', progress: 85, icon: '🥈' },
    { rank: 3, kelas: 'X IPA 3', progress: 81, icon: '🥉' },
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
};

// Komponen StatCard
function StatCard({ icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorMap = {
    emerald: {
      bg: colors.emerald[100],
      iconBg: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
      value: colors.emerald[700],
      border: colors.emerald[200],
    },
    amber: {
      bg: colors.amber[100],
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[600],
      border: colors.amber[200],
    },
    lavender: {
      bg: colors.lavender[100],
      iconBg: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
      value: '#6D28D9',
      border: colors.lavender[200],
    },
    blue: {
      bg: colors.blue[100],
      iconBg: `linear-gradient(135deg, ${colors.info} 0%, #2563EB 100%)`,
      value: '#1E40AF',
      border: colors.blue[200],
    },
    mint: {
      bg: colors.mint[100],
      iconBg: `linear-gradient(135deg, #059669 0%, #047857 100%)`,
      value: '#065F46',
      border: colors.mint[100],
    },
    sky: {
      bg: '#E0F2FE',
      iconBg: `linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)`,
      value: '#075985',
      border: '#BAE6FD',
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
        animation: `slideUp 0.5s ease-out ${delay}s both`,
      }}
      className="stats-card">
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
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text.secondary,
            marginBottom: '6px',
            fontFamily: '"Poppins", system-ui, sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", system-ui, sans-serif',
            lineHeight: '1.2',
            marginBottom: subtitle ? '4px' : '0',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Komponen Tren Hafalan Chart dengan 2 garis
function TrendHafalanChart({ data }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.emerald[200]}`,
      animation: 'slideUp 0.5s ease-out 0.4s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
        }}>
          <TrendingUp size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          Analisis Tren Hafalan (6 Bulan Terakhir)
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
          <XAxis
            dataKey="bulan"
            stroke={colors.text.tertiary}
            style={{ fontSize: '12px', fontFamily: '"Poppins", system-ui, sans-serif' }}
          />
          <YAxis
            stroke={colors.text.tertiary}
            style={{ fontSize: '12px', fontFamily: '"Poppins", system-ui, sans-serif' }}
          />
          <Tooltip
            contentStyle={{
              background: colors.white,
              border: `1px solid ${colors.emerald[200]}`,
              borderRadius: '8px',
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: '12px',
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: '12px',
            }}
          />
          <Line
            type="monotone"
            dataKey="aktual"
            name="Hafalan Aktual"
            stroke={colors.emerald[500]}
            strokeWidth={3}
            dot={{ fill: colors.emerald[500], r: 5 }}
            activeDot={{ r: 7 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            name="Target Sekolah"
            stroke={colors.amber[400]}
            strokeWidth={3}
            dot={{ fill: colors.amber[400], r: 5 }}
            activeDot={{ r: 7 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Komponen Distribusi Kehadiran Chart
function DistribusiKehadiranChart({ data }) {
  const COLORS = data.map(item => item.color);

  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.amber[200]}`,
      animation: 'slideUp 0.5s ease-out 0.5s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(251, 191, 36, 0.2)',
        }}>
          <PieChartIcon size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          Distribusi Kehadiran Siswa
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: colors.white,
              border: `1px solid ${colors.amber[200]}`,
              borderRadius: '8px',
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: '12px',
            }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '16px',
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: item.color,
            }} />
            <span style={{
              fontSize: '12px',
              color: colors.text.secondary,
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              {item.name}: {item.value} ({item.percent}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Komponen Progress Kelas dengan Badge Perubahan
function ProgressKelasChart({ data }) {
  const chartData = data.map(item => ({
    ...item,
    progressPercent: item.progress,
    fill: item.progress >= 80 ? colors.emerald[500] : item.progress >= 50 ? colors.amber[400] : colors.coral[400]
  }));

  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.lavender[200]}`,
      animation: 'slideUp 0.5s ease-out 0.6s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(139, 92, 246, 0.15)',
          }}>
            <BarChart3Icon size={20} color={colors.white} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            fontFamily: '"Poppins", system-ui, sans-serif',
          }}>
            Perbandingan Hafalan Antar Kelas
          </h3>
        </div>
      </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  minWidth: '80px',
                }}>
                  {kelas.kelas}
                </span>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: kelas.progress >= 80 ? colors.success : kelas.progress >= 50 ? colors.amber[600] : colors.coral[400],
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  {kelas.progress}%
                </span>
              </div>
              <div style={{
                padding: '4px 10px',
                borderRadius: '100px',
                background: kelas.change >= 0 ? `${colors.success}15` : `${colors.coral[400]}15`,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '12px' }}>{kelas.change >= 0 ? '🟢' : '🔴'}</span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: kelas.change >= 0 ? colors.success : colors.coral[400],
                  fontFamily: '"Poppins", system-ui, sans-serif',
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
                  ? `linear-gradient(90deg, ${colors.emerald[400]} 0%, ${colors.emerald[600]} 100%)`
                  : kelas.progress >= 50
                  ? `linear-gradient(90deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`
                  : `linear-gradient(90deg, ${colors.coral[400]} 0%, #FB7185 100%)`,
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

// Komponen Kinerja Guru
function KinerjaGuruChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.rataJuz));
  const guruTerbaik = data.reduce((prev, current) => (prev.rataJuz > current.rataJuz) ? prev : current);

  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.mint[100]}`,
      animation: 'slideUp 0.5s ease-out 0.7s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, #059669 0%, #047857 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
        }}>
          <UserCog size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          Kinerja Guru Tahfidz
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.gray[200]} />
          <XAxis
            dataKey="nama"
            stroke={colors.text.tertiary}
            style={{ fontSize: '12px', fontFamily: '"Poppins", system-ui, sans-serif' }}
          />
          <YAxis
            stroke={colors.text.tertiary}
            style={{ fontSize: '12px', fontFamily: '"Poppins", system-ui, sans-serif' }}
          />
          <Tooltip
            contentStyle={{
              background: colors.white,
              border: `1px solid ${colors.mint[100]}`,
              borderRadius: '8px',
              fontFamily: '"Poppins", system-ui, sans-serif',
              fontSize: '12px',
            }}
            formatter={(value) => [`${value} Juz`, 'Rata-rata Hafalan']}
          />
          <Bar dataKey="rataJuz" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.rataJuz >= 15 ? colors.emerald[500] : colors.amber[400]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Highlight Guru Terbaik */}
      <div style={{
        marginTop: '16px',
        padding: '12px 16px',
        background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.mint[100]} 100%)`,
        border: `1px solid ${colors.emerald[200]}`,
        borderRadius: '12px',
      }}>
        <p style={{
          fontSize: '12px',
          color: colors.text.secondary,
          fontFamily: '"Poppins", system-ui, sans-serif',
          lineHeight: '1.5',
        }}>
          ⭐ <strong>Guru dengan rata-rata tertinggi: {guruTerbaik.nama}</strong> ({guruTerbaik.rataJuz} Juz rata-rata per siswa)
        </p>
      </div>
    </div>
  );
}

// Komponen Leaderboard Kelas Terbaik
function LeaderboardKelas({ data }) {
  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.amber[200]}`,
      animation: 'slideUp 0.5s ease-out 0.8s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(251, 191, 36, 0.2)',
        }}>
          <Award size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          🏆 Leaderboard Kelas Terbaik
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: index === 0
                ? `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.amber[100]} 100%)`
                : index === 1
                ? `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.gray[100]} 100%)`
                : `linear-gradient(135deg, ${colors.coral[100]} 0%, #FFE4E6 100%)`,
              border: `2px solid ${index === 0 ? colors.amber[300] : index === 1 ? colors.gray[300] : '#FBCFE8'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease',
            }}
            className="leaderboard-item"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>{item.icon}</span>
              <div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: colors.text.primary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  marginBottom: '2px',
                }}>
                  {item.kelas}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: colors.text.tertiary,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                }}>
                  Peringkat #{item.rank}
                </p>
              </div>
            </div>
            <div style={{
              padding: '8px 16px',
              borderRadius: '100px',
              background: colors.white,
              border: `1px solid ${index === 0 ? colors.amber[300] : colors.gray[300]}`,
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: index === 0 ? colors.amber[600] : colors.text.primary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                {item.progress}%
              </span>
            </div>
          </div>
        ))}
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
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.emerald[200]}`,
      height: '100%',
      animation: 'slideUp 0.5s ease-out 0.9s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)',
        }}>
          <Calendar size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          Jadwal Setoran Hari Ini
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {jadwalSetoran.map((jadwal) => {
          const statusConfig = getStatusConfig(jadwal.status);
          const progress = Math.round((jadwal.sudahSetor / jadwal.totalSiswa) * 100);

          return (
            <div
              key={jadwal.id}
              style={{
                border: `1px solid ${colors.emerald[200]}`,
                borderRadius: '12px',
                padding: '16px',
                background: colors.emerald[50],
              }}
              className="jadwal-item"
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} color={colors.text.secondary} />
                    <span style={{
                      fontWeight: 600,
                      color: colors.text.primary,
                      fontFamily: '"Poppins", system-ui, sans-serif',
                      fontSize: '14px',
                    }}>
                      {jadwal.waktu}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: colors.text.primary,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    {jadwal.kelas}
                  </span>
                </div>
                <span style={{
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '100px',
                  background: statusConfig.bg,
                  color: statusConfig.text,
                  fontFamily: '"Poppins", system-ui, sans-serif',
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
                    fontSize: '12px',
                    color: colors.text.secondary,
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
                    Siswa Setor: {jadwal.sudahSetor}/{jadwal.totalSiswa}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: colors.emerald[600],
                    fontFamily: '"Poppins", system-ui, sans-serif',
                  }}>
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
      Penting: { bg: `${colors.warning}20`, text: colors.amber[600], icon: '⭐' },
      Acara: { bg: `${colors.success}20`, text: colors.success, icon: '🕋' },
      Lomba: { bg: `${colors.info}20`, text: colors.info, icon: '🏆' },
    };
    return configs[kategori] || configs.Penting;
  };

  return (
    <div style={{
      background: colors.white,
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${colors.amber[200]}`,
      height: '100%',
      animation: 'slideUp 0.5s ease-out 1s both',
    }}
    className="card-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(251, 191, 36, 0.2)',
        }}>
          <Bell size={20} color={colors.white} />
        </div>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text.primary,
          fontFamily: '"Poppins", system-ui, sans-serif',
        }}>
          Pengumuman Terbaru
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pengumuman.map((item) => {
          const kategoriConfig = getKategoriConfig(item.kategori);

          return (
            <div
              key={item.id}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: colors.white,
                border: `1px solid ${colors.amber[200]}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="pengumuman-item"
            >
              <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{kategoriConfig.icon}</span>
                <span style={{
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  background: kategoriConfig.bg,
                  color: kategoriConfig.text,
                  fontFamily: '"Poppins", system-ui, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  {item.kategori}
                </span>
              </div>
              <h4 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '6px',
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                {item.judul}
              </h4>
              <p style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                marginBottom: '10px',
                fontFamily: '"Poppins", system-ui, sans-serif',
                lineHeight: '1.6',
              }}>
                {item.preview}
              </p>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: colors.text.tertiary,
                fontFamily: '"Poppins", system-ui, sans-serif',
              }}>
                <Clock size={13} />
                {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Komponen QuickActionCard
function QuickActionCard({ icon, title, description, href, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      iconBg: colors.emerald[100],
      iconColor: colors.emerald[600],
      border: colors.emerald[200],
    },
    amber: {
      iconBg: colors.amber[100],
      iconColor: colors.amber[600],
      border: colors.amber[200],
    },
    violet: {
      iconBg: colors.lavender[100],
      iconColor: '#8B5CF6',
      border: colors.lavender[200],
    },
  };

  const scheme = colorMap[color];

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        background: colors.white,
        border: `1px solid ${scheme.border}`,
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}
      className="quick-action-card">
        <div style={{
          width: '64px',
          height: '64px',
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
          <h4 style={{
            fontSize: '15px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: '4px',
            fontFamily: '"Poppins", system-ui, sans-serif',
          }}>
            {title}
          </h4>
          <p style={{
            fontSize: '12px',
            color: colors.text.tertiary,
            fontFamily: '"Poppins", system-ui, sans-serif',
            lineHeight: '1.5',
          }}>
            {description}
          </p>
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <ArrowRight size={14} color={scheme.iconColor} />
        </div>
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
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 40px 20px',
          zIndex: 2,
        }}>
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
              fontWeight: 400,
              color: colors.text.secondary,
              fontFamily: '"Poppins", system-ui, sans-serif',
            }}>
              Analisis dan Statistik Sistem Tahfidz Al-Qur&apos;an
            </p>
          </div>
        </div>

        {/* Motivasi Harian */}
        <div style={{
          position: 'relative',
          padding: '0 40px 20px',
          zIndex: 2,
        }}>
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

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '24px 40px 40px', zIndex: 2 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {/* Stats Cards - 6 Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}>
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
                delay={0.1}
              />
              <StatCard
                icon={<BookOpen size={22} color={colors.white} />}
                title="Total Hafalan"
                value={`${data.stats.totalJuz} Juz`}
                subtitle="Keseluruhan siswa"
                color="lavender"
                delay={0.2}
              />
              <StatCard
                icon={<Award size={22} color={colors.white} />}
                title="Rata-rata Nilai"
                value={data.stats.rataRataNilai}
                subtitle="Nilai keseluruhan"
                color="blue"
                delay={0.1}
              />
              <StatCard
                icon={<School size={22} color={colors.white} />}
                title="Total Kelas Aktif"
                value={data.stats.totalKelas}
                subtitle="Kelas tahfidz aktif"
                color="mint"
                delay={0.2}
              />
              <StatCard
                icon={<CheckCircle2 size={22} color={colors.white} />}
                title="Rata-rata Kehadiran"
                value={`${data.stats.rataRataKehadiran}%`}
                subtitle="Kehadiran siswa"
                color="sky"
                delay={0.3}
              />
            </div>

            {/* Grid 2 Kolom: Tren Hafalan & Distribusi Kehadiran */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '16px',
            }}>
              <TrendHafalanChart data={data.trendHafalan} />
              <DistribusiKehadiranChart data={data.distribusiKehadiran} />
            </div>

            {/* Progress Kelas dengan Badge */}
            <ProgressKelasChart data={data.progressKelas} />

            {/* Grid 2 Kolom: Kinerja Guru & Leaderboard */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
              gap: '16px',
            }}>
              <KinerjaGuruChart data={data.kinerjaguru} />
              <LeaderboardKelas data={data.leaderboardKelas} />
            </div>

            {/* Grid 2 Kolom: Jadwal & Pengumuman */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '16px',
            }}>
              <JadwalSetoranCard jadwalSetoran={data.jadwalSetoran} />
              <PengumumanCard pengumuman={data.pengumuman} />
            </div>

            {/* Quick Actions / Navigasi Cepat */}
            <div style={{
              background: `linear-gradient(135deg, ${colors.amber[50]} 0%, ${colors.emerald[50]} 100%)`,
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              border: `1px solid ${colors.gray[200]}`,
              animation: 'slideUp 0.5s ease-out 1.1s both',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text.primary,
                marginBottom: '16px',
                fontFamily: '"Poppins", system-ui, sans-serif',
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

        {/* Footer */}
        <div style={{
          position: 'relative',
          padding: '20px 40px',
          borderTop: `1px solid ${colors.gray[200]}`,
          background: colors.white,
          zIndex: 2,
        }}>
          <p style={{
            fontSize: '11px',
            color: colors.text.tertiary,
            fontFamily: '"Poppins", system-ui, sans-serif',
            textAlign: 'center',
          }}>
            Tahfidz App v2.0 • Tahun Ajaran 2024/2025
          </p>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

        /* Slide Up Animation */
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Stats Card Animations */
        .stats-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stats-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.12);
        }

        /* Card Container Animations */
        .card-container {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        /* Jadwal Item Hover */
        .jadwal-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .jadwal-item:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
          background: ${colors.white} !important;
        }

        /* Pengumuman Item Hover */
        .pengumuman-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pengumuman-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.12);
          border-color: ${colors.amber[300]} !important;
        }

        /* Quick Action Card Hover */
        .quick-action-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .quick-action-card:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Leaderboard Item Hover */
        .leaderboard-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.15);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .stats-card {
            min-width: 100%;
          }
        }

        /* Smooth Scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Recharts Tooltip Custom */
        .recharts-tooltip-wrapper {
          outline: none;
        }
      `}</style>
    </AdminLayout>
  );
}
