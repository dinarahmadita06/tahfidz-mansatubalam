'use client';
import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle, XCircle, Clock, FileAudio } from 'lucide-react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import GuruLayout from '@/components/layout/GuruLayout';

export default function VerifikasiHafalan() {
  const [hafalanList, setHafalanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const [selectedHafalan, setSelectedHafalan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    score: 0,
    feedback: '',
    status: 'approved'
  });

  useEffect(() => {
    fetchHafalan();
  }, []);

  const fetchHafalan = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hafalan');
      const data = await res.json();
      setHafalanList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching hafalan:', error);
      setHafalanList([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} menit lalu`;
    } else if (diffHours < 24) {
      return `${diffHours} jam lalu`;
    } else if (diffDays === 1) {
      return '1 hari lalu';
    } else if (diffDays < 7) {
      return `${diffDays} hari lalu`;
    } else {
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
  };

  const handlePlayAudio = (id) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      // Simulasi play audio
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const HafalanCard = ({ hafalan }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
            {hafalan.siswa.user.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 leading-tight">{hafalan.siswa.user.name}</h4>
            <p className="text-xs text-gray-500 font-medium">{hafalan.siswa.kelas.nama}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          hafalan.status === 'LANCAR'
            ? 'bg-emerald-100 text-emerald-700'
            : hafalan.status === 'PERLU_PERBAIKAN'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-rose-100 text-rose-700'
        }`}>
          {hafalan.status === 'LANCAR' ? 'Lancar' :
           hafalan.status === 'PERLU_PERBAIKAN' ? 'Perbaikan' : 'Ditolak'}
        </span>
      </div>

      <div className="space-y-2 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
        <div className="flex justify-between">
          <span className="text-xs text-gray-500 font-semibold uppercase">Surah:</span>
          <span className="text-xs font-bold text-gray-800">{hafalan.surah.namaLatin}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500 font-semibold uppercase">Ayat:</span>
          <span className="text-xs font-bold text-gray-800">{hafalan.ayatMulai}-{hafalan.ayatSelesai}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-gray-500 font-semibold uppercase">Juz:</span>
          <span className="text-xs font-bold text-emerald-600">Juz {hafalan.juz}</span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 mt-1">
          <span className="text-xs text-gray-500 font-semibold uppercase">Waktu:</span>
          <span className="text-xs font-medium text-gray-600">{formatDate(hafalan.tanggal)}</span>
        </div>
      </div>

      {/* Nilai Section */}
      {hafalan.nilaiAkhir !== null && (
        <div className={`p-4 rounded-xl mb-4 border ${
          hafalan.status === 'LANCAR' ? 'bg-emerald-50/50 border-emerald-100' :
          hafalan.status === 'PERLU_PERBAIKAN' ? 'bg-amber-50/50 border-amber-100' : 'bg-rose-50/50 border-rose-100'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nilai Akhir:</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black ${
                hafalan.status === 'LANCAR' ? 'text-emerald-700' :
                hafalan.status === 'PERLU_PERBAIKAN' ? 'text-amber-700' : 'text-rose-700'
              }`}>{hafalan.nilaiAkhir?.toFixed(1)}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded bg-white border ${
                hafalan.status === 'LANCAR' ? 'text-emerald-600 border-emerald-200' :
                hafalan.status === 'PERLU_PERBAIKAN' ? 'text-amber-600 border-amber-200' : 'text-rose-600 border-rose-200'
              }`}>{hafalan.predikat}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200/50 rounded-full h-1.5 mb-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                hafalan.status === 'LANCAR' ? 'bg-emerald-500' :
                hafalan.status === 'PERLU_PERBAIKAN' ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${hafalan.nilaiAkhir}%` }}
            ></div>
          </div>

          {hafalan.catatan && (
            <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-2">
              "{hafalan.catatan}"
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <button 
        onClick={() => {
          setSelectedHafalan(hafalan);
          setShowDetailModal(true);
        }}
        className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
      >
        <FileAudio size={16} />
        Lihat Detail
      </button>
    </div>
  );

  if (loading) {
    return (
      <GuruLayout>
        <LoadingIndicator text="Memuat..." fullPage />
      </GuruLayout>
    );
  }

  // Filter data berdasarkan tab
  const filteredHafalan = hafalanList.filter(h => {
    if (activeTab === 'all') return true;
    if (activeTab === 'lancar') return h.status === 'LANCAR';
    if (activeTab === 'perlu_perbaikan') return h.status === 'PERLU_PERBAIKAN';
    if (activeTab === 'ditolak') return h.status === 'DITOLAK';
    return true;
  });

  // Statistik
  const totalHafalan = hafalanList.length;
  const lancar = hafalanList.filter(h => h.status === 'LANCAR').length;
  const perluPerbaikan = hafalanList.filter(h => h.status === 'PERLU_PERBAIKAN').length;
  const ditolak = hafalanList.filter(h => h.status === 'DITOLAK').length;
  const rataRataNilai = hafalanList.filter(h => h.nilaiAkhir !== null).length > 0
    ? (hafalanList.filter(h => h.nilaiAkhir !== null).reduce((acc, h) => acc + h.nilaiAkhir, 0) / hafalanList.filter(h => h.nilaiAkhir !== null).length).toFixed(1)
    : 0;

  return (
    <GuruLayout>
      <div className="space-y-6 pb-10">
        {/* Header Section */}
        <div className="rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white shadow-lg p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                Verifikasi Hafalan
              </h1>
              <p className="text-white/90 text-sm sm:text-base mt-1">
                Data hafalan siswa yang telah dinilai dan perlu divalidasi
              </p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            title="Lancar"
            value={lancar}
            color="bg-emerald-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Perlu Perbaikan"
            value={perluPerbaikan}
            color="bg-amber-500"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-white" />}
            title="Ditolak"
            value={ditolak}
            color="bg-rose-500"
          />
          <StatCard
            icon={<FileAudio className="w-6 h-6 text-white" />}
            title="Rata-rata Nilai"
            value={rataRataNilai}
            color="bg-teal-600"
          />
        </div>

        {/* Tabs and Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto bg-gray-50/50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              Semua ({totalHafalan})
            </button>
            <button
              onClick={() => setActiveTab('lancar')}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'lancar'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              Lancar ({lancar})
            </button>
            <button
              onClick={() => setActiveTab('perlu_perbaikan')}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'perlu_perbaikan'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              Perlu Perbaikan ({perluPerbaikan})
            </button>
            <button
              onClick={() => setActiveTab('ditolak')}
              className={`px-6 py-4 font-bold text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === 'ditolak'
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white'
                  : 'text-gray-400 hover:text-emerald-500'
              }`}
            >
              Ditolak ({ditolak})
            </button>
          </div>

          <div className="p-6">
            {filteredHafalan.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHafalan.map(hafalan => (
                  <HafalanCard key={hafalan.id} hafalan={hafalan} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileAudio className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700">Belum ada data hafalan</h3>
                <p className="text-sm text-gray-500 mt-1">Data hafalan akan muncul setelah siswa melakukan setoran</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detail Placeholder - Future implementation */}
      {showDetailModal && selectedHafalan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">Detail Verifikasi</h3>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl font-black shadow-inner">
                  {selectedHafalan.siswa.user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{selectedHafalan.siswa.user.name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{selectedHafalan.siswa.kelas.nama}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Materi</p>
                  <p className="text-sm font-bold text-gray-800">{selectedHafalan.surah.namaLatin}</p>
                  <p className="text-[11px] text-gray-500">Ayat {selectedHafalan.ayatMulai}-{selectedHafalan.ayatSelesai}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Capaian</p>
                  <p className="text-sm font-bold text-emerald-600">Juz {selectedHafalan.juz}</p>
                  <p className="text-[11px] text-gray-500">{new Date(selectedHafalan.tanggal).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Individual Aspect Scores */}
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                <h5 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">Nilai Per Aspek</h5>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Tartil:</span>
                    <span className="text-xs font-black text-emerald-700">{selectedHafalan.nilaiTartil || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Tajwid:</span>
                    <span className="text-xs font-black text-emerald-700">{selectedHafalan.nilaiTajwid || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Makhraj:</span>
                    <span className="text-xs font-black text-emerald-700">{selectedHafalan.nilaiMakhraj || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Kelancaran:</span>
                    <span className="text-xs font-black text-emerald-700">{selectedHafalan.nilaiKelancaran || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </GuruLayout>
  );
}