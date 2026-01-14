'use client';

import { useState, useEffect } from 'react';
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
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import CertificatePreviewModal from './CertificatePreviewModal';
import EmptyState from '@/components/shared/EmptyState';
import CertificateSettingsModal from './CertificateSettingsModal';

export default function NonAwardTab() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    query: '',
    kelasId: '',
    isPassed: 'true',
    assessed: 'true',
    periode: '',
    jenisKelamin: ''
  });
  const [kelas, setKelas] = useState([]);
  const [previewData, setPreviewData] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
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
      const res = await fetch('/api/admin/kelas');
      const data = await res.json();
      if (res.ok) {
        setKelas(data.kelas || []);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [filters.isPassed, filters.assessed, filters.kelasId, filters.periode, filters.jenisKelamin]);

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

  return (
    <div className="space-y-6">
      {/* Filters Card - Modern Glass Effect */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Cari Siswa
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau NISN..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchResults()}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-50/50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 hover:bg-white/80 text-sm"
              />
            </div>
          </div>
          
          {/* Filter Kelas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Kelas
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <select
                value={filters.kelasId}
                onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-50/50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 hover:bg-white/80 text-sm appearance-none cursor-pointer"
              >
                <option value="">Semua Kelas</option>
                {kelas.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Tahun */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Tahun Ujian
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              <select
                value={filters.periode}
                onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-emerald-50/50 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-white/50 hover:bg-white/80 text-sm appearance-none cursor-pointer"
              >
                <option value="">Semua Tahun</option>
                {Array.from({ length: 5 }).map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            </div>
          </div>

          {/* Filter Gender & Reset */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
              Opsi Cetak
            </label>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/50 border-2 border-emerald-50 rounded-xl flex-1 shadow-sm">
                <Calendar size={16} className="text-emerald-600" />
                <input 
                  type="date" 
                  value={certDate}
                  onChange={(e) => setCertDate(e.target.value)}
                  className="text-[10px] font-black text-slate-600 outline-none bg-transparent w-full"
                />
              </div>
              
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-50 border-2 border-slate-100 shadow-sm transition-all active:scale-95"
                title="Pengaturan TTD"
              >
                <Settings size={18} />
              </button>

              <button 
                onClick={fetchResults}
                disabled={loading}
                className="p-2.5 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl hover:bg-emerald-100 hover:border-emerald-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table Card - Glass Effect */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-50/50 border-b border-emerald-100/40">
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Siswa</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Kelas</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">Juz Ditasmi</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Tanggal Ujian</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Nilai / Predikat</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-emerald-800 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-6 bg-gray-50/30"></td>
                  </tr>
                ))
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12">
                    <EmptyState
                      title="Tidak ada data hasil tasmi"
                      description="Tidak ditemukan data siswa yang lulus tasmi sesuai dengan filter saat ini."
                      icon={Inbox}
                      actionLabel="Reset Filter"
                      onAction={() => setFilters({ query: '', kelasId: '', isPassed: 'true', assessed: 'true', periode: '', jenisKelamin: '' })}
                    />
                  </td>
                </tr>
              ) : (
                results.map((tasmi, index) => (
                  <tr key={tasmi.id} className={`hover:bg-emerald-50/50 transition-colors group ${index % 2 === 0 ? 'bg-white/40' : 'bg-emerald-50/10'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {(tasmi.siswa?.user?.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{tasmi.siswa?.user?.name || '-'}</p>
                          <p className="text-xs text-gray-500 font-medium">{tasmi.siswa?.nisn || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100/50 text-emerald-700 text-xs font-bold border border-emerald-100/50">
                        <GraduationCap size={14} />
                        {tasmi.siswa?.kelas?.nama || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        Juz {tasmi.juzYangDitasmi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 font-medium">
                      {tasmi.tanggalUjian ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-center min-w-[80px]">
                        <span className="text-lg font-black text-emerald-600 leading-none">{tasmi.nilaiAkhir || '-'}</span>
                        <span className="text-[10px] font-black uppercase text-slate-400 mt-1 tracking-tighter">{tasmi.predikat || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tasmi.certificate ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200 shadow-sm">
                          <FileCheck size={12} strokeWidth={3} /> Terbit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handlePreview(tasmi.id)}
                          className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-all shadow-sm hover:shadow-md bg-emerald-50/50 border border-emerald-100 active:scale-90"
                          title="Preview Sertifikat"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {!tasmi.certificate ? (
                          <button
                            onClick={() => handleGenerate(tasmi.id)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md hover:shadow-emerald-200 active:scale-95 group"
                          >
                            <FileCheck size={14} className="group-hover:rotate-12 transition-transform" />
                            Generate
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePreview(tasmi.id, true)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all shadow-sm hover:shadow-md bg-blue-50/50 border border-blue-100 active:scale-90"
                            title="Download/Cetak"
                          >
                            <Printer size={18} />
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

      {previewData && (
        <CertificatePreviewModal 
          data={previewData.data} 
          htmlTemplate={previewData.htmlTemplate} 
          onClose={() => setPreviewData(null)} 
        />
      )}

      {/* MODAL SETTINGS TTD */}
      <CertificateSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
