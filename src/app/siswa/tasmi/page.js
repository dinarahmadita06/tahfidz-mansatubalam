'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import { Award, Plus, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Edit2, Trash2, FileText, Star } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

// Stats Card Component (Transparent Pastel with Border Glow)
function StatsCard({ icon: Icon, title, value, subtitle, color = 'emerald', delay = 0 }) {
  const colorConfig = {
    emerald: {
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200/60',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      glow: 'shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_12px_40px_rgba(16,185,129,0.12)]',
    },
    purple: {
      bg: 'bg-purple-50/70',
      border: 'border-purple-200/60',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      glow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.25),0_12px_40px_rgba(168,85,247,0.12)]',
    },
    sky: {
      bg: 'bg-sky-50/70',
      border: 'border-sky-200/60',
      text: 'text-sky-700',
      iconBg: 'bg-sky-100',
      iconText: 'text-sky-600',
      glow: 'shadow-[0_0_0_1px_rgba(14,165,233,0.25),0_12px_40px_rgba(14,165,233,0.12)]',
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`${config.bg} backdrop-blur-sm rounded-2xl p-6 border ${config.border} ${config.glow} hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon size={24} className={config.iconText} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm ${config.text} font-medium`}>{title}</p>
          <p className={`text-2xl font-bold ${config.text}`}>{value}</p>
          {subtitle && <p className={`text-xs ${config.text} mt-0.5`}>{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// Status Badge Component
function StatusBadge({ status }) {
  const badges = {
    MENUNGGU: {
      icon: <Clock size={16} />,
      text: 'Menunggu Verifikasi',
      className: 'bg-amber-100 text-amber-700 border-amber-200'
    },
    DISETUJUI: {
      icon: <CheckCircle size={16} />,
      text: 'Disetujui',
      className: 'bg-green-100 text-green-700 border-green-200'
    },
    DITOLAK: {
      icon: <XCircle size={16} />,
      text: 'Ditolak',
      className: 'bg-red-100 text-red-700 border-red-200'
    },
    SELESAI: {
      icon: <Award size={16} />,
      text: 'Selesai',
      className: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  };

  const badge = badges[status] || badges.MENUNGGU;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-sm ${badge.className}`}>
      {badge.icon}
      <span>{badge.text}</span>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <tr>
      <td colSpan="6" className="px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <Award size={48} className="text-gray-300" />
          <p className="text-gray-500 font-medium">Belum ada pendaftaran Tasmi'</p>
          <p className="text-sm text-gray-400">Klik tombol "Daftar Tasmi' Baru" untuk mendaftar</p>
        </div>
      </td>
    </tr>
  );
}

// Table Row Component
function TasmiTableRow({ tasmi, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-emerald-50/30 transition-colors">
      {/* Juz Tasmi' */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-700 font-bold text-sm">{tasmi.jumlahHafalan}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{tasmi.juzYangDitasmi}</p>
            <p className="text-xs text-gray-500">{tasmi.jumlahHafalan} Juz Hafalan</p>
          </div>
        </div>
      </td>

      {/* Guru Pengampu */}
      <td className="px-6 py-4 text-sm text-gray-600">
        {tasmi.guruPengampu?.user?.name || '-'}
      </td>

      {/* Jadwal */}
      <td className="px-6 py-4 text-center">
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {tasmi.tanggalUjian || tasmi.tanggalTasmi
              ? new Date(tasmi.tanggalUjian || tasmi.tanggalTasmi).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : '-'}
          </p>
          <p className="text-gray-500">{tasmi.jamTasmi || '-'}</p>
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 text-center">
        <StatusBadge status={tasmi.statusPendaftaran} />
      </td>

      {/* Catatan Guru */}
      <td className="px-6 py-4 text-sm">
        {tasmi.statusPendaftaran === 'DITOLAK' && tasmi.catatanPenolakan ? (
          <div className="max-w-xs">
            <p className="text-red-600 font-semibold text-xs mb-1">Ditolak:</p>
            <p className="text-gray-700">{tasmi.catatanPenolakan}</p>
          </div>
        ) : tasmi.catatanPenguji ? (
          <div className="max-w-xs">
            <p className="text-gray-700">{tasmi.catatanPenguji}</p>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* Aksi */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {(tasmi.statusPendaftaran === 'MENUNGGU' || tasmi.statusPendaftaran === 'DITOLAK') && (
            <>
              <button
                onClick={() => onEdit(tasmi)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(tasmi.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          {(tasmi.statusPendaftaran === 'DISETUJUI' || tasmi.statusPendaftaran === 'SELESAI') && (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function SiswaTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [siswaData, setSiswaData] = useState(null);
  const [totalJuz, setTotalJuz] = useState(0);
  const [tasmiList, setTasmiList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [guruList, setGuruList] = useState([]);
  const [formData, setFormData] = useState({
    jumlahHafalan: 0,
    juzYangDitasmi: '',
    guruId: '',
    jamTasmi: '',
    tanggalTasmi: '',
    catatan: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch siswa data & total juz with guruKelas info
      const siswaRes = await fetch('/api/siswa', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });

      if (siswaRes.ok) {
        const siswaJson = await siswaRes.json();

        // Fetch kelas info with guru
        if (siswaJson.siswa?.kelasId) {
          const kelasRes = await fetch(`/api/admin/kelas/${siswaJson.siswa.kelasId}`, {
            cache: 'no-store',
          });
          if (kelasRes.ok) {
            const kelasData = await kelasRes.json();
            siswaJson.siswa.kelas = kelasData.kelas;
          }
        }

        setSiswaData(siswaJson.siswa);

        // Calculate total juz from hafalan
        if (siswaJson.siswa?.id) {
          const timestamp = new Date().getTime();
          const hafalanRes = await fetch(`/api/siswa/hafalan-summary?t=${timestamp}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });

          if (hafalanRes.ok) {
            const hafalanData = await hafalanRes.json();
            const juzCount = hafalanData.totalJuz || 0;
            setTotalJuz(juzCount);
            setFormData(prev => ({ ...prev, jumlahHafalan: juzCount }));
          } else {
            setTotalJuz(0);
          }
        }
      }

      // Fetch guru tahfidz list
      try {
        const guruRes = await fetch('/api/guru', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });

        if (guruRes.ok) {
          const guruData = await guruRes.json();
          setGuruList(Array.isArray(guruData) ? guruData : []);
        }
      } catch (guruError) {
        console.error('Error fetching guru list:', guruError);
      }

      // Fetch tasmi history
      const tasmiRes = await fetch('/api/siswa/tasmi');
      if (tasmiRes.ok) {
        const tasmiData = await tasmiRes.json();
        setTasmiList(tasmiData.tasmi || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.juzYangDitasmi || !formData.jamTasmi || !formData.tanggalTasmi || !formData.guruId) {
      toast.error('Semua field wajib diisi');
      return;
    }

    try {
      const url = editMode ? `/api/siswa/tasmi/${editId}` : '/api/siswa/tasmi';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jumlahHafalan: parseInt(formData.jumlahHafalan),
          juzYangDitasmi: formData.juzYangDitasmi,
          guruId: formData.guruId,
          jamTasmi: formData.jamTasmi,
          tanggalTasmi: formData.tanggalTasmi,
          catatan: formData.catatan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editMode ? 'Pendaftaran Tasmi\' berhasil diupdate!' : 'Pendaftaran Tasmi\' berhasil! Menunggu persetujuan guru.');
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menyimpan pendaftaran Tasmi\'');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (tasmi) => {
    if (tasmi.statusPendaftaran !== 'MENUNGGU' && tasmi.statusPendaftaran !== 'DITOLAK') {
      toast.error('Tidak dapat mengedit tasmi yang sudah disetujui atau selesai');
      return;
    }

    setEditMode(true);
    setEditId(tasmi.id);
    setFormData({
      jumlahHafalan: tasmi.jumlahHafalan,
      juzYangDitasmi: tasmi.juzYangDitasmi,
      guruId: tasmi.guruPengampu?.id || '',
      jamTasmi: tasmi.jamTasmi,
      tanggalTasmi: tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toISOString().split('T')[0] : '',
      catatan: tasmi.catatan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pendaftaran Tasmi\' ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/siswa/tasmi/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil dihapus');
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menghapus pendaftaran Tasmi\'');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
    }
  };

  const resetForm = () => {
    setFormData({
      jumlahHafalan: totalJuz,
      juzYangDitasmi: '',
      guruId: '',
      jamTasmi: '',
      tanggalTasmi: '',
      catatan: '',
    });
    setEditMode(false);
    setEditId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-50">
        {/* Container - Full Width SIMTAQ Style */}
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Header - SIMTAQ Green Gradient */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-6 sm:p-8 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl flex-shrink-0">
                <Award size={32} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold break-words">Tasmi' Al-Qur'an</h1>
                <p className="text-green-50 text-sm sm:text-base mt-1">
                  Ujian akhir hafalan Al-Qur'an - Daftar dan ajukan jadwal Tasmi' Anda
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards - Transparent Pastel with Border Glow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard
              icon={Award}
              title="Total Juz Hafalan"
              value={`${totalJuz} Juz`}
              color="emerald"
              delay={0.1}
            />
            <StatsCard
              icon={Calendar}
              title="Total Pendaftaran"
              value={tasmiList.length}
              color="purple"
              delay={0.2}
            />
            <StatsCard
              icon={CheckCircle}
              title="Status Pendaftaran"
              value="Siap Mendaftar"
              color="sky"
              delay={0.3}
            />
          </div>

          {/* Action Button - SIMTAQ Green Gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={openNewModal}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus size={20} />
              <span>Daftar Tasmi' Baru</span>
            </button>
          </motion.div>

          {/* Riwayat Tasmi - Table with Rounded Shadow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200/60"
          >
            {/* Table Header - SIMTAQ Green Gradient */}
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500">
              <h2 className="text-lg font-bold text-white">Riwayat Pendaftaran Tasmi'</h2>
              <p className="text-sm text-green-50 mt-1">Daftar pendaftaran dan hasil ujian Tasmi' Anda</p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Juz Tasmi'
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Guru Pengampu
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Jadwal
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Catatan Guru
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tasmiList.length === 0 ? (
                    <EmptyState />
                  ) : (
                    tasmiList.map((tasmi) => (
                      <TasmiTableRow
                        key={tasmi.id}
                        tasmi={tasmi}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Daftar/Edit - SIMTAQ Green Theme */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? 'Edit Pendaftaran Tasmi\'' : 'Daftar Tasmi\' Baru'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Isi formulir pendaftaran dengan lengkap dan benar
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nama & Kelas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={session?.user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={siswaData?.kelas?.nama || '-'}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Jumlah Hafalan & Juz yang Ditasmi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Hafalan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.jumlahHafalan}
                    onChange={(e) => setFormData({ ...formData, jumlahHafalan: parseInt(e.target.value) || 0 })}
                    min="2"
                    max="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Jumlah juz yang telah dihafal</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Juz yang Ditasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.juzYangDitasmi}
                    onChange={(e) => setFormData({ ...formData, juzYangDitasmi: e.target.value })}
                    placeholder="Contoh: Juz 1, Juz 2, Juz 3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Juz yang akan diuji</p>
                </div>
              </div>

              {/* Guru Pengampu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pengampu <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.guruId}
                  onChange={(e) => setFormData({ ...formData, guruId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Pilih guru pengampu tahfidz</option>
                  {guruList.map((guru) => (
                    <option key={guru.id} value={guru.id}>
                      {guru.user?.name || 'Guru Tanpa Nama'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Pilih guru tahfidz yang akan menguji</p>
              </div>

              {/* Jam & Tanggal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Tasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jamTasmi}
                    onChange={(e) => setFormData({ ...formData, jamTasmi: e.target.value })}
                    placeholder="Contoh: 08:00-10:00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Jam yang diajukan</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Tasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalTasmi}
                    onChange={(e) => setFormData({ ...formData, tanggalTasmi: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanggal yang diajukan</p>
                </div>
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="3"
                  placeholder="Catatan tambahan jika ada"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Info Panel - SIMTAQ Green */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  <strong>Catatan:</strong> Pastikan semua data yang Anda masukkan sudah benar.
                  Guru akan memverifikasi pendaftaran Anda dan dapat menolak jika terdapat kesalahan atau jadwal bentrok.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {editMode ? 'Update Pendaftaran' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </SiswaLayout>
  );
}
