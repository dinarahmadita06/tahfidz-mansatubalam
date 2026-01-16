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
    nilaiMakhrijul: '',
    nilaiKeindahan: '',
    nilaiTajwid: '',
    nilaiKelancaran: '',
    catatanPenguji: '',
  });

  // Rekap filter state
  const [rekapFilter, setRekapFilter] = useState({
    startDate: '',
    endDate: '',
    kelasId: '',
  });
  const [isDownloadingRekap, setIsDownloadingRekap] = useState(false);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [tasmiRes, guruRes] = await Promise.all([
        fetch('/api/guru/tasmi'),
        fetch('/api/guru/profile')
      ]);

      if (tasmiRes.ok) {
        const tasmiData = await tasmiRes.json();
        setTasmiList(tasmiData.tasmi || []);
      }

      if (guruRes.ok) {
        const guruData = await guruRes.json();
        const kelas = guruData.guruKelas?.map(gk => ({
          id: gk.kelas.id,
          nama: gk.kelas.nama
        })) || [];
        setGuruKelas(kelas);
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

  // Note: getPredikat function kept for future use but not displayed in UI
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
        const data = await response.json();
        toast.error(data.message || 'Gagal mengunduh PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Terjadi kesalahan saat mengunduh PDF');
    }
  };

  // Handle Download Rekap PDF
  const handleDownloadRekap = async () => {
    try {
      // Validasi: tanggal harus diisi
      if (!rekapFilter.startDate || !rekapFilter.endDate) {
        toast.error('Tanggal Mulai dan Tanggal Selesai harus diisi');
        return;
      }

      // Validasi: tanggal mulai tidak boleh lebih besar dari tanggal selesai
      const startDate = new Date(rekapFilter.startDate);
      const endDate = new Date(rekapFilter.endDate);
      if (startDate > endDate) {
        toast.error('Tanggal Mulai tidak boleh lebih besar dari Tanggal Selesai');
        return;
      }

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
        className: 'bg-amber-100 text-amber-700 border-amber-300',
      },
      DISETUJUI: {
        icon: <CheckCircle size={16} />,
        text: 'Terjadwal',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-300',
      },
      DITOLAK: {
        icon: <XCircle size={16} />,
        text: 'Ditolak',
        className: 'bg-red-100 text-red-700 border-red-300',
      },
      SELESAI: {
        icon: <Award size={16} />,
        text: 'Selesai',
        className: 'bg-green-100 text-green-700 border-green-300',
      },
    };

    const badge = badges[status] || badges.MENUNGGU;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.className}`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  // Note: getPredikatBadge function removed - predikat no longer displayed to user

  // Calculate preview values
  const nilaiAkhirPreview = calculateNilaiAkhir(gradeData);

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
        {/* Header Gradient Hijau */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Medal size={40} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">Tasmi&apos; Al-Qur&apos;an</h1>
                  <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
                    Ujian Tasmi&apos;
                  </span>
                </div>
                <p className="text-green-50 text-lg">Kelola pendaftaran dan penilaian ujian bacaan Al-Qur&apos;an siswa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Pengajuan */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-semibold mb-1">TOTAL PENGAJUAN TASMI&apos;</p>
                <h3 className="text-4xl font-bold text-emerald-700">{tasmiList.length}</h3>
              </div>
              <div className="bg-emerald-100 p-4 rounded-full">
                <Users size={32} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Menunggu Jadwal */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold mb-1">MENUNGGU JADWAL UJIAN</p>
                <h3 className="text-4xl font-bold text-amber-700">
                  {tasmiList.filter(t => t.statusPendaftaran === 'MENUNGGU').length}
                </h3>
              </div>
              <div className="bg-amber-100 p-4 rounded-full">
                <Clock size={32} className="text-amber-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Sudah Dinilai */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">SUDAH DINILAI / SELESAI</p>
                <h3 className="text-4xl font-bold text-blue-700">
                  {tasmiList.filter(t => t.nilaiAkhir).length}
                </h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <CheckCircle size={32} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Siswa</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nama atau NISN..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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

            {/* Rekap Button - Pindah ke posisi Filter Juz */}
            <button
              onClick={() => setShowRekapFilterModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
              title="Unduh laporan rekap hasil ujian Tasmi' dalam format PDF"
            >
              <FileText size={16} />
              Unduh Rekap
            </button>
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

              {/* Preview Hasil - Show nur Nilai Akhir tanpa Predikat */}
              {nilaiAkhirPreview && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Hasil Akhir:</h4>
                  <div className="flex items-center gap-4">
                    <Star size={32} className="text-emerald-500 fill-emerald-500" />
                    <div>
                      <p className="text-sm text-gray-600">Nilai Akhir</p>
                      <p className="text-4xl font-bold text-emerald-700">{nilaiAkhirPreview}</p>
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
              * Nilai akan disimpan dan PDF otomatis dibuat.
            </p>
          </div>
        </div>
      )}

      {/* Rekap Filter Modal */}
      {showRekapFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Filter Rekap Tasmi&apos;</h3>
              <button
                onClick={() => setShowRekapFilterModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Tanggal Mulai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                <input
                  type="date"
                  value={rekapFilter.startDate}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-emerald-50"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                <input
                  type="date"
                  value={rekapFilter.endDate}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-emerald-50"
                />
              </div>

              {/* Dropdown Kelas (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas (Optional)</label>
                <select
                  value={rekapFilter.kelasId}
                  onChange={(e) => setRekapFilter({ ...rekapFilter, kelasId: e.target.value })}
                  disabled={guruKelas.length === 0}
                  className="w-full px-3 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDownloadRekap}
                disabled={isDownloadingRekap || !rekapFilter.startDate || !rekapFilter.endDate}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={16} />
                {isDownloadingRekap ? 'Membuat...' : 'Download'}
              </button>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}
