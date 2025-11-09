'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SiswaLayout from '@/components/layout/SiswaLayout';
import { Award, Plus, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function SiswaTasmiPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [siswaData, setSiswaData] = useState(null);
  const [totalJuz, setTotalJuz] = useState(0);
  const [tasmiList, setTasmiList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    jumlahHafalan: 0,
    juzYangDitasmi: '',
    jamTasmi: '',
    tanggalTasmi: '',
    catatan: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch siswa data & total juz with guruKelas info
      const siswaRes = await fetch('/api/siswa', {
        cache: 'no-store', // Disable cache
        headers: {
          'Cache-Control': 'no-cache',
        }
      });

      if (siswaRes.ok) {
        const siswaJson = await siswaRes.json();

        // Fetch kelas info with guru
        if (siswaJson.siswa?.kelasId) {
          const kelasRes = await fetch(`/api/admin/kelas/${siswaJson.siswa.kelasId}`, {
            cache: 'no-store',
          });
          if (kelasRes.ok) {
            const kelasData = await kelasRes.json();
            siswaJson.siswa.kelas = kelasData.kelas;
          }
        }

        setSiswaData(siswaJson.siswa);

        // Calculate total juz from hafalan - with cache busting
        if (siswaJson.siswa?.id) {
          const timestamp = new Date().getTime();
          const hafalanRes = await fetch(`/api/siswa/hafalan-summary?t=${timestamp}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache',
            }
          });

          if (hafalanRes.ok) {
            const hafalanData = await hafalanRes.json();
            console.log('✅ Hafalan Data:', hafalanData);
            console.log('✅ Total Juz:', hafalanData.totalJuz);

            const juzCount = hafalanData.totalJuz || 0;
            setTotalJuz(juzCount);
            setFormData(prev => ({ ...prev, jumlahHafalan: juzCount }));

            console.log('✅ State updated - totalJuz:', juzCount);
          } else {
            console.error('❌ Failed to fetch hafalan summary:', await hafalanRes.text());
            // Fallback: set to 0
            setTotalJuz(0);
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

    // Validation
    if (!formData.juzYangDitasmi || !formData.jamTasmi || !formData.tanggalTasmi) {
      toast.error('Semua field wajib diisi');
      return;
    }

    try {
      const url = editMode ? `/api/siswa/tasmi/${editId}` : '/api/siswa/tasmi';
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jumlahHafalan: parseInt(formData.jumlahHafalan),
          juzYangDitasmi: formData.juzYangDitasmi,
          jamTasmi: formData.jamTasmi,
          tanggalTasmi: formData.tanggalTasmi,
          catatan: formData.catatan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editMode ? 'Pendaftaran Tasmi\' berhasil diupdate!' : 'Pendaftaran Tasmi\' berhasil! Menunggu persetujuan guru.');
        setShowModal(false);
        setEditMode(false);
        setEditId(null);
        resetForm();
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menyimpan pendaftaran Tasmi\'');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleEdit = (tasmi) => {
    if (tasmi.statusPendaftaran !== 'MENUNGGU' && tasmi.statusPendaftaran !== 'DITOLAK') {
      toast.error('Tidak dapat mengedit tasmi yang sudah disetujui atau selesai');
      return;
    }

    setEditMode(true);
    setEditId(tasmi.id);
    setFormData({
      jumlahHafalan: tasmi.jumlahHafalan,
      juzYangDitasmi: tasmi.juzYangDitasmi,
      jamTasmi: tasmi.jamTasmi,
      tanggalTasmi: tasmi.tanggalTasmi ? new Date(tasmi.tanggalTasmi).toISOString().split('T')[0] : '',
      catatan: tasmi.catatan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pendaftaran Tasmi\' ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/siswa/tasmi/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Tasmi\' berhasil dihapus');
        fetchData();
      } else {
        toast.error(data.message || 'Gagal menghapus pendaftaran Tasmi\'');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Terjadi kesalahan saat menghapus data');
    }
  };

  const resetForm = () => {
    setFormData({
      jumlahHafalan: totalJuz,
      juzYangDitasmi: '',
      jamTasmi: '',
      tanggalTasmi: '',
      catatan: '',
    });
    setEditMode(false);
    setEditId(null);
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
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

  // Debug: log state setiap render
  console.log('🔍 Render state - totalJuz:', totalJuz, '| formData.jumlahHafalan:', formData.jumlahHafalan);

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
                  Ujian akhir hafalan Al-Qur'an - Daftar dan ajukan jadwal Tasmi' Anda
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

          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status Pendaftaran</p>
                <p className="text-lg font-bold text-blue-600">Siap Mendaftar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-6">
          <button
            onClick={openNewModal}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            <Plus size={20} />
            <span>Daftar Tasmi' Baru</span>
          </button>
        </div>

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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Nama Siswa</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kelas</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jumlah Hafalan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Juz Tasmi'</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Guru Pengampu</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Jam</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Catatan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasmiList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Award size={48} className="text-gray-300" />
                        <p className="text-gray-500">Belum ada pendaftaran Tasmi'</p>
                        <p className="text-sm text-gray-400">Klik tombol "Daftar Tasmi' Baru" untuk mendaftar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasmiList.map((tasmi) => (
                    <tr key={tasmi.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {tasmi.siswa?.user?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tasmi.siswa?.kelas?.nama || '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-700 rounded-lg font-bold">
                          {tasmi.jumlahHafalan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tasmi.juzYangDitasmi || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {tasmi.guruPengampu?.user?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {tasmi.jamTasmi || '-'}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {tasmi.tanggalTasmi
                          ? new Date(tasmi.tanggalTasmi).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(tasmi.statusPendaftaran)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {tasmi.statusPendaftaran === 'DITOLAK' && tasmi.catatanPenolakan ? (
                          <div className="max-w-xs">
                            <p className="text-red-600 font-medium">Ditolak:</p>
                            <p className="text-gray-600">{tasmi.catatanPenolakan}</p>
                          </div>
                        ) : (
                          <span className="text-gray-600">{tasmi.catatan || '-'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {(tasmi.statusPendaftaran === 'MENUNGGU' || tasmi.statusPendaftaran === 'DITOLAK') && (
                            <>
                              <button
                                onClick={() => handleEdit(tasmi)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(tasmi.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                          {(tasmi.statusPendaftaran === 'DISETUJUI' || tasmi.statusPendaftaran === 'SELESAI') && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Daftar/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {editMode ? 'Edit Pendaftaran Tasmi\'' : 'Daftar Tasmi\' Baru'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Isi formulir pendaftaran dengan lengkap dan benar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Siswa
                  </label>
                  <input
                    type="text"
                    value={siswaData?.user?.name || ''}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas
                  </label>
                  <input
                    type="text"
                    value={siswaData?.kelas?.nama || '-'}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Hafalan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.jumlahHafalan}
                    onChange={(e) => setFormData({ ...formData, jumlahHafalan: parseInt(e.target.value) || 0 })}
                    min="2"
                    max="30"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Jumlah juz yang telah dihafal</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Juz yang Ditasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.juzYangDitasmi}
                    onChange={(e) => setFormData({ ...formData, juzYangDitasmi: e.target.value })}
                    placeholder="Contoh: Juz 1, Juz 2, Juz 3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Juz yang akan diuji</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Guru Pengampu
                </label>
                <input
                  type="text"
                  value={siswaData?.kelas?.guruKelas?.[0]?.guru?.user?.name || '-'}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Otomatis terisi sesuai kelas</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Tasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jamTasmi}
                    onChange={(e) => setFormData({ ...formData, jamTasmi: e.target.value })}
                    placeholder="Contoh: 08:00-10:00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Jam yang diajukan</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Tasmi' <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalTasmi}
                    onChange={(e) => setFormData({ ...formData, tanggalTasmi: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Tanggal yang diajukan</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="3"
                  placeholder="Catatan tambahan jika ada"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800">
                  <strong>Catatan:</strong> Pastikan semua data yang Anda masukkan sudah benar.
                  Guru akan memverifikasi pendaftaran Anda dan dapat menolak jika terdapat kesalahan atau jadwal bentrok.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
                >
                  {editMode ? 'Update Pendaftaran' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiswaLayout>
  );
}
