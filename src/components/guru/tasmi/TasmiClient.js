'use client';

import { useState, useMemo } from 'react';
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
          {icon}
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
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showRekapFilterModal, setShowRekapFilterModal] = useState(false);
  const [selectedTasmi, setSelectedTasmi] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form states
  const [approveData, setApproveData] = useState({ tanggalUjian: '', jamUjian: '' });
  const [rejectData, setRejectData] = useState({ catatanPenolakan: '' });
  const [gradeData, setGradeData] = useState({
    nilaiMakhrijul: '', nilaiKeindahan: '', nilaiTajwid: '', nilaiKelancaran: '', catatanPenguji: ''
  });
  const [rekapFilter, setRekapFilter] = useState({ startDate: '', endDate: '', kelasId: '' });
  const [isDownloadingRekap, setIsDownloadingRekap] = useState(false);

  const refreshData = async () => {
    const res = await fetch('/api/guru/tasmi');
    if (res.ok) {
      const data = await res.json();
      setTasmiList(data.tasmi || []);
    }
  };

  const calculateNilaiAkhir = (data) => {
    const { nilaiMakhrijul, nilaiKeindahan, nilaiTajwid, nilaiKelancaran } = data;
    if (!nilaiMakhrijul || !nilaiKeindahan || !nilaiTajwid || !nilaiKelancaran) return null;
    const total = parseFloat(nilaiMakhrijul) + parseFloat(nilaiKeindahan) + parseFloat(nilaiTajwid) + parseFloat(nilaiKelancaran);
    return (total / 4).toFixed(2);
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
      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil disetujui!');
        setShowApproveModal(false);
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
      if (response.ok) {
        toast.success('Pendaftaran ditolak');
        setShowRejectModal(false);
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
    if (!rekapFilter.startDate || !rekapFilter.endDate) {
      toast.error('Tanggal Mulai dan Selesai harus diisi');
      return;
    }
    setIsDownloadingRekap(true);
    try {
      const params = new URLSearchParams({
        startDate: rekapFilter.startDate,
        endDate: rekapFilter.endDate,
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

  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: { icon: <Clock size={16} />, text: 'Menunggu ACC', className: 'bg-amber-100 text-amber-700 border-amber-300' },
      DISETUJUI: { icon: <CheckCircle size={16} />, text: 'Terjadwal', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
      DITOLAK: { icon: <XCircle size={16} />, text: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-300' },
      SELESAI: { icon: <Award size={16} />, text: 'Selesai', className: 'bg-green-100 text-green-700 border-green-300' },
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
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDateTime(tasmi.tanggalUjian)}</td>
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
                          onClick={() => { setSelectedTasmi(tasmi); setIsEditMode(false); setGradeData({ nilaiMakhrijul: '', nilaiKeindahan: '', nilaiTajwid: '', nilaiKelancaran: '', catatanPenguji: '' }); setShowGradeModal(true); }}
                          className="px-2 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-100"
                        >
                          + Nilai
                        </button>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {tasmi.statusPendaftaran === 'MENUNGGU' && (
                          <>
                            <button onClick={() => { setSelectedTasmi(tasmi); setShowApproveModal(true); }} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle size={16} /></button>
                            <button onClick={() => { setSelectedTasmi(tasmi); setShowRejectModal(true); }} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><XCircle size={16} /></button>
                          </>
                        )}
                        {tasmi.nilaiAkhir && (
                          <>
                            <button onClick={() => { setSelectedTasmi(tasmi); setIsEditMode(true); setGradeData({ nilaiMakhrijul: tasmi.nilaiKelancaran, nilaiKeindahan: tasmi.nilaiAdab, nilaiTajwid: tasmi.nilaiTajwid, nilaiKelancaran: tasmi.nilaiIrama, catatanPenguji: tasmi.catatanPenguji }); setShowGradeModal(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16} /></button>
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

      {/* Modals - Simplified for brevity but keeping essential logic */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Setujui Tasmi'</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold mb-1">Tanggal</label>
                <input type="date" value={approveData.tanggalUjian} onChange={e => setApproveData({...approveData, tanggalUjian: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Jam</label>
                <input type="time" value={approveData.jamUjian} onChange={e => setApproveData({...approveData, jamUjian: e.target.value})} className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2 border rounded-lg font-bold">Batal</button>
              <button onClick={handleApprove} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700">Setujui</button>
            </div>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? 'Edit' : 'Tambah'} Nilai</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Makharijul Huruf</label>
                  <input type="number" value={gradeData.nilaiMakhrijul} onChange={e => setGradeData({...gradeData, nilaiMakhrijul: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Keindahan</label>
                  <input type="number" value={gradeData.nilaiKeindahan} onChange={e => setGradeData({...gradeData, nilaiKeindahan: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tajwid</label>
                  <input type="number" value={gradeData.nilaiTajwid} onChange={e => setGradeData({...gradeData, nilaiTajwid: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kelancaran</label>
                  <input type="number" value={gradeData.nilaiKelancaran} onChange={e => setGradeData({...gradeData, nilaiKelancaran: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Catatan</label>
                <textarea value={gradeData.catatanPenguji} onChange={e => setGradeData({...gradeData, catatanPenguji: e.target.value})} className="w-full p-2 border rounded-lg" rows={3} />
              </div>
              {calculateNilaiAkhir(gradeData) && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                  <span className="font-bold text-emerald-800">Nilai Akhir:</span>
                  <span className="text-2xl font-bold text-emerald-600">{calculateNilaiAkhir(gradeData)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGradeModal(false)} className="flex-1 py-2 border rounded-lg font-bold">Batal</button>
              <button onClick={handleSaveGrade} className="flex-1 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showRekapFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Unduh Rekap</h3>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Dari</label>
                  <input type="date" value={rekapFilter.startDate} onChange={e => setRekapFilter({...rekapFilter, startDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Sampai</label>
                  <input type="date" value={rekapFilter.endDate} onChange={e => setRekapFilter({...rekapFilter, endDate: e.target.value})} className="w-full p-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Kelas (Opsional)</label>
                <select value={rekapFilter.kelasId} onChange={e => setRekapFilter({...rekapFilter, kelasId: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Semua Kelas</option>
                  {guruKelas.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRekapFilterModal(false)} className="flex-1 py-2 border rounded-lg font-bold">Batal</button>
              <button onClick={handleDownloadRekap} disabled={isDownloadingRekap} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">
                {isDownloadingRekap ? 'Memproses...' : 'Unduh PDF'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
