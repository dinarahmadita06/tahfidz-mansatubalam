'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Download, Search, TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function LaporanProgresPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState(null);
  const [laporanData, setLaporanData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nama');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchLaporanData();
  }, [kelasId]);

  useEffect(() => {
    filterAndSortData();
  }, [searchTerm, sortBy, sortOrder, laporanData]);

  const fetchLaporanData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/guru/tahsin/${kelasId}/laporan`);
      if (!response.ok) throw new Error('Failed to fetch data');

      const data = await response.json();
      setKelas(data.kelas);
      setLaporanData(data.laporan);
      setFilteredData(data.laporan);
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = [...laporanData];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nis.includes(searchTerm)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'nama':
          aVal = a.nama.toLowerCase();
          bVal = b.nama.toLowerCase();
          break;
        case 'progres':
          aVal = a.progressPercentage;
          bVal = b.progressPercentage;
          break;
        case 'jumlah':
          aVal = a.totalSurat;
          bVal = b.totalSurat;
          break;
        default:
          aVal = a.nama.toLowerCase();
          bVal = b.nama.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  };

  const calculateStatistics = () => {
    if (laporanData.length === 0) {
      return {
        totalSiswa: 0,
        rataRataProgres: 0,
        totalSuratSelesai: 0,
        siswaTerbaik: null
      };
    }

    const totalProgres = laporanData.reduce((sum, item) => sum + item.progressPercentage, 0);
    const totalSurat = laporanData.reduce((sum, item) => sum + item.totalSurat, 0);
    const siswaTerbaik = [...laporanData].sort((a, b) => b.progressPercentage - a.progressPercentage)[0];

    return {
      totalSiswa: laporanData.length,
      rataRataProgres: (totalProgres / laporanData.length).toFixed(1),
      totalSuratSelesai: totalSurat,
      siswaTerbaik
    };
  };

  const downloadLaporan = () => {
    // Create CSV content
    const headers = ['No', 'NIS', 'Nama Siswa', 'Total Surat Selesai', 'Progres (%)'];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.nis,
      item.nama,
      item.totalSurat,
      item.progressPercentage
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Laporan_Tahsin_${kelas?.nama}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return '#10b981'; // green
    if (percentage >= 60) return '#3b82f6'; // blue
    if (percentage >= 40) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const stats = calculateStatistics();

  if (loading) {
    return (
      <GuruLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-emerald-600 font-semibold">Memuat data...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#f0fdf4', fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">=� Laporan Progres Tahsin</h1>
                <p className="text-emerald-100 mt-1">{kelas?.nama || 'Kelas'}</p>
              </div>
            </div>
            <button
              onClick={downloadLaporan}
              className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all shadow-md"
            >
              <Download className="w-5 h-5" />
              <span className="font-semibold">Download CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Siswa</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.totalSiswa}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Rata-rata Progres</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.rataRataProgres}%</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Surat Selesai</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.totalSuratSelesai}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <BookOpen className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Siswa Terbaik</p>
                <p className="text-lg font-bold text-purple-600 mt-2 truncate">
                  {stats.siswaTerbaik ? stats.siswaTerbaik.nama.split(' ')[0] : '-'}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.siswaTerbaik ? `${stats.siswaTerbaik.progressPercentage}%` : '-'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="nama">Urutkan: Nama</option>
                <option value="progres">Urutkan: Progres</option>
                <option value="jumlah">Urutkan: Jumlah Surat</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                {sortOrder === 'asc' ? '�' : '�'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">NIS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Nama Siswa</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Total Surat Selesai</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Progres</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data progres'}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.siswaId} className="hover:bg-emerald-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nis}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                            {item.nama.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{item.nama}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800">
                          {item.totalSurat} surat
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${item.progressPercentage}%`,
                                backgroundColor: getProgressColor(item.progressPercentage)
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                            {item.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => router.push(`/guru/tahsin/${kelasId}?siswa=${item.siswaId}`)}
                          className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm hover:underline"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          Menampilkan {filteredData.length} dari {laporanData.length} siswa
        </div>
      </div>
    </div>
    </GuruLayout>
  );
}
