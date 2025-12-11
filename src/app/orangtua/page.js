'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import ParentingMotivationalCard from '@/components/ParentingMotivationalCard';
import {
  BookOpen,
  Star,
  CalendarCheck,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Heart,
  Sparkles,
  ChevronDown,
  User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Progress Ring untuk statistik
function ProgressRing({ progress = 75, color = 'emerald', size = 100, strokeWidth = 6 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    sky: 'text-sky-500',
    purple: 'text-purple-500',
    lilac: 'text-purple-400',
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
          className={`${colorClasses[color]} transition-all duration-500 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-gray-900">{progress}%</span>
      </div>
    </div>
  );
}

// Line Chart Component (Simple)
function SimpleLineChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="h-48 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full bg-gray-100 rounded-t-lg overflow-hidden relative" style={{ height: '100%' }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg"
            />
          </div>
          <span className="text-xs text-gray-600 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardOrangTua() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [greeting, setGreeting] = useState('');

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Data dummy anak (jika orang tua punya beberapa anak)
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A', avatar: '👦' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B', avatar: '👧' },
  ];

  // Data dummy statistik anak
  const stats = {
    hafalanSelesai: 18,
    totalHafalan: 30,
    rataRataNilai: 88,
    kehadiran: 95,
    totalHari: 30,
  };

  // Data progres bulanan
  const progressData = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 52 },
    { label: 'Mar', value: 60 },
    { label: 'Apr', value: 68 },
    { label: 'Mei', value: 75 },
    { label: 'Jun', value: 82 },
  ];


  // Ambil nama depan dari nama user (mengambil kata pertama)
  const getFirstName = (fullName) => {
    if (!fullName) return 'Orang Tua';
    return fullName.split(' ')[0];
  };

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 15) setGreeting('Selamat Siang');
    else if (hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');

    // Set anak pertama sebagai default
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const hafalanProgress = Math.round((stats.hafalanSelesai / stats.totalHafalan) * 100);
  const kehadiranProgress = Math.round((stats.kehadiran / stats.totalHari) * 100);

  return (
    <OrangtuaLayout>
      <div className="min-h-screen animate-fade-in overflow-x-hidden max-w-full">
        {/* Header dengan Salam */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-8 relative"
        >
          <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 rounded-3xl md:rounded-3xl p-7 md:p-10 shadow-lg relative overflow-hidden">
            {/* Decorative Elements - contained */}
            <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 md:w-40 md:h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="relative z-10">
              {/* Header Content - Flexible Layout */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-5">
                {/* Left: Greeting */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 md:gap-4 mb-3">
                    <Heart className="text-white flex-shrink-0" size={28} />
                    <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white break-words">
                      {greeting}, {getFirstName(session?.user?.name)}! 👋
                    </h1>
                  </div>
                  <p className="text-emerald-50 text-base md:text-lg lg:text-xl">
                    Berikut perkembangan hafalan anak Anda.
                  </p>
                </div>

                {/* Right: Info Anak Card */}
                {selectedChild && (
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 shadow-md hover:bg-white/25 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{selectedChild.avatar}</span>
                        <div>
                          <p className="text-white font-bold text-xl">{selectedChild.name}</p>
                          <p className="text-emerald-100 text-base">Kelas {selectedChild.kelas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Child Selector Dropdown (jika lebih dari 1 anak) */}
              {children.length > 1 && (
                <div className="relative mt-5">
                  <button
                    onClick={() => setShowChildSelector(!showChildSelector)}
                    className="flex items-center gap-3 px-6 py-4 min-h-[56px] bg-white/90 hover:bg-white hover:ring-2 hover:ring-emerald-400/60 backdrop-blur-sm rounded-xl transition-all duration-200 ease-in-out shadow-md min-w-[200px] max-w-[340px]"
                  >
                    <User size={20} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-900 font-semibold text-base flex-1 truncate">
                      {selectedChild ? selectedChild.name : 'Pilih Anak'}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-emerald-600 flex-shrink-0 transition-transform duration-200 ${showChildSelector ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showChildSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[300px] max-w-[420px] w-full md:w-auto border-2 border-emerald-100"
                      >
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              setSelectedChild(child);
                              setShowChildSelector(false);
                            }}
                            className={`w-full px-6 py-5 min-h-[72px] flex items-center gap-4 hover:bg-emerald-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                              selectedChild?.id === child.id ? 'bg-emerald-50' : 'bg-white'
                            }`}
                          >
                            <span className="text-4xl flex-shrink-0">{child.avatar}</span>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate text-base">{child.name}</p>
                              <p className="text-sm text-gray-600">Kelas {child.kelas}</p>
                            </div>
                            {selectedChild?.id === child.id && (
                              <CheckCircle size={24} className="text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Motivational Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <ParentingMotivationalCard theme="mint" />
        </motion.div>

        {/* Statistics Cards - 3 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Card 1: Hafalan Selesai */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.075, duration: 0.2, ease: "easeOut" }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-7 md:p-8 shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-all min-h-[180px]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 bg-emerald-500 rounded-2xl shadow-md">
                <BookOpen className="text-white" size={28} />
              </div>
              <ProgressRing progress={hafalanProgress} color="emerald" size={90} strokeWidth={7} />
            </div>
            <h3 className="text-base font-semibold text-gray-600 mb-2">Hafalan Selesai</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.hafalanSelesai}</p>
            <p className="text-sm text-emerald-600 font-medium mt-2">dari {stats.totalHafalan} target</p>
          </motion.div>

          {/* Card 2: Rata-rata Nilai */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2, ease: "easeOut" }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-7 md:p-8 shadow-lg border-2 border-amber-100 hover:shadow-xl transition-all min-h-[180px]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 bg-amber-500 rounded-2xl shadow-md">
                <Star className="text-white" size={28} />
              </div>
              <ProgressRing progress={stats.rataRataNilai} color="amber" size={90} strokeWidth={7} />
            </div>
            <h3 className="text-base font-semibold text-gray-600 mb-2">Rata-rata Nilai</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.rataRataNilai}</p>
            <p className="text-sm text-amber-600 font-medium mt-2">dari 100</p>
          </motion.div>

          {/* Card 3: Kehadiran */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.125, duration: 0.2, ease: "easeOut" }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-3xl p-7 md:p-8 shadow-lg border-2 border-sky-100 hover:shadow-xl transition-all min-h-[180px]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="p-4 bg-sky-500 rounded-2xl shadow-md">
                <CalendarCheck className="text-white" size={28} />
              </div>
              <ProgressRing progress={kehadiranProgress} color="sky" size={90} strokeWidth={7} />
            </div>
            <h3 className="text-base font-semibold text-gray-600 mb-2">Kehadiran</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.kehadiran}</p>
            <p className="text-sm text-sky-600 font-medium mt-2">dari {stats.totalHari} hari</p>
          </motion.div>
        </div>

        {/* Main Content Grid - 2 Columns */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Left: Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.175, duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Grafik Progres Hafalan</h2>
                <p className="text-sm text-gray-600">6 bulan terakhir</p>
              </div>
            </div>

            <SimpleLineChart data={progressData} />

            <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-800">
                <strong>Trending ↗️:</strong> Progress anak meningkat 15% dalam 3 bulan terakhir!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </OrangtuaLayout>
  );
}
