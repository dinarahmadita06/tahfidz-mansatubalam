'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tag,
  FileArchive,
  CheckSquare,
  Square,
  FileSignature
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '@/components/shared/EmptyState';
import AwardCategoryModal from './AwardCategoryModal';
import CertificateSettingsModal from './CertificateSettingsModal';

// Helper functions untuk badge styling
const getPredikatBadgeClass = (predikat) => {
  const mapping = {
    'MUMTAZ': 'bg-emerald-100/60 text-emerald-700 border-emerald-200/60',
    'JAYYID_JIDDAN': 'bg-sky-100/60 text-sky-700 border-sky-200/60',
    'JAYYID': 'bg-indigo-100/60 text-indigo-700 border-indigo-200/60',
    'MAQBUL': 'bg-amber-100/60 text-amber-800 border-amber-200/60'
  };
  return mapping[predikat] || 'bg-slate-100/60 text-slate-700 border-slate-200/60';
};

const getStatusBadgeClass = (hasPublished) => {
  return hasPublished 
    ? 'bg-emerald-100/60 text-emerald-700 border-emerald-200/60'
    : 'bg-slate-100/60 text-slate-700 border-slate-200/60';
};

// Format JUZ display - avoid duplicate "Juz" prefix
const formatJuzDisplay = (juzValue) => {
  if (!juzValue) return '-';
  const trimmed = juzValue.toString().trim();
  
  // Check if already contains "juz" (case-insensitive)
  const containsJuz = /juz/i.test(trimmed);
  
  if (containsJuz) {
    // Remove duplicate "juz" at the beginning (case-insensitive)
    // e.g., "Juz juz 4" → "Juz 4", "juz juz 4" → "juz 4"
    const cleaned = trimmed.replace(/^juz\s+juz\s+/i, 'Juz ');
    // Capitalize first letter if starts with lowercase "juz"
    return cleaned.replace(/^juz\s+/, 'Juz ');
  }
  
  // If doesn't contain "juz", add prefix
  return `Juz ${trimmed}`;
};

