'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Search,
  BookCheck,
  Plus,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { generateTasmiRecapPDF } from '@/lib/tasmiPdfGenerator';

// StatCard Component
function StatCard({ label, value, icon, color = 'emerald' }) {
  const configs = {
    emerald: {
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-200/70',
      text: 'text-emerald-700',
      iconBg: 'bg-emerald-100/60',
      iconText: 'text-emerald-600',
      glow: 'shadow-emerald-500/10'
    },
    amber: {
      bg: 'bg-amber-50/60',
      border: 'border-amber-200/70',
      text: 'text-amber-700',
      iconBg: 'bg-amber-100/60',
      iconText: 'text-amber-600',
      glow: 'shadow-amber-500/10'
    },
    blue: {
      bg: 'bg-blue-50/60',
      border: 'border-blue-200/70',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100/60',
      iconText: 'text-blue-600',
      glow: 'shadow-blue-500/10'
    }
  };
  
  const config = configs[color] || configs.emerald;

  return (
    <div className={`${config.bg} ${config.border} ${config.glow} p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${config.text} text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80`}>{label}</p>
          <p className={`${config.text} text-2xl font-bold`}>{value}</p>
        </div>
        <div className={`w-12 h-12 ${config.iconBg} ${config.iconText} rounded-full flex items-center justify-center shadow-sm flex-shrink-0 border ${config.border}`}>
          {(() => {
            if (!icon) return null;
            if (React.isValidElement(icon)) return icon;
            
            const isComponent = 
              typeof icon === 'function' || 
              (typeof icon === 'object' && icon !== null && (
                icon.$$typeof === Symbol.for('react.forward_ref') || 
                icon.$$typeof === Symbol.for('react.memo') ||
                icon.render || 
                icon.displayName
              ));

            if (isComponent) {
              const IconComp = icon;
              return <IconComp size={24} />;
            }
            
            return null;
          })()}
        </div>
      </div>
    </div>
  );
}

export function TasmiStats({ tasmiList }) {
  const stats = useMemo(() => ({
    total: tasmiList.length,
    waiting: tasmiList.filter(t => t.statusPendaftaran === 'MENUNGGU').length,
    graded: tasmiList.filter(t => t.nilaiAkhir).length
  }), [tasmiList]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        label="Total Pengajuan Tasmi'"
        value={stats.total}
        icon={<Search size={24} />}
        color="emerald"
      />
      <StatCard
        label="Menunggu Jadwal Ujian"
        value={stats.waiting}
        icon={<Clock size={24} />}
        color="amber"
      />
      <StatCard
        label="Sudah Dinilai / Selesai"
        value={stats.graded}
        icon={<CheckCircle size={24} />}
        color="blue"
      />
    </div>
  );
}

