'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import StudentCreateModal from '@/components/admin/StudentCreateModal';

export default function KelolaSiswa() {
  const router = useRouter();
  const [allSiswa, setAllSiswa] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [kelasDiampu, setKelasDiampu] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statsData, setStatsData] = useState({
    totalSiswa: 0,
    siswaAktif: 0,
    menungguValidasi: 0,
  });

  // Fetch kelas aktif dan siswa mereka
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('📚 Fetching kelas aktif dari /api/guru/kelas...');
      const kelasRes = await fetch('/api/guru/kelas', { credentials: 'include' });
      if (!kelasRes.ok) throw new Error('Failed to fetch kelas');
      const kelasData = await kelasRes.json();
      const kelasList = kelasData.kelas || [];
      console.log('✅ Kelas yang diampu (AKTIF):', kelasList.length, kelasList.map(k => ({ id: k.id, nama: k.nama })));
      setKelasDiampu(kelasList);
      
      // Fetch siswa hanya dari kelas aktif yang diampu guru
      if (kelasList.length > 0) {
        const klasIds = kelasList.map(k => k.id).join(',');
        console.log('🔗 Kelas IDs untuk fetch siswa:', klasIds);
        const siswaRes = await fetch(`/api/guru/siswa?kelasIds=${klasIds}`, { credentials: 'include' });
        if (!siswaRes.ok) throw new Error('Failed to fetch siswa');
        const siswaData = await siswaRes.json();
        console.log('📊 API response:', siswaData);
        const siswaList = siswaData.data || [];
        console.log('✅ Siswa yang di-fetch:', siswaList.length, 'siswa');
        setAllSiswa(siswaList);
        setFilteredSiswa(siswaList);
        
        // Calculate stats
        const approved = siswaList.filter(s => s.status === 'approved').length;
        const pending = siswaList.filter(s => s.status !== 'approved').length;
        console.log(`📈 Stats: Total=${siswaList.length}, Aktif=${approved}, Menunggu=${pending}`);
        setStatsData({
          totalSiswa: siswaList.length,
          siswaAktif: approved,
          menungguValidasi: pending,
        });
      } else {
        console.warn('⚠️ Guru tidak memiliki kelas aktif yang diampu!');
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setKelasDiampu([]);
      setAllSiswa([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter siswa berdasarkan search dan selected kelas
  useEffect(() => {
    let result = allSiswa;
    
    // Filter by selected kelas
    if (selectedKelas) {
      result = result.filter(s => s.kelasId === selectedKelas);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.user?.name?.toLowerCase().includes(term) ||
        s.nis?.includes(term) ||
        s.nisn?.includes(term)
      );
    }
    
    setFilteredSiswa(result);
  }, [searchTerm, selectedKelas, allSiswa]);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-sm text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );

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

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  Kelola Siswa
                </h1>
                <p className="text-green-50 text-sm sm:text-base">
                  Monitoring siswa kelas binaan dan tracking progress hafalan
                </p>
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

          {loading ? (
            <LoadingIndicator text="Memuat data kelas dan siswa..." />
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  icon={<Users size={24} />}
                  title="Total Siswa"
                  value={totalSiswa}
                  color="bg-amber-500"
                />
                <StatCard 
                  icon={<CheckCircle size={24} />}
                  title="Siswa Aktif"
                  value={siswaAktif}
                  color="bg-emerald-500"
                />
                <StatCard 
                  icon={<AlertCircle size={24} />}
                  title="Menunggu Validasi"
                  value={menungguvalisasi}
                  color="bg-orange-500"
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
                        <th className="py-4 px-6 text-left text-xs font-bold text-emerald-900 uppercase tracking-wider">NISN</th>
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
          onSuccess={fetchData}
          userRole="GURU"
        />
      </div>
    </GuruLayout>
  );
}
