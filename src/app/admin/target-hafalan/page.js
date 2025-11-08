'use client';

import { useState, useEffect } from 'react';
import { Target, BookOpen, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function TargetHafalanPage() {
  const [targets, setTargets] = useState([]);
  const [statistics, setStatistics] = useState({
    totalKelas: 0,
    tahunAjaranAktif: '',
    rataRataTarget: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/target-hafalan');
      const data = await response.json();

      if (data.success) {
        setTargets(data.data.targets || []);
        setStatistics(data.data.statistics || {
          totalKelas: 0,
          tahunAjaranAktif: '',
          rataRataTarget: 0
        });
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-gradient-to-br from-emerald-50/30 via-cream-50/30 to-amber-50/20 p-6 lg:p-8 rounded-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Target className="text-white" size={28} />
              </div>
              Target Hafalan Sekolah
            </h1>
            <p className="text-gray-600 ml-16">
              Target hafalan minimal sekolah: 2 juz per tahun
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Kelas */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Kelas</p>
              <p className="text-3xl font-bold text-emerald-700">{statistics.totalKelas}</p>
            </div>
          </div>
        </div>

        {/* Tahun Ajaran Aktif */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-3xl p-6 shadow-lg border border-amber-100/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Tahun Ajaran Aktif</p>
              <p className="text-2xl font-bold text-amber-700">{statistics.tahunAjaranAktif || '-'}</p>
            </div>
          </div>
        </div>

        {/* Rata-rata Target */}
        <div className="bg-gradient-to-br from-mint-50 to-emerald-50/50 rounded-3xl p-6 shadow-lg border border-mint-100/50 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Rata-rata Target</p>
              <p className="text-3xl font-bold text-teal-700">{statistics.rataRataTarget} Juz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-emerald-100 to-teal-100">
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">
                  Tahun Ajaran
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">
                  Kelas
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">
                  Target Sekolah
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Target size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">Belum ada data kelas</p>
                      <p className="text-sm text-gray-400">Tambahkan tahun ajaran dan kelas terlebih dahulu</p>
                    </div>
                  </td>
                </tr>
              ) : (
                targets.map((target, index) => (
                  <tr
                    key={target.id}
                    className={`border-b border-gray-100 hover:bg-mint-50/30 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                        <Calendar size={14} />
                        {target.tahunAjaran}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{target.namaKelas}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-lg text-base font-bold shadow-sm">
                        <BookOpen size={16} />
                        {target.targetSekolah} Juz
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl p-6 shadow-lg border border-amber-200/50">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <AlertCircle className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Informasi Target Hafalan</h3>
            <p className="text-amber-800 leading-relaxed">
              Target hafalan sekolah ditetapkan secara konsisten sebesar <strong>2 juz per tahun</strong> untuk semua kelas.
              Target ini berlaku untuk seluruh siswa dan menjadi standar minimal hafalan yang harus dicapai setiap tahun ajaran.
            </p>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}
