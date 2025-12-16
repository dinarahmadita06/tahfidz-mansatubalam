'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  Award,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  User,
  TrendingUp,
  FileText,
  Download,
  Filter,
  BarChart3,
  Users,
  Trophy,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AdminTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('jadwal'); // 'jadwal' or 'rekap'

  // Data states
  const [tasmiList, setTasmiList] = useState([]);
  const [rekapData, setRekapData] = useState(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState('');
  const [filterBulan, setFilterBulan] = useState('');
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (session) {
      fetchTasmiData();
    }
  }, [session, filterStatus, filterBulan, filterTahun]);

  useEffect(() => {
    if (session && activeTab === 'rekap') {
      fetchRekapData();
    }
  }, [session, activeTab, filterBulan, filterTahun]);

  const fetchTasmiData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterBulan) params.append('bulan', filterBulan);
      if (filterTahun) params.append('tahun', filterTahun);

      const res = await fetch(`/api/admin/tasmi?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTasmiList(data.tasmi || []);
      }
    } catch (error) {
      console.error('Error fetching tasmi:', error);
      toast.error('Gagal memuat data tasmi');
    } finally {
      setLoading(false);
    }
  };

  const fetchRekapData = async () => {
    try {
      const params = new URLSearchParams();
      if (filterBulan) params.append('bulan', filterBulan);
      if (filterTahun) params.append('tahun', filterTahun);

      const res = await fetch(`/api/admin/tasmi/rekap?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRekapData(data);
      }
    } catch (error) {
      console.error('Error fetching rekap:', error);
      toast.error('Gagal memuat data rekapitulasi');
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
        text: 'Menunggu',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      DISETUJUI: {
        icon: <CheckCircle size={16} />,
        text: 'Disetujui',
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
    if (!predikat) return <span className="text-gray-400">-</span>;

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Toaster position="top-right" />

      <div className="space-y-6 tasmi-container">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Award className="text-purple-600" size={32} />
                Manajemen Tasmi&apos; Al-Qur&apos;an
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola jadwal ujian Tasmi&apos; dan lihat rekapitulasi hasil
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('jadwal')}
              className={`flex-1 px-6 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'jadwal'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar size={18} />
              Jadwal Tasmi&apos;
            </button>
            <button
              onClick={() => setActiveTab('rekap')}
              className={`flex-1 px-6 py-4 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'rekap'
                  ? 'border-b-2 border-purple-600 text-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 size={18} />
              Rekapitulasi & Laporan
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'jadwal' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-700">Filter Data</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Semua Status</option>
                        <option value="MENUNGGU">Menunggu</option>
                        <option value="DISETUJUI">Disetujui</option>
                        <option value="DITOLAK">Ditolak</option>
                        <option value="SELESAI">Selesai</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bulan
                      </label>
                      <select
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Semua Bulan</option>
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun
                      </label>
                      <select
                        value={filterTahun}
                        onChange={(e) => setFilterTahun(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                          Guru Penguji
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nilai
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Predikat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tasmiList.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
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
                                  <div className="text-xs text-gray-500">
                                    {tasmi.siswa.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {tasmi.siswa.kelas?.nama || '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="font-medium">{tasmi.juzYangDitasmi}</div>
                              <div className="text-xs text-gray-500">
                                Total: {tasmi.jumlahHafalan} Juz
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {tasmi.tanggalUjian ? (
                                <div>
                                  <div className="font-medium">
                                    {formatDateTime(tasmi.tanggalUjian)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">Belum dijadwalkan</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {tasmi.guruPenguji?.user.name || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(tasmi.statusPendaftaran)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {tasmi.nilaiAkhir ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-lg">
                                    {tasmi.nilaiAkhir.toFixed(0)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              {getPredikatBadge(tasmi.predikat)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'rekap' && rekapData && (
              <div className="space-y-6">
                {/* Filter */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Filter size={18} className="text-gray-600" />
                    <h3 className="font-semibold text-gray-700">Filter Periode</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bulan
                      </label>
                      <select
                        value={filterBulan}
                        onChange={(e) => setFilterBulan(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Semua Bulan</option>
                        <option value="1">Januari</option>
                        <option value="2">Februari</option>
                        <option value="3">Maret</option>
                        <option value="4">April</option>
                        <option value="5">Mei</option>
                        <option value="6">Juni</option>
                        <option value="7">Juli</option>
                        <option value="8">Agustus</option>
                        <option value="9">September</option>
                        <option value="10">Oktober</option>
                        <option value="11">November</option>
                        <option value="12">Desember</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun
                      </label>
                      <select
                        value={filterTahun}
                        onChange={(e) => setFilterTahun(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Users className="text-purple-600" size={24} />
                      <div>
                        <p className="text-xs text-gray-600">Total Pendaftar</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {rekapData.summary.totalPendaftar}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Clock className="text-amber-600" size={24} />
                      <div>
                        <p className="text-xs text-amber-700">Menunggu</p>
                        <p className="text-2xl font-bold text-amber-900">
                          {rekapData.summary.totalMenunggu}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-green-600" size={24} />
                      <div>
                        <p className="text-xs text-green-700">Disetujui</p>
                        <p className="text-2xl font-bold text-green-900">
                          {rekapData.summary.totalDisetujui}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <XCircle className="text-red-600" size={24} />
                      <div>
                        <p className="text-xs text-red-700">Ditolak</p>
                        <p className="text-2xl font-bold text-red-900">
                          {rekapData.summary.totalDitolak}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Award className="text-blue-600" size={24} />
                      <div>
                        <p className="text-xs text-blue-700">Selesai</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {rekapData.summary.totalSelesai}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-purple-600" size={24} />
                      <div>
                        <p className="text-xs text-purple-700">Rata-rata Nilai</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {rekapData.summary.averageScore}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Predikat Stats */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={20} />
                    Distribusi Predikat
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Mumtaz</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">
                        {rekapData.predikatStats.Mumtaz}
                      </p>
                      <p className="text-xs text-green-600 mt-1">90-100</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">Jayyid Jiddan</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">
                        {rekapData.predikatStats['Jayyid Jiddan']}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">80-89</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <p className="text-sm text-yellow-700 font-medium">Jayyid</p>
                      <p className="text-3xl font-bold text-yellow-900 mt-2">
                        {rekapData.predikatStats.Jayyid}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">70-79</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 font-medium">Maqbul</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {rekapData.predikatStats.Maqbul}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">&lt; 70</p>
                    </div>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                    10 Siswa dengan Nilai Tertinggi
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Peringkat
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Nama Siswa
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Kelas
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Juz
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Nilai
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                            Predikat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rekapData.topPerformers.map((tasmi, index) => (
                          <tr key={tasmi.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold">
                                {index + 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {tasmi.siswa.user.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {tasmi.siswa.kelas?.nama || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {tasmi.juzYangDitasmi}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-lg text-gray-900">
                                  {tasmi.nilaiAkhir.toFixed(0)}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getPredikatBadge(tasmi.predikat)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => toast.info('Fitur export akan segera hadir')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={18} />
                    Export Laporan (Excel)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .tasmi-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}
