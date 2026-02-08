'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Filter, Search, Eye, X, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import dynamic from 'next/dynamic';

// Dynamically import layout to reduce initial bundle size
const SiswaLayout = dynamic(() => import('@/components/layout/SiswaLayout'), {
  ssr: false,
  loading: () => <LoadingIndicator fullPage text="Memuat layout..." />
});

export default function HafalanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hafalan, setHafalan] = useState([]);
  const [filteredHafalan, setFilteredHafalan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.siswaId) {
      fetchHafalan();
    }
  }, [status, session, router]);

  useEffect(() => {
    let filtered = hafalan;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(h =>
        h.surah.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.surah.nama.includes(searchQuery)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(h => h.status === filterStatus);
    }

    setFilteredHafalan(filtered);
  }, [searchQuery, filterStatus, hafalan]);

  const fetchHafalan = async () => {
    try {
      const res = await fetch('/api/hafalan');
      const data = await res.json();
      setHafalan(data);
      setFilteredHafalan(data);
    } catch (error) {
      console.error('Error fetching hafalan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      LANCAR: { icon: CheckCircle, text: 'Lancar', className: 'bg-green-100 text-green-700 border-green-200' },
      PERLU_PERBAIKAN: { icon: AlertCircle, text: 'Perlu Perbaikan', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      DITOLAK: { icon: XCircle, text: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-200' },
    };
    return badges[status] || badges.LANCAR;
  };

  const getPredikatColor = (predikat) => {
    const colors = {
      A: 'text-green-600 bg-green-50',
      B: 'text-blue-600 bg-blue-50',
      C: 'text-yellow-600 bg-yellow-50',
      D: 'text-red-600 bg-red-50',
    };
    return colors[predikat] || 'text-gray-600 bg-gray-50';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingIndicator text="Memuat data hafalan..." size="large" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading hafalan...</div>}>
      <SiswaLayout>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hafalan Saya</h1>
              <p className="text-sm text-gray-600">Riwayat lengkap hafalan Anda</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Cari surah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="LANCAR">Lancar</option>
                <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Setoran</p>
            <p className="text-xl font-bold text-gray-900">{hafalan.length}</p>
          </div>
          <div className="bg-white border border-green-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Lancar</p>
            <p className="text-xl font-bold text-green-600">
              {hafalan.filter(h => h.status === 'LANCAR').length}
            </p>
          </div>
          <div className="bg-white border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Perlu Perbaikan</p>
            <p className="text-xl font-bold text-yellow-600">
              {hafalan.filter(h => h.status === 'PERLU_PERBAIKAN').length}
            </p>
          </div>
          <div className="bg-white border border-red-200 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Ditolak</p>
            <p className="text-xl font-bold text-red-600">
              {hafalan.filter(h => h.status === 'DITOLAK').length}
            </p>
          </div>
        </div>

        {/* Hafalan List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900 text-sm">
              Daftar Hafalan ({filteredHafalan.length})
            </h3>
          </div>

          {filteredHafalan.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">
                {searchQuery || filterStatus !== 'all'
                  ? 'Tidak ada hafalan yang sesuai dengan filter'
                  : 'Belum ada riwayat hafalan'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b text-xs">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Surah</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Ayat</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">Nilai</th>
                    <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHafalan.slice(0, 10).map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </td>
                        <td className="px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{item.surah.namaLatin}</p>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {item.ayatMulai}-{item.ayatSelesai}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                            <StatusIcon size={12} />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {item.nilaiAkhir ? item.nilaiAkhir.toFixed(1) : '-'}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => setViewModal(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {viewModal.surah.namaLatin}
                    </h3>
                    <p className="text-xs text-gray-500">{viewModal.surah.nama}</p>
                  </div>
                  <button
                    onClick={() => setViewModal(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Info Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tanggal Setor</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {new Date(viewModal.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ayat</p>
                    <p className="font-medium text-gray-900 text-sm">
                      {viewModal.ayatMulai} - {viewModal.ayatSelesai}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Juz</p>
                    <p className="font-medium text-gray-900 text-sm">{viewModal.juz}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Halaman</p>
                    <p className="font-medium text-gray-900 text-sm">{viewModal.halaman || '-'}</p>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-gray-600 mb-1">Status</p>
                  {(() => {
                    const statusBadge = getStatusBadge(viewModal.status);
                    const StatusIcon = statusBadge.icon;
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                        <StatusIcon size={14} />
                        {statusBadge.text}
                      </span>
                    );
                  })()}
                </div>

                {/* Penilaian */}
                <div className="border-t pt-3">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Penilaian</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tartil</p>
                      <p className="text-base font-bold text-gray-900">
                        {viewModal.nilaiTartil || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Tajwid</p>
                      <p className="text-base font-bold text-gray-900">
                        {viewModal.nilaiTajwid || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Makhraj</p>
                      <p className="text-base font-bold text-gray-900">
                        {viewModal.nilaiMakhraj || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Kelancaran</p>
                      <p className="text-base font-bold text-gray-900">
                        {viewModal.nilaiKelancaran || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">Nilai Akhir</p>
                      <p className="text-lg font-bold text-blue-600">
                        {viewModal.nilaiAkhir ? viewModal.nilaiAkhir.toFixed(1) : '-'}
                      </p>
                    </div>
                    {viewModal.predikat && (
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-600">Predikat</p>
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPredikatColor(viewModal.predikat)}`}>
                          {viewModal.predikat}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Catatan Guru */}
                {viewModal.catatan && (
                  <div className="border-t pt-3">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Catatan Guru</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {viewModal.catatan}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <button
                  onClick={() => setViewModal(null)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </SiswaLayout>
    </Suspense>
  );
}