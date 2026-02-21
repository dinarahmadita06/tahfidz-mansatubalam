'use client';

import { useState } from 'react';
import { Eye, X, Edit, Save, User, Key, Users, AlertCircle } from 'lucide-react';

// Helper function to format date
const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return '-';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID');
  } catch (e) {
    return '-';
  }
};

export default function SiswaTableClient({ siswaList }) {
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleRowClick = (siswa) => {
    if (siswa.status === 'rejected') {
      setSelectedSiswa(siswa);
      
      // Format tanggalLahir untuk input date
      let formattedDate = '';
      if (siswa.tanggalLahir) {
        try {
          const date = new Date(siswa.tanggalLahir);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toISOString().split('T')[0];
          }
        } catch (e) {
          console.error('Error formatting date:', e);
        }
      }

      // Get wali data if exists
      const wali = siswa.orangTuaSiswa?.[0]?.orangTua;
      
      setEditFormData({
        name: siswa.user?.name || '',
        nis: siswa.nis || '',
        nisn: siswa.nisn || '',
        tanggalLahir: formattedDate,
        jenisKelamin: siswa.jenisKelamin || 'LAKI_LAKI',
        kelasId: siswa.kelasId || '',
        // Wali data
        namaWali: wali?.user?.name || '',
      });
      setShowDetailModal(true);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedSiswa) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/guru/siswa/${selectedSiswa.id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        alert('Data siswa berhasil diperbarui! Status kembali menunggu validasi admin.');
        setShowDetailModal(false);
        window.location.reload(); // Refresh untuk update data
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal memperbarui data siswa');
      }
    } catch (error) {
      console.error('Error updating siswa:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSiswa(null);
    setIsEditing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">Aktif</span>;
      case 'pending':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Menunggu</span>;
      case 'rejected':
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Ditolak</span>;
      default:
        return <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <>
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-md overflow-hidden border border-emerald-100/30">
        <div className="p-6 border-b border-emerald-100/30">
          <h2 className="text-xl font-bold text-emerald-900">Daftar Siswa (Kelas Aktif)</h2>
          <p className="text-sm text-slate-600 mt-1">
            Menampilkan {siswaList.length} siswa
          </p>
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
              {siswaList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    Tidak ada siswa yang ditemukan
                  </td>
                </tr>
              ) : (
                siswaList.map((siswa, index) => (
                  <tr 
                    key={siswa.id} 
                    onClick={() => handleRowClick(siswa)}
                    className={`border-b border-gray-100 transition-colors ${
                      siswa.status === 'rejected' 
                        ? 'cursor-pointer hover:bg-red-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
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
                      {getStatusBadge(siswa.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Siswa Ditolak */}
      {showDetailModal && selectedSiswa && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={handleCloseModal}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border border-red-100 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6 sm:p-8 z-20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-200">
                  <X size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Detail Siswa Ditolak</h2>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">
                    Informasi lengkap dan alasan penolakan
                  </p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              {/* Alasan Penolakan */}
              <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex gap-4">
                <AlertCircle className="text-red-600 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-bold text-red-900">Alasan Penolakan</p>
                  <p className="text-xs text-red-800/80 leading-relaxed mt-0.5">
                    {selectedSiswa.rejectionReason || 'Tidak ada alasan yang diberikan'}
                  </p>
                </div>
              </div>

              {/* SECTION: Data Diri Siswa */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <User size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Data Diri Siswa</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Lengkap Siswa *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all"
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {selectedSiswa.user?.name || '-'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Jenis Kelamin *</label>
                    {isEditing ? (
                      <select
                        value={editFormData.jenisKelamin}
                        onChange={(e) => setEditFormData({ ...editFormData, jenisKelamin: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all bg-white"
                      >
                        <option value="LAKI_LAKI">Laki-laki</option>
                        <option value="PEREMPUAN">Perempuan</option>
                      </select>
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {selectedSiswa.jenisKelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">NISN</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.nisn}
                        onChange={(e) => setEditFormData({ ...editFormData, nisn: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Nomor Induk Siswa Nasional"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {selectedSiswa.nisn || '-'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">NIS *</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.nis}
                        onChange={(e) => setEditFormData({ ...editFormData, nis: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Nomor Induk Siswa"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {selectedSiswa.nis || '-'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tanggal Lahir *</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editFormData.tanggalLahir}
                        onChange={(e) => setEditFormData({ ...editFormData, tanggalLahir: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {formatDateForDisplay(selectedSiswa.tanggalLahir)}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Kelas Saat Ini</label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-700 font-medium">
                      {selectedSiswa.kelas?.nama || '-'}
                    </div>
                    <p className="text-xs text-gray-500">Kelas tidak dapat diubah di sini</p>
                  </div>
                </div>
              </div>

              {/* SECTION: Akun Siswa */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <Key size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Akun Siswa</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Username (NIS) *</label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                      {selectedSiswa.nis || '-'}
                    </div>
                    <p className="text-xs text-gray-500">Username untuk login menggunakan NIS siswa</p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="p-4 bg-amber-50 border-2 border-amber-100 rounded-2xl">
                      <p className="text-xs text-amber-800">
                        <strong>ℹ️ Info Password:</strong> Password tidak dapat diubah melalui form ini. Untuk reset password, hubungi admin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Data Orang Tua / Wali */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-emerald-100 pb-3">
                  <Users size={20} className="text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Data Orang Tua / Wali</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nama Wali</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editFormData.namaWali}
                        onChange={(e) => setEditFormData({ ...editFormData, namaWali: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-emerald-500 outline-none transition-all"
                        placeholder="Nama orang tua/wali"
                      />
                    ) : (
                      <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                        {selectedSiswa.orangTuaSiswa?.[0]?.orangTua?.user?.name || '-'}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Username Wali (NIS Anak)</label>
                    <div className="px-4 py-3 rounded-xl border-2 border-gray-50 bg-gray-50 text-gray-900 font-medium">
                      {selectedSiswa.nis || '-'}
                    </div>
                    <p className="text-xs text-gray-500">Username wali untuk login menggunakan NIS anak</p>
                  </div>

                  {!selectedSiswa.orangTuaSiswa?.[0] && !isEditing && (
                    <div className="md:col-span-2">
                      <div className="p-4 bg-yellow-50 border-2 border-yellow-100 rounded-2xl flex gap-4">
                        <AlertCircle className="text-yellow-600 shrink-0" size={20} />
                        <div>
                          <p className="text-xs text-yellow-800">
                            <strong>⚠️ Perhatian:</strong> Siswa ini belum terhubung dengan akun orang tua/wali.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 rounded-2xl border-2 border-gray-200 bg-white text-gray-700 font-bold hover:bg-gray-50 transition-all shadow-sm"
                >
                  Tutup
                </button>
                
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all shadow-md"
                  >
                    <Edit size={18} />
                    Edit Data
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    {isSaving ? 'Menyimpan...' : 'Simpan & Ajukan Ulang'}
                  </button>
                )}
              </div>

              {/* Info Footer */}
              <div className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  💡 <strong>Info:</strong> Setelah data disimpan, status akan kembali ke &quot;Menunggu Validasi&quot; untuk ditinjau ulang oleh admin
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
