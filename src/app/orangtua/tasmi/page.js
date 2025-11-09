'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import OrangtuaLayout from '@/components/layout/OrangtuaLayout';
import { Award, Calendar, CheckCircle, XCircle, Clock, AlertCircle, BookOpen, Star, FileText } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function OrangtuaTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [tasmiList, setTasmiList] = useState([]);

  useEffect(() => {
    if (session) {
      fetchChildrenData();
    }
  }, [session]);

  useEffect(() => {
    if (selectedChild) {
      setTasmiList(selectedChild.tasmi || []);
    }
  }, [selectedChild]);

  const fetchChildrenData = async () => {
    try {
      const response = await fetch('/api/orangtua/tasmi');
      if (response.ok) {
        const data = await response.json();
        setChildrenData(data.children || []);
        if (data.children && data.children.length > 0) {
          setSelectedChild(data.children[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
      toast.error('Gagal memuat data anak');
    } finally {
      setLoading(false);
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

  const getPredikatBadge = (predikat) => {
    if (!predikat) return <span className="text-gray-400">-</span>;

    const badges = {
      Mumtaz: 'bg-green-100 text-green-700 border-green-200',
      'Jayyid Jiddan': 'bg-blue-100 text-blue-700 border-blue-200',
      Jayyid: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      Maqbul: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${
          badges[predikat] || badges.Maqbul
        }`}
      >
        {predikat}
      </span>
    );
  };

  if (loading) {
    return (
      <OrangtuaLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </OrangtuaLayout>
    );
  }

  if (childrenData.length === 0) {
    return (
      <OrangtuaLayout>
        <Toaster position="top-right" />
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Data Anak Tidak Ditemukan</h2>
            <p className="text-gray-600">Silakan hubungi admin untuk menghubungkan data anak Anda.</p>
          </div>
        </div>
      </OrangtuaLayout>
    );
  }

  return (
    <OrangtuaLayout>
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
                  Monitoring ujian akhir hafalan Al-Qur'an anak Anda
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Child Selector */}
        {childrenData.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Anak
            </label>
            <select
              value={selectedChild?.siswaId || ''}
              onChange={(e) => {
                const child = childrenData.find(c => c.siswaId === e.target.value);
                setSelectedChild(child);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {childrenData.map((child) => (
                <option key={child.siswaId} value={child.siswaId}>
                  {child.nama} - {child.kelas}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Info Card */}
        {selectedChild && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <BookOpen size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nama Anak</p>
                  <p className="text-xl font-bold text-gray-900">{selectedChild.nama}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Award size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Pendaftaran Tasmi&apos;</p>
                  <p className="text-2xl font-bold text-gray-900">{tasmiList.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Riwayat Tasmi */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
            <h2 className="text-lg font-bold text-gray-900">Riwayat Tasmi' Anak</h2>
            <p className="text-sm text-gray-600 mt-1">Status ujian hafalan Al-Qur'an</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal Daftar</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Juz yang Ditasmi</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jadwal Ujian</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Nilai</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Predikat</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Hasil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasmiList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Award size={48} className="text-gray-300" />
                        <p className="text-gray-500">Belum ada pendaftaran Tasmi&apos;</p>
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
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{tasmi.juzYangDitasmi}</div>
                        <div className="text-xs text-gray-500">Total: {tasmi.jumlahHafalan} Juz</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(tasmi.statusPendaftaran)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {tasmi.tanggalUjian
                          ? new Date(tasmi.tanggalUjian).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tasmi.publishedAt && tasmi.nilaiAkhir ? (
                          <div className="flex items-center justify-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-lg">{tasmi.nilaiAkhir.toFixed(0)}</span>
                          </div>
                        ) : tasmi.statusPendaftaran === 'SELESAI' ? (
                          <span className="text-xs text-gray-500">Menunggu publikasi</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tasmi.publishedAt && tasmi.predikat ? (
                          getPredikatBadge(tasmi.predikat)
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {tasmi.publishedAt && tasmi.pdfUrl ? (
                          <button
                            onClick={() => window.open(tasmi.pdfUrl, '_blank')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FileText size={14} />
                            Lihat PDF
                          </button>
                        ) : tasmi.statusPendaftaran === 'SELESAI' ? (
                          <span className="text-xs text-gray-500">Belum tersedia</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrangtuaLayout>
  );
}
