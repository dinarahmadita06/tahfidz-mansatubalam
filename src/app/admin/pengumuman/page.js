'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import {
  Home,
  ChevronRight,
  Megaphone,
  Plus,
  X,
  Calendar,
  Users,
  AlertCircle,
  Trash2,
  CheckCircle,
  Loader
} from 'lucide-react';

export default function PengumumanPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pengumumanList, setPengumumanList] = useState([]);
  const [siswaWisudaList, setSiswaWisudaList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    tipePengumuman: 'UMUM',
    judul: '',
    isi: '',
    isPenting: false,
    targetRole: [],
    siswaIds: []
  });

  useEffect(() => {
    fetchPengumuman();
  }, []);

  useEffect(() => {
    if (showModal && formData.tipePengumuman === 'WISUDA') {
      fetchSiswaWisuda();
    }
  }, [showModal, formData.tipePengumuman]);

  const fetchPengumuman = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/pengumuman');
      if (res.ok) {
        const data = await res.json();
        setPengumumanList(data.pengumuman || []);
      }
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswaWisuda = async () => {
    try {
      const res = await fetch('/api/admin/siswa-wisuda');
      if (res.ok) {
        const data = await res.json();
        setSiswaWisudaList(data.siswa || []);
      }
    } catch (error) {
      console.error('Error fetching siswa wisuda:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Validasi
      if (formData.targetRole.length === 0) {
        setError('Pilih minimal satu target penerima');
        setSubmitting(false);
        return;
      }

      if (formData.tipePengumuman !== 'WISUDA') {
        if (!formData.judul || !formData.isi) {
          setError('Judul dan isi harus diisi');
          setSubmitting(false);
          return;
        }
      } else {
        if (formData.siswaIds.length === 0) {
          setError('Pilih minimal satu siswa untuk wisuda');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/admin/pengumuman', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Pengumuman berhasil dibuat!');
        setTimeout(() => {
          setShowModal(false);
          setSuccess('');
          resetForm();
          fetchPengumuman();
        }, 2000);
      } else {
        setError(data.error || 'Gagal membuat pengumuman');
      }
    } catch (error) {
      console.error('Error creating pengumuman:', error);
      setError('Terjadi kesalahan saat membuat pengumuman');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengumuman ini?')) return;

    try {
      const res = await fetch(`/api/admin/pengumuman?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccess('Pengumuman berhasil dihapus');
        setTimeout(() => setSuccess(''), 3000);
        fetchPengumuman();
      } else {
        setError('Gagal menghapus pengumuman');
      }
    } catch (error) {
      console.error('Error deleting pengumuman:', error);
      setError('Terjadi kesalahan');
    }
  };

  const resetForm = () => {
    setFormData({
      tipePengumuman: 'UMUM',
      judul: '',
      isi: '',
      isPenting: false,
      targetRole: [],
      siswaIds: []
    });
  };

  const toggleTargetRole = (role) => {
    setFormData(prev => ({
      ...prev,
      targetRole: prev.targetRole.includes(role)
        ? prev.targetRole.filter(r => r !== role)
        : [...prev.targetRole, role]
    }));
  };

  const toggleSiswa = (siswaId) => {
    setFormData(prev => ({
      ...prev,
      siswaIds: prev.siswaIds.includes(siswaId)
        ? prev.siswaIds.filter(id => id !== siswaId)
        : [...prev.siswaIds, siswaId]
    }));
  };

  const tipeBadgeStyle = {
    UMUM: { bg: '#FFEFC1', text: '#92400E', icon: '📢' },
    WISUDA: { bg: '#E5D4FF', text: '#6B21A8', icon: '🎓' },
    KEGIATAN: { bg: '#D1FAE5', text: '#065F46', icon: '📅' },
    LIBUR: { bg: '#FEE2E2', text: '#991B1B', icon: '🏖️' }
  };

  return (
    <AdminLayout>
      <PageWrapper>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Home size={16} />
          <ChevronRight size={14} />
          <span className="font-medium text-emerald-700">Pengumuman</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-xl shadow-lg">
              <Megaphone className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengumuman</h1>
              <p className="text-sm text-gray-600 mt-1">
                Kelola pengumuman untuk guru, siswa, dan orang tua
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
          >
            <Plus size={20} />
            Buat Pengumuman
          </button>
        </div>

        {/* Success/Error Message */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="font-medium">{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* List Pengumuman */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : pengumumanList.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">Belum ada pengumuman</p>
            <p className="text-gray-400 text-sm">Klik tombol "Buat Pengumuman" untuk memulai</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pengumumanList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: tipeBadgeStyle[item.tipePengumuman]?.bg,
                          color: tipeBadgeStyle[item.tipePengumuman]?.text
                        }}
                      >
                        {tipeBadgeStyle[item.tipePengumuman]?.icon} {item.tipePengumuman}
                      </span>
                      {item.isPenting && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          <AlertCircle size={14} /> Penting
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.judul}</h3>
                    <p className="text-gray-600 text-sm mb-4 whitespace-pre-line line-clamp-3">
                      {item.isi}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        Target: {item.targetRole.join(', ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Create */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Buat Pengumuman Baru</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setError('');
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipe Pengumuman */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipe Pengumuman
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['UMUM', 'WISUDA', 'KEGIATAN', 'LIBUR'].map((tipe) => (
                      <button
                        key={tipe}
                        type="button"
                        onClick={() => setFormData({ ...formData, tipePengumuman: tipe })}
                        className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.tipePengumuman === tipe
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        {tipeBadgeStyle[tipe]?.icon} {tipe}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Target Penerima
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['GURU', 'SISWA', 'ORANG_TUA'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleTargetRole(role)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.targetRole.includes(role)
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        {role.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                {formData.tipePengumuman === 'WISUDA' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Pilih Siswa Wisuda (Hafal 30 Juz)
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                      {siswaWisudaList.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-4">
                          Tidak ada siswa yang eligible untuk wisuda
                        </p>
                      ) : (
                        siswaWisudaList.map((siswa) => (
                          <label
                            key={siswa.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.siswaIds.includes(siswa.id)}
                              onChange={() => toggleSiswa(siswa.id)}
                              className="w-4 h-4 text-emerald-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{siswa.nama}</p>
                              <p className="text-xs text-gray-500">
                                Kelas {siswa.kelas.tingkat} {siswa.kelas.nama} • {siswa.totalJuzLancar} Juz
                              </p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ⚠️ Template akan di-generate otomatis berdasarkan siswa yang dipilih
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Judul Pengumuman
                      </label>
                      <input
                        type="text"
                        value={formData.judul}
                        onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Masukkan judul pengumuman..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Isi Pengumuman
                      </label>
                      <textarea
                        rows={8}
                        value={formData.isi}
                        onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                        placeholder="Masukkan isi pengumuman..."
                        required
                      />
                    </div>
                  </>
                )}

                {/* Toggle Penting */}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Tandai sebagai Penting</p>
                    <p className="text-xs text-amber-700 mt-1">Pengumuman akan ditampilkan dengan highlight merah</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isPenting: !formData.isPenting })}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      formData.isPenting ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        formData.isPenting ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setError('');
                    }}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="animate-spin" size={20} />
                        Menyimpan...
                      </>
                    ) : (
                      'Publikasikan'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageWrapper>
    </AdminLayout>
  );
}
