'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  UserPlus, 
  Search, 
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Edit
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { useParams, useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import StudentCreateModal from '@/components/admin/StudentCreateModal';

export default function KelolaSiswaByKelas() {
  const { kelasId } = useParams();
  const router = useRouter();
  const [kelas, setKelas] = useState(null);
  const [allSiswa, setAllSiswa] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalSiswa: 0,
    siswaAktif: 0,
    menungguValidasi: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch data kelas spesifik
      const kelasRes = await fetch('/api/guru/kelas', { credentials: 'include' });
      if (!kelasRes.ok) throw new Error('Failed to fetch kelas');
      const kelasData = await kelasRes.json();
      const foundKelas = (kelasData.kelas || []).find(k => k.id === kelasId);
      
      if (foundKelas) {
        setKelas(foundKelas);
        
        // Fetch siswa untuk kelas ini
        const siswaRes = await fetch(`/api/guru/siswa?kelasIds=${kelasId}`, { credentials: 'include' });
        if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
        const siswaData = await siswaRes.json();
        const siswaList = siswaData.data || [];
        setAllSiswa(siswaList);
        setFilteredSiswa(siswaList);
        
        // Calculate stats
        const approved = siswaList.filter(s => s.status === 'approved').length;
        const pending = siswaList.filter(s => s.status !== 'approved').length;
        setStatsData({
          totalSiswa: siswaList.length,
          siswaAktif: approved,
          menungguValidasi: pending,
        });
      } else {
        console.warn('⚠️ Kelas tidak ditemukan atau tidak diampu!');
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [kelasId]);

  useEffect(() => {
    if (kelasId) {
      fetchData();
    }
  }, [kelasId, fetchData]);

  // Filter siswa berdasarkan search
  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const result = allSiswa.filter(s => 
        s.user?.name?.toLowerCase().includes(term) ||
        s.nis?.includes(term) ||
        s.nisn?.includes(term)
      );
      setFilteredSiswa(result);
    } else {
      setFilteredSiswa(allSiswa);
    }
  }, [searchTerm, allSiswa]);

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

  if (loading) {
    return (
      <GuruLayout>
        <LoadingIndicator text="Memuat data kelas..." fullPage />
      </GuruLayout>
    );
  }

  if (!kelas) {
    return (
      <GuruLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kelas Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Kelas ini mungkin sudah tidak aktif atau Anda tidak memiliki akses untuk mengelolanya.</p>
            <button 
              onClick={() => router.push('/guru/kelola-siswa')}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
            >
              Kembali ke Kelola Siswa
            </button>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="w-full py-6 space-y-6">
          {/* Header Section */}
          <div className="relative w-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg px-6 py-8 sm:px-8 sm:py-10 overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/guru/kelola-siswa')}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    Kelas {kelas.nama}
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base">
                    Manajemen siswa dan monitoring progress kelas
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard 
              icon={Users}
              title="Total Siswa"
              value={statsData.totalSiswa}
              theme="amber"
            />
            <StatCard 
              icon={CheckCircle}
              title="Siswa Aktif"
              value={statsData.siswaAktif}
              theme="emerald"
            />
            <StatCard 
              icon={AlertCircle}
              title="Menunggu Validasi"
              value={statsData.menungguValidasi}
              theme="orange"
            />
          </div>

          {/* Filter Section */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-md p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Cari Nama Siswa, NIS, atau NISN
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Nama, NIS, NISN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Siswa List Card */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
            <div className="p-6 border-b border-emerald-100/30">
              <h2 className="text-xl font-bold text-emerald-900">Daftar Siswa Kelas {kelas.nama}</h2>
              <p className="text-sm text-slate-600 mt-1">Menampilkan {filteredSiswa.length} siswa</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-200">
                  <tr>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">No</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Nama Siswa</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NISN</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NIS</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Kelas</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">Aksi</th>
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
                        <p className="text-sm text-gray-600">{siswa.nisn || '-'}</p>
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
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors" title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                          <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors" title="Hapus">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredSiswa.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">Tidak ada siswa ditemukan</p>
              </div>
            )}
          </div>
        </div>

        <StudentCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={fetchData}
          userRole="GURU"
          initialKelasId={kelasId}
        />
      </div>
    </GuruLayout>
  );
}
