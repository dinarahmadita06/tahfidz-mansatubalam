'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import ParentingMotivationalCard from '@/components/ParentingMotivationalCard';
import {
  CalendarCheck,
  User,
  ChevronDown,
  CheckCircle,
  Download,
  XCircle,
  Calendar,
  Clock,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen Donut Chart
function DonutChart({ data, percentage }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  const slices = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (currentAngle * Math.PI) / 180;

    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ');

    return {
      path: pathData,
      color: item.color,
      label: item.label,
      value: item.value,
    };
  });

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background circle */}
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="12" />

        {/* Slices */}
        {slices.map((slice, index) => (
          <motion.path
            key={index}
            d={slice.path}
            fill={slice.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        ))}

        {/* Inner circle (donut hole) */}
        <circle cx="50" cy="50" r="28" fill="white" />
      </svg>

      {/* Percentage in center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-bold text-emerald-600">{percentage}%</p>
        <p className="text-xs text-gray-600">Kehadiran</p>
      </div>

      {/* Legend */}
      <div className="mt-8 space-y-2 w-full">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-700 font-medium flex-1">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal Detail Presensi
function PresensiModal({ isOpen, onClose, presensi }) {
  if (!isOpen || !presensi) return null;

  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'hadir':
        return { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Hadir' };
      case 'izin':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Izin' };
      case 'sakit':
        return { icon: AlertCircle, color: 'text-sky-600', bg: 'bg-sky-50', label: 'Sakit' };
      default:
        return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Alfa' };
    }
  };

  const statusConfig = getStatusConfig(presensi.status);
  const StatusIcon = statusConfig.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detail Presensi</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="text-gray-500" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold text-gray-900">{presensi.tanggal}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jam Presensi</p>
                  <p className="font-semibold text-gray-900">{presensi.jam || '08:00'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Kegiatan</p>
                <p className="font-semibold text-gray-900">{presensi.kegiatan}</p>
              </div>

              <div className={`${statusConfig.bg} p-4 rounded-lg flex items-center gap-3`}>
                <StatusIcon className={statusConfig.color} size={32} />
                <div>
                  <p className="text-sm text-gray-600">Status Kehadiran</p>
                  <p className={`text-xl font-bold ${statusConfig.color}`}>
                    {statusConfig.label}
                  </p>
                </div>
              </div>

              {presensi.catatan && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Catatan Guru:</p>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-900 leading-relaxed">{presensi.catatan}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PresensiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState(null);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [selectedPresensi, setSelectedPresensi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('Oktober 2025');

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Data dummy anak
  const children = [
    { id: 1, name: 'Ahmad Fauzan', kelas: '5A', avatar: '👦' },
    { id: 2, name: 'Fatimah Azzahra', kelas: '3B', avatar: '👧' },
  ];

  // Data dummy presensi - hanya menampilkan Setoran Hafalan
  const presensiData = [
    {
      id: 1,
      tanggal: '28 Okt 2025',
      kegiatan: 'Setoran Hafalan',
      status: 'Hadir',
      catatan: 'Lancar & disiplin, hafalan Al-Baqarah ayat 1-10',
      jam: '08:00',
    },
    {
      id: 2,
      tanggal: '26 Okt 2025',
      kegiatan: 'Setoran Hafalan',
      status: 'Alfa',
      catatan: 'Tidak hadir tanpa keterangan',
      jam: '-',
    },
    {
      id: 3,
      tanggal: '25 Okt 2025',
      kegiatan: 'Setoran Hafalan',
      status: 'Hadir',
      catatan: 'Sangat baik, hafalan lancar',
      jam: '08:15',
    },
    {
      id: 4,
      tanggal: '23 Okt 2025',
      kegiatan: 'Setoran Hafalan',
      status: 'Sakit',
      catatan: 'Demam, ada surat keterangan dokter',
      jam: '-',
    },
    {
      id: 5,
      tanggal: '21 Okt 2025',
      kegiatan: 'Setoran Hafalan',
      status: 'Hadir',
      catatan: 'Baik, hafalan sudah lancar',
      jam: '08:00',
    },
  ];

  // Hitung ringkasan
  const totalHadir = presensiData.filter((p) => p.status === 'Hadir').length;
  const totalIzin = presensiData.filter((p) => p.status === 'Izin').length;
  const totalSakit = presensiData.filter((p) => p.status === 'Sakit').length;
  const totalAlfa = presensiData.filter((p) => p.status === 'Alfa').length;
  const totalHari = presensiData.length;
  const persentaseKehadiran = Math.round((totalHadir / totalHari) * 100);

  // Data untuk donut chart
  const chartData = [
    { label: 'Hadir', value: totalHadir, color: '#10b981' },
    { label: 'Izin', value: totalIzin, color: '#f59e0b' },
    { label: 'Sakit', value: totalSakit, color: '#0ea5e9' },
    { label: 'Alfa', value: totalAlfa, color: '#f43f5e' },
  ];

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50/30 via-cream-50/30 to-amber-50/20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Memuat presensi...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const handleOpenModal = (presensi) => {
    setSelectedPresensi(presensi);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'hadir':
        return <span className="text-emerald-500">●</span>;
      case 'izin':
        return <span className="text-amber-500">●</span>;
      case 'sakit':
        return <span className="text-sky-500">●</span>;
      default:
        return <span className="text-rose-500">●</span>;
    }
  };

  return (
    <OrangtuaLayout>
      <div className="min-h-screen animate-fade-in">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="bg-gradient-to-r from-emerald-400 via-mint-400 to-amber-300 rounded-3xl p-6 md:p-8 shadow-lg relative overflow-visible">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              {/* Header Content */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                {/* Left: Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <CalendarCheck className="text-white flex-shrink-0" size={28} />
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                      Presensi Siswa
                    </h1>
                  </div>
                  <p className="text-emerald-50 text-base md:text-lg mb-2">
                    Pantau kehadiran anak Anda dalam kegiatan tahfidz setiap hari.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Calendar size={16} className="text-white" />
                    <span className="text-white text-sm font-medium">{selectedMonth}</span>
                  </div>
                </div>

                {/* Right: Info Anak Card */}
                {selectedChild && (
                  <div className="w-full lg:w-auto flex-shrink-0">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:bg-white/25 transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{selectedChild.avatar}</span>
                        <div>
                          <p className="text-white font-bold text-lg">{selectedChild.name}</p>
                          <p className="text-emerald-100 text-sm">Kelas {selectedChild.kelas}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Child Selector Dropdown */}
              {children.length > 1 && (
                <div className="relative mt-2">
                  <button
                    onClick={() => setShowChildSelector(!showChildSelector)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/90 hover:bg-white hover:ring-1 hover:ring-emerald-400/60 backdrop-blur-sm rounded-xl transition-all duration-200 ease-in-out shadow-md min-w-[180px] max-w-[320px] w-full lg:w-auto"
                  >
                    <User size={18} className="text-emerald-600 flex-shrink-0" />
                    <span className="text-emerald-900 font-semibold text-sm flex-1 truncate">
                      {selectedChild ? selectedChild.name : 'Pilih Anak'}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-emerald-600 flex-shrink-0 transition-transform duration-200 ${
                        showChildSelector ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showChildSelector && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl overflow-hidden z-50 min-w-[280px] max-w-[400px] w-full md:w-auto border border-emerald-100"
                      >
                        {children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => {
                              setSelectedChild(child);
                              setShowChildSelector(false);
                            }}
                            className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-emerald-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 ${
                              selectedChild?.id === child.id ? 'bg-emerald-50' : 'bg-white'
                            }`}
                          >
                            <span className="text-3xl flex-shrink-0">{child.avatar}</span>
                            <div className="text-left flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">{child.name}</p>
                              <p className="text-sm text-gray-600">Kelas {child.kelas}</p>
                            </div>
                            {selectedChild?.id === child.id && (
                              <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <ParentingMotivationalCard theme="lilac" />
        </motion.div>

        {/* Ringkasan Presensi - 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Card 1: Hadir */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl md:text-3xl">✅</div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Hadir</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-emerald-600">{totalHadir}</p>
            <p className="text-xs text-gray-600 mt-1">Hari</p>
          </motion.div>

          {/* Card 2: Izin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm border border-amber-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl md:text-3xl">🟡</div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Izin</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-amber-600">{totalIzin}</p>
            <p className="text-xs text-gray-600 mt-1">Hari</p>
          </motion.div>

          {/* Card 3: Sakit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm border border-sky-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl md:text-3xl">🔵</div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Sakit</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-sky-600">{totalSakit}</p>
            <p className="text-xs text-gray-600 mt-1">Hari</p>
          </motion.div>

          {/* Card 4: Alfa */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 shadow-sm border border-rose-100 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl md:text-3xl">🔴</div>
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Alfa</h3>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-rose-600">{totalAlfa}</p>
            <p className="text-xs text-gray-600 mt-1">Hari</p>
          </motion.div>
        </div>

        {/* Total Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gradient-to-br from-emerald-50 to-mint-50 rounded-2xl p-6 mb-8 border border-emerald-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Hari Belajar</p>
              <p className="text-3xl font-bold text-gray-900">{totalHari} Hari</p>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="text-emerald-600" size={32} />
              <div>
                <p className="text-sm text-gray-600 mb-1">Persentase Kehadiran</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-emerald-600">
                    {persentaseKehadiran}%
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 font-semibold rounded-full px-3 py-1 text-sm">
                    Sangat Baik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid: Grafik & Tabel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Grafik Donut */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CalendarCheck className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-800">Rekap Kehadiran</h2>
                <p className="text-xs text-gray-600">Bulan Ini</p>
              </div>
            </div>

            <DonutChart data={chartData} percentage={persentaseKehadiran} />
          </motion.div>

          {/* Tabel Riwayat Presensi */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.45 }}
            className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="text-amber-600" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-800">Riwayat Presensi</h2>
                  <p className="text-xs text-gray-600">Detail kehadiran harian</p>
                </div>
              </div>

              {/* Download Button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-sm">
                <Download size={16} />
                <span className="font-semibold">Unduh Laporan</span>
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-700">
                      Tanggal
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-700">
                      Kegiatan
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-emerald-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-emerald-700">
                      Catatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {presensiData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() => handleOpenModal(item)}
                      className="border-b border-gray-100 hover:bg-mint-50 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900">{item.tanggal}</td>
                      <td className="py-3 px-4 text-gray-700">{item.kegiatan}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getStatusIcon(item.status)}
                          <span className="text-sm font-medium">{item.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 text-sm truncate max-w-xs">
                        {item.catatan}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {presensiData.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  onClick={() => handleOpenModal(item)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-emerald-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{item.tanggal}</p>
                      <p className="text-sm text-gray-600">{item.kegiatan}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium">{item.status}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">{item.catatan}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Modal Presensi */}
        <PresensiModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          presensi={selectedPresensi}
        />
      </div>
    </OrangtuaLayout>
  );
}
