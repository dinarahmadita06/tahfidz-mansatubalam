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
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PresensiSiswaPage() {
  const [selectedMonth, setSelectedMonth] = useState(10); // Oktober = 10
  const [selectedYear] = useState(2025);

  // Data presensi lengkap (seminggu sekali = 4x per bulan)
  const allPresensiData = [
    // Oktober 2025
    { nama: 'Abdullah Rahman', tanggal: '2025-10-27', hari: 'Senin', status: 'hadir', waktu: '07:45', keterangan: '-', bulan: 10, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-10-20', hari: 'Senin', status: 'hadir', waktu: '07:50', keterangan: '-', bulan: 10, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-10-13', hari: 'Senin', status: 'izin', waktu: null, keterangan: 'Keperluan keluarga', bulan: 10, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-10-06', hari: 'Senin', status: 'hadir', waktu: '07:40', keterangan: '-', bulan: 10, tahun: 2025 },

    // September 2025
    { nama: 'Abdullah Rahman', tanggal: '2025-09-29', hari: 'Senin', status: 'hadir', waktu: '07:48', keterangan: '-', bulan: 9, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-09-22', hari: 'Senin', status: 'sakit', waktu: null, keterangan: 'Demam', bulan: 9, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-09-15', hari: 'Senin', status: 'hadir', waktu: '07:42', keterangan: '-', bulan: 9, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-09-08', hari: 'Senin', status: 'hadir', waktu: '07:55', keterangan: '-', bulan: 9, tahun: 2025 },

    // Agustus 2025
    { nama: 'Abdullah Rahman', tanggal: '2025-08-25', hari: 'Senin', status: 'hadir', waktu: '07:38', keterangan: '-', bulan: 8, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-08-18', hari: 'Senin', status: 'hadir', waktu: '07:45', keterangan: '-', bulan: 8, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-08-11', hari: 'Senin', status: 'alfa', waktu: null, keterangan: 'Tidak ada keterangan', bulan: 8, tahun: 2025 },
    { nama: 'Abdullah Rahman', tanggal: '2025-08-04', hari: 'Senin', status: 'hadir', waktu: '07:50', keterangan: '-', bulan: 8, tahun: 2025 },
  ];

  // Filter data berdasarkan bulan yang dipilih
  const presensiData = allPresensiData.filter(
    p => p.bulan === selectedMonth && p.tahun === selectedYear
  );

  // Statistik
  const stats = {
    hadir: presensiData.filter(p => p.status === 'hadir').length,
    izin: presensiData.filter(p => p.status === 'izin').length,
    sakit: presensiData.filter(p => p.status === 'sakit').length,
    alfa: presensiData.filter(p => p.status === 'alfa').length,
  };

  const totalHari = presensiData.length;
  const persentaseHadir = Math.round((stats.hadir / totalHari) * 100);

  const getStatusBadge = (status) => {
    const badges = {
      hadir: {
        label: 'Hadir',
        className: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      },
      izin: {
        label: 'Izin',
        className: 'bg-amber-100 text-amber-700 border border-amber-300',
      },
      sakit: {
        label: 'Sakit',
        className: 'bg-sky-100 text-sky-700 border border-sky-300',
      },
      alfa: {
        label: 'Alfa',
        className: 'bg-rose-100 text-rose-700 border border-rose-300',
      },
    };
    return badges[status] || badges.hadir;
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

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Calendar className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Riwayat Kehadiran</h2>
                <p className="text-sm text-gray-600">Detail presensi harian</p>
              </div>
            </div>

            {/* Filter Bulan */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Filter Bulan:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month} {selectedYear}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Nama</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Tanggal</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">Status Kehadiran</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {presensiData.map((presensi, index) => {
                const statusBadge = getStatusBadge(presensi.status);

                return (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {presensi.nama}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{presensi.hari}</span>
                        <span className="text-xs text-gray-500">{presensi.tanggal}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold ${statusBadge.className}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {presensi.keterangan}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer - Total */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-700">Total Data:</span>
            <span className="font-bold text-emerald-600">{presensiData.length} hari</span>
          </div>
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
