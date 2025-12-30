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
  XCircle,
  BookOpen,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Link
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for classes
const mockClasses = [
  { id: 'cmj5e0vj40001jm04gnqslpzs', name: 'X A1', tahunAjaran: '2024/2025', targetJuz: 1, totalSiswa: 25, progress: 45 },
  { id: 'cmj5e0vj40001jm04gnqslpzt', name: 'X A2', tahunAjaran: '2024/2025', targetJuz: 1, totalSiswa: 24, progress: 52 },
  { id: 'cmj5e0vj40001jm04gnqslpzu', name: 'XI A1', tahunAjaran: '2024/2025', targetJuz: 2, totalSiswa: 26, progress: 38 },
  { id: 'cmj5e0vj40001jm04gnqslpzv', name: 'XI A2', tahunAjaran: '2024/2025', targetJuz: 2, totalSiswa: 23, progress: 41 },
  { id: 'cmj5e0vj40001jm04gnqslpzw', name: 'XII A1', tahunAjaran: '2024/2025', targetJuz: 3, totalSiswa: 22, progress: 65 },
];

export default function KelolaSiswa() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');

  useEffect(() => {
    setClasses(mockClasses);
    setFilteredClasses(mockClasses);
  }, []);

  useEffect(() => {
    let result = classes;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.tahunAjaran.toLowerCase().includes(term)
      );
    }
    
    // Apply tahun ajaran filter
    if (selectedTahunAjaran) {
      result = result.filter(c => c.tahunAjaran === selectedTahunAjaran);
    }
    
    setFilteredClasses(result);
  }, [searchTerm, selectedTahunAjaran, classes]);

  // Get unique tahun ajaran values
  const tahunAjaranOptions = [...new Set(mockClasses.map(c => c.tahunAjaran))];

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
  const totalKelas = filteredClasses.length;
  const totalSiswa = filteredClasses.reduce((acc, c) => acc + c.totalSiswa, 0);
  const avgProgress = totalKelas > 0 
    ? Math.round(filteredClasses.reduce((acc, c) => acc + c.progress, 0) / totalKelas)
    : 0;
  const activeKelas = filteredClasses.length; // All are considered active

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

        {/* Statistics Cards - Pastel Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={Users}
            title="Total Kelas"
            value={totalKelas}
            theme="emerald"
          />
          <StatCard 
            icon={TrendingUp}
            title="Total Siswa"
            value={totalSiswa}
            theme="amber"
          />
          <StatCard 
            icon={Users}
            title="Rata-rata Progress"
            value={`${avgProgress}%`}
            theme="blue"
          />
          <StatCard 
            icon={Award}
            title="Kelas Aktif"
            value={activeKelas}
            theme="emerald"
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
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Tahun Ajaran
                </label>
                <select
                  value={selectedTahunAjaran}
                  onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                  className="w-full h-11 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                >
                  <option value="">Semua</option>
                  {tahunAjaranOptions.map(tahun => (
                    <option key={tahun} value={tahun}>{tahun}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Classes List Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
          <div className="p-6 border-b border-emerald-100/30">
            <h2 className="text-xl font-bold text-emerald-900">Daftar Kelas</h2>
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
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Rata-rata Progress</th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100/50">
                {filteredClasses.map((kelas, index) => (
                  <tr key={kelas.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <span className="text-gray-600">{index + 1}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{kelas.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-600">{kelas.tahunAjaran}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-emerald-600">{kelas.targetJuz} Juz</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-blue-600">{kelas.totalSiswa} siswa</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${kelas.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{kelas.progress}%</span>
                      </div>
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
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredClasses.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">Tidak ada kelas ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}