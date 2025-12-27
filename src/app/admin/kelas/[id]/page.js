'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus, Edit, Trash2, Search, ArrowLeft, Upload, Download,
  Users, Link as LinkIcon, Filter, X
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRouter, useParams } from 'next/navigation';
import StudentCreateModal from '@/components/admin/StudentCreateModal';
import * as XLSX from 'xlsx';
import {
  generateSiswaEmail,
  normalizeGender,
  formatGender,
  validateNISN,
  validateNIS,
  matchesSearch
} from '@/lib/siswaUtils';

// Modern Pastel Color Palette (SIMTAQ Style)
const colors = {
  emerald: { 50: '#ECFDF5', 100: '#D1FAE5', 500: '#10B981', 600: '#059669', 700: '#047857' },
  amber: { 50: '#FEF3C7', 100: '#FDE68A', 500: '#F59E0B', 600: '#D97706' },
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 500: '#3B82F6', 600: '#2563EB' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 400: '#9CA3AF', 600: '#4B5563', 900: '#111827' },
  white: '#FFFFFF',
  red: { 50: '#FEF2F2', 500: '#EF4444', 600: '#DC2626' }
};

export default function KelolaSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const kelasId = params.id;

  // ============ STATE ============
  const [kelas, setKelas] = useState(null);
  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    nis: '',
    email: '', // Auto-generated
    jenisKelamin: 'LAKI_LAKI',
    tanggalLahir: '',
    alamat: '',
    noTelepon: ''
  });

  // ============ EFFECTS ============
  useEffect(() => {
    if (kelasId) {
      fetchKelasDetail();
      fetchSiswa();
    }
  }, [kelasId]);

  // Auto-generate email when name or NIS changes
  useEffect(() => {
    if (formData.name && formData.nis) {
      const generatedEmail = generateSiswaEmail(formData.name, formData.nis);
      setFormData(prev => ({ ...prev, email: generatedEmail }));
    }
  }, [formData.name, formData.nis]);

  // ============ DATA FETCHING ============
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
      const data = Array.isArray(result) ? result : (result.data || []);
      setSiswaList(data);
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSiswaList([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ FORM HANDLERS ============
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    const nisnValidation = validateNISN(formData.nisn);
    if (!nisnValidation.valid) {
      alert(nisnValidation.error);
      return;
    }

    const nisValidation = validateNIS(formData.nis);
    if (!nisValidation.valid) {
      alert(nisValidation.error);
      return;
    }

    try {
      const url = editingSiswa
        ? `/api/admin/siswa/${editingSiswa.id}`
        : '/api/admin/siswa';
      const method = editingSiswa ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        kelasId,
        jenisKelamin: normalizeGender(formData.jenisKelamin),
        password: formData.nis // Default password = NIS
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert(editingSiswa ? 'Siswa berhasil diupdate' : 'Siswa berhasil ditambahkan');
        setShowModal(false);
        resetForm();
        fetchSiswa();
      } else {
        const error = await response.json();
        alert(error.error || 'Gagal menyimpan data siswa');
      }
    } catch (error) {
      console.error('Error saving siswa:', error);
      alert('Gagal menyimpan data siswa');
    }
  };

  const handleEdit = (siswa) => {
    setEditingSiswa(siswa);
    setFormData({
      name: siswa.user.name,
      nisn: siswa.nisn || '',
      nis: siswa.nis,
      email: siswa.user.email,
      jenisKelamin: siswa.jenisKelamin,
      tanggalLahir: siswa.tanggalLahir ? new Date(siswa.tanggalLahir).toISOString().split('T')[0] : '',
      alamat: siswa.alamat || '',
      noTelepon: siswa.noTelepon || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      const response = await fetch(`/api/admin/siswa/${id}`, { method: 'DELETE' });
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

  const resetForm = () => {
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      email: '',
      jenisKelamin: 'LAKI_LAKI',
      tanggalLahir: '',
      alamat: '',
      noTelepon: ''
    });
    setEditingSiswa(null);
  };

  // ============ EXCEL IMPORT ============
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);

        // Transform & validate - support both old and new format
        const transformedData = data.map(row => {
          // Support both formats: "Nama Siswa"/"Nama" (new) OR "name" (old)
          const name = row['Nama Siswa'] || row['Nama'] || row['name'] || '';

          // Support both formats: "NISN" (new) OR "nisn" (old)
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();

          // Support both formats: "NIS" (new) OR "nis" (old)
          const nis = String(row['NIS'] || row['nis'] || '').trim();

          // Support: "Jenis Kelamin"/"L/P" (new) OR "jenisKelamin"/"jenisKelamir" (old - with typo support!)
          const rawGender = row['Jenis Kelamin'] || row['L/P'] || row['jenisKelamin'] || row['jenisKelamir'] || 'L';

          return {
            name,
            nisn,
            nis,
            email: generateSiswaEmail(name, nis),
            jenisKelamin: normalizeGender(rawGender),
            tanggalLahir: row['Tanggal Lahir'] || row['tanggalLahir'] || '',
            alamat: row['Alamat'] || row['alamat'] || '',
            kelasId,
            // Orang Tua - support both formats
            namaOrtu: row['Nama Orang Tua'] || row['namaOrtu'] || '',
            emailOrtu: row['Email Orang Tua'] || row['emailOrtu'] || '',
            noHPOrtu: row['No HP Orang Tua'] || row['noHPOrtu'] || ''
          };
        });

        // Set preview data and show preview modal
        setPreviewData(transformedData);
        setShowPreviewModal(true);
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert('Gagal membaca file Excel');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleConfirmImport = async () => {
    if (previewData.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }

    setIsImporting(true);

    try {
      // Send to import API
      const response = await fetch('/api/admin/siswa/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siswaData: previewData }),
      });

      const result = await response.json();

      // Close preview modal
      setShowPreviewModal(false);

      // Show import results
      setImportResults(result);
      setShowImportModal(true);

      // Refresh siswa list
      await fetchSiswa();

      // Clear preview data
      setPreviewData([]);
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Gagal mengimport data siswa');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [{
      'Nama Siswa': 'Ahmad Fauzi',
      'NISN': '1234567890',
      'NIS': '2024001',
      'Jenis Kelamin': 'L',
      'Tanggal Lahir': '2010-01-15',
      'Alamat': 'Jl. Contoh No. 123',
      'Nama Orang Tua': 'Budi Santoso',
      'Email Orang Tua': 'budi@example.com',
      'No HP Orang Tua': '081234567890'
    }];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `template_siswa_${kelas?.nama || 'kelas'}.xlsx`);
  };

  // ============ FILTERING ============
  const filteredSiswa = siswaList.filter(siswa => {
    const matchSearch = matchesSearch(siswa, searchTerm);
    const matchGender = filterGender === 'all' || siswa.jenisKelamin === filterGender;
    return matchSearch && matchGender;
  });

  // ============ RENDER ============
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.emerald[500] }}></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div style={{ background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`, minHeight: '100vh', padding: '32px' }} className="kelas-detail-container">

        {/* Header */}
        <div style={{ background: colors.white, borderRadius: '20px', padding: '32px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <button
              onClick={() => router.back()}
              style={{ padding: '12px', borderRadius: '12px', border: 'none', background: colors.gray[100], cursor: 'pointer' }}
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: colors.gray[900], marginBottom: '4px' }}>
                Kelola Siswa - {kelas?.nama}
              </h1>
              <p style={{ fontSize: '14px', color: colors.gray[600] }}>
                Tahun Ajaran {kelas?.tahunAjaran?.nama} • Target {kelas?.targetJuz || 1} Juz
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
              background: colors.blue[500], color: colors.white, borderRadius: '12px',
              fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}>
              <Upload size={18} />
              Import Excel
              <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>

            <button
              onClick={downloadTemplate}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                background: colors.white, color: colors.emerald[600], border: `2px solid ${colors.emerald[500]}`,
                borderRadius: '12px', fontWeight: '600', cursor: 'pointer'
              }}
            >
              <Download size={18} />
              Template Excel
            </button>

            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
                background: `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
                color: colors.white, border: 'none', borderRadius: '12px', fontWeight: '600',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <UserPlus size={18} />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div style={{ background: colors.white, borderRadius: '20px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.gray[400] }} size={20} />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, NIS, NISN, atau nama orang tua..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', paddingLeft: '44px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px',
                  border: `2px solid ${colors.gray[200]}`, borderRadius: '12px', fontSize: '14px', outline: 'none'
                }}
              />
            </div>

            {/* Gender Filter */}
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              style={{
                padding: '12px 16px', border: `2px solid ${colors.gray[200]}`, borderRadius: '12px',
                fontSize: '14px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="all">Semua Jenis Kelamin</option>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </div>

          <div style={{ marginTop: '12px', fontSize: '13px', color: colors.gray[600] }}>
            Menampilkan {filteredSiswa.length} dari {siswaList.length} siswa
          </div>
        </div>

        {/* Table */}
        <div style={{ background: colors.white, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.emerald[100]} 100%)` }}>
                  <th style={tableHeaderStyle}>NO</th>
                  <th style={tableHeaderStyle}>NAMA SISWA</th>
                  <th style={tableHeaderStyle}>EMAIL</th>
                  <th style={tableHeaderStyle}>NISN</th>
                  <th style={tableHeaderStyle}>NIS</th>
                  <th style={tableHeaderStyle}>JENIS KELAMIN</th>
                  <th style={tableHeaderStyle}>ORANG TUA</th>
                  <th style={tableHeaderStyle}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: colors.gray[400] }}>
                      <Users size={48} style={{ margin: '0 auto 16px' }} />
                      <p>Tidak ada data siswa</p>
                    </td>
                  </tr>
                ) : (
                  filteredSiswa.map((siswa, index) => {
                    const parentName = siswa.orangTuaSiswa?.[0]?.orangTua?.user?.name || '-';
                    const hasParent = siswa.orangTuaSiswa?.length > 0;

                    return (
                      <tr
                        key={siswa.id}
                        style={{
                          borderBottom: `1px solid ${colors.gray[100]}`,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = colors.emerald[50]}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={tableCellStyle}>{index + 1}</td>
                        <td style={tableCellStyle}>
                          <div style={{ fontWeight: '600', color: colors.gray[900] }}>{siswa.user.name}</div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ fontSize: '13px', color: colors.gray[600] }}>{siswa.user.email}</span>
                        </td>
                        <td style={tableCellStyle}>{siswa.nisn || '-'}</td>
                        <td style={tableCellStyle}>
                          <span style={{ fontWeight: '600', color: colors.emerald[700] }}>{siswa.nis}</span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            background: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[50] : '#FEE2F2',
                            color: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[700] : '#DC2626'
                          }}>
                            {formatGender(siswa.jenisKelamin)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>{parentName}</td>
                        <td style={tableCellStyle}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleEdit(siswa)}
                              title="Edit Siswa"
                              style={actionButtonStyle(colors.emerald[500], colors.emerald[50])}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(siswa.id)}
                              title="Hapus Siswa"
                              style={actionButtonStyle(colors.red[500], colors.red[50])}
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={() => alert('Fitur hubungkan orang tua akan segera ditambahkan')}
                              title={hasParent ? 'Kelola Orang Tua' : 'Hubungkan Orang Tua'}
                              style={actionButtonStyle(colors.amber[500], colors.amber[50])}
                            >
                              <LinkIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form Siswa */}
        {/* Student Create Modal */}
        <StudentCreateModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={fetchSiswa}
          defaultKelasId={kelasId}
        />

        {/* Modal Preview Excel */}
        {showPreviewModal && previewData.length > 0 && (
          <ModalPreviewExcel
            data={previewData}
            onImport={handleConfirmImport}
            onClose={() => { setShowPreviewModal(false); setPreviewData([]); }}
            isImporting={isImporting}
          />
        )}

        {/* Modal Import Results */}
        {showImportModal && importResults && (
          <ModalImportResults
            results={importResults}
            onClose={() => { setShowImportModal(false); setImportResults(null); }}
          />
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .kelas-detail-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

// ============ STYLES ============
const tableHeaderStyle = {
  padding: '16px 12px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '700',
  color: colors.emerald[700],
  letterSpacing: '0.5px',
  textTransform: 'uppercase'
};

const tableCellStyle = {
  padding: '16px 12px',
  fontSize: '14px',
  color: colors.gray[700]
};

const actionButtonStyle = (color, bgColor) => ({
  padding: '8px',
  borderRadius: '8px',
  border: 'none',
  background: bgColor,
  color: color,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
});

// ============ SUB-COMPONENTS ============
function ModalPreviewExcel({ data, onImport, onClose, isImporting }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: colors.white, borderRadius: '24px', padding: '32px', maxWidth: '1000px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.gray[900], marginBottom: '4px' }}>
              Preview Data Import
            </h2>
            <p style={{ fontSize: '14px', color: colors.gray[600] }}>
              {data.length} siswa akan diimport
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={24} />
          </button>
        </div>

        {/* Table Preview */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', border: `1px solid ${colors.gray[200]}`, borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: colors.emerald[50], position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ ...tableHeaderStyle, width: '40px' }}>No</th>
                <th style={tableHeaderStyle}>Nama Siswa</th>
                <th style={{ ...tableHeaderStyle, width: '120px' }}>NISN</th>
                <th style={{ ...tableHeaderStyle, width: '100px' }}>NIS</th>
                <th style={{ ...tableHeaderStyle, width: '80px' }}>L/P</th>
                <th style={tableHeaderStyle}>Email</th>
              </tr>
            </thead>
            <tbody>
              {data.map((siswa, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${colors.gray[100]}` }}>
                  <td style={{ ...tableCellStyle, textAlign: 'center', fontWeight: '600' }}>{index + 1}</td>
                  <td style={tableCellStyle}>{siswa.name}</td>
                  <td style={tableCellStyle}>{siswa.nisn || '-'}</td>
                  <td style={tableCellStyle}>{siswa.nis}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[100] : colors.amber[100],
                      color: siswa.jenisKelamin === 'LAKI_LAKI' ? colors.blue[700] : colors.amber[700]
                    }}>
                      {siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td style={{ ...tableCellStyle, fontSize: '12px', color: colors.gray[600] }}>{siswa.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            style={{
              padding: '12px 28px',
              border: `2px solid ${colors.gray[300]}`,
              borderRadius: '12px',
              background: colors.white,
              color: colors.text?.secondary || colors.gray[700],
              fontSize: '14px',
              fontWeight: '600',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              opacity: isImporting ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onImport}
            disabled={isImporting}
            style={{
              padding: '12px 28px',
              border: 'none',
              borderRadius: '12px',
              background: isImporting
                ? colors.gray[400]
                : `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`,
              color: colors.white,
              fontSize: '14px',
              fontWeight: '600',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: isImporting ? 'none' : '0 4px 12px rgba(26, 147, 111, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isImporting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }}></div>
                Mengimport...
              </>
            ) : (
              <>
                <Upload size={18} />
                Import {data.length} Siswa
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ModalImportResults({ results, onClose }) {
  const successCount = results.results?.success?.length || 0;
  const failedCount = results.results?.failed?.length || 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
      <div style={{ background: colors.white, borderRadius: '24px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Hasil Import</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ padding: '20px', background: colors.emerald[50], borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.emerald[600] }}>{successCount}</div>
            <div style={{ fontSize: '14px', color: colors.emerald[700], marginTop: '4px' }}>Berhasil</div>
          </div>
          <div style={{ padding: '20px', background: colors.red[50], borderRadius: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '700', color: colors.red[600] }}>{failedCount}</div>
            <div style={{ fontSize: '14px', color: colors.red[700], marginTop: '4px' }}>Gagal</div>
          </div>
        </div>

        {failedCount > 0 && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: colors.red[700] }}>Data yang Gagal:</h3>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {results.results.failed.map((item, idx) => (
                <div key={idx} style={{ padding: '12px', background: colors.red[50], borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>
                    {item.data?.name || 'Nama tidak tersedia'}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.red[700], marginTop: '4px' }}>
                    {item.error}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: '16px', padding: '12px', background: colors.emerald[500], color: colors.white, border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: colors.gray[700], marginBottom: '8px' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  border: `2px solid ${colors.gray[200]}`,
  borderRadius: '12px',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.2s ease'
};
