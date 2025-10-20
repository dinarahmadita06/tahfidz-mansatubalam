'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FileText, Download, Calendar, Users, TrendingUp,
  BarChart3, PieChart, FileSpreadsheet
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function LaporanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  const laporanTypes = [
    {
      id: 1,
      title: 'Laporan Progress Hafalan',
      description: 'Laporan detail progress hafalan per siswa atau kelas',
      icon: TrendingUp,
      color: 'blue',
      formats: ['PDF', 'Excel'],
    },
    {
      id: 2,
      title: 'Laporan Setoran Harian',
      description: 'Rekap setoran hafalan per hari',
      icon: Calendar,
      color: 'green',
      formats: ['PDF', 'Excel'],
    },
    {
      id: 3,
      title: 'Laporan Per Siswa',
      description: 'Laporan lengkap per siswa untuk raport',
      icon: Users,
      color: 'purple',
      formats: ['PDF'],
    },
    {
      id: 4,
      title: 'Statistik Kelas',
      description: 'Analisis statistik per kelas dengan grafik',
      icon: BarChart3,
      color: 'yellow',
      formats: ['PDF', 'Excel'],
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        border: 'border-blue-200',
        hover: 'hover:border-blue-400',
      },
      green: {
        bg: 'bg-green-100',
        icon: 'text-green-600',
        border: 'border-green-200',
        hover: 'hover:border-green-400',
      },
      purple: {
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-400',
      },
      yellow: {
        bg: 'bg-yellow-100',
        icon: 'text-yellow-600',
        border: 'border-yellow-200',
        hover: 'hover:border-yellow-400',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <GuruLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Laporan & Statistik</h1>
            <p className="text-sm text-gray-600">Generate laporan dan analisis data hafalan</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl">
        {/* Filter Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">⚙️ Pengaturan Laporan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode Laporan
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="hari-ini">Hari Ini</option>
                <option value="minggu-ini">Minggu Ini</option>
                <option value="bulan-ini">Bulan Ini</option>
                <option value="semester-ini">Semester Ini</option>
                <option value="tahun-ini">Tahun Ajaran Ini</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelas
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="">Semua Kelas</option>
                <option value="xii-ipa-1">XII IPA 1</option>
                <option value="xi-ipa-2">XI IPA 2</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format Export
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="both">PDF & Excel</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jenis Laporan */}
        <h3 className="font-semibold text-gray-900 mb-4">📊 Jenis Laporan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {laporanTypes.map((laporan) => {
            const Icon = laporan.icon;
            const colorClasses = getColorClasses(laporan.color);

            return (
              <div
                key={laporan.id}
                className={`bg-white border-2 ${colorClasses.border} rounded-lg p-6 ${colorClasses.hover} transition-all`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 ${colorClasses.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon size={28} className={colorClasses.icon} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {laporan.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {laporan.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {laporan.formats.map((format) => (
                      <span
                        key={format}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                    <Download size={16} />
                    Generate
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={20} className="text-green-600" />
            Statistik Cepat ({selectedPeriod.replace('-', ' ')})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">-</p>
              <p className="text-xs text-gray-600">Total Setoran</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">-</p>
              <p className="text-xs text-gray-600">Siswa Aktif</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">-%</p>
              <p className="text-xs text-gray-600">Rata-rata Nilai</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900 mb-1">-</p>
              <p className="text-xs text-gray-600">Ayat Dihafal</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-4 text-center">
            💡 Pilih periode dan kelas untuk melihat statistik detail
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Tentang Laporan</p>
              <p className="text-blue-700">
                Laporan akan di-generate dalam format PDF atau Excel sesuai pilihan.
                Anda dapat mengunduh dan mencetak laporan untuk keperluan administrasi atau evaluasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
