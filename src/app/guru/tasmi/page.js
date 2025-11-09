'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  Award,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  User,
  Save,
  X as XIcon,
  Edit,
  FileText,
  Send,
  Plus,
  Eye,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function GuruTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [tasmiList, setTasmiList] = useState([]);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedTasmi, setSelectedTasmi] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [approveData, setApproveData] = useState({
    tanggalUjian: '',
    jamUjian: '',
  });

  const [rejectData, setRejectData] = useState({
    catatanPenolakan: '',
  });

  const [gradeData, setGradeData] = useState({
    nilaiMakhrijul: '',
    nilaiKeindahan: '',
    nilaiTajwid: '',
    nilaiKelancaran: '',
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
    const { nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran } = data;
    if (!nilaiMakhrijul || !nilaiKeindahan || !nilaiTajwid || !nilaiKelancaran) return null;

    const total =
      parseFloat(nilaiMakhrijul) +
      parseFloat(nilaiKeindahan) +
      parseFloat(nilaiTajwid) +
      parseFloat(nilaiKelancaran);
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
      tanggalUjian: tasmi.tanggalTasmi
        ? new Date(tasmi.tanggalTasmi).toISOString().split('T')[0]
        : '',
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
  const openGradeModal = (tasmi, isEdit = false) => {
    setSelectedTasmi(tasmi);
    setIsEditMode(isEdit);

    if (isEdit && tasmi.nilaiAkhir) {
      // Load existing grades
      setGradeData({
        nilaiMakhrijul: tasmi.nilaiKelancaran || '',
        nilaiKeindahan: tasmi.nilaiAdab || '',
        nilaiTajwid: tasmi.nilaiTajwid || '',
        nilaiKelancaran: tasmi.nilaiIrama || '',
        catatanPenguji: tasmi.catatanPenguji || '',
      });
    } else {
      // Reset for new grade
      setGradeData({
        nilaiMakhrijul: '',
        nilaiKeindahan: '',
        nilaiTajwid: '',
        nilaiKelancaran: '',
        catatanPenguji: '',
      });
    }
    setShowGradeModal(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedTasmi) return;

    const { nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran } = gradeData;

    if (!nilaiMakhrijul || !nilaiKeindahan || !nilaiTajwid || !nilaiKelancaran) {
      toast.error('Semua nilai harus diisi');
      return;
    }

    // Validate range
    const values = [nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran];
    const allValid = values.every((v) => {
      const num = parseFloat(v);
      return num >= 0 && num <= 100;
    });

    if (!allValid) {
      toast.error('Semua nilai harus antara 0-100');
      return;
    }

    const nilaiAkhir = calculateNilaiAkhir(gradeData);
    const predikat = getPredikat(nilaiAkhir);

    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nilaiKelancaran: parseFloat(nilaiMakhrijul),
          nilaiAdab: parseFloat(nilaiKeindahan),
          nilaiTajwid: parseFloat(nilaiTajwid),
          nilaiIrama: parseFloat(nilaiKelancaran),
          nilaiAkhir: parseFloat(nilaiAkhir),
          predikat,
          catatanPenguji: gradeData.catatanPenguji,
          publish: false, // Save as draft, generate PDF but don't publish
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Penilaian berhasil disimpan! PDF sedang dibuat...');
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

  const handlePublish = async (tasmiId) => {
    if (!confirm('Apakah Anda yakin ingin mempublikasikan hasil ini ke siswa?')) return;

    try {
      const response = await fetch(`/api/guru/tasmi/${tasmiId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Hasil penilaian berhasil dipublikasikan!');
        fetchData();
      } else {
        toast.error(data.message || 'Gagal mempublikasikan hasil');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: {
        icon: <Clock size={16} />,
        text: 'Menunggu ACC',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      DISETUJUI: {
        icon: <CheckCircle size={16} />,
        text: 'Terjadwal',
        className: 'bg-green-100 text-green-700 border-green-200',
      },
      DITOLAK: {
        icon: <XCircle size={16} />,
        text: 'Ditolak',
        className: 'bg-red-100 text-red-700 border-red-200',
      },
      SELESAI: {
        icon: <Award size={16} />,
        text: 'Selesai',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
    };

    const badge = badges[status] || badges.MENUNGGU;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.className}`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  // Get predikat badge
  const getPredikatBadge = (predikat) => {
    if (!predikat) return null;

    const badges = {
      Mumtaz: 'bg-green-100 text-green-700 border-green-200',
      'Jayyid Jiddan': 'bg-blue-100 text-blue-700 border-blue-200',
      Jayyid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Maqbul: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${
          badges[predikat] || badges.Maqbul
        }`}
      >
        {predikat}
      </span>
    );
  };

  // Calculate preview values
  const nilaiAkhirPreview = calculateNilaiAkhir(gradeData);
  const predikatPreview = getPredikat(nilaiAkhirPreview);

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Award className="text-purple-600" size={32} />
                Manajemen Tasmi&apos; Al-Qur&apos;an
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola pendaftaran dan penilaian ujian Tasmi&apos;
              </p>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Pendaftaran Tasmi&apos;</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kelas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Juz yang Ditasmi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal Ujian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasil Penilaian
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasmiList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      Tidak ada data tasmi
                    </td>
                  </tr>
                ) : (
                  tasmiList.map((tasmi, index) => (
                    <tr key={tasmi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <div className="font-medium">{tasmi.siswa.user.name}</div>
                            <div className="text-xs text-gray-500">{tasmi.siswa.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tasmi.siswa.kelas?.nama || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{tasmi.juzYangDitasmi}</div>
                        <div className="text-xs text-gray-500">Total: {tasmi.jumlahHafalan} Juz</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tasmi.tanggalUjian ? (
                          <div>
                            <div className="font-medium">{formatDateTime(tasmi.tanggalUjian)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Belum dijadwalkan</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(tasmi.statusPendaftaran)}</td>
                      <td className="px-6 py-4 text-center">
                        {/* Jika sudah dinilai */}
                        {tasmi.nilaiAkhir ? (
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star size={16} className="text-yellow-500 fill-yellow-500" />
                              <span className="font-bold text-lg">{tasmi.nilaiAkhir.toFixed(0)}</span>
                            </div>
                            {getPredikatBadge(tasmi.predikat)}
                            {tasmi.publishedAt ? (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <CheckCircle size={12} /> Dipublikasi
                              </span>
                            ) : (
                              <span className="text-xs text-amber-600">Belum dipublikasi</span>
                            )}
                          </div>
                        ) : tasmi.statusPendaftaran === 'DISETUJUI' ? (
                          <button
                            onClick={() => openGradeModal(tasmi, false)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Plus size={14} />
                            Tambah Penilaian
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Aksi untuk status MENUNGGU */}
                          {tasmi.statusPendaftaran === 'MENUNGGU' && (
                            <>
                              <button
                                onClick={() => openApproveModal(tasmi)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <CheckCircle size={14} />
                                Setujui
                              </button>
                              <button
                                onClick={() => openRejectModal(tasmi)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <XCircle size={14} />
                                Tolak
                              </button>
                            </>
                          )}

                          {/* Aksi untuk sudah dinilai tapi belum publish */}
                          {tasmi.nilaiAkhir && !tasmi.publishedAt && (
                            <>
                              <button
                                onClick={() => openGradeModal(tasmi, true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handlePublish(tasmi.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Send size={14} />
                                Publish
                              </button>
                            </>
                          )}

                          {/* Jika sudah publish, tampilkan PDF */}
                          {tasmi.publishedAt && tasmi.pdfUrl && (
                            <button
                              onClick={() => window.open(tasmi.pdfUrl, '_blank')}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              <FileText size={14} />
                              Lihat PDF
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
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Setujui Pendaftaran Tasmi&apos;</h3>
              <button
                onClick={() => setShowApproveModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Ujian
                </label>
                <input
                  type="date"
                  value={approveData.tanggalUjian}
                  onChange={(e) => setApproveData({ ...approveData, tanggalUjian: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jam Ujian</label>
                <input
                  type="time"
                  value={approveData.jamUjian}
                  onChange={(e) => setApproveData({ ...approveData, jamUjian: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Setujui
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Tolak Pendaftaran Tasmi&apos;</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penolakan
                </label>
                <textarea
                  value={rejectData.catatanPenolakan}
                  onChange={(e) => setRejectData({ catatanPenolakan: e.target.value })}
                  rows={4}
                  placeholder="Contoh: Jadwal pendaftaran tasmi ditolak karena jam yang diajukan bentrok dengan jadwal guru"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle size={18} />
                Tolak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {showGradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit' : 'Tambah'} Penilaian Tasmi&apos;
              </h3>
              <button
                onClick={() => setShowGradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            {selectedTasmi && (
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Nama Siswa:</span>
                    <p className="font-semibold text-gray-900">{selectedTasmi.siswa.user.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Kelas:</span>
                    <p className="font-semibold text-gray-900">
                      {selectedTasmi.siswa.kelas?.nama || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Juz yang Ditasmi:</span>
                    <p className="font-semibold text-gray-900">{selectedTasmi.juzYangDitasmi}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Hafalan:</span>
                    <p className="font-semibold text-gray-900">{selectedTasmi.jumlahHafalan} Juz</p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Nilai Makhrijul Huruf */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Makhrijul Huruf (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeData.nilaiMakhrijul}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiMakhrijul: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Masukkan nilai 0-100"
                />
              </div>

              {/* Nilai Keindahan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keindahan dalam Melantunkan (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeData.nilaiKeindahan}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiKeindahan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Masukkan nilai 0-100"
                />
              </div>

              {/* Nilai Tajwid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tajwid (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeData.nilaiTajwid}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiTajwid: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Masukkan nilai 0-100"
                />
              </div>

              {/* Nilai Kelancaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelancaran dan Kefashihan dalam Melafalkan Makhrijul Huruf (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeData.nilaiKelancaran}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiKelancaran: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Masukkan nilai 0-100"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Penguji (Opsional)
                </label>
                <textarea
                  value={gradeData.catatanPenguji}
                  onChange={(e) => setGradeData({ ...gradeData, catatanPenguji: e.target.value })}
                  rows={3}
                  placeholder="Tambahkan catatan atau komentar untuk siswa..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Preview Hasil */}
              {nilaiAkhirPreview && (
                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Preview Hasil:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nilai Akhir:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-2xl font-bold text-purple-700">
                          {nilaiAkhirPreview}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Predikat:</p>
                      <p className="text-2xl font-bold text-purple-700 mt-1">{predikatPreview}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGrade}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Simpan Nilai
              </button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              * Nilai akan disimpan dan PDF otomatis dibuat. Klik &quot;Publish&quot; untuk menampilkan hasil ke siswa.
            </p>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
