'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Award, Target, TrendingUp, Calendar, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

// Dynamically import layout to reduce initial bundle size
const SiswaLayout = dynamic(() => import('@/components/layout/SiswaLayout'), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">Loading layout...</div></div>
});

export default function SiswaDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hafalan, setHafalan] = useState([]);
  const [stats, setStats] = useState({
    totalJuz: 0,
    totalAyat: 0,
    nilaiRataRata: 0,
    setoranBulanIni: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session?.user?.siswaId) {
        fetchHafalan();
      } else {
        // Jika user tidak punya siswaId, set loading false
        setLoading(false);
      }
    }
  }, [status, session?.user?.siswaId, router]);

  const fetchHafalan = async () => {
    try {
      const res = await fetch('/api/hafalan');
      const data = await res.json();
      setHafalan(data);

      // Calculate stats
      if (data.length > 0) {
        const uniqueJuz = [...new Set(data.map(h => h.juz))];
        const totalAyat = data.reduce((sum, h) => sum + (h.ayatSelesai - h.ayatMulai + 1), 0);
        const avgNilai = data.reduce((sum, h) => sum + (h.nilaiAkhir || 0), 0) / data.length;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const setoranBulanIni = data.filter(h => new Date(h.tanggal) >= startOfMonth).length;

        setStats({
          totalJuz: uniqueJuz.length,
          totalAyat,
          nilaiRataRata: avgNilai.toFixed(1),
          setoranBulanIni,
        });
      }
    } catch (error) {
      console.error('Error fetching hafalan:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      LANCAR: { icon: CheckCircle, text: 'Lancar', className: 'bg-green-100 text-green-700' },
      PERLU_PERBAIKAN: { icon: AlertCircle, text: 'Perlu Perbaikan', className: 'bg-yellow-100 text-yellow-700' },
      DITOLAK: { icon: XCircle, text: 'Ditolak', className: 'bg-red-100 text-red-700' },
    };
    return badges[status] || badges.LANCAR;
  };

  const getPredikatColor = (predikat) => {
    const colors = {
      A: 'text-green-600',
      B: 'text-blue-600',
      C: 'text-yellow-600',
      D: 'text-red-600',
    };
    return colors[predikat] || 'text-gray-600';
  };

  if (status === 'loading' || loading) {
    return (
      <Suspense fallback={<LoadingIndicator text="Loading..." fullPage />}>
        <LoadingIndicator text="Loading..." fullPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <SiswaLayout>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Selamat datang, {session?.user?.name}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Juz</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalJuz}</p>
                <p className="text-xs text-gray-500 mt-1">dari 30 juz</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Ayat</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAyat}</p>
                <p className="text-xs text-gray-500 mt-1">ayat dihafal</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target size={20} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Nilai Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.nilaiRataRata > 0 ? stats.nilaiRataRata : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">nilai keseluruhan</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award size={20} className="text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Setoran Bulan Ini</p>
                <p className="text-2xl font-bold text-gray-900">{stats.setoranBulanIni}</p>
                <p className="text-xs text-gray-500 mt-1">kali setoran</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp size={20} className="text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Progress Hafalan</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Progress</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalJuz} / 30 Juz ({Math.round((stats.totalJuz / 30) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.round((stats.totalJuz / 30) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Riwayat Hafalan Terbaru</h2>

          {hafalan.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={36} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium text-sm">Belum ada riwayat hafalan</p>
              <p className="text-xs mt-1">Mulai setorkan hafalan Anda ke guru</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hafalan.slice(0, 5).map((item) => {
                    const statusBadge = getStatusBadge(item.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-900">
                          {new Date(item.tanggal).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-3 py-2 text-gray-900 truncate max-w-[100px]">
                          {item.surah.namaLatin}
                        </td>
                        <td className="px-3 py-2 text-gray-600">
                          {item.ayatMulai}-{item.ayatSelesai}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                            <StatusIcon size={12} />
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-900">
                          {item.nilaiAkhir ? item.nilaiAkhir.toFixed(1) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </SiswaLayout>
    </Suspense>
  );
}