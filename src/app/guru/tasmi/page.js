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
  X as XIcon,
  Edit,
  FileText,
  Send
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function GuruTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('acc'); // 'acc' or 'penilaian'
  const [tasmiList, setTasmiList] = useState([]);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedTasmi, setSelectedTasmi] = useState(null);

  // Form states
  const [approveData, setApproveData] = useState({
    tanggalUjian: '',
    jamUjian: '',
  });

  const [rejectData, setRejectData] = useState({
    catatanPenolakan: '',
  });

  const [gradeData, setGradeData] = useState({
    nilaiKelancaran: '',
    nilaiTajwid: '',
    nilaiAdab: '',
    nilaiIrama: '',
    catatanPenguji: '',
  });

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
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

  // Calculate nilai akhir dan predikat otomatis
  const calculateNilaiAkhir = (data) => {
    const { nilaiKelancaran, nilaiTajwid, nilaiAdab, nilaiIrama } = data;
    if (!nilaiKelancaran || !nilaiTajwid || !nilaiAdab || !nilaiIrama) return null;

    const total = parseFloat(nilaiKelancaran) + parseFloat(nilaiTajwid) +
                  parseFloat(nilaiAdab) + parseFloat(nilaiIrama);
    return (total / 4).toFixed(2);
  };

  const getPredikat = (nilaiAkhir) => {
    if (!nilaiAkhir) return '-';
    const nilai = parseFloat(nilaiAkhir);
    if (nilai >= 90) return 'Mumtaz';
    if (nilai >= 80) return 'Jayyid Jiddan';
    if (nilai >= 70) return 'Jayyid';
    return 'Maqbul';
  };

  // Handle Approve
  const openApproveModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setApproveData({
      tanggalUjian: tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toISOString().split('T')[0] : '',
      jamUjian: tasmi.jamTasmi || '',
    });
    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedTasmi) return;

    if (!approveData.tanggalUjian || !approveData.jamUjian) {
      toast.error('Tanggal dan jam ujian harus diisi');
      return;
    }

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tanggalUjian: approveData.tanggalUjian,
          jamUjian: approveData.jamUjian,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil disetujui!');
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

  // Handle Reject
  const openRejectModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setRejectData({ catatanPenolakan: '' });
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedTasmi) return;

    if (!rejectData.catatanPenolakan.trim()) {
      toast.error('Catatan penolakan harus diisi');
      return;
    }

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rejectData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran ditolak');
        setShowRejectModal(false);
        setSelectedTasmi(null);
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menolak pendaftaran');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Handle Penilaian
  const openGradeModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setGradeData({
      nilaiKelancaran: tasmi.nilaiKelancaran || '',
      nilaiTajwid: tasmi.nilaiTajwid || '',
      nilaiAdab: tasmi.nilaiAdab || '',
      nilaiIrama: tasmi.nilaiIrama || '',
      catatanPenguji: tasmi.catatanPenguji || '',
    });
    setShowGradeModal(true);
  };

  const handleGrade = async (publish = false) => {
    if (!selectedTasmi) return;

    const { nilaiKelancaran, nilaiTajwid, nilaiAdab, nilaiIrama } = gradeData;

    if (!nilaiKelancaran || !nilaiTajwid || !nilaiAdab || !nilaiIrama) {
      toast.error('Semua nilai harus diisi');
      return;
    }

    const nilaiAkhir = calculateNilaiAkhir(gradeData);
    const predikat = getPredikat(nilaiAkhir);

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gradeData,
          nilaiAkhir: parseFloat(nilaiAkhir),
          predikat,
          publish,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(publish ? 'Penilaian berhasil disimpan dan dipublish!' : 'Penilaian berhasil disimpan!');
        setShowGradeModal(false);
        setSelectedTasmi(null);
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menyimpan penilaian');
      }
    } catch (error) {
      console.error('Error grading:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: {
        icon: <Clock size={16} />,
        text: 'Menunggu ACC',
        className: 'bg-amber-100 text-amber-700 border-amber-200'
      },
      DISETUJUI: {
        icon: <CheckCircle size={16} />,
        text: 'Terjadwal',
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
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-xs ${badge.className}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  // Filter data
  const pendingTasmi = tasmiList.filter(t => t.statusPendaftaran === 'MENUNGGU');
  const approvedTasmi = tasmiList.filter(t => t.statusPendaftaran === 'DISETUJUI');
  const finishedTasmi = tasmiList.filter(t => t.statusPendaftaran === 'SELESAI');

  const nilaiAkhirPreview = calculateNilaiAkhir(gradeData);
  const predikatPreview = getPredikat(nilaiAkhirPreview);

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
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Award size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Manajemen Tasmi' Al-Qur'an</h1>
              <p className="text-purple-100">
                ACC pendaftaran dan penilaian ujian Tasmi' siswa
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menunggu ACC</p>
                <p className="text-2xl font-bold text-gray-900">{pendingTasmi.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Terjadwal</p>
                <p className="text-2xl font-bold text-gray-900">{approvedTasmi.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Perlu Dinilai</p>
                <p className="text-2xl font-bold text-gray-900">{finishedTasmi.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('acc')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'acc'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 ACC / Penjadwalan Tasmi'
            </button>
            <button
              onClick={() => setActiveTab('penilaian')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${
                activeTab === 'penilaian'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              ⭐ Penilaian Tasmi'
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'acc' ? (
              /* TAB 1: ACC / Penjadwalan */
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pendaftaran Menunggu ACC</h2>

                {pendingTasmi.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Tidak ada pendaftaran yang menunggu ACC</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama Siswa</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kelas</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Juz</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jadwal Diajukan</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tanggal Daftar</th>
                          <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pendingTasmi.map((tasmi) => (
                          <tr key={tasmi.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-purple-600" />
                                </div>
                                <span className="font-medium text-gray-900">{tasmi.siswa?.user?.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{tasmi.siswa?.kelas?.nama || '-'}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-semibold text-sm">
                                {tasmi.juzYangDitasmi}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                              <div>
                                <p className="font-medium">{tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID') : '-'}</p>
                                <p className="text-gray-500">{tasmi.jamTasmi || '-'}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-sm text-gray-600">
                              {new Date(tasmi.tanggalDaftar).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openApproveModal(tasmi)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
                                >
                                  <CheckCircle size={14} />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => openRejectModal(tasmi)}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <XCircle size={14} />
                                  Tolak
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Terjadwal Section */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Tasmi' Terjadwal</h2>

                  {approvedTasmi.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">Belum ada tasmi yang terjadwal</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {approvedTasmi.map((tasmi) => (
                        <div key={tasmi.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">{tasmi.siswa?.user?.name}</p>
                              <p className="text-xs text-gray-500">{tasmi.siswa?.kelas?.nama}</p>
                            </div>
                            {getStatusBadge(tasmi.statusPendaftaran)}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Award size={14} className="text-purple-600" />
                              <span>{tasmi.juzYangDitasmi}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar size={14} className="text-blue-600" />
                              <span>{tasmi.tanggalUjian ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID') : '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock size={14} className="text-amber-600" />
                              <span>{tasmi.jamTasmi || '-'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* TAB 2: Penilaian */
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tasmi' Perlu Dinilai</h2>

                {finishedTasmi.length === 0 ? (
                  <div className="text-center py-12">
                    <Star size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Tidak ada tasmi yang perlu dinilai</p>
                    <p className="text-sm text-gray-400 mt-1">Ubah status tasmi menjadi SELESAI untuk mulai penilaian</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {finishedTasmi.map((tasmi) => (
                      <div key={tasmi.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{tasmi.siswa?.user?.name}</p>
                            <p className="text-xs text-gray-500">{tasmi.siswa?.kelas?.nama}</p>
                          </div>
                          {tasmi.nilaiAkhir ? (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              Sudah Dinilai
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                              Belum Dinilai
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Award size={14} className="text-purple-600" />
                            <span>{tasmi.juzYangDitasmi}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} className="text-blue-600" />
                            <span>{tasmi.tanggalUjian ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID') : '-'}</span>
                          </div>
                          {tasmi.nilaiAkhir && (
                            <div className="flex items-center gap-2">
                              <Star size={14} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-gray-900">{tasmi.nilaiAkhir}</span>
                              <span className="text-xs text-gray-500">({tasmi.predikat})</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openGradeModal(tasmi)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Edit size={16} />
                          {tasmi.nilaiAkhir ? 'Edit Nilai' : 'Beri Nilai'}
                        </button>
                        {tasmi.nilaiAkhir && !tasmi.publishedAt && (
                          <p className="text-xs text-center text-amber-600 mt-2">⚠️ Belum dipublish</p>
                        )}
                        {tasmi.publishedAt && (
                          <p className="text-xs text-center text-green-600 mt-2">✓ Sudah dipublish</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Approve */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Setujui Pendaftaran Tasmi'</h2>
              <p className="text-sm text-gray-600 mt-1">
                Atur jadwal ujian Tasmi' untuk siswa
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                <input
                  type="text"
                  value={selectedTasmi?.siswa?.user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Juz yang Ditasmi'kan</label>
                <input
                  type="text"
                  value={selectedTasmi?.juzYangDitasmi || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={approveData.tanggalUjian}
                  onChange={(e) => setApproveData({ ...approveData, tanggalUjian: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Ujian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 08:00 - 10:00"
                  value={approveData.jamUjian}
                  onChange={(e) => setApproveData({ ...approveData, jamUjian: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: HH:MM - HH:MM</p>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedTasmi(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Tolak Pendaftaran Tasmi'</h2>
              <p className="text-sm text-gray-600 mt-1">
                Berikan alasan penolakan kepada siswa
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                <input
                  type="text"
                  value={selectedTasmi?.siswa?.user?.name || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Contoh: Jadwal yang diajukan bentrok dengan jadwal guru lain..."
                  value={rejectData.catatanPenolakan}
                  onChange={(e) => setRejectData({ ...rejectData, catatanPenolakan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  required
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedTasmi(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle size={20} />
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Penilaian */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Penilaian Tasmi' Al-Qur'an</h2>
              <p className="text-sm text-gray-600 mt-1">
                Berikan penilaian untuk siswa yang telah melaksanakan ujian Tasmi'
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Siswa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa</label>
                  <input
                    type="text"
                    value={selectedTasmi?.siswa?.user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                  <input
                    type="text"
                    value={selectedTasmi?.siswa?.kelas?.nama || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Juz yang Ditasmi'</label>
                  <input
                    type="text"
                    value={selectedTasmi?.juzYangDitasmi || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Ujian</label>
                  <input
                    type="text"
                    value={selectedTasmi?.tanggalUjian ? new Date(selectedTasmi.tanggalUjian).toLocaleDateString('id-ID') : '-'}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Penilaian */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Aspek Penilaian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Kelancaran (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="85"
                      value={gradeData.nilaiKelancaran}
                      onChange={(e) => setGradeData({ ...gradeData, nilaiKelancaran: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Tajwid (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="90"
                      value={gradeData.nilaiTajwid}
                      onChange={(e) => setGradeData({ ...gradeData, nilaiTajwid: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Adab & Sikap (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="88"
                      value={gradeData.nilaiAdab}
                      onChange={(e) => setGradeData({ ...gradeData, nilaiAdab: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nilai Irama & Lagu (0-100) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="87"
                      value={gradeData.nilaiIrama}
                      onChange={(e) => setGradeData({ ...gradeData, nilaiIrama: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Preview Nilai Akhir */}
              {nilaiAkhirPreview && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Nilai Akhir (Rata-rata)</p>
                      <p className="text-3xl font-bold text-purple-900 mt-1">{nilaiAkhirPreview}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-purple-700 font-medium">Predikat</p>
                      <p className={`text-2xl font-bold mt-1 ${
                        predikatPreview === 'Mumtaz' ? 'text-green-600' :
                        predikatPreview === 'Jayyid Jiddan' ? 'text-blue-600' :
                        predikatPreview === 'Jayyid' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {predikatPreview}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Catatan Penguji */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penguji (Opsional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Berikan catatan atau feedback untuk siswa..."
                  value={gradeData.catatanPenguji}
                  onChange={(e) => setGradeData({ ...gradeData, catatanPenguji: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex gap-3">
              <button
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedTasmi(null);
                }}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => handleGrade(false)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Simpan (Draft)
              </button>
              <button
                onClick={() => handleGrade(true)}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Send size={20} />
                Simpan & Publish
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
