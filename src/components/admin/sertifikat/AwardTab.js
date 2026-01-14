'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  Eye, 
  Download, 
  Trash2, 
  UserPlus, 
  Users,
  Trophy,
  Filter,
  GraduationCap,
  Calendar,
  Layers,
  Inbox,
  Award,
  ChevronRight,
  FileCheck,
  Printer, 
  Plus,
  Settings,
  Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/shared/EmptyState';
import AwardCategoryModal from './AwardCategoryModal';
import CertificateSettingsModal from './CertificateSettingsModal';

export default function AwardTab() {
  const [candidates, setCandidates] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingSelected, setLoadingSelected] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);

  const [candidateFilters, setCandidateFilters] = useState({
    query: '',
    kelasId: '',
    periode: '',
    jenisKelamin: '',
    hideSelected: false
  });

  const [selectedFilters, setSelectedFilters] = useState({
    query: '',
    categoryId: ''
  });

  const [kelas, setKelas] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchKelas();
  }, []);

  // Fetch candidates based on filters
  useEffect(() => {
    fetchCandidates();
  }, [candidateFilters.kelasId, candidateFilters.periode, candidateFilters.jenisKelamin, candidateFilters.hideSelected]);

  // Fetch selected based on filters
  useEffect(() => {
    fetchSelected();
  }, [selectedFilters.categoryId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/awards/categories');
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (err) {
      console.error('Error categories:', err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await fetch('/api/admin/kelas');
      const data = await res.json();
      if (res.ok) setKelas(data.kelas || []);
    } catch (err) {
      console.error('Error kelas:', err);
    }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      // Build params manually to handle boolean correctly
      const params = new URLSearchParams();
      if (candidateFilters.query) params.append('query', candidateFilters.query);
      if (candidateFilters.kelasId) params.append('kelasId', candidateFilters.kelasId);
      if (candidateFilters.periode) params.append('periode', candidateFilters.periode);
      if (candidateFilters.jenisKelamin) params.append('jenisKelamin', candidateFilters.jenisKelamin);
      if (candidateFilters.hideSelected) params.append('hideSelected', 'true');

      const res = await fetch(`/api/admin/awards/candidates?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setCandidates(data.candidates || []);
    } catch (err) {
      toast.error('Gagal mengambil data peserta');
    } finally {
      setLoadingCandidates(false);
    }
  };

  const fetchSelected = async () => {
    setLoadingSelected(true);
    try {
      const params = new URLSearchParams(selectedFilters);
      const res = await fetch(`/api/admin/awards/selected?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setSelectedRecipients(data.selected || []);
    } catch (err) {
      toast.error('Gagal mengambil data award');
    } finally {
      setLoadingSelected(false);
    }
  };

  const handleAddAward = async (tasmi) => {
    const categoryId = document.getElementById(`cat-select-${tasmi.id}`).value;
    if (!categoryId) return toast.error('Pilih kategori terlebih dahulu');

    try {
      const res = await fetch('/api/admin/awards/selected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: tasmi.siswaId,
          categoryId,
          sourceTasmiId: tasmi.id
        })
      });

      if (res.ok) {
        toast.success('Berhasil menambahkan ke daftar award');
        fetchCandidates();
        fetchSelected();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Gagal menambahkan');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleUpdateCategory = async (recipientId, categoryId) => {
    try {
      const res = await fetch(`/api/admin/awards/selected/${recipientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId })
      });

      if (res.ok) {
        toast.success('Kategori diperbarui');
        fetchSelected();
      }
    } catch (err) {
      toast.error('Gagal memperbarui kategori');
    }
  };

  const handleRemoveAward = async (id) => {
    if (!confirm('Hapus siswa ini dari daftar award?')) return;
    try {
      const res = await fetch(`/api/admin/awards/selected/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Dihapus dari daftar award');
        fetchCandidates();
        fetchSelected();
      }
    } catch (err) {
      toast.error('Gagal menghapus');
    }
  };

  const handlePreview = (id, isAward = false, download = false) => {
    const type = isAward ? 'award' : 'non-award';
    const url = `/api/admin/certificates/${type}/${id}/preview?date=${certDate}${download ? '&download=true' : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-10">
      {/* SECTION 1: CANDIDATES */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Semua Peserta Tasmi</h3>
              <p className="text-xs text-slate-500 font-medium italic">Siswa yang sudah lulus ujian dan siap diberikan award</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 border-emerald-50 shadow-sm">
              <Calendar size={16} className="text-emerald-600" />
              <input 
                type="date" 
                value={certDate}
                onChange={(e) => setCertDate(e.target.value)}
                className="text-[10px] font-black text-slate-600 outline-none"
              />
            </div>

            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border-2 border-slate-50 shadow-sm transition-all active:scale-95"
              title="Pengaturan TTD"
            >
              <Settings size={18} />
            </button>

            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-emerald-50 border-2 border-emerald-50 shadow-sm transition-all active:scale-95"
            >
              <Tag size={16} />
              Kelola Kategori
            </button>
          </div>
        </div>

        {/* Candidate Filters */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
          <div className="space-y-4">
            {/* Row 1: Filters + Refresh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 ml-1">Cari Nama/NISN</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Ketik lalu Enter..."
                    value={candidateFilters.query}
                    onChange={(e) => setCandidateFilters({ ...candidateFilters, query: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
                    className="w-full h-10 pl-10 pr-4 bg-white/50 border-2 border-emerald-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 ml-1">Kelas</label>
                <select
                  value={candidateFilters.kelasId}
                  onChange={(e) => setCandidateFilters({ ...candidateFilters, kelasId: e.target.value })}
                  className="w-full h-10 px-4 bg-white/50 border-2 border-emerald-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer"
                >
                  <option value="">Semua Kelas</option>
                  {kelas.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600 ml-1">Tahun</label>
                <select
                  value={candidateFilters.periode}
                  onChange={(e) => setCandidateFilters({ ...candidateFilters, periode: e.target.value })}
                  className="w-full h-10 px-4 bg-white/50 border-2 border-emerald-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer"
                >
                  <option value="">Semua Tahun</option>
                  {[0,1,2,3,4].map(i => {
                    const y = new Date().getFullYear() - i;
                    return <option key={y} value={y}>{y}</option>
                  })}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 ml-1">Gender</label>
                  <select
                    value={candidateFilters.jenisKelamin}
                    onChange={(e) => setCandidateFilters({ ...candidateFilters, jenisKelamin: e.target.value })}
                    className="w-full h-10 px-4 bg-white/50 border-2 border-emerald-50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer"
                  >
                    <option value="">Semua</option>
                    <option value="LAKI_LAKI">Putra</option>
                    <option value="PEREMPUAN">Putri</option>
                  </select>
                </div>
                <button 
                  onClick={fetchCandidates}
                  className="h-10 w-10 flex items-center justify-center bg-white/70 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all border border-emerald-200 shadow-sm"
                  title="Refresh Data"
                >
                  <RefreshCw size={18} className={loadingCandidates ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
            
            {/* Row 2: Toggle */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={candidateFilters.hideSelected}
                  onChange={(e) => setCandidateFilters({ ...candidateFilters, hideSelected: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-xs font-semibold text-slate-600">Sembunyikan yang sudah masuk award</span>
              </label>
            </div>
          </div>
        </div>

        {/* Candidate Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[320px]" />
                <col className="w-[120px]" />
                <col className="w-[240px]" />
                <col className="w-[160px]" />
                <col className="w-[220px]" />
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-200">
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-emerald-900 tracking-wide">Siswa</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-emerald-900 tracking-wide">Kelas</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-emerald-900 tracking-wide">Juz</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-emerald-900 tracking-wide">Nilai</th>
                  <th className="px-6 py-3.5 text-right text-sm font-semibold text-emerald-900 tracking-wide">Aksi Award</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/20">
                {loadingCandidates ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-8 bg-slate-50/30"></td></tr>
                  ))
                ) : candidates.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">Tidak ada peserta yang ditemukan</td></tr>
                ) : (
                  candidates.map((tasmi) => (
                    <tr key={tasmi.id} className="hover:bg-emerald-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {(tasmi.siswa?.user?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm md:text-[15px]">{tasmi.siswa?.user?.name || '-'}</p>
                            <p className="text-xs text-slate-500">{tasmi.siswa?.nisn || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                          {tasmi.siswa?.kelas?.nama || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-emerald-600 text-sm md:text-[15px]">Juz {tasmi.juzYangDitasmi}</td>
                      <td className="px-6 py-4 text-center">
                        <p className="text-base font-bold text-slate-700 leading-none">{tasmi.nilaiAkhir || '-'}</p>
                        <p className="text-xs text-slate-500 mt-1">{tasmi.predikat || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className="relative w-[160px]">
                            <select 
                              id={`cat-select-${tasmi.id}`}
                              className="w-full h-10 pl-3 pr-8 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                              <option value="">Pilih Award...</option>
                              {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                            </select>
                            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-500 rotate-90 pointer-events-none" size={14} />
                          </div>
                          <button
                            onClick={() => handleAddAward(tasmi)}
                            className="h-10 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-90"
                            title="Tambah ke Award"
                          >
                            <Plus size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 2: SELECTED RECIPIENTS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-sm">
            <Trophy size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 tracking-tight">Daftar Terpilih Award Wisuda</h3>
            <p className="text-xs text-slate-500 font-medium italic">Siswa yang telah dipilih untuk menerima penghargaan</p>
          </div>
        </div>

        {/* Selected Filters */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-amber-100/60 p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 ml-1">Filter Kategori</label>
              <select
                value={selectedFilters.categoryId}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, categoryId: e.target.value })}
                className="w-full h-10 px-4 bg-white/50 border-2 border-amber-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 ml-1">Cari Peserta</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Ketik lalu Enter..."
                  value={selectedFilters.query}
                  onChange={(e) => setSelectedFilters({ ...selectedFilters, query: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSelected()}
                  className="w-full h-10 pl-10 pr-4 bg-white/50 border-2 border-amber-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm transition-all"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button 
                onClick={fetchSelected}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
              >
                <RefreshCw size={16} className={loadingSelected ? 'animate-spin' : ''} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Selected Table */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-b border-orange-200">
                  <th className="px-6 py-3.5 text-left text-sm font-semibold text-orange-900 tracking-wide">Siswa</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-orange-900 tracking-wide">Kelas</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-orange-900 tracking-wide">Kategori Award</th>
                  <th className="px-6 py-3.5 text-center text-sm font-semibold text-orange-900 tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-right text-sm font-semibold text-orange-900 tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/20">
                {loadingSelected ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse"><td colSpan="5" className="px-6 py-8 bg-slate-50/30"></td></tr>
                  ))
                ) : selectedRecipients.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold italic">Belum ada award yang dipilih</td></tr>
                ) : (
                  selectedRecipients.map((rec) => (
                    <tr key={rec.id} className="hover:bg-orange-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {(rec.student?.user?.name || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm md:text-[15px]">{rec.student?.user?.name || '-'}</p>
                            <p className="text-xs text-slate-500">{rec.student?.nisn || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm md:text-[15px] text-slate-600">{rec.student?.kelas?.nama || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="relative inline-block w-full max-w-[200px]">
                          <select
                            value={rec.categoryId}
                            onChange={(e) => handleUpdateCategory(rec.id, e.target.value)}
                            className="w-full h-9 pl-3 pr-8 bg-white border border-orange-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 appearance-none cursor-pointer"
                          >
                            {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                          </select>
                          <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 rotate-90 pointer-events-none" size={14} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {rec.certificate ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100 shadow-sm">
                            <FileCheck size={12} /> Terbit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-medium border border-slate-100">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => handlePreview(rec.id, true)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                            title="Preview"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handlePreview(rec.id, true, true)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                            title="Download"
                          >
                            <Download size={18} />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1" />
                          <button
                            onClick={() => handleRemoveAward(rec.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 active:scale-90"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MODAL SETTINGS TTD */}
      <CertificateSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* MODAL KATEGORI */}
      <AwardCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onUpdate={fetchCategories}
      />
    </div>
  );
}
