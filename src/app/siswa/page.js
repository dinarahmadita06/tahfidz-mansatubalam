'use client';

import { useState, useEffect } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  BookOpen,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  Target,
  Sparkles,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Komponen Progress Ring untuk statistik
function ProgressRing({ progress = 75, color = 'emerald', size = 120, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    sky: 'text-sky-500',
    purple: 'text-purple-500',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colorClasses[color]} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{progress}%</span>
      </div>
    </div>
  );
}

export default function DashboardSiswa() {
  const [currentTime, setCurrentTime] = useState('');
  const [greeting, setGreeting] = useState('');

  // Data dummy untuk dashboard
  const siswaName = 'Ahmad Fauzan';
  const stats = {
    hafalanSelesai: 15,
    totalHafalan: 30,
    rataRataNilai: 85,
    kehadiran: 92,
    totalHari: 30,
    catatanGuru: 3,
  };

  const recentActivities = [
    {
      id: 1,
      type: 'setor',
      title: 'Setor Hafalan Al-Baqarah 1-5',
      status: 'approved',
      time: '2 jam yang lalu',
      icon: BookOpen,
    },
    {
      id: 2,
      type: 'nilai',
      title: 'Nilai Hafalan: 88/100',
      status: 'info',
      time: '5 jam yang lalu',
      icon: Star,
    },
    {
      id: 3,
      type: 'catatan',
      title: 'Catatan dari Ustadz Yusuf',
      status: 'warning',
      time: '1 hari yang lalu',
      icon: MessageSquare,
    },
  ];

  const achievementData = [
    { label: 'Juz 1', progress: 100, color: 'emerald' },
    { label: 'Juz 2', progress: 75, color: 'emerald' },
    { label: 'Juz 3', progress: 45, color: 'amber' },
    { label: 'Juz 4', progress: 20, color: 'sky' },
  ];

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Update current time
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    updateTime();
  }, []);

  const hafalanProgress = Math.round((stats.hafalanSelesai / stats.totalHafalan) * 100);
  const kehadiranProgress = Math.round((stats.kehadiran / stats.totalHari) * 100);

  return (
    <SiswaLayout>
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Greeting Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="text-amber-300" size={28} />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {greeting}, {siswaName}! 👋
              </h1>
            </div>
            <p className="text-emerald-50 text-lg mb-4">{currentTime}</p>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <BookMarked className="text-white" size={18} />
                <span className="text-white font-medium text-sm">
                  {stats.hafalanSelesai} Hafalan Selesai
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Target className="text-white" size={18} />
                <span className="text-white font-medium text-sm">
                  Target: {stats.totalHafalan} Hafalan
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Statistics Cards - 4 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Hafalan Selesai */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
              <BookOpen className="text-white" size={24} />
            </div>
            <ProgressRing progress={hafalanProgress} color="emerald" size={80} strokeWidth={6} />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Hafalan Selesai</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.hafalanSelesai}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">dari {stats.totalHafalan} target</p>
        </motion.div>

        {/* Card 2: Rata-rata Nilai */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500 rounded-xl shadow-md">
              <Star className="text-white" size={24} />
            </div>
            <ProgressRing progress={stats.rataRataNilai} color="amber" size={80} strokeWidth={6} />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Rata-rata Nilai</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.rataRataNilai}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">dari 100</p>
        </motion.div>

        {/* Card 3: Kehadiran */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-sky-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-500 rounded-xl shadow-md">
              <CalendarCheck className="text-white" size={24} />
            </div>
            <ProgressRing progress={kehadiranProgress} color="sky" size={80} strokeWidth={6} />
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Kehadiran</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.kehadiran}</p>
          <p className="text-xs text-sky-600 font-medium mt-1">dari {stats.totalHari} hari</p>
        </motion.div>

        {/* Card 4: Catatan Guru */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500 rounded-xl shadow-md">
              <MessageSquare className="text-white" size={24} />
            </div>
            <div className="flex items-center justify-center w-20 h-20">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">{stats.catatanGuru}</p>
                <p className="text-xs text-purple-600 font-medium">Catatan</p>
              </div>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Catatan Guru</h3>
          <Link
            href="/siswa/penilaian-hafalan"
            className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2 transition-colors"
          >
            Lihat semua <ChevronRight size={16} />
          </Link>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Progress Hafalan per Juz */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Progress Hafalan per Juz</h2>
              <p className="text-sm text-gray-600">Pantau perkembangan hafalanmu</p>
            </div>
          </div>

          <div className="space-y-4">
            {achievementData.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                    className={`h-full rounded-full ${
                      item.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      item.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                      'bg-gradient-to-r from-sky-500 to-blue-500'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            href="/siswa/laporan"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Lihat Laporan Lengkap <ChevronRight size={18} />
          </Link>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Aktivitas Terkini</h2>
              <p className="text-sm text-gray-600">Update terbaru</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              const statusColors = {
                approved: 'bg-emerald-100 text-emerald-700',
                info: 'bg-sky-100 text-sky-700',
                warning: 'bg-amber-100 text-amber-700',
              };

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={`p-2 rounded-lg ${statusColors[activity.status]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button className="mt-4 w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
            Lihat Semua Aktivitas
          </button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-6 shadow-lg border border-emerald-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Award className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Aksi Cepat</h2>
            <p className="text-sm text-gray-600">Mulai aktivitas belajarmu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/siswa/setor-hafalan"
            className="group flex items-center gap-3 p-4 bg-white hover:bg-emerald-50 rounded-xl border-2 border-gray-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2 bg-emerald-100 group-hover:bg-emerald-500 rounded-lg transition-colors">
              <BookOpen className="text-emerald-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Setor Hafalan</span>
          </Link>

          <Link
            href="/siswa/latihan"
            className="group flex items-center gap-3 p-4 bg-white hover:bg-purple-50 rounded-xl border-2 border-gray-100 hover:border-purple-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2 bg-purple-100 group-hover:bg-purple-500 rounded-lg transition-colors">
              <Target className="text-purple-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Mode Latihan</span>
          </Link>

          <Link
            href="/siswa/referensi"
            className="group flex items-center gap-3 p-4 bg-white hover:bg-sky-50 rounded-xl border-2 border-gray-100 hover:border-sky-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2 bg-sky-100 group-hover:bg-sky-500 rounded-lg transition-colors">
              <BookMarked className="text-sky-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Baca Al-Qur'an</span>
          </Link>

          <Link
            href="/siswa/buku-digital"
            className="group flex items-center gap-3 p-4 bg-white hover:bg-amber-50 rounded-xl border-2 border-gray-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2 bg-amber-100 group-hover:bg-amber-500 rounded-lg transition-colors">
              <BookMarked className="text-amber-600 group-hover:text-white transition-colors" size={20} />
            </div>
            <span className="font-semibold text-gray-900 text-sm">Buku Digital</span>
          </Link>
        </div>
      </motion.div>

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
