'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Target,
  BookOpen,
  TrendingUp,
  Award,
  Plus,
  CheckCircle,
  Star,
  Sparkles,
  BookMarked,
  Calendar,
  X
} from 'lucide-react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import MotivationalCard from '@/components/MotivationalCard';

export default function TargetHafalanSiswaPage() {
  const { data: session } = useSession();
  const [targetData, setTargetData] = useState({
    targetSekolah: 0,
    targetPribadi: 0,
    capaian: 0,
    progressPercentage: 0,
    kelasInfo: {}
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTarget, setNewTarget] = useState('');

  useEffect(() => {
    if (session?.user?.id) {
      fetchTargetHafalan();
    }
  }, [session]);

  const fetchTargetHafalan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/siswa/target-hafalan');
      const data = await response.json();

      if (data.success) {
        setTargetData(data.data);
      }
    } catch (error) {
      console.error('Error fetching target hafalan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTarget = async () => {
    if (!newTarget || parseFloat(newTarget) <= 0) {
      alert('Masukkan target yang valid');
      return;
    }

    try {
      const response = await fetch('/api/siswa/target-hafalan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPribadi: parseFloat(newTarget)
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchTargetHafalan();
        setShowAddModal(false);
        setNewTarget('');
        alert('Target pribadi berhasil ditambahkan!');
      }
    } catch (error) {
      console.error('Error adding target:', error);
      alert('Gagal menambahkan target');
    }
  };

  // Circular progress component
  const CircularProgress = ({ percentage, size = 200 }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{Math.round(percentage)}%</span>
          <span className="text-sm text-gray-600 mt-1">Progress</span>
        </div>
      </div>
    );
  };

  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 via-amber-50/20 to-cream-50/30 p-6 lg:p-8">
        {/* Islamic Quote Header */}
        <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <BookOpen size={200} className="text-white" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Target Hafalanku</h2>
            </div>
          </div>
        </div>

        {/* Motivational Card - Slider */}
        <MotivationalCard theme="emerald" className="mb-8" />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Side - Progress Circle */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100/50 flex flex-col items-center justify-center">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="text-emerald-600" size={24} />
                  Progress Hafalanku
                </h3>

                <CircularProgress percentage={targetData.progressPercentage} size={220} />

                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-2">Capaian Hafalan</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {targetData.capaian}
                    </span>
                    <span className="text-2xl text-gray-600">/</span>
                    <span className="text-2xl font-semibold text-gray-700">
                      {targetData.targetPribadi || targetData.targetSekolah}
                    </span>
                    <span className="text-gray-600">Juz</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Target Cards */}
              <div className="space-y-6">
                {/* Target Sekolah Card */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 shadow-lg border border-emerald-200/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                        <BookOpen className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-emerald-900">Target Sekolah</h3>
                        <p className="text-sm text-emerald-700">Kelas {targetData.kelasInfo?.namaKelas}</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-emerald-200/50 rounded-xl">
                      <p className="text-2xl font-bold text-emerald-800">{targetData.targetSekolah}</p>
                      <p className="text-xs text-emerald-700 text-center">Juz</p>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    Target minimal hafalan yang ditetapkan sekolah untuk kelasmu tahun ini.
                  </p>
                </div>

                {/* Target Pribadi Card */}
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-3xl p-6 shadow-lg border border-amber-200/50 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
                        <Target className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-amber-900">Target Pribadi</h3>
                        <p className="text-sm text-amber-700">Target yang kamu tetapkan</p>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-amber-200/50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-800">
                        {targetData.targetPribadi || targetData.targetSekolah}
                      </p>
                      <p className="text-xs text-amber-700 text-center">Juz</p>
                    </div>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed mb-4">
                    Tetapkan target pribadimu untuk meningkatkan motivasi hafalan!
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Plus size={20} />
                    Ubah Target Pribadi
                  </button>
                </div>
              </div>
            </div>

            {/* Achievement Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Hafalan */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-md">
                    <BookMarked className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Hafalan</p>
                    <p className="text-3xl font-bold text-emerald-700">{targetData.capaian} Juz</p>
                  </div>
                </div>
              </div>

              {/* Sisa Target */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-md">
                    <Calendar className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Sisa Target</p>
                    <p className="text-3xl font-bold text-amber-700">
                      {Math.max(0, (targetData.targetPribadi || targetData.targetSekolah) - targetData.capaian)} Juz
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-teal-100/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-md">
                    {targetData.progressPercentage >= 80 ? (
                      <CheckCircle className="text-white" size={28} />
                    ) : (
                      <Star className="text-white" size={28} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Status</p>
                    <p className="text-xl font-bold text-teal-700">
                      {targetData.progressPercentage >= 80 ? 'Sangat Baik!' :
                       targetData.progressPercentage >= 50 ? 'Tetap Semangat!' :
                       'Ayo Tingkatkan!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add Target Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                    <Target className="text-white" size={20} />
                  </div>
                  Ubah Target Pribadi
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target Hafalan (dalam Juz)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="30"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  placeholder="Contoh: 3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg font-semibold"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Target saat ini: <strong>{targetData.targetPribadi || targetData.targetSekolah} Juz</strong>
                </p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
                <p className="text-sm text-amber-800 leading-relaxed">
                  💡 <strong>Tips:</strong> Tetapkan target yang realistis dan sesuai dengan kemampuanmu.
                  Target yang terlalu tinggi bisa membuatmu terbebani.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddTarget}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                >
                  Simpan Target
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SiswaLayout>
  );
}
