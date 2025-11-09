'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Star,
  User,
  AlertCircle,
  Save,
  X as XIcon
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function GuruTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [guruId, setGuruId] = useState(null);
  const [tasmiList, setTasmiList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedTasmi, setSelectedTasmi] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Form states
  const [scheduleData, setScheduleData] = useState({
    tanggalUjian: '',
    waktu: '',
  });

  const [gradeData, setGradeData] = useState({
    nilaiKelancaran: '',
    nilaiTajwid: '',
    nilaiKetepatan: '',
    catatan: '',
  });

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Get guru ID
      const guruRes = await fetch('/api/guru');
      if (guruRes.ok) {
        const guruData = await guruRes.json();
        setGuruId(guruData.guru?.id);
      }

      // Get all tasmi
      const tasmiRes = await fetch('/api/guru/tasmi');
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

  const handleApprove = async () => {
    if (!selectedTasmi) return;

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggalUjian: selectedTasmi.tanggalTasmi, // Use tanggal from siswa's submission
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil disetujui');
        setShowApproveModal(false);
        setSelectedTasmi(null);
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menyetujui pendaftaran');
      }
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleReject = async () => {
    if (!selectedTasmi) return;

    if (!rejectReason || rejectReason.trim() === '') {
      toast.error('Catatan penolakan wajib diisi');
      return;
    }

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catatanPenolakan: rejectReason.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil ditolak');
        setShowRejectModal(false);
        setSelectedTasmi(null);
        setRejectReason('');
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menolak pendaftaran');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selectedTasmi) return;

    try {
      const tanggalUjian = new Date(`${scheduleData.tanggalUjian}T${scheduleData.waktu || '00:00'}`);

      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggalUjian: tanggalUjian.toISOString(),
        }),
      });

      if (response.ok) {
        toast.success('Jadwal ujian berhasil ditambahkan');
        setShowScheduleModal(false);
        setSelectedTasmi(null);
        setScheduleData({ tanggalUjian: '', waktu: '' });
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menambah jadwal');
      }
    } catch (error) {
      console.error('Error scheduling:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedTasmi) return;

    try {
      const kelancaran = parseInt(gradeData.nilaiKelancaran);
      const tajwid = parseInt(gradeData.nilaiTajwid);
      const ketepatan = parseInt(gradeData.nilaiKetepatan);
      const nilaiAkhir = ((kelancaran + tajwid + ketepatan) / 3).toFixed(2);

      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guruPengujiId: guruId,
          nilaiKelancaran: kelancaran,
          nilaiTajwid: tajwid,
          nilaiKetepatan: ketepatan,
          nilaiAkhir: parseFloat(nilaiAkhir),
          catatan: gradeData.catatan || null,
        }),
      });

      if (response.ok) {
        toast.success('Nilai berhasil disimpan');
        setShowGradeModal(false);
        setSelectedTasmi(null);
        setGradeData({ nilaiKelancaran: '', nilaiTajwid: '', nilaiKetepatan: '', catatan: '' });
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menyimpan nilai');
      }
    } catch (error) {
      console.error('Error grading:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const openApproveModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setShowApproveModal(true);
  };

  const openRejectModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const openScheduleModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setShowScheduleModal(true);
  };

  const openGradeModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setShowGradeModal(true);
  };

  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: { icon: <Clock size={14} />, text: 'Menunggu', class: 'bg-amber-100 text-amber-700' },
      DISETUJUI: { icon: <CheckCircle size={14} />, text: 'Disetujui', class: 'bg-green-100 text-green-700' },
      DITOLAK: { icon: <XCircle size={14} />, text: 'Ditolak', class: 'bg-red-100 text-red-700' },
      SELESAI: { icon: <Award size={14} />, text: 'Selesai', class: 'bg-purple-100 text-purple-700' },
    };
    const badge = badges[status] || badges.MENUNGGU;
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${badge.class}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  const filteredTasmi = filterStatus === 'ALL'
    ? tasmiList
    : tasmiList.filter(t => t.statusPendaftaran === filterStatus);

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Award size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Manajemen Tasmi'</h1>
              <p className="text-purple-100">
                Verifikasi pendaftaran, atur jadwal, dan input nilai ujian Tasmi' siswa
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Pendaftar', value: tasmiList.length, color: 'indigo' },
            { label: 'Menunggu Verifikasi', value: tasmiList.filter(t => t.statusPendaftaran === 'MENUNGGU').length, color: 'amber' },
            { label: 'Disetujui', value: tasmiList.filter(t => t.statusPendaftaran === 'DISETUJUI').length, color: 'green' },
            { label: 'Selesai', value: tasmiList.filter(t => t.statusPendaftaran === 'SELESAI').length, color: 'purple' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {['ALL', 'MENUNGGU', 'DISETUJUI', 'DITOLAK', 'SELESAI'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'ALL' ? 'Semua' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Nama Siswa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Kelas</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Jumlah Hafalan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Juz Tasmi'</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Jam</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Catatan</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasmi.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <Award size={48} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">Belum ada data Tasmi'</p>
                    </td>
                  </tr>
                ) : (
                  filteredTasmi.map((tasmi, idx) => (
                    <tr key={tasmi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {tasmi.siswa?.user?.name || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tasmi.siswa?.kelas?.nama || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                          {tasmi.jumlahHafalan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {tasmi.juzYangDitasmi || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {tasmi.jamTasmi || '-'}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {tasmi.tanggalTasmi
                          ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">{getStatusBadge(tasmi.statusPendaftaran)}</td>
                      <td className="px-4 py-3 text-sm">
                        {tasmi.statusPendaftaran === 'DITOLAK' && tasmi.catatanPenolakan ? (
                          <div className="max-w-xs">
                            <p className="text-red-600 font-medium text-xs">Ditolak:</p>
                            <p className="text-gray-600 text-xs">{tasmi.catatanPenolakan}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600 text-xs">{tasmi.catatan || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {tasmi.statusPendaftaran === 'MENUNGGU' && (
                            <>
                              <button
                                onClick={() => openApproveModal(tasmi)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                title="Setujui"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => openRejectModal(tasmi)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                title="Tolak"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {tasmi.statusPendaftaran === 'DISETUJUI' && !tasmi.nilaiAkhir && (
                            <button
                              onClick={() => openGradeModal(tasmi)}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                              title="Nilai"
                            >
                              Input Nilai
                            </button>
                          )}
                          {tasmi.statusPendaftaran === 'SELESAI' && (
                            <span className="text-gray-400 text-xs">-</span>
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
      </div>

      {/* Modal Approve */}
      {showApproveModal && selectedTasmi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Setujui Pendaftaran Tasmi'</h2>
              <p className="text-sm text-gray-600 mt-1">Periksa detail pendaftaran sebelum menyetujui</p>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Nama Siswa</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.siswa?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Kelas</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.siswa?.kelas?.nama || '-'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Jumlah Hafalan</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.jumlahHafalan} Juz</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Juz yang Ditasmi'</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.juzYangDitasmi}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Jam Tasmi'</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.jamTasmi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tanggal Tasmi'</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTasmi.tanggalTasmi
                        ? new Date(selectedTasmi.tanggalTasmi).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
                {selectedTasmi.catatan && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Catatan Siswa</p>
                    <p className="text-sm text-gray-700">{selectedTasmi.catatan}</p>
                  </div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  Dengan menyetujui, jadwal ujian akan diatur sesuai tanggal dan jam yang diajukan siswa.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowApproveModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleApprove}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold"
                >
                  Setujui Pendaftaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {showRejectModal && selectedTasmi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-5 border-b">
              <h2 className="text-xl font-bold text-gray-900">Tolak Pendaftaran Tasmi'</h2>
              <p className="text-sm text-gray-600 mt-1">Berikan alasan penolakan yang jelas</p>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Nama Siswa</p>
                  <p className="font-semibold text-gray-900">{selectedTasmi.siswa?.user?.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Jam yang Diajukan</p>
                    <p className="font-semibold text-gray-900">{selectedTasmi.jamTasmi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tanggal yang Diajukan</p>
                    <p className="font-semibold text-gray-900">
                      {selectedTasmi.tanggalTasmi
                        ? new Date(selectedTasmi.tanggalTasmi).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="4"
                  placeholder="Contoh: Jadwal pendaftaran tasmi ditolak karena jam yang diajukan bentrok dengan jadwal guru mengajar di kelas lain"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Siswa akan melihat catatan ini dan dapat mengedit pendaftarannya</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  Siswa dapat mengedit dan mengajukan ulang pendaftaran setelah melihat catatan penolakan Anda.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
                >
                  Tolak Pendaftaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Jadwal */}
      {showScheduleModal && selectedTasmi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Tambah Jadwal Ujian</h2>
              <button onClick={() => setShowScheduleModal(false)}>
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tanggal Ujian *</label>
                <input
                  type="date"
                  value={scheduleData.tanggalUjian}
                  onChange={(e) => setScheduleData({ ...scheduleData, tanggalUjian: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Waktu</label>
                <input
                  type="time"
                  value={scheduleData.waktu}
                  onChange={(e) => setScheduleData({ ...scheduleData, waktu: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nilai */}
      {showGradeModal && selectedTasmi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Input Nilai Tasmi'</h2>
              <button onClick={() => setShowGradeModal(false)}>
                <XIcon size={20} />
              </button>
            </div>
            <form onSubmit={handleGrade} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Kelancaran *</label>
                  <input
                    type="number"
                    value={gradeData.nilaiKelancaran}
                    onChange={(e) => setGradeData({ ...gradeData, nilaiKelancaran: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tajwid *</label>
                  <input
                    type="number"
                    value={gradeData.nilaiTajwid}
                    onChange={(e) => setGradeData({ ...gradeData, nilaiTajwid: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ketepatan *</label>
                  <input
                    type="number"
                    value={gradeData.nilaiKetepatan}
                    onChange={(e) => setGradeData({ ...gradeData, nilaiKetepatan: e.target.value })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Catatan</label>
                <textarea
                  value={gradeData.catatan}
                  onChange={(e) => setGradeData({ ...gradeData, catatan: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Tambahkan catatan (opsional)"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGradeModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Batal</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg">Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
