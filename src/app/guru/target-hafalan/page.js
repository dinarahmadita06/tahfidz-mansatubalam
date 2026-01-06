'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Target,
  BookOpen,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Award
} from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

export default function TargetHafalanGuruPage() {
  const { data: session } = useSession();
  const [kelasData, setKelasData] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [statistics, setStatistics] = useState({
    targetSekolah: 0,
    targetKelas: 0,
    rataRataProgres: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTargetHafalan();
    }
  }, [session]);

  const fetchTargetHafalan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/guru/target-hafalan');
      const data = await response.json();

      if (data.success) {
        setKelasData(data.data.kelas);
        setSiswaList(data.data.siswaList || []);
        setStatistics(data.data.statistics || {
          targetSekolah: 0,
          targetKelas: 0,
          rataRataProgres: 0
        });
      }
    } catch (error) {
      console.error('Error fetching target hafalan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncTarget = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch('/api/guru/target-hafalan/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        await fetchTargetHafalan();
        alert('Target berhasil disinkronkan dengan target sekolah!');
      }
    } catch (error) {
      console.error('Error syncing target:', error);
      alert('Gagal menyinkronkan target');
    } finally {
      setIsSyncing(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'emerald';
    if (progress >= 50) return 'amber';
    return 'red';
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 80) return 'bg-gradient-to-r from-emerald-400 to-emerald-500';
    if (progress >= 50) return 'bg-gradient-to-r from-amber-400 to-amber-500';
    return 'bg-gradient-to-r from-red-400 to-red-500';
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <GuruLayout>
      <div className="bg-gradient-to-br from-emerald-50/30 via-cream-50/30 to-amber-50/20 p-6 lg:p-8 rounded-2xl min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="text-white" size={28} />
                </div>
                Target Hafalan Kelas
              </h1>
              {kelasData && (
                <div className="ml-16 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-semibold">
                    <BookOpen size={16} />
                    {kelasData.nama}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-sm font-semibold">
                    <Calendar size={16} />
                    {kelasData.tahunAjaran?.nama}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleSyncTarget}
              disabled={isSyncing}
              className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] justify-center"
            >
              {isSyncing ? (
                <LoadingIndicator size="small" text="Menyinkronkan..." inline className="text-white" />
              ) : (
                <>
                  <RefreshCw size={20} />
                  Sinkronkan Target Sekolah
                </>
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl shadow-xl p-20 border border-emerald-100/30 flex items-center justify-center">
            <LoadingIndicator text="Memuat data target hafalan..." />
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<BookOpen size={24} />}
                title="Target Sekolah"
                value={`${statistics.targetSekolah} Juz`}
                color="bg-emerald-500"
              />
              <StatCard
                icon={<Target size={24} />}
                title="Target Kelas"
                value={`${statistics.targetKelas} Juz`}
                color="bg-amber-500"
              />
              <StatCard
                icon={<TrendingUp size={24} />}
                title="Rata-rata Progres"
                value={`${statistics.rataRataProgres}%`}
                color="bg-teal-500"
              />
            </div>

            {/* Tabel Daftar Siswa */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100/30">
              <div className="p-6 bg-gradient-to-r from-emerald-100 to-teal-100 border-b border-emerald-200/50">
                <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                  <Users size={24} />
                  Daftar Siswa & Target Individual
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">No</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Nama Siswa</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">NIS</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">Target (Juz)</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">Capaian (Juz)</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-emerald-900">Progress</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-emerald-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {siswaList.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users size={32} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500">Belum ada data siswa</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      siswaList.map((siswa, index) => {
                        const progress = siswa.target > 0
                          ? Math.round((siswa.capaian / siswa.target) * 100)
                          : 0;
                        const progressColor = getProgressColor(progress);

                        return (
                          <tr
                            key={siswa.id}
                            className={`border-b border-gray-100 hover:bg-mint-50/30 transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                            }`}
                          >
                            <td className="px-6 py-4 text-gray-700 font-medium">{index + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {siswa.nama.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{siswa.nama}</p>
                                  <p className="text-xs text-gray-500">{siswa.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-mono text-sm">{siswa.nis}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
                                <Target size={14} />
                                {siswa.target}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold">
                                <BookOpen size={14} />
                                {siswa.capaian}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${getProgressBarColor(progress)} transition-all duration-500 rounded-full`}
                                    style={{ width: `${Math.min(progress, 100)}%` }}
                                  ></div>
                                </div>
                                <span className={`text-sm font-bold text-${progressColor}-700 min-w-[45px] text-right`}>
                                  {progress}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {progress >= 80 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                                  <CheckCircle size={14} />
                                  Baik
                                </span>
                              ) : progress >= 50 ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                                  <AlertCircle size={14} />
                                  Sedang
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                                  <AlertCircle size={14} />
                                  Perlu Perhatian
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info Card */}
            <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-6 shadow-lg border border-emerald-200/50">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Award className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-2">💡 Tips untuk Guru</h3>
                  <p className="text-emerald-800 leading-relaxed text-sm">
                    Pantau progress siswa secara berkala. Berikan perhatian khusus kepada siswa dengan progress
                    di bawah 50%. Gunakan tombol <strong>"Sinkronkan Target Sekolah"</strong> untuk menyamakan
                    target kelas dengan target yang ditetapkan sekolah.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </GuruLayout>
  );
}
