'use client';

import { useState, useEffect } from 'react';
import { Target, BookOpen, Calendar, TrendingUp, Edit2, Save, X, Plus, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function TargetHafalanPage() {
  const [targets, setTargets] = useState([]);
  const [statistics, setStatistics] = useState({
    totalKelas: 0,
    tahunAjaranAktif: '',
    rataRataTarget: 0
  });
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleEdit = (target) => {
    setEditingId(target.id);
    setEditValue(target.targetKelas || target.targetSekolah);
  };

  const handleSave = async (targetId) => {
    try {
      const response = await fetch('/api/admin/target-hafalan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: targetId,
          targetKelas: parseFloat(editValue)
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchTargets();
        setEditingId(null);
        setEditValue('');
      }
    } catch (error) {
      console.error('Error saving target:', error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
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
              Target Hafalan
            </h1>
            <p className="text-gray-600 ml-16">
              Atur target hafalan tahunan sekolah dan setiap kelas
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold hover:scale-105"
          >
            <Plus size={20} />
            Tambah Target Baru
          </button>
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
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">
                  Target Sekolah
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">
                  Target Kelas
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : targets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <Target size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500">Belum ada target hafalan</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm hover:bg-emerald-600 transition"
                      >
                        Tambah Target
                      </button>
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
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
                        <BookOpen size={14} />
                        {target.targetSekolah} Juz
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === target.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-24 px-3 py-2 border-2 border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center font-semibold"
                          autoFocus
                        />
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-lg text-sm font-semibold">
                          <Target size={14} />
                          {target.targetKelas || target.targetSekolah} Juz
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingId === target.id ? (
                          <>
                            <button
                              onClick={() => handleSave(target.id)}
                              className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
                              title="Simpan"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition shadow-md hover:shadow-lg"
                              title="Batal"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleEdit(target)}
                            className="p-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition shadow-md hover:shadow-lg"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </div>
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
            <h3 className="font-bold text-amber-900 mb-2">📝 Catatan Penting</h3>
            <p className="text-amber-800 leading-relaxed">
              Target hafalan minimal <strong>2 juz per tahun</strong>. Guru dapat menyesuaikan target kelas
              sesuai dengan kemampuan dan kondisi siswa. Target yang telah ditetapkan akan menjadi
              acuan evaluasi hafalan siswa.
            </p>
          </div>
        </div>
      </div>

      {/* Add Modal (Simple version - you can enhance this) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Plus className="text-emerald-500" />
              Tambah Target Baru
            </h3>
            <p className="text-gray-600 mb-6">
              Fitur ini akan segera tersedia. Saat ini target otomatis dibuat saat tahun ajaran dan kelas ditambahkan.
            </p>
            <button
              onClick={() => setShowAddModal(false)}
              className="w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
