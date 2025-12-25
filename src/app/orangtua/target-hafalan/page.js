'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Target,
  BookOpen,
  TrendingUp,
  Award,
  User,
  GraduationCap,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
  BarChart3,
  Clock,
  BookMarked,
  Sparkles
} from 'lucide-react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';

export default function TargetHafalanOrangtuaPage() {
  const { data: session } = useSession();
  const [anakList, setAnakList] = useState([]);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [targetData, setTargetData] = useState(null);
  const [hafalanHistory, setHafalanHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAnakList();
    }
  }, [session]);

  const fetchAnakList = async () => {
    try {
      const response = await fetch('/api/orangtua/target-hafalan');
      const data = await response.json();

      if (data.success) {
        setAnakList(data.data.anakList || []);
        if (data.data.anakList.length > 0) {
          setSelectedAnak(data.data.anakList[0]);
          fetchTargetDetail(data.data.anakList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching anak list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTargetDetail = async (siswaId) => {
    try {
      const response = await fetch(`/api/orangtua/target-hafalan/${siswaId}`);
      const data = await response.json();

      if (data.success) {
        setTargetData(data.data.target);
        setHafalanHistory(data.data.history || []);
      }
    } catch (error) {
      console.error('Error fetching target detail:', error);
    }
  };

  const handleAnakChange = (anak) => {
    setSelectedAnak(anak);
    fetchTargetDetail(anak.id);
  };

  const getStatusColor = (progress) => {
    if (progress >= 80) return 'emerald';
    if (progress >= 50) return 'amber';
    return 'red';
  };

  const getStatusText = (progress) => {
    if (progress >= 80) return 'Sangat Baik';
    if (progress >= 50) return 'Sedang';
    return 'Perlu Perhatian';
  };

  // Simple Bar Chart Component
  const BarChart = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.label}</span>
              <span className="font-bold text-emerald-600">{item.value} Juz</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-amber-50/20 to-cream-50/30 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="text-white" size={28} />
            </div>
            Target Hafalan Anak
          </h1>
          <p className="text-gray-600 ml-16">
            Pantau progress dan capaian hafalan anak Anda
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        ) : anakList.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-lg">
            <User size={64} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Belum ada data anak yang terdaftar</p>
          </div>
        ) : (
          <>
            {/* Anak Selector */}
            {anakList.length > 1 && (
              <div className="mb-8 bg-white rounded-2xl p-4 shadow-lg border border-emerald-100/50">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Pilih Anak:
                </label>
                <div className="flex flex-wrap gap-3">
                  {anakList.map((anak) => (
                    <button
                      key={anak.id}
                      onClick={() => handleAnakChange(anak)}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                        selectedAnak?.id === anak.id
                          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <User size={18} />
                      {anak.nama}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedAnak && targetData && (
              <>
                {/* Student Info Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl mb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-10">
                    <User size={200} className="text-white" />
                  </div>
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <User className="text-white" size={32} />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Nama Lengkap</p>
                        <p className="text-white text-xl font-bold">{selectedAnak.nama}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <GraduationCap className="text-white" size={32} />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Kelas</p>
                        <p className="text-white text-xl font-bold">{targetData.kelasInfo.nama}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Calendar className="text-white" size={32} />
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Tahun Ajaran</p>
                        <p className="text-white text-xl font-bold">{targetData.kelasInfo.tahunAjaran}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Target Sekolah */}
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                        <BookOpen className="text-white" size={24} />
                      </div>
                      <span className="text-3xl font-bold text-emerald-700">{targetData.targetSekolah}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-emerald-900 mb-1">Target Sekolah</h3>
                    <p className="text-xs text-emerald-700">Juz per tahun</p>
                  </div>

                  {/* Target Anak */}
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                        <Target className="text-white" size={24} />
                      </div>
                      <span className="text-3xl font-bold text-amber-700">
                        {targetData.targetPribadi || targetData.targetSekolah}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-amber-900 mb-1">Target Anak</h3>
                    <p className="text-xs text-amber-700">Juz target pribadi</p>
                  </div>

                  {/* Progress Hafalan */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-teal-200/50 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                        <TrendingUp className="text-white" size={24} />
                      </div>
                      <span className="text-3xl font-bold text-teal-700">{targetData.progressPercentage}%</span>
                    </div>
                    <h3 className="text-sm font-semibold text-teal-900 mb-1">Progress Hafalan</h3>
                    <p className="text-xs text-teal-700">{targetData.capaian} dari {targetData.targetPribadi || targetData.targetSekolah} Juz</p>
                  </div>

                  {/* Status */}
                  <div className={`bg-gradient-to-br from-${getStatusColor(targetData.progressPercentage)}-50 to-${getStatusColor(targetData.progressPercentage)}-100/50 rounded-2xl p-6 shadow-lg border border-${getStatusColor(targetData.progressPercentage)}-200/50 hover:shadow-xl transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br from-${getStatusColor(targetData.progressPercentage)}-400 to-${getStatusColor(targetData.progressPercentage)}-500 rounded-xl flex items-center justify-center shadow-md`}>
                        {targetData.progressPercentage >= 80 ? (
                          <CheckCircle className="text-white" size={24} />
                        ) : targetData.progressPercentage >= 50 ? (
                          <Star className="text-white" size={24} />
                        ) : (
                          <AlertCircle className="text-white" size={24} />
                        )}
                      </div>
                      <Award className={`text-${getStatusColor(targetData.progressPercentage)}-400`} size={32} />
                    </div>
                    <h3 className={`text-sm font-semibold text-${getStatusColor(targetData.progressPercentage)}-900 mb-1`}>Status</h3>
                    <p className={`text-xs text-${getStatusColor(targetData.progressPercentage)}-700 font-semibold`}>
                      {getStatusText(targetData.progressPercentage)}
                    </p>
                  </div>
                </div>

                {/* Progress Chart & History */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Grafik Progress */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-emerald-100/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="text-emerald-600" size={24} />
                      Grafik Progress Hafalan
                    </h2>

                    <BarChart
                      data={[
                        { label: 'Target Sekolah', value: targetData.targetSekolah },
                        { label: 'Target Pribadi', value: targetData.targetPribadi || targetData.targetSekolah },
                        { label: 'Capaian Saat Ini', value: targetData.capaian }
                      ]}
                    />

                    <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-200/50">
                      <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="text-emerald-600" size={20} />
                        <p className="text-sm font-semibold text-emerald-900">Progress Overview</p>
                      </div>
                      <p className="text-sm text-emerald-800 leading-relaxed">
                        Anak Anda telah menghafal <strong>{targetData.capaian} Juz</strong> dari target{' '}
                        <strong>{targetData.targetPribadi || targetData.targetSekolah} Juz</strong>.
                        Sisa <strong>{Math.max(0, (targetData.targetPribadi || targetData.targetSekolah) - targetData.capaian)} Juz</strong> lagi untuk mencapai target.
                      </p>
                    </div>
                  </div>

                  {/* Riwayat Hafalan Terbaru */}
                  <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl border border-emerald-100/50">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Clock className="text-amber-600" size={24} />
                      Riwayat Hafalan Terbaru
                    </h2>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {hafalanHistory.length === 0 ? (
                        <div className="text-center py-8">
                          <BookMarked size={48} className="text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">Belum ada riwayat hafalan</p>
                        </div>
                      ) : (
                        hafalanHistory.map((hafalan, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 hover:shadow-md transition-all duration-200"
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <BookMarked className="text-white" size={20} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-1">
                                {hafalan.surahNama} ({hafalan.surahNamaLatin})
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Ayat {hafalan.ayatMulai} - {hafalan.ayatSelesai} • Juz {hafalan.juz}
                              </p>
                              <div className="flex items-center gap-4 text-xs">
                                <span className="flex items-center gap-1 text-amber-700">
                                  <Star size={14} className="fill-amber-500 text-amber-500" />
                                  <span className="font-semibold">{hafalan.nilaiAkhir || '-'}</span>
                                </span>
                                <span className={`px-2 py-1 rounded-lg font-semibold ${
                                  hafalan.status === 'LANCAR'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : hafalan.status === 'PERLU_PERBAIKAN'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {hafalan.status === 'LANCAR' ? '✓ Lancar' :
                                   hafalan.status === 'PERLU_PERBAIKAN' ? '! Perlu Perbaikan' :
                                   '✗ Ditolak'}
                                </span>
                                <span className="text-gray-500 ml-auto">
                                  {new Date(hafalan.tanggal).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Motivational Quote for Parents */}
                <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-8 shadow-xl border border-purple-200/50">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Heart className="text-white" size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-purple-600" size={20} />
                        <h3 className="font-bold text-purple-900 text-xl">Pesan untuk Orang Tua</h3>
                      </div>
                      <p className="text-purple-800 leading-relaxed mb-4 text-lg">
                        "Didiklah anakmu sesuai dengan zamannya, karena mereka hidup bukan di zamanmu"
                      </p>
                      <p className="text-purple-700 leading-relaxed text-sm bg-white/50 p-4 rounded-xl">
                        Dukung setiap pencapaian anak dengan kasih sayang dan doa. Jangan membandingkan
                        anak dengan yang lain. Setiap anak memiliki keunikan dan kecepatan belajar sendiri.
                        Yang terpenting adalah konsistensi dan keikhlasan dalam menghafal Al-Qur'an.
                        <strong> Barakallahu fiikum! </strong>🤲
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 font-semibold">
                        <Award size={18} />
                        <span>Teruslah berikan motivasi dan apresiasi kepada anak Anda</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </OrangtuaLayout>
  );
}
