'use client';
import { useState, useEffect } from 'react';
import { Play, Pause, Volume2, CheckCircle, XCircle, Clock, FileAudio, Loader2 } from 'lucide-react';
import GuruLayout from '@/components/layout/GuruLayout';

export default function VerifikasiHafalan() {
  const [hafalanList, setHafalanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);
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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const HafalanCard = ({ hafalan }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{hafalan.siswa.user.name}</h4>
          <p className="text-sm text-gray-500">{hafalan.siswa.kelas.nama}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          hafalan.status === 'LANCAR'
            ? 'bg-green-100 text-green-800'
            : hafalan.status === 'PERLU_PERBAIKAN'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {hafalan.status === 'LANCAR' ? 'Lancar' :
           hafalan.status === 'PERLU_PERBAIKAN' ? 'Perlu Perbaikan' : 'Ditolak'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Surah:</span>
          <span className="text-sm font-medium">{hafalan.surah.namaLatin}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Ayat:</span>
          <span className="text-sm font-medium">{hafalan.ayatMulai}-{hafalan.ayatSelesai}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Juz:</span>
          <span className="text-sm font-medium">Juz {hafalan.juz}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Tanggal Setor:</span>
          <span className="text-sm font-medium">{formatDate(hafalan.tanggalSetor)}</span>
        </div>
      </div>

      {/* Nilai Section */}
      {hafalan.nilaiAkhir !== null && (
        <div className={`p-4 rounded-lg mb-4 ${
          hafalan.status === 'LANCAR' ? 'bg-green-50' :
          hafalan.status === 'PERLU_PERBAIKAN' ? 'bg-yellow-50' : 'bg-red-50'
        }`}>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-sm">
              <span className="text-gray-600">Tartil:</span>
              <span className="font-medium ml-1">{hafalan.nilaiTartil || '-'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Tajwid:</span>
              <span className="font-medium ml-1">{hafalan.nilaiTajwid || '-'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Makhraj:</span>
              <span className="font-medium ml-1">{hafalan.nilaiMakhraj || '-'}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Kelancaran:</span>
              <span className="font-medium ml-1">{hafalan.nilaiKelancaran || '-'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className={`text-sm font-medium ${
              hafalan.status === 'LANCAR' ? 'text-green-800' :
              hafalan.status === 'PERLU_PERBAIKAN' ? 'text-yellow-800' : 'text-red-800'
            }`}>Nilai Akhir:</span>
            <span className={`text-lg font-bold ${
              hafalan.status === 'LANCAR' ? 'text-green-800' :
              hafalan.status === 'PERLU_PERBAIKAN' ? 'text-yellow-800' : 'text-red-800'
            }`}>{hafalan.nilaiAkhir?.toFixed(1)} ({hafalan.predikat})</span>
          </div>
          {hafalan.catatan && (
            <p className={`text-sm mt-2 ${
              hafalan.status === 'LANCAR' ? 'text-green-700' :
              hafalan.status === 'PERLU_PERBAIKAN' ? 'text-yellow-700' : 'text-red-700'
            }`}>{hafalan.catatan}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
          Lihat Detail
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-[#FFB030]" />
        </div>
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1F1F1F] mb-2">Verifikasi Hafalan</h1>
          <p className="text-gray-600">Data hafalan siswa yang telah dinilai</p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<CheckCircle className="w-6 h-6 text-white" />}
            title="Lancar"
            value={lancar}
            color="bg-green-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6 text-white" />}
            title="Perlu Perbaikan"
            value={perluPerbaikan}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<XCircle className="w-6 h-6 text-white" />}
            title="Ditolak"
            value={ditolak}
            color="bg-red-500"
          />
          <StatCard
            icon={<FileAudio className="w-6 h-6 text-white" />}
            title="Rata-rata Nilai"
            value={rataRataNilai}
            color="bg-[#874D14]"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'all'
                  ? 'text-[#FFB030] border-b-2 border-[#FFB030]'
                  : 'text-gray-500'
              }`}
            >
              Semua ({totalHafalan})
            </button>
            <button
              onClick={() => setActiveTab('lancar')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'lancar'
                  ? 'text-[#FFB030] border-b-2 border-[#FFB030]'
                  : 'text-gray-500'
              }`}
            >
              Lancar ({lancar})
            </button>
            <button
              onClick={() => setActiveTab('perlu_perbaikan')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'perlu_perbaikan'
                  ? 'text-[#FFB030] border-b-2 border-[#FFB030]'
                  : 'text-gray-500'
              }`}
            >
              Perlu Perbaikan ({perluPerbaikan})
            </button>
            <button
              onClick={() => setActiveTab('ditolak')}
              className={`px-6 py-4 font-medium whitespace-nowrap ${
                activeTab === 'ditolak'
                  ? 'text-[#FFB030] border-b-2 border-[#FFB030]'
                  : 'text-gray-500'
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
              <div className="text-center py-12">
                <FileAudio className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data hafalan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}