const actionBtnClass = (variant) => {
  const base = 'h-9 w-9 rounded-xl flex items-center justify-center transition border';
  const variants = {
    preview: 'bg-sky-50 text-sky-700 border-sky-200/70 hover:bg-sky-100',
    download: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100',
    delete: 'bg-rose-50 text-rose-700 border-rose-200/70 hover:bg-rose-100'
  };
  return `${base} ${variants[variant] || 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'}`;
};

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
    jenjang: '', // Filter jenjang
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

  // Bulk generate states
  const [selectedAwardIds, setSelectedAwardIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [skipPublished, setSkipPublished] = useState(true);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkSummary, setBulkSummary] = useState(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchKelas();
  }, []);

  // Fetch candidates based on filters
  useEffect(() => {
    fetchCandidates();
  }, [candidateFilters.kelasId, candidateFilters.jenjang, candidateFilters.periode, candidateFilters.jenisKelamin, candidateFilters.hideSelected]);

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
      // Ambil dari master kelas, bukan dari awards/tasmi
      const res = await fetch('/api/kelas');
      const data = await res.json();
      
      if (res.ok) {
        // Handle berbagai format response
        const kelasList = data.kelas || data.data || data || [];
        console.log('📚 Master Kelas loaded:', kelasList.length, 'kelas');
        setKelas(Array.isArray(kelasList) ? kelasList : []);
      }
    } catch (err) {
      console.error('❌ Error kelas:', err);
      toast.error('Gagal memuat data kelas');
    }
  };

  // Filter kelas berdasarkan jenjang
  const filteredKelasByJenjang = React.useMemo(() => {
    // Jika "Semua Jenjang" dipilih, tampilkan semua kelas
    if (!candidateFilters.jenjang || candidateFilters.jenjang === '') return kelas;
    
    // Jika jenjang spesifik dipilih, filter sesuai jenjang
    const filtered = kelas.filter(k => k.nama?.startsWith(candidateFilters.jenjang));
    console.log(`🔍 Filter Jenjang "${candidateFilters.jenjang}":`, filtered.length, 'kelas');
    return filtered;
  }, [kelas, candidateFilters.jenjang]);

  // Reset kelasId ketika jenjang berubah (opsional)
  React.useEffect(() => {
    // Hanya reset jika bukan "Semua Jenjang"
    if (candidateFilters.jenjang && candidateFilters.jenjang !== '') {
      setCandidateFilters(prev => ({ ...prev, kelasId: '' }));
    }
  }, [candidateFilters.jenjang]);

  // Filter selected recipients based on search query
  const filteredSelectedRecipients = React.useMemo(() => {
    if (!selectedFilters.query) return selectedRecipients;
    
    return selectedRecipients.filter(recipient => {
      const name = recipient.student?.user?.name?.toLowerCase() || '';
      const query = selectedFilters.query.toLowerCase();
      return name.includes(query);
    });
  }, [selectedRecipients, selectedFilters.query]);

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      // Build params manually to handle boolean correctly
      const params = new URLSearchParams();
      if (candidateFilters.query) params.append('query', candidateFilters.query);
      
      // Filter berdasarkan jenjang (jika dipilih)
      if (candidateFilters.jenjang) {
        params.append('jenjang', candidateFilters.jenjang);
      }
      
      // Hanya kirim kelasId jika ada dan bukan "Semua Kelas"
      if (candidateFilters.kelasId && candidateFilters.kelasId !== '') {
        params.append('kelasId', candidateFilters.kelasId);
      }
      
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

  // Bulk generate handlers
  const handleSelectAllAwards = () => {
    if (selectedAwardIds.length === filteredSelectedRecipients.length) {
      setSelectedAwardIds([]);
    } else {
      setSelectedAwardIds(filteredSelectedRecipients.map(r => r.id));
    }
  };

  const handleSelectOneAward = (id) => {
    if (selectedAwardIds.includes(id)) {
      setSelectedAwardIds(selectedAwardIds.filter(i => i !== id));
    } else {
      setSelectedAwardIds([...selectedAwardIds, id]);
    }
  };

  const handleBulkGenerateAwards = async () => {
    // Validasi: jika ada yang belum pilih kategori dan tidak ada default kategori
    if (!defaultCategoryId && selectedAwardIds.length === 0) {
      toast.error('Pilih kategori award default atau pilih peserta tertentu');
      return;
    }

    setBulkGenerating(true);
    setBulkSummary(null);

    try {
      const payload = {
        filters: selectedFilters,
        skipPublished,
        selectedIds: selectedAwardIds.length > 0 ? selectedAwardIds : undefined,
        defaultCategoryId: defaultCategoryId || undefined,
        printDate: certDate,
      };

      const res = await fetch('/api/admin/certificates/award/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal generate sertifikat');
      }

      // Get summary from headers
      const successCount = parseInt(res.headers.get('X-Success-Count') || '0');
      const failedCount = parseInt(res.headers.get('X-Failed-Count') || '0');
      const skippedCount = parseInt(res.headers.get('X-Skipped-Count') || '0');
      const totalCount = parseInt(res.headers.get('X-Total-Count') || '0');

      setBulkSummary({
        success: successCount,
        failed: failedCount,
        skipped: skippedCount,
        total: totalCount,
      });

      // Check if response is JSON (all skipped) or ZIP file
      const contentType = res.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        toast.info(data.message || 'Semua sertifikat sudah terbit');
        setShowBulkModal(false);
        return;
      }

      // Download ZIP/PDF file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from header or use default
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'sertifikat-award.zip';
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(
        `Generate selesai! Berhasil: ${successCount}, Gagal: ${failedCount}, Dilewati: ${skippedCount}`
      );
      setShowBulkModal(false);
      setSelectedAwardIds([]);
      fetchSelected();

    } catch (error) {
      console.error('Bulk generate error:', error);
      toast.error(error.message || 'Gagal generate sertifikat bulk');
    } finally {
      setBulkGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Award Wisuda</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 text-white border border-transparent rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md hover:scale-105"
          >
            <Tag size={14} />
            Kelola Kategori
          </button>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={candidateFilters.query}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, query: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fetchCandidates()}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
            />
          </div>

          <select
            value={candidateFilters.jenjang}
            onChange={(e) => setCandidateFilters({ ...candidateFilters, jenjang: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Jenjang</option>
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>

          <select
            value={candidateFilters.kelasId}
            onChange={(e) => setCandidateFilters({ ...candidateFilters, kelasId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Kelas</option>
            {filteredKelasByJenjang.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>

          <select
            value={candidateFilters.periode}
            onChange={(e) => setCandidateFilters({ ...candidateFilters, periode: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Tahun</option>
            {Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>

          <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg border border-gray-200">
            <Calendar size={14} className="text-gray-400" />
            <input 
              type="date" 
              value={certDate}
              onChange={(e) => setCertDate(e.target.value)}
              className="text-xs text-gray-600 outline-none w-24"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Pengaturan"
          >
            <Settings size={18} />
          </button>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="TTD"
          >
            <FileSignature size={18} />
          </button>

          <button
            onClick={() => fetchCandidates()}
            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {showAdvancedFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3">
            <select
              value={candidateFilters.jenisKelamin}
              onChange={(e) => setCandidateFilters({ ...candidateFilters, jenisKelamin: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
            >
              <option value="">Gender</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                checked={candidateFilters.hideSelected || false}
                onChange={(e) => setCandidateFilters({ ...candidateFilters, hideSelected: e.target.checked })}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              Sembunyikan sudah award
            </label>
          </div>
        )}
      </div>

      {/* Tabel Kandidat */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50/70 border-b border-orange-100/70">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Siswa</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Kelas</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Juz</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Nilai</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wide">Kategori</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingCandidates ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="5" className="px-4 py-4 bg-gray-50"></td></tr>
                ))
              ) : candidates.length === 0 ? (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400 text-sm">Tidak ada kandidat</td></tr>
              ) : (
                candidates.map((tasmi, idx) => (
                  <tr key={tasmi.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-orange-50/40 border-b border-slate-100`}>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900 text-sm">{tasmi.siswa?.user?.name || '-'}</p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-block px-2 py-1 rounded-full bg-orange-100/60 text-orange-700 border border-orange-200/60 text-xs font-medium">
                        {tasmi.siswa?.kelas?.nama || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-700 text-sm">{formatJuzDisplay(tasmi.juzYangDitasmi)}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="inline-flex flex-col items-center gap-1">
                        <span className="text-base font-semibold text-gray-900">{tasmi.nilaiAkhir || '-'}</span>
                        {tasmi.predikat && (
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-xs ${getPredikatBadgeClass(tasmi.predikat)}`}>
                            {tasmi.predikat.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          id={`cat-select-${tasmi.id}`}
                          className="w-36 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                        >
                          <option value="">Kategori...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                        </select>
                        <button
                          onClick={() => handleAddAward(tasmi)}
                          className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all"
                          title="Tambahkan"
                        >
                          <Plus size={16} />
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

      {/* Panel Terpilih */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header Panel */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded"></span>
              Siap Digenerate ({filteredSelectedRecipients.length})
            </h3>
          </div>
        </div>

        {/* Filter Mini */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <select
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
            >
              <option value="">Kategori default...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
            </select>

            <select
              value={selectedFilters.categoryId}
              onChange={(e) => setSelectedFilters({ ...selectedFilters, categoryId: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
            >
              <option value="">Filter kategori...</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
            </select>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Cari nama..."
                value={selectedFilters.query}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchSelected()}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-orange-50/70 border-b border-orange-100/70">
                <th className="px-4 py-3 text-center w-12">
                  <input
                    type="checkbox"
                    checked={selectedAwardIds.length === filteredSelectedRecipients.length && filteredSelectedRecipients.length > 0}
                    onChange={handleSelectAllAwards}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                    title="Pilih Semua"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Nama Siswa</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Kelas</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Kategori Award</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingSelected ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan="6" className="px-6 py-6 bg-gray-50"></td></tr>
                ))
              ) : filteredSelectedRecipients.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada award yang dipilih</td></tr>
              ) : (
                filteredSelectedRecipients.map((rec, idx) => (
                  <tr key={rec.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-orange-50/40 border-b border-slate-100`}>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedAwardIds.includes(rec.id)}
                        onChange={() => handleSelectOneAward(rec.id)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900 text-sm">{rec.student?.user?.name || '-'}</p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-block px-2 py-1 rounded-full bg-orange-100/60 text-orange-700 border border-orange-200/60 text-xs font-medium">{rec.student?.kelas?.nama || '-'}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <select
                        value={rec.categoryId}
                        onChange={(e) => handleUpdateCategory(rec.id, e.target.value)}
                        className="w-36 px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                      >
                        {categories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(rec.certificate)}`}>
                        {rec.certificate ? (
                          <><FileCheck size={10} /> TERBIT</>
                        ) : (
                          'DRAFT'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex justify-end items-center gap-1">
                        <button
                          onClick={() => handlePreview(rec.id, true)}
                          className={actionBtnClass('preview')}
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handlePreview(rec.id, true, true)}
                          className={actionBtnClass('download')}
                          title="Download"
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveAward(rec.id)}
                          className={actionBtnClass('delete')}
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Footer Toolbar */}
        {filteredSelectedRecipients.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
            {selectedAwardIds.length > 0 && (
              <span className="text-sm text-gray-600 mr-auto">
                <span className="font-medium text-orange-600">{selectedAwardIds.length}</span> dipilih
              </span>
            )}

            <button 
              onClick={() => setShowBulkModal(true)}
              disabled={selectedAwardIds.length === 0 && !defaultCategoryId}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedAwardIds.length > 0 ? `Generate (${selectedAwardIds.length})` : 'Generate Semua'}
            </button>
          </div>
        )}
      </div>

      {/* MODAL SETTINGS TTD */}
      <CertificateSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Bulk Generate Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-orange-100">
            <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <FileArchive className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Generate Sertifikat Award Bulk</h3>
                  <p className="text-sm text-gray-600">Konfirmasi pembuatan sertifikat award massal</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {bulkGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-900">Sedang generate sertifikat...</p>
                    {bulkSummary && bulkSummary.total > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-gray-600">Total: {bulkSummary.total}</p>
                        <p className="text-xs text-green-600">✓ Berhasil: {bulkSummary.success}</p>
                        <p className="text-xs text-red-600">✗ Gagal: {bulkSummary.failed}</p>
                        <p className="text-xs text-yellow-600">⊘ Dilewati: {bulkSummary.skipped}</p>
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 transition-all duration-300"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">
                      {selectedAwardIds.length > 0 ? (
                        <>
                          Akan generate <span className="font-bold text-orange-700">{selectedAwardIds.length} sertifikat award</span> yang dipilih
                        </>
                      ) : (
                        <>
                          Akan generate <span className="font-bold text-orange-700">semua sertifikat award</span> sesuai filter saat ini
                        </>
                      )}
                    </p>
                    {defaultCategoryId && (
                      <p className="text-xs text-gray-600 mt-2">
                        Kategori default akan digunakan untuk yang belum memiliki kategori
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={skipPublished}
                      onChange={(e) => setSkipPublished(e.target.checked)}
                      className="w-5 h-5 text-orange-600 bg-white border-2 border-orange-300 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">Lewati yang sudah TERBIT</p>
                      <p className="text-xs text-gray-600">Hanya generate sertifikat yang belum diterbitkan</p>
                    </div>
                  </label>
                </>
              )}
            </div>

            {!bulkGenerating && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkGenerateAwards}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg transition-all active:scale-95"
                >
                  Generate Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL KATEGORI */}
      <AwardCategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onUpdate={fetchCategories}
      />
    </div>
  );
}
