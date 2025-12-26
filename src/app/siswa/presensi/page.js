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
} from 'lucide-react';

// ============================================================
// EMPTY STATE COMPONENT
// ============================================================
function EmptyState() {
  return (
    <tr>
      <td colSpan="6" className="px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <CalendarCheck size={48} className="text-gray-300" />
          <p className="text-gray-500 font-medium">Belum ada data presensi</p>
          <p className="text-sm text-gray-400">Data presensi akan muncul setelah Anda mengikuti kegiatan tahfidz</p>
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================
export default function PresensiSiswaPage() {
  // Real-time timezone-aware current date
  const getCurrentDate = () => new Date();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentDate().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(getCurrentDate().getFullYear());

  // Data presensi mingguan (kosong = belum ada presensi)
  // Dalam praktik real, data ini akan di-fetch dari API
  const allPresensiData = [];

  // Filter data berdasarkan bulan yang dipilih
  const presensiData = allPresensiData.filter(
    p => p.bulan === selectedMonth && p.tahun === selectedYear
  );

  // Statistik (default semua 0 karena belum ada data)
  const stats = {
    hadir: presensiData.filter(p => p.status === 'hadir').length,
    izin: presensiData.filter(p => p.status === 'izin').length,
    sakit: presensiData.filter(p => p.status === 'sakit').length,
    alfa: presensiData.filter(p => p.status === 'alfa').length,
  };

  const totalHari = presensiData.length;
  const persentaseHadir = totalHari > 0 ? Math.round((stats.hadir / totalHari) * 100) : 0;

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
      {/* Background Gradient - SIMTAQ Style */}
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-10 py-6 space-y-6">

          {/* Header - SIMTAQ Green Gradient */}
          <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <CalendarCheck size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Presensi Kehadiran</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Riwayat kehadiran mingguan dan statistik bulanan
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards - SIMTAQ Standard Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hadir */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={24} className="text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-emerald-700 font-medium">Hadir</p>
                  <p className="text-2xl font-bold text-emerald-900">{stats.hadir}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">{persentaseHadir}% kehadiran</p>
                </div>
              </div>
            </div>

            {/* Izin */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={24} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-amber-700 font-medium">Izin</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.izin}</p>
                  <p className="text-xs text-amber-600 mt-0.5">minggu</p>
                </div>
              </div>
            </div>

            {/* Sakit */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Thermometer size={24} className="text-sky-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-sky-700 font-medium">Sakit</p>
                  <p className="text-2xl font-bold text-sky-900">{stats.sakit}</p>
                  <p className="text-xs text-sky-600 mt-0.5">minggu</p>
                </div>
              </div>
            </div>

            {/* Alfa */}
            <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <XCircle size={24} className="text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-rose-700 font-medium">Alfa</p>
                  <p className="text-2xl font-bold text-rose-900">{stats.alfa}</p>
                  <p className="text-xs text-rose-600 mt-0.5">minggu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Presensi - SIMTAQ Table Style */}
          <div className="bg-white/70 backdrop-blur rounded-2xl border border-white/20 shadow-lg shadow-green-500/10 overflow-hidden">
            {/* Table Header - SIMTAQ Green Gradient */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">Riwayat Kehadiran Mingguan</h2>
                  <p className="text-sm text-green-50 leading-snug">
                    Rekap presensi per minggu
                  </p>
                </div>

                {/* Filter Bulan */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <label className="text-sm font-medium text-white">Bulan:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 sm:px-4 py-2 border border-white/30 rounded-xl text-sm font-medium text-gray-700 bg-white/90 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Minggu Ke-
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Periode
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Jam Kehadiran
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Keterangan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presensiData.length === 0 ? (
                    <EmptyState />
                  ) : (
                    presensiData.map((presensi, index) => {
                      const statusBadge = getStatusBadge(presensi.status);

                      return (
                        <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-emerald-700 font-bold text-sm">{index + 1}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <div className="flex flex-col">
                              <span className="font-medium">{presensi.periode}</span>
                              <span className="text-xs text-gray-500">{presensi.tanggal}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-medium text-sm ${statusBadge.className}`}>
                              {statusBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {presensi.jamKehadiran || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {presensi.keterangan || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            {presensiData.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-700">Total Minggu:</span>
                  <span className="font-bold text-emerald-600">{presensiData.length} minggu</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
