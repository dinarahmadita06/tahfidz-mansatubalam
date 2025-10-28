'use client';

import { useState } from 'react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Thermometer,
  XCircle,
  Calendar,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mini Chart Component untuk grafik bulanan
function AttendanceChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((week, index) => {
        const height = (week.total / maxValue) * 100;
        const hadirHeight = (week.hadir / week.total) * 100;
        const izinHeight = (week.izin / week.total) * 100;
        const sakitHeight = (week.sakit / week.total) * 100;
        const alfaHeight = (week.alfa / week.total) * 100;

        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col-reverse h-24 gap-0.5 relative group">
              {/* Hadir */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${hadirHeight}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-emerald-500 rounded-t-sm relative"
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  Hadir: {week.hadir}
                </div>
              </motion.div>
              {/* Izin */}
              {week.izin > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${izinHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                  className="bg-amber-500"
                />
              )}
              {/* Sakit */}
              {week.sakit > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${sakitHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  className="bg-sky-500"
                />
              )}
              {/* Alfa */}
              {week.alfa > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${alfaHeight}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  className="bg-rose-500"
                />
              )}
            </div>
            <span className="text-xs text-gray-600 font-medium">{week.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PresensiSiswaPage() {
  const [currentMonth, setCurrentMonth] = useState(9); // Oktober = 9 (0-indexed)
  const [currentYear] = useState(2025);

  // Data presensi
  const presensiData = [
    { tanggal: '2025-10-28', hari: 'Senin', status: 'hadir', waktu: '07:45', keterangan: null },
    { tanggal: '2025-10-27', hari: 'Minggu', status: 'hadir', waktu: '07:50', keterangan: null },
    { tanggal: '2025-10-26', hari: 'Sabtu', status: 'hadir', waktu: '07:40', keterangan: null },
    { tanggal: '2025-10-25', hari: 'Jumat', status: 'izin', waktu: null, keterangan: 'Keperluan keluarga' },
    { tanggal: '2025-10-24', hari: 'Kamis', status: 'hadir', waktu: '07:48', keterangan: null },
    { tanggal: '2025-10-23', hari: 'Rabu', status: 'hadir', waktu: '07:42', keterangan: null },
    { tanggal: '2025-10-22', hari: 'Selasa', status: 'sakit', waktu: null, keterangan: 'Demam' },
    { tanggal: '2025-10-21', hari: 'Senin', status: 'hadir', waktu: '07:55', keterangan: null },
    { tanggal: '2025-10-20', hari: 'Minggu', status: 'hadir', waktu: '07:38', keterangan: null },
    { tanggal: '2025-10-19', hari: 'Sabtu', status: 'alfa', waktu: null, keterangan: 'Tidak ada keterangan' },
  ];

  // Statistik
  const stats = {
    hadir: presensiData.filter(p => p.status === 'hadir').length,
    izin: presensiData.filter(p => p.status === 'izin').length,
    sakit: presensiData.filter(p => p.status === 'sakit').length,
    alfa: presensiData.filter(p => p.status === 'alfa').length,
  };

  const totalHari = presensiData.length;
  const persentaseHadir = Math.round((stats.hadir / totalHari) * 100);

  // Data chart mingguan
  const chartData = [
    { label: 'Mg 1', hadir: 5, izin: 0, sakit: 0, alfa: 0, total: 5 },
    { label: 'Mg 2', hadir: 4, izin: 1, sakit: 0, alfa: 0, total: 5 },
    { label: 'Mg 3', hadir: 5, izin: 0, sakit: 1, alfa: 0, total: 6 },
    { label: 'Mg 4', hadir: 4, izin: 0, sakit: 0, alfa: 1, total: 5 },
  ];

  const getStatusConfig = (status) => {
    const configs = {
      hadir: {
        label: 'Hadir',
        icon: CheckCircle,
        color: 'emerald',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        badge: 'bg-emerald-500',
        border: 'border-emerald-200',
      },
      izin: {
        label: 'Izin',
        icon: Clock,
        color: 'amber',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        badge: 'bg-amber-500',
        border: 'border-amber-200',
      },
      sakit: {
        label: 'Sakit',
        icon: Thermometer,
        color: 'sky',
        bg: 'bg-sky-50',
        text: 'text-sky-700',
        badge: 'bg-sky-500',
        border: 'border-sky-200',
      },
      alfa: {
        label: 'Alfa',
        icon: XCircle,
        color: 'rose',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        badge: 'bg-rose-500',
        border: 'border-rose-200',
      },
    };
    return configs[status] || configs.hadir;
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <SiswaLayout>
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <CalendarCheck className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Presensi</h1>
                <div className="h-1 w-24 bg-white/30 rounded-full mt-2"></div>
              </div>
            </div>
            <p className="text-emerald-50 text-lg flex items-center gap-2">
              <Sparkles size={18} />
              Riwayat kehadiran dan statistik bulanan
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Hadir */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-emerald-500 rounded-xl">
              <CheckCircle className="text-white" size={24} />
            </div>
            <span className="text-sm font-semibold text-emerald-700">Hadir</span>
          </div>
          <p className="text-4xl font-bold text-emerald-900">{stats.hadir}</p>
          <p className="text-xs text-emerald-600 mt-1">{persentaseHadir}% kehadiran</p>
        </motion.div>

        {/* Izin */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-amber-500 rounded-xl">
              <Clock className="text-white" size={24} />
            </div>
            <span className="text-sm font-semibold text-amber-700">Izin</span>
          </div>
          <p className="text-4xl font-bold text-amber-900">{stats.izin}</p>
          <p className="text-xs text-amber-600 mt-1">hari</p>
        </motion.div>

        {/* Sakit */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-sky-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-sky-500 rounded-xl">
              <Thermometer className="text-white" size={24} />
            </div>
            <span className="text-sm font-semibold text-sky-700">Sakit</span>
          </div>
          <p className="text-4xl font-bold text-sky-900">{stats.sakit}</p>
          <p className="text-xs text-sky-600 mt-1">hari</p>
        </motion.div>

        {/* Alfa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-6 shadow-lg border border-rose-100"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-rose-500 rounded-xl">
              <XCircle className="text-white" size={24} />
            </div>
            <span className="text-sm font-semibold text-rose-700">Alfa</span>
          </div>
          <p className="text-4xl font-bold text-rose-900">{stats.alfa}</p>
          <p className="text-xs text-rose-600 mt-1">hari</p>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kehadiran Bulanan</h2>
              <p className="text-sm text-gray-600">{monthNames[currentMonth]} {currentYear}</p>
            </div>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentMonth(Math.max(0, currentMonth - 1))}
              disabled={currentMonth === 0}
              className={`p-2 rounded-lg transition-colors ${
                currentMonth === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentMonth(Math.min(11, currentMonth + 1))}
              disabled={currentMonth === 11}
              className={`p-2 rounded-lg transition-colors ${
                currentMonth === 11
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <AttendanceChart data={chartData} />

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-gray-600">Hadir</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-sm text-gray-600">Izin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-sky-500 rounded"></div>
            <span className="text-sm text-gray-600">Sakit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500 rounded"></div>
            <span className="text-sm text-gray-600">Alfa</span>
          </div>
        </div>
      </motion.div>

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Calendar className="text-emerald-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Riwayat Kehadiran</h2>
            <p className="text-sm text-gray-600">Detail presensi harian</p>
          </div>
        </div>

        <div className="space-y-3">
          {presensiData.map((presensi, index) => {
            const statusConfig = getStatusConfig(presensi.status);
            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.03 }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 ${statusConfig.border} ${statusConfig.bg} hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 ${statusConfig.badge} rounded-xl`}>
                    <StatusIcon className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-900">{presensi.hari}</p>
                      <span className="text-gray-400">•</span>
                      <p className="text-sm text-gray-600">{presensi.tanggal}</p>
                    </div>
                    {presensi.keterangan && (
                      <p className="text-sm text-gray-600">{presensi.keterangan}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {presensi.waktu && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Waktu</p>
                      <p className="font-semibold text-gray-900">{presensi.waktu}</p>
                    </div>
                  )}
                  <div className={`px-4 py-2 ${statusConfig.badge} text-white font-bold rounded-lg`}>
                    {statusConfig.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
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
      `}</style>
    </SiswaLayout>
  );
}
