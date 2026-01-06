'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  ClipboardCheck,
  Users,
  BookOpen,
  ChevronRight,
  Loader2,
  CalendarCheck,
  CheckCircle2,
  School,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function PresensiPage() {
  const router = useRouter();
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKelasGuru();
  }, []);

  const fetchKelasGuru = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guru/kelas');

      if (!response.ok) {
        throw new Error('Gagal memuat data kelas');
      }

      const data = await response.json();
      setKelasList(data.kelas || []);
    } catch (error) {
      console.error('Error fetching kelas:', error);
      toast.error('Gagal memuat data kelas');
      setKelasList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKelasClick = (kelasId) => {
    router.push(`/guru/presensi/${kelasId}`);
  };

  // Calculate statistics
  const totalKelas = kelasList.length;
  const totalSiswa = kelasList.reduce((sum, kelas) => sum + (kelas._count?.siswa || 0), 0);

  // TODO: Implement proper presensi hari ini calculation from API
  const presensiHariIni = 0; // Placeholder - should be calculated from actual presensi data

  if (loading) {
    return (
      <GuruLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Memuat data...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div className="space-y-6">
        {/* Header Gradient Hijau */}
        <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-2xl shadow-lg p-5 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4 w-full">
              <div className="bg-white/20 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl flex-shrink-0">
                <ClipboardCheck size={32} className="text-white sm:hidden" />
                <ClipboardCheck size={40} className="text-white hidden sm:block" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <h1 className="text-2xl sm:text-4xl font-bold truncate">Presensi Siswa</h1>
                </div>
                <p className="text-green-50 text-sm sm:text-lg leading-relaxed max-w-2xl">
                  Pilih kelas untuk mencatat kehadiran siswa
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Kelas Diampu */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-semibold mb-1">TOTAL KELAS DIAMPU</p>
                <h3 className="text-4xl font-bold text-emerald-700">{totalKelas}</h3>
              </div>
              <div className="bg-emerald-100 p-4 rounded-full">
                <School size={32} className="text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Card 2: Total Siswa */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-semibold mb-1">TOTAL SISWA</p>
                <h3 className="text-4xl font-bold text-blue-700">{totalSiswa}</h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-full">
                <Users size={32} className="text-blue-600" />
              </div>
            </div>
          </div>

          {/* Card 3: Presensi Hari Ini */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-semibold mb-1">PRESENSI HARI INI</p>
                <h3 className="text-4xl font-bold text-amber-700">{presensiHariIni}</h3>
                <p className="text-amber-600 text-xs mt-1">kelas sudah diisi</p>
              </div>
              <div className="bg-amber-100 p-4 rounded-full">
                <CheckCircle2 size={32} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Daftar Kelas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-green-600">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen size={20} />
              Daftar Kelas yang Diampu
            </h2>
          </div>

          <div className="p-6">
            {kelasList.length === 0 ? (
              /* Empty State */
              <div className="py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center">
                    <BookOpen size={48} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Kelas yang Diampu</h3>
                    <p className="text-gray-600">Anda belum ditugaskan untuk mengampu kelas manapun.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Kelas Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kelasList.map((kelas) => (
                  <div
                    key={kelas.id}
                    onClick={() => handleKelasClick(kelas.id)}
                    className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 cursor-pointer transition-all duration-300 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                        <BookOpen size={28} className="text-white" />
                      </div>
                      <ChevronRight size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      Kelas {kelas.nama}
                    </h3>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          kelas.status === 'AKTIF'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                            : 'bg-red-100 text-red-700 border-red-300'
                        }`}
                      >
                        {kelas.status === 'AKTIF' ? (
                          <>
                            <CheckCircle2 size={14} />
                            Aktif
                          </>
                        ) : (
                          'Nonaktif'
                        )}
                      </span>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className="text-gray-400" />
                        <span className="font-medium">{kelas._count?.siswa || 0} siswa</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarCheck size={16} className="text-gray-400" />
                        <span className="font-medium">{kelas.tahunAjaran?.nama || 'Tidak ada TA'}</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-emerald-600 font-semibold text-sm group-hover:text-emerald-700">
                        <span>Catat Presensi</span>
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </GuruLayout>
  );
}
