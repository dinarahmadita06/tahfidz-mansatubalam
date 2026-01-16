'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { generateTasmiRecapPDF } from '@/lib/tasmiPdfGenerator';
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
  Search,
  BookCheck,
  Users,
  CalendarCheck,
  Medal,
  Plus,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function GuruTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [tasmiList, setTasmiList] = useState([]);
  const [guruKelas, setGuruKelas] = useState([]);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showRekapFilterModal, setShowRekapFilterModal] = useState(false);
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
    nilaiKelancaran: '',
    nilaiAdab: '',
    nilaiTajwid: '',
    nilaiKefasihan: '',
    catatanPenguji: '',
  });

  const [rekapFilter, setRekapFilter] = useState({
    startDate: '',
    endDate: '',
    kelasId: '',
  });

  const [isDownloadingRekap, setIsDownloadingRekap] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch both tasmiList and guruKelas in parallel
      const [tasmiRes, profileRes] = await Promise.all([
        fetch(`/api/guru/tasmi?role=GURU`),
        fetch('/api/guru/profile'),
      ]);

      if (tasmiRes.ok) {
        const tasmiData = await tasmiRes.json();
        setTasmiList(tasmiData.data || []);
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.guruKelas && Array.isArray(profileData.guruKelas)) {
          setGuruKelas(profileData.guruKelas);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.role === 'GURU') {
      fetchData();
    }
  }, [session]);

  // Status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      MENUNGGU: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu ACC' },
      DISETUJUI: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Terjadwal' },
      SELESAI: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      DITOLAK: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ditolak' },
    };

    const statusConfig = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
        {statusConfig.label}
      </span>
    );
  };

  // Format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Open approve modal
  const openApproveModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setApproveData({ tanggalUjian: '', jamUjian: '' });
    setShowApproveModal(true);
  };

  // Open reject modal
  const openRejectModal = (tasmi) => {
    setSelectedTasmi(tasmi);
    setRejectData({ catatanPenolakan: '' });
    setShowRejectModal(true);
  };

  // Open grade modal
  const openGradeModal = (tasmi, isEdit) => {
    setSelectedTasmi(tasmi);
    setIsEditMode(isEdit);

    if (isEdit && tasmi) {
      setGradeData({
        nilaiKelancaran: tasmi.nilaiKelancaran || '',
        nilaiAdab: tasmi.nilaiAdab || '',
        nilaiTajwid: tasmi.nilaiTajwid || '',
        nilaiKefasihan: tasmi.nilaiIrama || '',
        catatanPenguji: tasmi.catatanPenguji || '',
      });
    } else {
      setGradeData({
        nilaiKelancaran: '',
        nilaiAdab: '',
        nilaiTajwid: '',
        nilaiKefasihan: '',
        catatanPenguji: '',
      });
    }

    setShowGradeModal(true);
  };

  // Handle approve
  const handleApprove = async () => {
    if (!approveData.tanggalUjian || !approveData.jamUjian) {
      toast.error('Tanggal dan jam ujian wajib diisi');
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
        toast.success('Pendaftaran disetujui');
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

  // Handle reject
  const handleReject = async () => {
    if (!rejectData.catatanPenolakan.trim()) {
      toast.error('Catatan penolakan wajib diisi');
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

  // Handle grading
  const handleGrade = async () => {
    if (!gradeData.nilaiKelancaran || !gradeData.nilaiAdab || !gradeData.nilaiTajwid || !gradeData.nilaiKefasihan) {
      toast.error('Semua nilai komponen wajib diisi');
      return;
    }

    try {
      const nilaiKelancaran = parseFloat(gradeData.nilaiKelancaran);
      const nilaiAdab = parseFloat(gradeData.nilaiAdab);
      const nilaiTajwid = parseFloat(gradeData.nilaiTajwid);
      const nilaiKefasihan = parseFloat(gradeData.nilaiKefasihan);

      if (isNaN(nilaiKelancaran) || isNaN(nilaiAdab) || isNaN(nilaiTajwid) || isNaN(nilaiKefasihan)) {
        toast.error('Nilai harus berupa angka');
        return;
      }

      const nilaiAkhir = (nilaiKelancaran + nilaiAdab + nilaiTajwid + nilaiKefasihan) / 4;

      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nilaiKelancaran: parseFloat(nilaiKelancaran),
          nilaiAdab: parseFloat(nilaiAdab),
          nilaiTajwid: parseFloat(nilaiTajwid),
          nilaiIrama: parseFloat(nilaiKefasihan),
          nilaiAkhir: parseFloat(nilaiAkhir),
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

  // Handle Download PDF Laporan Per Siswa
  const handleDownloadPDF = async (tasmiId) => {
    try {
      const response = await fetch(`/api/guru/tasmi/${tasmiId}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        // Download PDF
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Laporan_Tasmi_${tasmiId}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('PDF berhasil diunduh');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Gagal mengunduh PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Terjadi kesalahan saat mengunduh PDF');
    }
  };

  // Handle Download Rekap PDF
  const handleDownloadRekap = async () => {
    // Validation
    if (!rekapFilter.startDate || !rekapFilter.endDate) {
      toast.error('Tanggal mulai dan selesai wajib diisi');
      return;
    }

    if (new Date(rekapFilter.startDate) > new Date(rekapFilter.endDate)) {
      toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal selesai');
      return;
    }

    try {
      setIsDownloadingRekap(true);

      // Build query params
      const params = new URLSearchParams();
      params.append('startDate', rekapFilter.startDate);
      params.append('endDate', rekapFilter.endDate);
      if (rekapFilter.kelasId) params.append('kelasId', rekapFilter.kelasId);

      const response = await fetch(`/api/guru/tasmi/generate-rekap?${params.toString()}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok && result.ok && !result.empty) {
        // Success - generate PDF menggunakan jsPDF
        const data = result.data;
        await generateTasmiRecapPDF(data);
        toast.success('Rekap Tasmi berhasil diunduh');
        setShowRekapFilterModal(false);
      } else if (result.empty) {
        // Tidak ada data selesai
        toast.success('Belum ada hasil ujian Tasmi yang selesai pada periode ini.');
      } else {
        // Error lain
        toast.error(result.message || 'Gagal mengunduh rekap PDF');
      }
    } catch (error) {
      console.error('Error downloading rekap:', error);
      toast.error('Terjadi kesalahan saat mengunduh rekap');
    } finally {
      setIsDownloadingRekap(false);
    }
  };

  if (loading || !session) {
    return <GuruLayout><Toaster /></GuruLayout>;
  }

  return (
    <GuruLayout>
      <Toaster />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <BookCheck size={40} />
                Tasmi&apos; Al-Qur&apos;an
              </h1>
              <p className="text-emerald-50 text-lg">Kelola pendaftaran dan penilaian ujian bacaan Al-Qur&apos;an siswa</p>
            </div>
            <span className="inline-block bg-white bg-opacity-20 text-white px-4 py-2 rounded-full font-semibold">
              Ujian Tasmi&apos;
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border-l-4 border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-700 text-sm font-semibold tracking-wide uppercase">Total Pengajuan Tasmi&apos;</p>
                <p className="text-4xl font-bold text-emerald-600 mt-2">{tasmiList.length}</p>
              </div>
              <Users size={48} className="text-emerald-300" />
            </div>
          </div>

          <div className="rounded-xl border-l-4 border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-semibold tracking-wide uppercase">Menunggu Jadwal Ujian</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{tasmiList.filter((t) => t.statusPendaftaran === 'MENUNGGU').length}</p>
              </div>
              <Clock size={48} className="text-orange-300" />
            </div>
          </div>

          <div className="rounded-xl border-l-4 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold tracking-wide uppercase">Sudah Dinilai / Selesai</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{tasmiList.filter((t) => t.nilaiAkhir).length}</p>
              </div>
              <Medal size={48} className="text-blue-300" />
            </div>
          </div>
        </div>

        {/* Filter & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Cari Siswa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Siswa</label>
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nama atau NISN..."
                    className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filter Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Status</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Semua Status</option>
                  <option value="MENUNGGU">Menunggu ACC</option>
                  <option value="DISETUJUI">Terjadwal</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="DITOLAK">Ditolak</option>
                </select>
              </div>

              {/* Filter Kelas */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Kelas</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                  <option value="">Semua Kelas</option>
                </select>
              </div>

              {/* Rekap Button */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Unduh Laporan</label>
                <button
                  onClick={() => setShowRekapFilterModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                  title="Unduh laporan rekap hasil ujian Tasmi' dalam format PDF"
                >
                  <FileText size={16} />
                  Unduh Rekap
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookCheck size={20} />
              Daftar Pendaftaran Tasmi&apos;
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-500 to-green-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kelas</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Juz yang Ditasmi</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Jadwal Ujian</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Hasil Penilaian</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasmiList.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                          <BookCheck size={48} className="text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Pengajuan Tasmi&apos;</h3>
                          <p className="text-gray-600">Pengajuan Tasmi&apos; akan muncul otomatis setelah siswa mendaftar.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasmiList.map((tasmi, index) => (
                    <tr key={tasmi.id} className="hover:bg-emerald-50 transition-colors duration-200 border-b border-gray-200">
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
                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                              <CheckCircle size={12} /> Tersimpan
                            </span>
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

                          {/* Aksi untuk sudah dinilai - HANYA EDIT + PDF */}
                          {tasmi.nilaiAkhir && (
                            <>
                              <button
                                onClick={() => openGradeModal(tasmi, true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDownloadPDF(tasmi.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                              >
                                <FileText size={14} />
                                PDF
                              </button>
                            </>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Penolakan</label>
                <textarea
                  value={rejectData.catatanPenolakan}
                  onChange={(e) => setRejectData({ catatanPenolakan: e.target.value })}
                  placeholder="Jelaskan alasan penolakan..."
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Penilaian' : 'Tambah Penilaian'}</h3>
              <button
                onClick={() => setShowGradeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Makhrajul Huruf (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gradeData.nilaiKelancaran}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiKelancaran: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keindahan Melantunkan (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gradeData.nilaiAdab}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiAdab: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tajwid (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gradeData.nilaiTajwid}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiTajwid: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kefasihan & Kelancaran (0-100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={gradeData.nilaiKefasihan}
                  onChange={(e) => setGradeData({ ...gradeData, nilaiKefasihan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Penguji (Opsional)</label>
                <textarea
                  value={gradeData.catatanPenguji}
                  onChange={(e) => setGradeData({ ...gradeData, catatanPenguji: e.target.value })}
                  placeholder="Catatan tambahan untuk siswa..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleGrade}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={18} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rekap Filter Modal */}
      {showRekapFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Filter Rekap Tasmi&apos;</h3>
              <button
                onClick={() => setShowRekapFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={rekapFilter.startDate}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                <input
                  type="date"
                  value={rekapFilter.endDate}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas (Opsional)</label>
                <select
                  value={rekapFilter.kelasId}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, kelasId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Semua Kelas</option>
                  {guruKelas.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRekapFilterModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDownloadRekap}
                disabled={isDownloadingRekap}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileText size={18} />
                {isDownloadingRekap ? 'Unduh...' : 'Unduh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
