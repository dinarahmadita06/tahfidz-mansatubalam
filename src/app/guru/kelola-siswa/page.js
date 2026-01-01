'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ArrowRight,
  UserPlus,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  BookOpen,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Link,
  Loader
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KelolaSiswa() {
  const router = useRouter();
  const [kelasDiampu, setKelasDiampu] = useState([]);  // Kelas aktif yang diampu guru
  const [allSiswa, setAllSiswa] = useState([]);        // Siswa dari kelas aktif saja
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');  // Changed from tahunAjaran to kelas filter
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalSiswa: 0,
    siswaAktif: 0,
    menungguValidasi: 0,
  });

  // Fetch kelas aktif yang diampu guru dan siswa mereka
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch kelas aktif yang diampu guru (dari /api/guru/kelas yang sudah difilter AKTIF)
        const kelasRes = await fetch('/api/guru/kelas', { credentials: 'include' });
        if (!kelasRes.ok) throw new Error('Failed to fetch kelas');
        const kelasData = await kelasRes.json();
        const kelasList = kelasData.kelas || [];
        setKelasDiampu(kelasList);
        setFilteredClasses(kelasList);
        
        // 2. Fetch siswa hanya dari kelas aktif yang diampu guru
        if (kelasList.length > 0) {
          const klasIds = kelasList.map(k => k.id).join(',');
          const siswaRes = await fetch(`/api/guru/siswa?kelasIds=${klasIds}`, { credentials: 'include' });
          if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
          const siswaData = await siswaRes.json();
          const siswaList = siswaData.data || (Array.isArray(siswaData) ? siswaData : []);
          setAllSiswa(siswaList);
          
          // Calculate stats from filtered siswa only
          setStatsData({
            totalSiswa: siswaList.length,
            siswaAktif: siswaList.filter(s => s.status === 'approved').length,
            menungguValidasi: siswaList.filter(s => s.status !== 'approved').length,
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setKelasDiampu([]);
        setAllSiswa([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter kelas berdasarkan search
  useEffect(() => {
    let result = kelasDiampu;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(k => 
        k.nama.toLowerCase().includes(term) ||
        k.tahunAjaran?.nama?.toLowerCase().includes(term)
      );
    }
    
    // Apply kelas filter
    if (selectedKelas) {
      result = result.filter(k => k.id === selectedKelas);
    }
    
    setFilteredClasses(result);
  }, [searchTerm, selectedKelas, kelasDiampu]);

  // Calculate statistics from filtered classes
  const totalKelas = filteredClasses.length;
  const totalSiswaFiltered = allSiswa.filter(s => {
    // Filter siswa only from filtered kelas
    return filteredClasses.some(k => k.id === s.kelasId);
  }).length;
  const siswaAktifFiltered = allSiswa.filter(s => 
    filteredClasses.some(k => k.id === s.kelasId) && s.status === 'approved'
  ).length;

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
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-2 border-blue-200',
        titleColor: 'text-blue-600',
        valueColor: 'text-blue-700',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
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

  // Calculate statistics
  const totalSiswa = statsData.totalSiswa;
  const siswaAktif = statsData.siswaAktif;
  const menungguvalisasi = statsData.menungguValidasi;

  // Get unique kelas for dropdown
  const kelasOptions = kelasDiampu.map(k => ({
    id: k.id,
    nama: k.nama
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1600px] mx-auto px-6 lg:px-10 py-6 space-y-6">
        {/* Header Section - Hero Card */}
        <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Kelola Siswa
              </h1>
              <p className="text-green-50 text-sm sm:text-base">
                Manajemen data siswa berdasarkan kelas
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button
                onClick={() => router.push('/guru')}
                className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 shadow-md"
              >
                <span className="hidden sm:inline">Kembali</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-300 shadow-md">
                <UserPlus size={18} />
                <span className="hidden sm:inline">Tambah Siswa</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="animate-spin h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <p className="text-slate-600">Memuat data kelas dan siswa...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard 
                icon={Users}
                title="Total Siswa (dari Kelas Aktif)"
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

            {/* Filter Search Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md shadow-emerald-100/30 p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Cari Kelas
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 flex-shrink-0" size={18} />
                      <input
                        type="text"
                        placeholder="Cari berdasarkan nama kelas atau tahun ajaran..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                      Filter Kelas (Hanya Aktif)
                    </label>
                    <select
                      value={selectedKelas}
                      onChange={(e) => setSelectedKelas(e.target.value)}
                      className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="">Semua Kelas ({kelasDiampu.length})</option>
                      {kelasOptions.map(k => (
                        <option key={k.id} value={k.id}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Classes List Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
              <div className="p-6 border-b border-emerald-100/30">
                <h2 className="text-xl font-bold text-emerald-900">Daftar Kelas Diampu (Aktif)</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">No</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Kelas</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Tahun Ajaran</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Target Juz</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Jumlah Siswa</th>
                      <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-100/50">
                    {filteredClasses.map((kelas, index) => {
                      const siswaCount = allSiswa.filter(s => s.kelasId === kelas.id).length;
                      return (
                        <tr key={kelas.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-6">
                            <span className="text-gray-600">{index + 1}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-gray-900">{kelas.nama}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm text-gray-600">{kelas.tahunAjaran?.nama || '-'}</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium text-emerald-600">{kelas.targetJuz || '-'} Juz</p>
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-medium text-blue-600">{siswaCount} siswa</p>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => router.push(`/guru/kelola-siswa/${kelas.id}`)}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-colors text-sm"
                            >
                              <span>Detail</span>
                              <ArrowRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredClasses.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-gray-500">Tidak ada kelas aktif yang diampu</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}