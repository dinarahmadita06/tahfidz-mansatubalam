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
      <div className="w-full max-w-7xl mx-auto space-y-6 py-6 px-4 sm:px-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <CalendarCheck className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Presensi</h1>
              <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                <Sparkles size={14} />
                Riwayat kehadiran dan statistik bulanan
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hadir */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 shadow-sm border border-emerald-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-emerald-700">Hadir</span>
            </div>
            <p className="text-3xl font-bold text-emerald-900">{stats.hadir}</p>
            <p className="text-xs text-emerald-600 mt-1">{persentaseHadir}% kehadiran</p>
          </div>

          {/* Izin */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 shadow-sm border border-amber-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl">
                <Clock className="text-amber-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-amber-700">Izin</span>
            </div>
            <p className="text-3xl font-bold text-amber-900">{stats.izin}</p>
            <p className="text-xs text-amber-600 mt-1">hari</p>
          </div>

          {/* Sakit */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl p-5 shadow-sm border border-sky-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl">
                <Thermometer className="text-sky-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-sky-700">Sakit</span>
            </div>
            <p className="text-3xl font-bold text-sky-900">{stats.sakit}</p>
            <p className="text-xs text-sky-600 mt-1">hari</p>
          </div>

          {/* Alfa */}
          <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl p-5 shadow-sm border border-rose-100/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl">
                <XCircle className="text-rose-600" size={20} />
              </div>
              <span className="text-sm font-semibold text-rose-700">Alfa</span>
            </div>
            <p className="text-3xl font-bold text-rose-900">{stats.alfa}</p>
            <p className="text-xs text-rose-600 mt-1">hari</p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Calendar className="text-emerald-600" size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Riwayat Kehadiran</h2>
                  <p className="text-sm text-gray-600">Detail presensi harian</p>
                </div>
              </div>

              {/* Filter Bulan */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Filter Bulan:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
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
                <tr className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm border-b border-emerald-100/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-900">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-900">Nama</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-900">Tanggal</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-emerald-900">Status Kehadiran</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-emerald-900">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {presensiData.map((presensi, index) => {
                  const statusBadge = getStatusBadge(presensi.status);

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100/50 hover:bg-emerald-50/40 transition-colors"
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
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {presensi.keterangan}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer - Total */}
          <div className="px-6 py-4 bg-gray-50/50 backdrop-blur-sm border-t border-gray-100/50">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">Total Data:</span>
              <span className="font-bold text-emerald-600">{presensiData.length} hari</span>
            </div>
          </div>
        </div>
      </div>
    </SiswaLayout>
  );
}
