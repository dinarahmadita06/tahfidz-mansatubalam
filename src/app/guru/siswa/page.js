'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Users, BookOpen, TrendingUp, Search, UserPlus, RefreshCw } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function KelolaSiswaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchSiswa();

      // Auto-refresh setiap 30 detik untuk melihat perubahan status validasi
      const interval = setInterval(() => {
        fetchSiswa(true);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [status, router]);

  const fetchSiswa = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/siswa');
      const data = await res.json();

      // Fetch hafalan stats for each siswa
      const siswaWithStats = await Promise.all(
        data.map(async (siswa) => {
          const hafalanRes = await fetch(`/api/hafalan?siswaId=${siswa.id}`);
          const hafalanData = await hafalanRes.json();

          // Calculate stats
          const uniqueJuz = [...new Set(hafalanData.map(h => h.juz))];
          const totalAyat = hafalanData.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
          const avgNilai = hafalanData.length > 0
            ? hafalanData.reduce((sum, h) => sum + (h.nilaiAkhir || 0), 0) / hafalanData.length
            : 0;

          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const setoranBulanIni = hafalanData.filter(h => new Date(h.tanggalSetor) >= startOfMonth).length;

          return {
            ...siswa,
            stats: {
              totalJuz: uniqueJuz.length,
              totalAyat,
              nilaiRataRata: avgNilai.toFixed(1),
              setoranBulanIni,
              totalSetoran: hafalanData.length,
            },
          };
        })
      );

      setSiswaList(siswaWithStats);
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchSiswa(true);
  };

  const filteredSiswa = siswaList.filter((siswa) =>
    siswa.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    siswa.kelas.nama.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <GuruLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Siswa</h1>
            <p className="text-sm text-gray-600">
              Daftar siswa dan statistik hafalan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
            <button
              onClick={() => router.push('/guru/tambah-siswa')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <UserPlus size={18} />
              Tambah Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900">{siswaList.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Siswa Aktif</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siswaList.filter(s => s.status === 'active' || s.status === 'approved').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menunggu Validasi</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siswaList.filter(s => s.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata Nilai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {siswaList.length > 0
                    ? (siswaList.reduce((sum, s) => sum + parseFloat(s.stats.nilaiRataRata), 0) / siswaList.length).toFixed(1)
                    : '-'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari nama siswa atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Siswa List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredSiswa.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={48} className="mx-auto mb-3 opacity-50" />
              <p>
                {searchQuery
                  ? 'Tidak ada siswa yang sesuai dengan pencarian'
                  : 'Belum ada siswa terdaftar'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Juz
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Ayat
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nilai Rata-rata
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Setoran Bulan Ini
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Setoran
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-semibold">
                              {siswa.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {siswa.user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {siswa.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {siswa.kelas.nama}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          siswa.status === 'active' || siswa.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : siswa.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : siswa.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {siswa.status === 'active' || siswa.status === 'approved'
                            ? 'Aktif'
                            : siswa.status === 'pending'
                            ? 'Pending'
                            : siswa.status === 'rejected'
                            ? 'Ditolak'
                            : siswa.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {siswa.stats.totalJuz}
                        </span>
                        <span className="text-xs text-gray-500"> / 30</span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {siswa.stats.totalAyat}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-semibold ${
                          siswa.stats.nilaiRataRata >= 90 ? 'text-green-600' :
                          siswa.stats.nilaiRataRata >= 80 ? 'text-blue-600' :
                          siswa.stats.nilaiRataRata >= 70 ? 'text-yellow-600' :
                          siswa.stats.nilaiRataRata > 0 ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {siswa.stats.nilaiRataRata > 0 ? siswa.stats.nilaiRataRata : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {siswa.stats.setoranBulanIni}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {siswa.stats.totalSetoran}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </GuruLayout>
  );
}
