'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, ArrowLeft, Upload, Download, Users, BookOpen } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function KelasDetailPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  const [kelas, setKelas] = useState(null);
  const [siswa, setSiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [importData, setImportData] = useState([]);
  const [importResults, setImportResults] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    nis: '',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '',
    alamat: '',
    noHP: ''
  });

  useEffect(() => {
    if (kelasId) {
      fetchKelasDetail();
      fetchSiswa();
    }
  }, [kelasId]);

  const fetchKelasDetail = async () => {
    try {
      const response = await fetch(`/api/kelas/${kelasId}`);
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/siswa?kelasId=${kelasId}`);
      const result = await response.json();
      // Handle both array response and object with data property
      const data = Array.isArray(result) ? result : (result.data || []);
      setSiswa(data);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswa([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingSiswa ? `/api/admin/siswa/${editingSiswa.id}` : '/api/admin/siswa';
      const method = editingSiswa ? 'PUT' : 'POST';

      // Always include kelasId for this context
      const submitData = {
        ...formData,
        kelasId: kelasId,
        email: formData.email || `${formData.nisn}@siswa.tahfidz.com`,
        password: formData.password || formData.nisn
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingSiswa ? 'Siswa berhasil diupdate' : 'Siswa berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchSiswa();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.error || 'Gagal menyimpan data siswa');
      }
    } catch (error) {
      console.error('Error saving siswa:', error);
      alert('Gagal menyimpan data siswa: ' + error.message);
    }
  };

  const handleEdit = (siswaItem) => {
    setEditingSiswa(siswaItem);
    setFormData({
      name: siswaItem.user.name,
      nisn: siswaItem.nisn,
      nis: siswaItem.nis,
      jenisKelamin: siswaItem.jenisKelamin,
      tempatLahir: siswaItem.tempatLahir,
      tanggalLahir: new Date(siswaItem.tanggalLahir).toISOString().split('T')[0],
      alamat: siswaItem.alamat || '',
      noHP: siswaItem.noHP || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus siswa ini dari kelas?')) return;

    try {
      const response = await fetch(`/api/admin/siswa/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Siswa berhasil dihapus');
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menghapus siswa');
      }
    } catch (error) {
      console.error('Error deleting siswa:', error);
      alert('Gagal menghapus siswa');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        // Transform data to match API format
        const transformedData = data.map(row => ({
          name: row['Nama Siswa'] || row['Nama'] || row['nama'] || '',
          nisn: row['NISN'] || row['nisn'] || '',
          nis: row['NIS'] || row['nis'] || '',
          kelasId: kelasId, // Use current kelas
          jenisKelamin: row['L/P'] || row['Jenis Kelamin'] || row['jenisKelamin'] || 'L',
          tempatLahir: row['Tempat Lahir'] || row['tempatLahir'] || '',
          tanggalLahir: row['Tanggal Lahir'] || row['tanggalLahir'] || '',
          namaOrtu: row['Nama Ortu'] || row['namaOrtu'] || '',
          emailOrtu: row['Email Ortu'] || row['emailOrtu'] || '',
          noHPOrtu: row['No HP Ortu'] || row['noHPOrtu'] || ''
        }));

        setImportData(transformedData);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Gagal membaca file Excel');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    try {
      const response = await fetch('/api/admin/siswa/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ siswaData: importData }),
      });

      const result = await response.json();
      setImportResults(result);
      fetchSiswa();
    } catch (error) {
      console.error('Error importing siswa:', error);
      alert('Gagal mengimport data siswa');
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Nama Siswa': 'Contoh Nama Siswa',
        'NISN': '1234567890',
        'NIS': '12345',
        'L/P': 'L',
        'Tempat Lahir': 'Jakarta',
        'Tanggal Lahir': '2010-01-01',
        'Nama Ortu': 'Nama Orang Tua',
        'Email Ortu': 'orangtua@example.com',
        'No HP Ortu': '081234567890'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Siswa');
    XLSX.writeFile(wb, `template_siswa_${kelas?.nama || 'kelas'}.xlsx`);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      jenisKelamin: 'L',
      tempatLahir: '',
      tanggalLahir: '',
      alamat: '',
      noHP: ''
    });
    setEditingSiswa(null);
  };

  const filteredSiswa = siswa.filter(s => {
    const matchSearch = searchTerm === '' ||
      s.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm) ||
      s.nis.includes(searchTerm);
    return matchSearch;
  });

  if (loading && !kelas) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/kelas')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {kelas?.nama || 'Loading...'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Tahun Ajaran {kelas?.tahunAjaran?.nama} • Target {kelas?.targetJuz || 1} Juz
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download size={20} />
              Template
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer">
              <Upload size={20} />
              Import Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <UserPlus size={20} />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari siswa (nama, NISN, NIS)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="text-orange-600 dark:text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Siswa</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{siswa.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Laki-laki</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {siswa.filter(s => s.jenisKelamin === 'L').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="text-purple-600 dark:text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Perempuan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {siswa.filter(s => s.jenisKelamin === 'P').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    NISN / NIS
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Orang Tua
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Users size={48} className="mx-auto mb-2 opacity-50" />
                      <p>Belum ada siswa di kelas ini</p>
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswaItem, index) => (
                    <tr key={siswaItem.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {siswaItem.user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {siswaItem.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {siswaItem.nisn}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {siswaItem.nis}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {siswaItem.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {siswaItem.orangTua ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {siswaItem.orangTua.user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {siswaItem.orangTua.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(siswaItem)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(siswaItem.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingSiswa ? 'Edit Siswa' : 'Tambah Siswa ke ' + kelas?.nama}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NISN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      NIS *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jenis Kelamin *
                    </label>
                    <select
                      required
                      value={formData.jenisKelamin}
                      onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tempat Lahir *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.tempatLahir}
                      onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tanggal Lahir *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalLahir}
                      onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      No. HP
                    </label>
                    <input
                      type="text"
                      value={formData.noHP}
                      onChange={(e) => setFormData({ ...formData, noHP: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alamat
                  </label>
                  <textarea
                    rows={3}
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Info:</strong> Email akan otomatis dibuat: <code>{formData.nisn}@siswa.tahfidz.com</code>
                    <br />
                    Password default: <code>{formData.nisn}</code> (NISN siswa)
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingSiswa ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Preview Import Data - {kelas?.nama}
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData([]);
                    setImportResults(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {!importResults ? (
                <>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    {importData.length} data siswa siap diimport ke kelas {kelas?.nama}
                  </p>
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-neutral-800">
                        <tr>
                          <th className="px-4 py-2 text-left">Nama Siswa</th>
                          <th className="px-4 py-2 text-left">NISN</th>
                          <th className="px-4 py-2 text-left">NIS</th>
                          <th className="px-4 py-2 text-left">L/P</th>
                          <th className="px-4 py-2 text-left">Nama Ortu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="border-t dark:border-neutral-700">
                            <td className="px-4 py-2">{row.name}</td>
                            <td className="px-4 py-2">{row.nisn}</td>
                            <td className="px-4 py-2">{row.nis}</td>
                            <td className="px-4 py-2">{row.jenisKelamin}</td>
                            <td className="px-4 py-2">{row.namaOrtu || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importData.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        ... dan {importData.length - 10} data lainnya
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData([]);
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Import Sekarang
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {importResults.message}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <p className="text-green-800 dark:text-green-200 font-bold text-2xl">
                          {importResults.results.success.length}
                        </p>
                        <p className="text-green-600 dark:text-green-400">Berhasil</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <p className="text-red-800 dark:text-red-200 font-bold text-2xl">
                          {importResults.results.failed.length}
                        </p>
                        <p className="text-red-600 dark:text-red-400">Gagal</p>
                      </div>
                    </div>
                  </div>

                  {importResults.results.failed.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Data yang Gagal:
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {importResults.results.failed.map((fail, idx) => (
                          <div key={idx} className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-sm">
                            <p className="text-red-800 dark:text-red-200">
                              {fail.data.name} (NISN: {fail.data.nisn})
                            </p>
                            <p className="text-red-600 dark:text-red-400">{fail.error}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData([]);
                        setImportResults(null);
                      }}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Tutup
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