export function TasmiTableSection({ initialTasmi, guruKelas }) {
  const router = useRouter();
  const [tasmiList, setTasmiList] = useState(initialTasmi);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [kelasFilter, setKelasFilter] = useState('');

  // Modals
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showRekapFilterModal, setShowRekapFilterModal] = useState(false);
  const [selectedTasmi, setSelectedTasmi] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [reviewData, setReviewData] = useState({ catatanGuru: '' });
  const [gradeData, setGradeData] = useState({
    nilaiMakhrijul: '', 
    nilaiKeindahan: '', 
    nilaiTajwid: '', 
    nilaiKelancaran: '', 
    catatanPenguji: '',
    isPassed: true // Default to true
  });
  const [rekapFilter, setRekapFilter] = useState({ 
    mode: 'range', 
    startDate: '', 
    endDate: '', 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear(),
    kelasId: '' 
  });
  const [isDownloadingRekap, setIsDownloadingRekap] = useState(false);

  const refreshData = async () => {
    const res = await fetch('/api/guru/tasmi');
    if (res.ok) {
      const data = await res.json();
      setTasmiList(data.tasmi || []);
    }
  };

  const openGradeModal = (tasmi, isEdit) => {
    setSelectedTasmi(tasmi);
    setIsEditMode(isEdit);
    if (isEdit && tasmi) {
      setGradeData({
        nilaiMakhrijul: tasmi.nilaiKelancaran || '',
        nilaiKeindahan: tasmi.nilaiAdab || '',
        nilaiTajwid: tasmi.nilaiTajwid || '',
        nilaiKelancaran: tasmi.nilaiIrama || '',
        catatanPenguji: tasmi.catatanPenguji || '',
        isPassed: tasmi.isPassed ?? true
      });
    } else {
      setGradeData({ 
        nilaiMakhrijul: '', 
        nilaiKeindahan: '', 
        nilaiTajwid: '', 
        nilaiKelancaran: '', 
        catatanPenguji: '',
        isPassed: true 
      });
    }
    setShowGradeModal(true);
  };

  const calculateNilaiAkhir = (data) => {
    const { nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran } = data;
    if (!nilaiMakhrijul || !nilaiKeindahan || !nilaiTajwid || !nilaiKelancaran) return null;
    const total = parseFloat(nilaiMakhrijul) + parseFloat(nilaiKeindahan) + parseFloat(nilaiTajwid) + parseFloat(nilaiKelancaran);
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

  const filteredTasmi = useMemo(() => {
    return tasmiList.filter(t => {
      const matchesSearch = t.siswa.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.siswa.nisn && t.siswa.nisn.includes(searchQuery));
      const matchesStatus = !statusFilter || t.statusPendaftaran === statusFilter;
      const matchesKelas = !kelasFilter || t.siswa.kelasId === kelasFilter;
      return matchesSearch && matchesStatus && matchesKelas;
    });
  }, [tasmiList, searchQuery, statusFilter, kelasFilter]);

  const handleApprove = async () => {
    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catatan: reviewData.catatanGuru,
        }),
      });
      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil disetujui!');
        setShowReviewModal(false);
        refreshData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menyetujui pendaftaran');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleReject = async () => {
    if (!reviewData.catatanGuru.trim()) {
      toast.error('Catatan guru wajib diisi jika menolak');
      return;
    }
    try {
      const response = await fetch(`/api/guru/tasmi/${selectedTasmi.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catatanPenolakan: reviewData.catatanGuru,
        }),
      });
      if (response.ok) {
        toast.success('Pendaftaran ditolak');
        setShowReviewModal(false);
        refreshData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menolak pendaftaran');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleSaveGrade = async () => {
    const { nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran } = gradeData;
    if (!nilaiMakhrijul || !nilaiKeindahan || !nilaiTajwid || !nilaiKelancaran) {
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
          nilaiKelancaran: parseInt(nilaiKelancaran),
          nilaiAdab: parseInt(nilaiKeindahan),
          nilaiTajwid: parseInt(nilaiTajwid),
          nilaiIrama: parseInt(nilaiMakhrijul),
          nilaiAkhir: parseFloat(nilaiAkhir),
          predikat: predikat,
          catatanPenguji: gradeData.catatanPenguji,
          isPassed: gradeData.isPassed,
          publish: false,
        }),
      });
      if (response.ok) {
        toast.success('Penilaian berhasil disimpan!');
        setShowGradeModal(false);
        refreshData();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Gagal menyimpan penilaian');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDownloadPDF = async (tasmiId) => {
    try {
      const response = await fetch(`/api/guru/tasmi/${tasmiId}/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Laporan_Tasmi_${tasmiId}.pdf`;
        link.click();
        toast.success('PDF berhasil diunduh');
      } else {
        toast.error('Gagal mengunduh PDF');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDownloadRekap = async () => {
    let start = rekapFilter.startDate;
    let end = rekapFilter.endDate;

    if (rekapFilter.mode === 'monthly') {
      const { month, year } = rekapFilter;
      if (!month || !year) {
        toast.error('Bulan dan Tahun harus dipilih');
        return;
      }
      start = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
    } else {
      if (!start || !end) {
        toast.error('Tanggal Mulai dan Selesai harus diisi');
        return;
      }
      if (new Date(start) > new Date(end)) {
        toast.error('Tanggal Mulai tidak boleh lebih besar dari Tanggal Selesai');
        return;
      }
    }

    setIsDownloadingRekap(true);
    try {
      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
        mode: rekapFilter.mode,
        ...(rekapFilter.kelasId && { kelasId: rekapFilter.kelasId })
      });
      const response = await fetch(`/api/guru/tasmi/generate-rekap?${params.toString()}`, { method: 'POST' });
      const result = await response.json();
      if (response.ok && result.ok && !result.empty) {
        await generateTasmiRecapPDF(result.data);
        toast.success('Rekap Tasmi berhasil diunduh');
        setShowRekapFilterModal(false);
      } else {
        toast.error(result.message || 'Tidak ada data');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsDownloadingRekap(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const displayJadwal = (tasmi) => {
    if (tasmi.statusPendaftaran === 'MENUNGGU') {
      if (!tasmi.tanggalTasmi) return '-';
      const date = new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
      return `${date} ${tasmi.jamTasmi || ''}`;
    }
    return formatDateTime(tasmi.tanggalUjian);
  };

  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: { icon: <Clock size={16} />, text: 'Menunggu Verifikasi', className: 'bg-amber-100 text-amber-700 border-amber-300' },
      DISETUJUI: { icon: <CheckCircle size={16} />, text: 'Terjadwal', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      DITOLAK: { icon: <XCircle size={16} />, text: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-300' },
      SELESAI: { icon: <Award size={16} />, text: 'Selesai', className: 'bg-green-100 text-green-700 border-green-300' },
      DIBATALKAN: { icon: <XCircle size={16} />, text: 'Dibatalkan', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    };
    const badge = badges[status] || badges.MENUNGGU;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${badge.className}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cari Siswa</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Nama atau NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU">Menunggu ACC</option>
              <option value="DISETUJUI">Terjadwal</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Kelas</label>
            <select 
              value={kelasFilter}
              onChange={(e) => setKelasFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="">Semua Kelas</option>
              {guruKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowRekapFilterModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold w-full h-10"
            >
              <FileText size={18} /> Unduh Rekap
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookCheck size={20} /> Daftar Pendaftaran Tasmi&apos;
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">No</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Nama Siswa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Kelas</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Juz</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Jadwal</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Nilai</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasmi.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">Tidak ada data pendaftaran</td>
                </tr>
              ) : (
                filteredTasmi.map((tasmi, index) => (
                  <tr key={tasmi.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm font-bold text-gray-900">{tasmi.siswa.user.name}</div>
                          <div className="text-xs text-gray-500">{tasmi.siswa.nisn || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{tasmi.siswa.kelas?.nama || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{tasmi.juzYangDitasmi}</div>
                      <div className="text-xs text-gray-500">{tasmi.jumlahHafalan} Juz</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-bold text-gray-900">
                          {tasmi.tanggalUjian || tasmi.tanggalTasmi
                            ? new Date(tasmi.tanggalUjian || tasmi.tanggalTasmi).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '-'}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">{tasmi.jamTasmi || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(tasmi.statusPendaftaran)}</td>
                    <td className="px-6 py-4 text-center">
                      {tasmi.nilaiAkhir ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                            <Star size={14} className="fill-current" /> {tasmi.nilaiAkhir}
                          </div>
                        </div>
                      ) : tasmi.statusPendaftaran === 'DISETUJUI' ? (
                        <button 
                          onClick={() => openGradeModal(tasmi, false)}
                          className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          + Nilai
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {tasmi.statusPendaftaran === 'MENUNGGU' && (
                          <button 
                            onClick={() => { setSelectedTasmi(tasmi); setReviewData({ catatanGuru: '' }); setShowReviewModal(true); }} 
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 text-xs font-bold flex items-center gap-1"
                          >
                            <FileText size={14} /> Review
                          </button>
                        )}
                        {tasmi.statusPendaftaran === 'SELESAI' && tasmi.nilaiAkhir && (
                          <>
                            <button onClick={() => openGradeModal(tasmi, true)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
                            <button onClick={() => handleDownloadPDF(tasmi.id)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><FileText size={16} /></button>
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

      {/* Modal Review Pendaftaran */}
      {showReviewModal && selectedTasmi && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
              <h3 className="text-lg font-bold text-gray-900">Review Pendaftaran Tasmi</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <XIcon size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Info Read-only */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Siswa</p>
                  <p className="font-bold text-gray-900">{selectedTasmi.siswa.user.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Kelas</p>
                  <p className="font-bold text-gray-900">{selectedTasmi.siswa.kelas?.nama || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Juz Ditasmi</p>
                  <p className="font-bold text-emerald-700">{selectedTasmi.juzYangDitasmi}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-0.5">Jadwal</p>
                  <p className="font-bold text-gray-900">{displayJadwal(selectedTasmi)}</p>
                </div>
              </div>

              {/* Textarea Catatan */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Catatan Guru
                </label>
                <textarea
                  value={reviewData.catatanGuru}
                  onChange={(e) => setReviewData({ ...reviewData, catatanGuru: e.target.value })}
                  placeholder="Masukkan catatan atau instruksi tambahan..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32 transition-all"
                />
                <p className="text-[10px] text-gray-400 mt-1 italic">* Wajib diisi jika menolak pendaftaran</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleReject}
                  className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  <XCircle size={18} /> Tolak
                </button>
                <button
                  onClick={handleApprove}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
                >
                  <CheckCircle size={18} /> Terima
                </button>
              </div>
              
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-full py-2 text-gray-500 text-sm font-medium hover:text-gray-700 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-emerald-100 animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit' : 'Tambah'} Nilai Tasmi'</h3>
                <p className="text-xs text-slate-500 font-medium">Isi penilaian tasmi siswa</p>
              </div>
              <button onClick={() => setShowGradeModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Makharijul Huruf</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={gradeData.nilaiMakhrijul} 
                    onChange={e => setGradeData({...gradeData, nilaiMakhrijul: e.target.value})} 
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Keindahan</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={gradeData.nilaiKeindahan} 
                    onChange={e => setGradeData({...gradeData, nilaiKeindahan: e.target.value})} 
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Tajwid</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={gradeData.nilaiTajwid} 
                    onChange={e => setGradeData({...gradeData, nilaiTajwid: e.target.value})} 
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    placeholder="0-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Kelancaran</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={gradeData.nilaiKelancaran} 
                    onChange={e => setGradeData({...gradeData, nilaiKelancaran: e.target.value})} 
                    className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    placeholder="0-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Catatan Penguji</label>
                <textarea 
                  value={gradeData.catatanPenguji} 
                  onChange={e => setGradeData({...gradeData, catatanPenguji: e.target.value})} 
                  className="w-full p-4 border border-slate-200 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all min-h-[120px] resize-none" 
                  placeholder="Masukkan feedback untuk siswa..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="isPassed" 
                  checked={gradeData.isPassed}
                  onChange={e => setGradeData({...gradeData, isPassed: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isPassed" className="text-sm font-bold text-gray-700 cursor-pointer">
                  Siswa Lulus Tasmi (Layak Sertifikat)
                </label>
              </div>

              {calculateNilaiAkhir(gradeData) && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between shadow-sm shadow-emerald-100/50">
                  <span className="font-bold text-emerald-800 text-sm">Nilai Akhir :</span>
                  <div className="flex items-center gap-2">
                    <Star size={20} className="text-emerald-500 fill-emerald-500" />
                    <span className="text-3xl font-black text-emerald-600 tracking-tight">{calculateNilaiAkhir(gradeData)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button 
                onClick={() => setShowGradeModal(false)} 
                className="flex-1 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleSaveGrade} 
                className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300/50 transition-all shadow-lg shadow-emerald-200"
              >
                Simpan Penilaian
              </button>
            </div>
          </div>
        </div>
      )}

      {showRekapFilterModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 border border-emerald-100/60 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-emerald-50/30 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Unduh Rekap Tasmi'</h3>
                <p className="text-xs text-slate-500 font-medium">Pilih periode & filter untuk mengunduh rekap</p>
              </div>
              <button 
                onClick={() => setShowRekapFilterModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Segmented Control / Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setRekapFilter({ ...rekapFilter, mode: 'range' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    rekapFilter.mode === 'range' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Rentang Tanggal
                </button>
                <button
                  onClick={() => setRekapFilter({ ...rekapFilter, mode: 'monthly' })}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    rekapFilter.mode === 'monthly' 
                    ? 'bg-white text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Bulanan
                </button>
              </div>

              {rekapFilter.mode === 'range' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Dari</label>
                    <input 
                      type="date" 
                      value={rekapFilter.startDate} 
                      onChange={e => setRekapFilter({...rekapFilter, startDate: e.target.value})} 
                      className="w-full h-11 px-4 border border-slate-200 bg-white/70 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Sampai</label>
                    <input 
                      type="date" 
                      value={rekapFilter.endDate} 
                      onChange={e => setRekapFilter({...rekapFilter, endDate: e.target.value})} 
                      className="w-full h-11 px-4 border border-slate-200 bg-white/70 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Bulan</label>
                    <select 
                      value={rekapFilter.month} 
                      onChange={e => setRekapFilter({...rekapFilter, month: parseInt(e.target.value)})} 
                      className="w-full h-11 px-4 border border-slate-200 bg-white/70 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all"
                    >
                      {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Tahun</label>
                    <input 
                      type="number" 
                      value={rekapFilter.year} 
                      onChange={e => setRekapFilter({...rekapFilter, year: parseInt(e.target.value)})} 
                      className="w-full h-11 px-4 border border-slate-200 bg-white/70 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all" 
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 tracking-wide uppercase mb-1.5">Kelas (Opsional)</label>
                <select 
                  value={rekapFilter.kelasId} 
                  onChange={e => setRekapFilter({...rekapFilter, kelasId: e.target.value})} 
                  className="w-full h-11 px-4 border border-slate-200 bg-white/70 rounded-xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-200/40 outline-none transition-all"
                >
                  <option value="">Semua Kelas</option>
                  {guruKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
              <button 
                onClick={() => setShowRekapFilterModal(false)} 
                className="flex-1 h-11 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
              >
                Batal
              </button>
              <button 
                onClick={handleDownloadRekap} 
                disabled={isDownloadingRekap} 
                className="flex-1 h-11 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 focus:ring-4 focus:ring-emerald-300/50 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                {isDownloadingRekap ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <FileText size={18} />
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
