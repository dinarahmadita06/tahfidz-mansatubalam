'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import GuruLayout from '@/components/layout/GuruLayout';
import StudentCreateModal from '@/components/admin/StudentCreateModal';
import { PageSkeleton } from '@/components/shared/Skeleton';

export default function KelolaSiswa() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch data using React Query for better performance and caching
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['guru-siswa'],
    queryFn: async () => {
      const kelasRes = await fetch('/api/guru/kelas');
      if (!kelasRes.ok) throw new Error('Failed to fetch kelas');
      const kelasData = await kelasRes.json();
      const kelasList = kelasData.kelas || [];
      
      let siswaList = [];
      if (kelasList.length > 0) {
        const klasIds = kelasList.map(k => k.id).join(',');
        const siswaRes = await fetch(`/api/guru/siswa?kelasIds=${klasIds}`);
        if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
        const siswaData = await siswaRes.json();
        siswaList = siswaData.data || [];
      }
      
      return { kelasList, siswaList };
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const allSiswa = data?.siswaList || [];
  const kelasDiampu = data?.kelasList || [];

  // Filter siswa berdasarkan search dan selected kelas (client-side for instant response)
  const filteredSiswa = useMemo(() => {
    let result = allSiswa;
    
    if (selectedKelas) {
      result = result.filter(s => s.kelasId === selectedKelas);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.user?.name?.toLowerCase().includes(term) ||
        s.user?.email?.toLowerCase().includes(term) ||
        s.nis?.includes(term)
      );
    }
    
    return result;
  }, [searchTerm, selectedKelas, allSiswa]);

  // Calculate stats
  const statsData = useMemo(() => {
    const approved = allSiswa.filter(s => s.status === 'approved').length;
    const pending = allSiswa.filter(s => s.status !== 'approved').length;
    return {
      totalSiswa: allSiswa.length,
      siswaAktif: approved,
      menungguValidasi: pending,
    };
  }, [allSiswa]);

  const StatCard = ({ icon: Icon, title, value, theme = 'emerald' }) => {
    const themeConfig = {
      emerald: {
        bg: 'bg-gradient-to-br from-emerald-50 to-green-50',
        border: 'border-2 border-emerald-200',
        titleColor: 'text-emerald-600',
        valueColor: 'text-emerald-700',
        iconBg: 'bg-emerald-100',
        iconColor: 'text-emerald-600',
      },
      amber: {
        bg: 'bg-gradient-to-br from-amber-50 to-orange-50',
        border: 'border-2 border-amber-200',
        titleColor: 'text-amber-600',
        valueColor: 'text-amber-700',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
      },
      orange: {
        bg: 'bg-gradient-to-br from-orange-50 to-red-50',
        border: 'border-2 border-orange-200',
        titleColor: 'text-orange-600',
        valueColor: 'text-orange-700',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
      },
    };

    const config = themeConfig[theme] || themeConfig.emerald;

    return (
      <div className={`${config.bg} rounded-2xl ${config.border} p-6 shadow-sm hover:shadow-md transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${config.titleColor} text-xs font-bold mb-2 uppercase tracking-wide`}>
              {title}
            </p>
            <h3 className={`${config.valueColor} text-3xl font-bold`}>
              {value}
            </h3>
          </div>
          <div className={`${config.iconBg} p-4 rounded-full shadow-md flex-shrink-0`}>
            <Icon size={28} className={config.iconColor} strokeWidth={2} />
          </div>
        </div>
      </div>
    );
  };

  const totalSiswa = statsData.totalSiswa;
  const siswaAktif = statsData.siswaAktif;
  const menungguvalisasi = statsData.menungguValidasi;

  const kelasOptions = kelasDiampu.map(k => ({
    id: k.id,
    nama: k.nama
  }));

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full py-6 space-y-6">
          {/* Header Section */}
          <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                  <Users className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    Kelola Siswa
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base mt-1">
                    Monitoring siswa kelas binaan dan tracking progress hafalan
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm hover:bg-emerald-50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <UserPlus size={20} />
                <span>Tambah Siswa Baru</span>
              </button>
            </div>
          </div>

          {isLoading ? (
            <PageSkeleton />
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  icon={Users}
                  title="Total Siswa"
                  value={totalSiswa}
                  theme="amber"
                />
                <StatCard 
                  icon={CheckCircle}
                  title="Siswa Aktif"
                  value={siswaAktif}
                  theme="emerald"
                />
                <StatCard 
                  icon={AlertCircle}
                  title="Menunggu Validasi"
                  value={menungguvalisasi}
                  theme="orange"
                />
              </div>

              {/* Filter Section */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Cari Nama Siswa atau NIS
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Cari siswa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:w-64">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Filter Kelas
                    </label>
                    <div className="relative">
                      <select
                        value={selectedKelas}
                        onChange={(e) => setSelectedKelas(e.target.value)}
                        className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm appearance-none bg-white"
                      >
                        <option value="">Semua Kelas ({kelasDiampu.length})</option>
                        {kelasOptions.map(k => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <Users size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Siswa List Card */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
                <div className="p-6 border-b border-emerald-100/30">
                  <h2 className="text-xl font-bold text-emerald-900">Daftar Siswa (Kelas Aktif)</h2>
                  <p className="text-sm text-slate-600 mt-1">Menampilkan {filteredSiswa.length} dari {allSiswa.length} siswa</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                      <tr>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">No</th>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Siswa</th>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Email</th>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NIS</th>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Kelas</th>
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100/50">
                      {filteredSiswa.map((siswa, index) => (
                        <tr key={siswa.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <span className="text-gray-600 text-sm">{index + 1}</span>
                          </td>
                          <td className="py-4 px-6">
                            <p className="font-medium text-gray-900">{siswa.user?.name || 'N/A'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600 truncate max-w-[200px]" title={siswa.user?.email}>
                              {siswa.user?.email || '-'}
                            </p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{siswa.nis || '-'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{siswa.kelas?.nama || '-'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              siswa.status === 'approved' 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {siswa.status === 'approved' ? 'Aktif' : 'Menunggu'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredSiswa.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-gray-500">Tidak ada siswa yang sesuai dengan filter</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <StudentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={refetch}
          userRole="GURU"
        />
      </div>
    </GuruLayout>
  );
}
