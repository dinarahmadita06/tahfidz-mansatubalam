'use client';

import { useState } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  BookOpen,
  Target,
  Award,
  Sparkles,
  Download,
  Filter,
  ChevronDown,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import MotivationalCard from '@/components/MotivationalCard';

// Line Chart Component
function LineChart({ data, color = 'emerald' }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.value / maxValue) * 80;
    return `${x},${y}`;
  }).join(' ');

  const colorClasses = {
    emerald: { line: 'stroke-emerald-500', fill: 'fill-emerald-500', gradient: 'from-emerald-500/20' },
    amber: { line: 'stroke-amber-500', fill: 'fill-amber-500', gradient: 'from-amber-500/20' },
    purple: { line: 'stroke-purple-500', fill: 'fill-purple-500', gradient: 'from-purple-500/20' },
    sky: { line: 'stroke-sky-500', fill: 'fill-sky-500', gradient: 'from-sky-500/20' },
  };

  return (
    <div className="relative h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" className={colorClasses[color].gradient} />
            <stop offset="100%" stopOpacity="0" />
          </linearGradient>
        </defs>

        <polyline
          fill={`url(#gradient-${color})`}
          points={`0,100 ${points} 100,100`}
        />

        <polyline
          fill="none"
          stroke="currentColor"
          className={colorClasses[color].line}
          strokeWidth="0.5"
          points={points}
        />

        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 80;
          return (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              cx={x}
              cy={y}
              r="1"
              className={colorClasses[color].fill}
            />
          );
        })}
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 mt-2">
        {data.map((d, i) => (
          <span key={i} className={i === 0 || i === data.length - 1 ? '' : 'hidden md:block'}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, size = 200 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;

          const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
          const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
          const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const largeArc = angle > 180 ? 1 : 0;

          return (
            <motion.path
              key={index}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
              fill={item.color}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}

        {/* Inner circle */}
        <circle cx="50" cy="50" r="25" fill="white" />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-gray-900">{total}</p>
        <p className="text-xs text-gray-600">Total Juz</p>
      </div>
    </div>
  );
}

// Bar Chart Component
function HorizontalBarChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">{item.label}</span>
            <span className="text-gray-600">{item.value}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full ${item.color} rounded-full`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function LaporanHafalanPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('bulanan');
  const [showFilter, setShowFilter] = useState(false);

  // Sample data
  const progressData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 58 },
    { label: 'Apr', value: 65 },
    { label: 'Mei', value: 71 },
    { label: 'Jun', value: 78 },
    { label: 'Jul', value: 85 },
  ];

  const juzDistribution = [
    { label: 'Juz 30', value: 15, color: '#10b981' },
    { label: 'Juz 29', value: 12, color: '#f59e0b' },
    { label: 'Juz 28', value: 8, color: '#8b5cf6' },
    { label: 'Juz 27', value: 5, color: '#06b6d4' },
  ];

  const aspectScores = [
    { label: 'Tajwid', value: 92, color: 'bg-emerald-500' },
    { label: 'Kelancaran', value: 88, color: 'bg-amber-500' },
    { label: 'Makhraj', value: 85, color: 'bg-purple-500' },
    { label: 'Adab', value: 95, color: 'bg-sky-500' },
  ];

  const monthlyStats = [
    { label: 'Total Setoran', value: '24', subtitle: 'kali setor', icon: BookOpen, color: 'emerald', gradient: 'from-emerald-400 to-teal-400' },
    { label: 'Rata-rata Nilai', value: '90', subtitle: 'dari 100', icon: Award, color: 'amber', gradient: 'from-amber-400 to-orange-400' },
    { label: 'Target Tercapai', value: '85%', subtitle: 'progress', icon: Target, color: 'purple', gradient: 'from-purple-400 to-indigo-400' },
    { label: 'Hari Berturut', value: '12', subtitle: 'hari', icon: TrendingUp, color: 'sky', gradient: 'from-sky-400 to-blue-400' },
  ];

  const recentAchievements = [
    { title: 'Hafal 1 Juz', date: '15 Okt 2025', icon: '🏆', color: 'emerald' },
    { title: 'Nilai Sempurna', date: '10 Okt 2025', icon: '⭐', color: 'amber' },
    { title: 'Konsisten 7 Hari', date: '5 Okt 2025', icon: '🔥', color: 'purple' },
  ];

  const handleDownloadReport = () => {
    toast.success('Laporan sedang diunduh...');
  };

  return (
    <SiswaLayout>
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-green-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <BarChart3 className="text-white" size={32} />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Laporan Hafalan</h1>
                    <div className="h-1 w-24 bg-white/30 rounded-full mt-2"></div>
                  </div>
                </div>
                <p className="text-emerald-50 text-lg flex items-center gap-2">
                  <Sparkles size={18} />
                  Statistik dan progress hafalan Al-Qur'an
                </p>
              </div>

              <button
                onClick={handleDownloadReport}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <Download size={20} />
                Unduh Laporan
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Motivational Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <MotivationalCard theme="amber" />
      </motion.div>

      {/* Period Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex items-center gap-3"
      >
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <Filter size={18} />
          <span className="font-semibold text-gray-700">
            {selectedPeriod === 'mingguan' ? 'Mingguan' : selectedPeriod === 'bulanan' ? 'Bulanan' : 'Tahunan'}
          </span>
          <ChevronDown size={18} className={`transition-transform ${showFilter ? 'rotate-180' : ''}`} />
        </button>

        {showFilter && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-2"
          >
            {['mingguan', 'bulanan', 'tahunan'].map((period) => (
              <button
                key={period}
                onClick={() => {
                  setSelectedPeriod(period);
                  setShowFilter(false);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  selectedPeriod === period
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {monthlyStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
              <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Progress Hafalan</h2>
              <p className="text-sm text-gray-600">Perkembangan 7 bulan terakhir</p>
            </div>
          </div>

          <LineChart data={progressData} color="emerald" />

          <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-semibold">Peningkatan Bulan Ini</p>
                <p className="text-2xl font-bold text-emerald-900">+7 Halaman</p>
              </div>
              <div className="p-3 bg-emerald-500 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Juz Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <BookOpen className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Distribusi Juz</h2>
              <p className="text-sm text-gray-600">Hafalan per juz</p>
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <DonutChart data={juzDistribution} size={180} />
          </div>

          <div className="space-y-2">
            {juzDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.value} hal</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aspect Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nilai per Aspek</h2>
              <p className="text-sm text-gray-600">Rata-rata nilai berdasarkan aspek penilaian</p>
            </div>
          </div>

          <HorizontalBarChart data={aspectScores} />

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <p className="text-sm text-emerald-700 font-semibold mb-1">Nilai Tertinggi</p>
              <p className="text-2xl font-bold text-emerald-900">Adab (95)</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
              <p className="text-sm text-purple-700 font-semibold mb-1">Perlu Ditingkatkan</p>
              <p className="text-2xl font-bold text-purple-900">Makhraj (85)</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Trophy className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pencapaian</h2>
              <p className="text-sm text-gray-600">Prestasi terbaru</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentAchievements.map((achievement, index) => {
              const colorClasses = {
                emerald: 'bg-emerald-50 border-emerald-200',
                amber: 'bg-amber-50 border-amber-200',
                purple: 'bg-purple-50 border-purple-200',
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${colorClasses[achievement.color]}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{achievement.title}</p>
                      <p className="text-xs text-gray-600">{achievement.date}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl text-center">
            <p className="text-white font-bold text-lg mb-1">Total Badge</p>
            <p className="text-4xl font-bold text-white">12</p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </SiswaLayout>
  );
}
