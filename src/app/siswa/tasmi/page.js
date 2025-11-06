'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import { Award, Plus, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function SiswaTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [siswaData, setSiswaData] = useState(null);
  const [totalJuz, setTotalJuz] = useState(0);
  const [tasmiList, setTasmiList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    jumlahJuz: 0,
  });

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch siswa data & total juz
      const siswaRes = await fetch('/api/siswa');
      if (siswaRes.ok) {
        const siswaJson = await siswaRes.json();
        setSiswaData(siswaJson.siswa);

        // Calculate total juz from hafalan
        if (siswaJson.siswa?.id) {
          const hafalanRes = await fetch(`/api/siswa/hafalan-summary`);
          if (hafalanRes.ok) {
            const hafalanData = await hafalanRes.json();
            setTotalJuz(hafalanData.totalJuz || 0);
            setFormData({ jumlahJuz: hafalanData.totalJuz || 0 });
          }
        }
      }

      // Fetch tasmi history
      const tasmiRes = await fetch('/api/siswa/tasmi');
      if (tasmiRes.ok) {
        const tasmiData = await tasmiRes.json();
        setTasmiList(tasmiData.tasmi || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation: minimum 2 juz
    if (formData.jumlahJuz < 2) {
      toast.error('Minimal hafalan 2 juz untuk mendaftar Tasmi\'');
      return;
    }

    try {
      const response = await fetch('/api/siswa/tasmi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jumlahJuz: parseInt(formData.jumlahJuz),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil! Menunggu persetujuan guru.');
        setShowModal(false);
        fetchData();
      } else {
        toast.error(data.message || 'Gagal mendaftar Tasmi\'');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Terjadi kesalahan saat mendaftar');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      MENUNGGU: {
        icon: <Clock size={16} />,
        text: 'Menunggu Verifikasi',
        className: 'bg-amber-100 text-amber-700 border-amber-200'
      },
      DISETUJUI: {
        icon: <CheckCircle size={16} />,
        text: 'Disetujui',
        className: 'bg-green-100 text-green-700 border-green-200'
      },
      DITOLAK: {
        icon: <XCircle size={16} />,
        text: 'Ditolak',
        className: 'bg-red-100 text-red-700 border-red-200'
      },
      SELESAI: {
        icon: <Award size={16} />,
        text: 'Selesai',
        className: 'bg-purple-100 text-purple-700 border-purple-200'
      }
    };

    const badge = badges[status] || badges.MENUNGGU;

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium text-sm ${badge.className}`}>
        {badge.icon}
        <span>{badge.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <SiswaLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </SiswaLayout>
    );
  }

  return (
    <SiswaLayout>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-8 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Award size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Tasmi' Al-Qur'an</h1>
                <p className="text-purple-100">
                  Ujian akhir hafalan Al-Qur'an untuk siswa yang telah menghafal minimal 2 juz
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award size={24} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Juz Hafalan</p>
                <p className="text-2xl font-bold text-gray-900">{totalJuz} Juz</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pendaftaran</p>
                <p className="text-2xl font-bold text-gray-900">{tasmiList.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Kelayakan</p>
                <p className={`text-lg font-bold ${totalJuz >= 2 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalJuz >= 2 ? 'Memenuhi Syarat' : 'Belum Memenuhi'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Info */}
        {totalJuz < 2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 mb-1">Syarat Pendaftaran Tasmi'</p>
              <p className="text-sm text-amber-700">
                Anda harus menghafal minimal <strong>2 juz</strong> untuk dapat mendaftar ujian Tasmi'.
                Saat ini Anda telah menghafal <strong>{totalJuz} juz</strong>.
                {totalJuz < 2 && ` Masih kurang ${2 - totalJuz} juz lagi!`}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {totalJuz >= 2 && (
          <div className="mb-6">
            <button
              onClick={() => setShowModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Plus size={20} />
              <span>Daftar Tasmi' Baru</span>
            </button>
          </div>
        )}

        {/* Riwayat Tasmi */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="text-lg font-bold text-gray-900">Riwayat Pendaftaran Tasmi'</h2>
            <p className="text-sm text-gray-600 mt-1">Daftar pendaftaran dan hasil ujian Tasmi' Anda</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jumlah Juz</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jadwal Ujian</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Nilai Akhir</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasmiList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Award size={48} className="text-gray-300" />
                        <p className="text-gray-500">Belum ada pendaftaran Tasmi'</p>
                        {totalJuz >= 2 && (
                          <p className="text-sm text-gray-400">Klik tombol "Daftar Tasmi' Baru" untuk mendaftar</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasmiList.map((tasmi) => (
                    <tr key={tasmi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(tasmi.tanggalDaftar).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                          {tasmi.jumlahJuz}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(tasmi.statusPendaftaran)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {tasmi.tanggalUjian
                          ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tasmi.nilaiAkhir ? (
                          <span className="inline-flex items-center justify-center w-14 h-10 bg-purple-100 text-purple-700 rounded-lg font-bold text-lg">
                            {tasmi.nilaiAkhir.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tasmi.catatan || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Daftar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Daftar Tasmi' Baru</h2>
              <p className="text-sm text-gray-600 mt-1">Konfirmasi jumlah juz yang telah Anda hafal</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Juz Hafalan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.jumlahJuz}
                  onChange={(e) => setFormData({ jumlahJuz: parseInt(e.target.value) || 0 })}
                  min="2"
                  max="30"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl font-bold"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Minimal 2 juz, maksimal 30 juz</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Catatan:</strong> Pastikan jumlah juz yang Anda daftarkan sesuai dengan hafalan yang telah Anda kuasai.
                  Guru akan memverifikasi pendaftaran Anda.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  Daftar Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiswaLayout>
  );
}
