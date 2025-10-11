'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Eye, Clock, Loader2, UserCheck } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

export default function ValidasiSiswaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filter, setFilter] = useState('pending'); // pending, active, rejected, all

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchSiswa();
      }
    }
  }, [status, filter, router, session]);

  const fetchSiswa = async () => {
    try {
      const url = filter === 'all'
        ? '/api/siswa'
        : `/api/siswa?status=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setSiswaList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching siswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (siswaId) => {
    if (!confirm('Yakin ingin menyetujui siswa ini?')) return;

    setActionLoading(siswaId);
    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId,
          action: 'approve',
        }),
      });

      if (response.ok) {
        alert('Siswa berhasil disetujui!');
        fetchSiswa();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to approve siswa'));
      }
    } catch (error) {
      console.error('Error approving siswa:', error);
      alert('Terjadi kesalahan saat menyetujui siswa');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Mohon masukkan alasan penolakan');
      return;
    }

    setActionLoading(rejectModal.id);
    try {
      const response = await fetch('/api/siswa/validate', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId: rejectModal.id,
          action: 'reject',
          rejectionReason,
        }),
      });

      if (response.ok) {
        alert('Siswa berhasil ditolak!');
        setRejectModal(null);
        setRejectionReason('');
        fetchSiswa();
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Failed to reject siswa'));
      }
    } catch (error) {
      console.error('Error rejecting siswa:', error);
      alert('Terjadi kesalahan saat menolak siswa');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      active: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels = {
      pending: 'Menunggu Validasi',
      active: 'Aktif',
      rejected: 'Ditolak',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  const pendingCount = siswaList.filter(s => s.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Validasi Siswa</h1>
                <p className="text-sm text-gray-600">Kelola persetujuan siswa baru</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {pendingCount > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-yellow-600" />
              <p className="text-sm text-yellow-900">
                <strong>{pendingCount} siswa</strong> menunggu validasi dari Anda
              </p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Menunggu Validasi
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Disetujui
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'rejected'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Ditolak
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Siswa List */}
        {siswaList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <UserCheck size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium">Tidak ada siswa</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter === 'pending' ? 'Belum ada siswa yang menunggu validasi' : `Tidak ada siswa dengan status ${filter}`}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NISN/NIS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Daftar</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {siswaList.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{siswa.user.name}</div>
                          <div className="text-sm text-gray-500">{siswa.user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{siswa.nisn}</div>
                        <div className="text-sm text-gray-500">{siswa.nis}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{siswa.kelas.nama}</td>
                      <td className="px-6 py-4">{getStatusBadge(siswa.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(siswa.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewModal(siswa)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                          {siswa.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(siswa.id)}
                                disabled={actionLoading === siswa.id}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                                title="Setujui"
                              >
                                {actionLoading === siswa.id ? (
                                  <Loader2 size={18} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => setRejectModal(siswa)}
                                disabled={actionLoading === siswa.id}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Tolak"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View Detail Modal */}
        {viewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Detail Siswa</h3>
                <button
                  onClick={() => setViewModal(null)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="font-medium text-gray-900">{viewModal.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{viewModal.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NISN</p>
                    <p className="font-medium text-gray-900">{viewModal.nisn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">NIS</p>
                    <p className="font-medium text-gray-900">{viewModal.nis}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kelas</p>
                    <p className="font-medium text-gray-900">{viewModal.kelas.nama}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jenis Kelamin</p>
                    <p className="font-medium text-gray-900">{viewModal.jenisKelamin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tempat, Tanggal Lahir</p>
                    <p className="font-medium text-gray-900">
                      {viewModal.tempatLahir}, {new Date(viewModal.tanggalLahir).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">No. HP</p>
                    <p className="font-medium text-gray-900">{viewModal.noHP || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-medium text-gray-900">{viewModal.alamat || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    {getStatusBadge(viewModal.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Daftar</p>
                    <p className="font-medium text-gray-900">
                      {new Date(viewModal.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                {viewModal.status === 'rejected' && viewModal.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-red-900">Alasan Penolakan:</p>
                    <p className="text-sm text-red-700 mt-1">{viewModal.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Tolak Siswa</h3>
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  Anda akan menolak siswa <strong>{rejectModal.user.name}</strong>.
                  Mohon berikan alasan penolakan.
                </p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Masukkan alasan penolakan..."
                />

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModal(null);
                      setRejectionReason('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading === rejectModal.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading === rejectModal.id ? (
                      <>
                        <Loader2 size={18} className="inline mr-2 animate-spin" />
                        Menolak...
                      </>
                    ) : (
                      'Tolak Siswa'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
    </AdminLayout>
  );
}
