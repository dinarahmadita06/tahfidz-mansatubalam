'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Download, 
  FileCheck, 
  Printer,
  ChevronLeft,
  ChevronRight,
  User,
  GraduationCap,
  Calendar,
  Layers,
  Inbox,
  Settings,
  CheckSquare,
  Square,
  FileArchive
} from 'lucide-react';
import toast from 'react-hot-toast';
import CertificatePreviewModal from './CertificatePreviewModal';
import EmptyState from '@/components/shared/EmptyState';
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
    print: 'bg-emerald-50 text-emerald-700 border-emerald-200/70 hover:bg-emerald-100',
    delete: 'bg-rose-50 text-rose-700 border-rose-200/70 hover:bg-rose-100'
  };
  return `${base} ${variants[variant] || 'bg-slate-50 border-slate-200/70 text-slate-600 hover:bg-slate-100'}`;
};

export default function NonAwardTab() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    query: '',
    jenjang: '', // Filter jenjang
    kelasId: '',
    isPassed: 'true',
    assessed: 'true',
    periode: '',
    jenisKelamin: ''
  });
  const [kelas, setKelas] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  
  // Bulk generate states
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [skipPublished, setSkipPublished] = useState(true);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, success: 0, failed: 0, skipped: 0 });
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkSummary, setBulkSummary] = useState(null);

  // Filter kelas berdasarkan jenjang
  const filteredKelasByJenjang = React.useMemo(() => {
    // Jika "Semua Jenjang" dipilih, tampilkan semua kelas
    if (!filters.jenjang || filters.jenjang === '') return kelas;
    
    // Jika jenjang spesifik dipilih, filter sesuai jenjang
    const filtered = kelas.filter(k => k.nama?.startsWith(filters.jenjang));
    console.log(`🔍 Filter Jenjang "${filters.jenjang}":`, filtered.length, 'kelas');
    return filtered;
  }, [kelas, filters.jenjang]);

  // Reset kelasId ketika jenjang berubah (opsional)
  React.useEffect(() => {
    // Hanya reset jika bukan "Semua Jenjang"
    if (filters.jenjang && filters.jenjang !== '') {
      setFilters(prev => ({ ...prev, kelasId: '' }));
    }
  }, [filters.jenjang]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      // Build params - JANGAN kirim kelasId jika "Semua Kelas" dipilih
      const params = new URLSearchParams();
      
      if (filters.query) params.append('query', filters.query);
      if (filters.isPassed) params.append('isPassed', filters.isPassed);
      if (filters.assessed) params.append('assessed', filters.assessed);
      if (filters.periode) params.append('periode', filters.periode);
      if (filters.jenisKelamin) params.append('jenisKelamin', filters.jenisKelamin);
      
      // Filter berdasarkan jenjang (jika dipilih)
      if (filters.jenjang) {
        params.append('jenjang', filters.jenjang);
      }
      
      // Hanya kirim kelasId jika ada dan bukan "Semua Kelas" (empty string)
      if (filters.kelasId && filters.kelasId !== '') {
        params.append('kelasId', filters.kelasId);
      }

      const res = await fetch(`/api/admin/tasmi/results?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setResults(data.tasmiResults);
      }
    } catch (error) {
      toast.error('Gagal mengambil data hasil tasmi');
    } finally {
      setLoading(false);
    }
  };

  const fetchKelas = async () => {
    try {
      // Ambil dari master kelas, bukan dari tasmi
      const res = await fetch('/api/kelas');
      const data = await res.json();
      
      if (res.ok) {
        // Handle berbagai format response
        const kelasList = data.kelas || data.data || data || [];
        console.log('📚 Master Kelas loaded:', kelasList.length, 'kelas');
        setKelas(Array.isArray(kelasList) ? kelasList : []);
      }
    } catch (error) {
      console.error('❌ Error fetching kelas:', error);
      toast.error('Gagal memuat data kelas');
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filters.isPassed, filters.assessed, filters.kelasId, filters.jenjang, filters.periode, filters.jenisKelamin]);

  useEffect(() => {
    fetchKelas();
  }, []);

  const handleGenerate = async (tasmiId) => {
    try {
      const res = await fetch(`/api/admin/certificates/non-award/${tasmiId}/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Sertifikat berhasil diterbitkan');
        fetchResults();
      } else {
        toast.error(data.message || 'Gagal menerbitkan sertifikat');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handlePreview = async (tasmiId, download = false) => {
    // Membuka PDF Preview di tab baru atau trigger download
    const url = `/api/admin/certificates/non-award/${tasmiId}/preview?date=${certDate}${download ? '&download=true' : ''}`;
    window.open(url, '_blank');
  };

  // Bulk generate functions
  const handleSelectAll = () => {
    if (selectedIds.length === results.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(results.map(r => r.id));
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkGenerate = async () => {
    setBulkGenerating(true);
    setBulkProgress({ current: 0, total: 0 });
    setBulkErrors([]);
    setBulkSummary(null);

    try {
      const payload = {
        filters: {
          query: filters.query,
          jenjang: filters.jenjang,
          kelasId: filters.kelasId,
          isPassed: filters.isPassed,
          assessed: filters.assessed,
          periode: filters.periode,
          jenisKelamin: filters.jenisKelamin
        },
        skipPublished,
        selectedIds: selectedIds.length > 0 ? selectedIds : undefined,
        printDate: certDate,
      };

      const res = await fetch('/api/admin/certificates/tasmi/bulk-generate', {
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
        toast(data.message || 'Semua sertifikat sudah terbit', { icon: 'ℹ️' });
        setShowBulkModal(false);
        return;
      }

      // Download ZIP file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Get filename from header or use default
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'sertifikat-tasmi.zip';
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
      setSelectedIds([]);
      fetchResults();

    } catch (error) {
      console.error('Bulk generate error:', error);
      toast.error(error.message || 'Gagal generate sertifikat');
    } finally {
      setBulkGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && fetchResults()}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
            />
          </div>
          
          <select
            value={filters.jenjang}
            onChange={(e) => setFilters({ ...filters, jenjang: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Jenjang</option>
            <option value="X">X</option>
            <option value="XI">XI</option>
            <option value="XII">XII</option>
          </select>

          <select
            value={filters.kelasId}
            onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Kelas</option>
            {filteredKelasByJenjang.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>

          <select
            value={filters.periode}
            onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm cursor-pointer"
          >
            <option value="">Tahun</option>
            {Array.from({ length: 5 }).map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>

          <input 
            type="date" 
            value={certDate}
            onChange={(e) => setCertDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
          />

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
            title="Pengaturan"
          >
            <Settings size={18} />
          </button>

          <button 
            onClick={fetchResults}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>



      {/* Tabel Data */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-emerald-100/70">
                <th className="px-3 py-2 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === results.length && results.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                    title="Pilih Semua"
                  />
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Siswa</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Kelas</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Juz</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Tanggal</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Nilai</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="8" className="px-6 py-4 bg-gray-50"></td>
                  </tr>
                ))
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400 text-sm">Tidak ada data</td>
                </tr>
              ) : (
                results.map((tasmi, idx) => (
                  <tr key={tasmi.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} hover:bg-emerald-50/40 border-b border-slate-100`}>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tasmi.id)}
                        onChange={() => handleSelectOne(tasmi.id)}
                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-2 text-gray-900">{tasmi.siswa?.user?.name || '-'}</td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-block px-2 py-1 rounded-full bg-emerald-100/60 text-emerald-700 border border-emerald-200/60 text-xs font-medium">
                        {tasmi.siswa?.kelas?.nama || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-700">{formatJuzDisplay(tasmi.juzYangDitasmi)}</td>
                    <td className="px-4 py-2 text-center text-gray-600 text-xs">
                      {tasmi.tanggalUjian ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold text-gray-900">{tasmi.nilaiAkhir || '-'}</span>
                        {tasmi.predikat && (
                          <span className={`inline-block px-2 py-0.5 rounded-full border text-xs ${getPredikatBadgeClass(tasmi.predikat)}`}>
                            {tasmi.predikat.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(tasmi.certificate)}`}>
                        {tasmi.certificate ? (
                          <><FileCheck size={10} /> TERBIT</>
                        ) : (
                          'DRAFT'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handlePreview(tasmi.id)}
                          className={actionBtnClass('preview')}
                          title="Preview"
                        >
                          <Eye size={14} />
                        </button>
                        {!tasmi.certificate ? (
                          <button
                            onClick={() => handleGenerate(tasmi.id)}
                            className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-all"
                          >
                            Generate
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePreview(tasmi.id, true)}
                            className={actionBtnClass('print')}
                            title="Download"
                          >
                            <Printer size={14} />
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

        {/* Footer Toolbar */}
        {results.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
            {selectedIds.length > 0 && (
              <span className="text-sm text-gray-600 mr-auto">
                <span className="font-medium text-orange-600">{selectedIds.length}</span> dipilih
              </span>
            )}
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={results.length === 0}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-all disabled:opacity-50"
            >
              Generate Semua
            </button>
          </div>
        )}
      </div>

      {previewData && (
        <CertificatePreviewModal 
          data={previewData.data} 
          htmlTemplate={previewData.htmlTemplate} 
          onClose={() => setPreviewData(null)} 
        />
      )}

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
                  <h3 className="text-lg font-bold text-gray-900">Generate Sertifikat Bulk</h3>
                  <p className="text-sm text-gray-600">Konfirmasi pembuatan sertifikat massal</p>
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
                      {selectedIds.length > 0 ? (
                        <>
                          Akan generate <span className="font-bold text-orange-700">{selectedIds.length} sertifikat</span> yang dipilih
                        </>
                      ) : (
                        <>
                          Akan generate <span className="font-bold text-orange-700">semua sertifikat</span> sesuai filter saat ini
                        </>
                      )}
                    </p>
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

                  {bulkErrors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-red-900 mb-2">Error pada {bulkErrors.length} sertifikat:</p>
                      <ul className="text-xs text-red-700 space-y-1 max-h-32 overflow-y-auto">
                        {bulkErrors.slice(0, 10).map((err, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500">•</span>
                            <span>{err.siswa}: {err.error}</span>
                          </li>
                        ))}
                        {bulkErrors.length > 10 && (
                          <li className="text-red-600 font-bold">+ {bulkErrors.length - 10} error lainnya</li>
                        )}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>

            {!bulkGenerating && (
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkErrors([]);
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button
                  onClick={handleBulkGenerate}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg transition-all active:scale-95"
                >
                  Generate Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL SETTINGS TTD */}
      <CertificateSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
