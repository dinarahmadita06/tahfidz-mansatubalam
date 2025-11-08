'use client';

import { useState, useEffect } from 'react';
import { Target, BookOpen, Calendar, TrendingUp, AlertCircle, Plus } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveHeading,
  ResponsiveStatCard,
  ResponsiveTableWrapper,
  ResponsiveModal
} from '@/components/admin/ResponsiveWrapper';

export default function TargetHafalanPage() {
  const [targets, setTargets] = useState([]);
  const [statistics, setStatistics] = useState({
    totalKelas: 0,
    tahunAjaranAktif: '',
    rataRataTarget: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [formData, setFormData] = useState({
    kelasId: '',
    targetJuz: 2,
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    deadline: '',
    keterangan: ''
  });

  useEffect(() => {
    fetchTargets();
    fetchKelas();
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

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      if (data.success) {
        setKelasList(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        kelasId: formData.kelasId,
        targetJuz: parseInt(formData.targetJuz),
        bulan: parseInt(formData.bulan),
        tahun: parseInt(formData.tahun),
        deadline: formData.deadline || null,
        keterangan: formData.keterangan || null,
      };

      const response = await fetch('/api/admin/target-hafalan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert('Target hafalan berhasil ditambahkan!');
        setShowAddModal(false);
        resetForm();
        fetchTargets();
      } else {
        alert(data.message || 'Gagal menambahkan target hafalan');
      }
    } catch (error) {
      console.error('Error adding target:', error);
      alert('Terjadi kesalahan saat menambahkan target');
    }
  };

  const resetForm = () => {
    setFormData({
      kelasId: '',
      targetJuz: 2,
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      deadline: '',
      keterangan: ''
    });
  };

  return (
    <AdminLayout>
      <ResponsiveContainer>
        <ResponsiveCard className="bg-gradient-to-br from-emerald-50/30 via-cream-50/30 to-amber-50/20">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Target className="text-white" size={24} />
                  </div>
                  <ResponsiveHeading level={1} className="text-gray-900">
                    Target Hafalan Sekolah
                  </ResponsiveHeading>
                </div>
                <p className="text-sm sm:text-base text-gray-600 sm:ml-15">
                  Target hafalan minimal sekolah: 2 juz per tahun
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 font-semibold hover:scale-105"
              >
                <Plus size={18} className="sm:hidden" />
                <Plus size={20} className="hidden sm:block" />
                <span className="text-sm sm:text-base">Tambah Target</span>
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <ResponsiveGrid cols={{ sm: 1, md: 3, lg: 3, xl: 3 }} gap="md" className="mb-6 sm:mb-8">
            <ResponsiveStatCard
              icon={BookOpen}
              title="Total Kelas"
              value={statistics.totalKelas}
              color="emerald"
            />
            <ResponsiveStatCard
              icon={Calendar}
              title="Tahun Ajaran Aktif"
              value={statistics.tahunAjaranAktif || '-'}
              color="amber"
            />
            <ResponsiveStatCard
              icon={TrendingUp}
              title="Rata-rata Target"
              value={`${statistics.rataRataTarget} Juz`}
              color="blue"
            />
          </ResponsiveGrid>

          {/* Table */}
          <ResponsiveTableWrapper className="bg-white shadow-xl border border-emerald-100/30">
            <table className="w-full min-w-full">
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
          </ResponsiveTableWrapper>

          {/* Catatan */}
          <ResponsiveCard className="mt-6 sm:mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200/50 shadow-lg" padding="default">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-400 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                <AlertCircle className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-1 sm:mb-2 text-sm sm:text-base">Informasi Target Hafalan</h3>
                <p className="text-amber-800 leading-relaxed text-xs sm:text-sm">
                  Target hafalan sekolah ditetapkan secara konsisten sebesar <strong>2 juz per tahun</strong> untuk semua kelas.
                  Target ini berlaku untuk seluruh siswa dan menjadi standar minimal hafalan yang harus dicapai setiap tahun ajaran.
                </p>
              </div>
            </div>
          </ResponsiveCard>

          {/* Add Target Modal - Simplified for School Target Only */}
          {showAddModal && (
            <ResponsiveModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                resetForm();
              }}
              maxWidth="xl"
            >
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Plus className="text-white" size={20} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Tambah Target Sekolah
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Tambahkan target hafalan sekolah untuk kelas tertentu
              </p>

            <form onSubmit={handleAddTarget} className="space-y-5">
              {/* Pilih Kelas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kelasId}
                  onChange={(e) => setFormData({ ...formData, kelasId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Pilih Kelas --</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama} - {kelas.tahunAjaran?.nama || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Target Juz */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Juz <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    max="30"
                    step="0.5"
                    value={formData.targetJuz}
                    onChange={(e) => setFormData({ ...formData, targetJuz: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: 2 juz</p>
                </div>

                {/* Bulan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bulan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bulan}
                    onChange={(e) => setFormData({ ...formData, bulan: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="1">Januari</option>
                    <option value="2">Februari</option>
                    <option value="3">Maret</option>
                    <option value="4">April</option>
                    <option value="5">Mei</option>
                    <option value="6">Juni</option>
                    <option value="7">Juli</option>
                    <option value="8">Agustus</option>
                    <option value="9">September</option>
                    <option value="10">Oktober</option>
                    <option value="11">November</option>
                    <option value="12">Desember</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tahun */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tahun <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={formData.tahun}
                    onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Deadline (Opsional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline (Opsional)
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Keterangan (Opsional)
                </label>
                <textarea
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Catatan tambahan untuk target ini..."
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Simpan Target
                </button>
              </div>
            </form>
            </ResponsiveModal>
          )}
        </ResponsiveCard>
      </ResponsiveContainer>
    </AdminLayout>
  );
}
