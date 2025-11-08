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
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [formData, setFormData] = useState({
    tipeTarget: 'KELAS', // KELAS atau SISWA
    kelasId: '',
    siswaId: '',
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

  useEffect(() => {
    if (formData.kelasId && formData.tipeTarget === 'SISWA') {
      fetchSiswaByKelas(formData.kelasId);
    }
  }, [formData.kelasId, formData.tipeTarget]);

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

  const fetchSiswaByKelas = async (kelasId) => {
    try {
      const response = await fetch(`/api/kelas/${kelasId}`);
      const data = await response.json();
      if (data.success && data.data?.siswa) {
        setSiswaList(data.data.siswa);
      }
    } catch (error) {
      console.error('Error fetching siswa:', error);
    }
  };

  const handleAddTarget = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        targetJuz: parseInt(formData.targetJuz),
        bulan: parseInt(formData.bulan),
        tahun: parseInt(formData.tahun),
        deadline: formData.deadline || null,
        keterangan: formData.keterangan || null,
      };

      if (formData.tipeTarget === 'KELAS') {
        // Target untuk semua siswa di kelas
        payload.kelasId = formData.kelasId;
      } else {
        // Target untuk siswa spesifik
        payload.siswaId = formData.siswaId;
      }

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
      tipeTarget: 'KELAS',
      kelasId: '',
      siswaId: '',
      targetJuz: 2,
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      deadline: '',
      keterangan: ''
    });
    setSiswaList([]);
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

      {/* Add Modal - Full Form */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Plus className="text-white" size={20} />
              </div>
              Tambah Target Hafalan Baru
            </h3>
            <p className="text-gray-600 mb-6">
              Tambahkan target hafalan untuk kelas atau siswa tertentu
            </p>

            <form onSubmit={handleAddTarget} className="space-y-6">
              {/* Tipe Target */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipe Target <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipeTarget: 'KELAS', siswaId: '' })}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                      formData.tipeTarget === 'KELAS'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-emerald-300'
                    }`}
                  >
                    Target Kelas
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipeTarget: 'SISWA' })}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition-all ${
                      formData.tipeTarget === 'SISWA'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    Target Siswa
                  </button>
                </div>
              </div>

              {/* Pilih Kelas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.kelasId}
                  onChange={(e) => setFormData({ ...formData, kelasId: e.target.value, siswaId: '' })}
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

              {/* Pilih Siswa (hanya muncul jika tipe SISWA) */}
              {formData.tipeTarget === 'SISWA' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Siswa <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.siswaId}
                    onChange={(e) => setFormData({ ...formData, siswaId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required={formData.tipeTarget === 'SISWA'}
                    disabled={!formData.kelasId}
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.map((siswa) => (
                      <option key={siswa.id} value={siswa.id}>
                        {siswa.user?.name || siswa.nama || 'Tidak ada nama'}
                      </option>
                    ))}
                  </select>
                  {!formData.kelasId && (
                    <p className="text-xs text-gray-500 mt-1">Pilih kelas terlebih dahulu</p>
                  )}
                </div>
              )}

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
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
}
