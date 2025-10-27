'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  TrendingUp,
  Award,
  Calendar,
  FileText,
  BarChart3,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Color Palette - Emerald & Amber dengan variasi
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
  },
  teal: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    500: '#14B8A6',
    600: '#0D9488',
  },
  rose: {
    50: '#FFF1F2',
    400: '#FB7185',
    500: '#F43F5E',
  },
  violet: {
    50: '#FAF5FF',
    500: '#8B5CF6',
  },
  red: {
    400: '#EF4444',
    500: '#DC2626',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
  },
  white: '#FFFFFF',
};

// Mock Data
const mockKelas = [
  { id: 1, nama: 'X IPA 1' },
  { id: 2, nama: 'X IPA 2' },
  { id: 3, nama: 'XI IPA 1' },
];

const mockSiswa = [
  { id: 1, nama: 'Ahmad Fadli', kelasId: 1 },
  { id: 2, nama: 'Siti Fatimah', kelasId: 1 },
  { id: 3, nama: 'Muhammad Rizki', kelasId: 2 },
  { id: 4, nama: 'Aisyah Nur', kelasId: 2 },
];

const mockPenilaian = [
  {
    id: 1,
    siswaId: 1,
    tanggal: '2025-10-25',
    surah: 'Al-Baqarah',
    ayat: '1-5',
    nilaiTajwid: 85,
    nilaiKelancaran: 90,
    nilaiAdab: 95,
    catatan: 'Bacaan sudah bagus, perlu lebih lancar',
  },
  {
    id: 2,
    siswaId: 1,
    tanggal: '2025-10-24',
    surah: 'Al-Fatihah',
    ayat: '1-7',
    nilaiTajwid: 90,
    nilaiKelancaran: 85,
    nilaiAdab: 90,
    catatan: 'Makhraj sudah benar',
  },
];

export default function PenilaianHafalanPage() {
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswa, setSelectedSiswa] = useState('');
  const [siswaList, setSiswaList] = useState([]);
  const [penilaianList, setPenilaianList] = useState([]);
  const [filteredPenilaian, setFilteredPenilaian] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPenilaian, setEditingPenilaian] = useState(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    surah: '',
    ayat: '',
    nilaiTajwid: '',
    nilaiKelancaran: '',
    nilaiAdab: '',
    catatan: '',
  });

  useEffect(() => {
    // Load initial data
    setPenilaianList(mockPenilaian);
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      const filtered = mockSiswa.filter(s => s.kelasId === parseInt(selectedKelas));
      setSiswaList(filtered);
      setSelectedSiswa('');
      setFilteredPenilaian([]);
    }
  }, [selectedKelas]);

  const handleTampilkanData = () => {
    if (!selectedSiswa) {
      toast.error('Pilih siswa terlebih dahulu!');
      return;
    }

    const filtered = penilaianList.filter(p => p.siswaId === parseInt(selectedSiswa));
    setFilteredPenilaian(filtered);

    if (filtered.length === 0) {
      toast('Belum ada data penilaian untuk siswa ini');
    }
  };

  const handleOpenModal = (penilaian = null) => {
    if (penilaian) {
      setEditingPenilaian(penilaian);
      setFormData({
        tanggal: penilaian.tanggal,
        surah: penilaian.surah,
        ayat: penilaian.ayat,
        nilaiTajwid: penilaian.nilaiTajwid,
        nilaiKelancaran: penilaian.nilaiKelancaran,
        nilaiAdab: penilaian.nilaiAdab,
        catatan: penilaian.catatan,
      });
    } else {
      setEditingPenilaian(null);
      setFormData({
        tanggal: new Date().toISOString().split('T')[0],
        surah: '',
        ayat: '',
        nilaiTajwid: '',
        nilaiKelancaran: '',
        nilaiAdab: '',
        catatan: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPenilaian(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      surah: '',
      ayat: '',
      nilaiTajwid: '',
      nilaiKelancaran: '',
      nilaiAdab: '',
      catatan: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validasi
    if (!selectedSiswa) {
      toast.error('Pilih siswa terlebih dahulu!');
      return;
    }

    if (!formData.surah || !formData.ayat) {
      toast.error('Surah dan Ayat harus diisi!');
      return;
    }

    if (!formData.nilaiTajwid || !formData.nilaiKelancaran || !formData.nilaiAdab) {
      toast.error('Semua nilai harus diisi!');
      return;
    }

    const newPenilaian = {
      id: editingPenilaian ? editingPenilaian.id : Date.now(),
      siswaId: parseInt(selectedSiswa),
      ...formData,
      nilaiTajwid: parseInt(formData.nilaiTajwid),
      nilaiKelancaran: parseInt(formData.nilaiKelancaran),
      nilaiAdab: parseInt(formData.nilaiAdab),
    };

    if (editingPenilaian) {
      // Update
      setPenilaianList(prev =>
        prev.map(p => (p.id === editingPenilaian.id ? newPenilaian : p))
      );
      setFilteredPenilaian(prev =>
        prev.map(p => (p.id === editingPenilaian.id ? newPenilaian : p))
      );
      toast.success('Penilaian berhasil diupdate!');
    } else {
      // Tambah
      setPenilaianList(prev => [...prev, newPenilaian]);
      setFilteredPenilaian(prev => [...prev, newPenilaian]);
      toast.success('Penilaian berhasil disimpan!');
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus penilaian ini?')) {
      setPenilaianList(prev => prev.filter(p => p.id !== id));
      setFilteredPenilaian(prev => prev.filter(p => p.id !== id));
      toast.success('Penilaian berhasil dihapus!');
    }
  };

  // Calculate statistics
  const stats = {
    totalPenilaian: filteredPenilaian.length,
    rataTajwid:
      filteredPenilaian.length > 0
        ? (
            filteredPenilaian.reduce((sum, p) => sum + p.nilaiTajwid, 0) /
            filteredPenilaian.length
          ).toFixed(1)
        : 0,
    rataKelancaran:
      filteredPenilaian.length > 0
        ? (
            filteredPenilaian.reduce((sum, p) => sum + p.nilaiKelancaran, 0) /
            filteredPenilaian.length
          ).toFixed(1)
        : 0,
    rataAdab:
      filteredPenilaian.length > 0
        ? (
            filteredPenilaian.reduce((sum, p) => sum + p.nilaiAdab, 0) /
            filteredPenilaian.length
          ).toFixed(1)
        : 0,
  };

  const getNilaiColor = (nilai) => {
    if (nilai >= 85) return colors.emerald[600];
    if (nilai >= 70) return colors.amber[500];
    return colors.red[400];
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(to bottom right, ${colors.emerald[50]}, ${colors.teal[50]}, ${colors.amber[50]})`,
          padding: '32px',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: colors.white,
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${colors.gray[200]}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
              }}
            >
              <BookOpen size={28} color={colors.white} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: colors.gray[800],
                  marginBottom: '4px',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Penilaian Hafalan
              </h1>
              <p
                style={{
                  fontSize: '14px',
                  color: colors.gray[600],
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Nilai & catatan hasil setoran siswa
              </p>
            </div>
          </div>

          {/* Filter Section */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginTop: '24px',
            }}
          >
            {/* Dropdown Kelas */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.gray[700],
                  marginBottom: '8px',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Pilih Kelas
              </label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: '"Poppins", sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.emerald[500])}
                onBlur={(e) => (e.target.style.borderColor = colors.gray[200])}
              >
                <option value="">-- Pilih Kelas --</option>
                {mockKelas.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdown Siswa */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.gray[700],
                  marginBottom: '8px',
                  fontFamily: '"Poppins", sans-serif',
                }}
              >
                Pilih Siswa
              </label>
              <select
                value={selectedSiswa}
                onChange={(e) => setSelectedSiswa(e.target.value)}
                disabled={!selectedKelas}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: `2px solid ${colors.gray[200]}`,
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: '"Poppins", sans-serif',
                  outline: 'none',
                  transition: 'all 0.2s',
                  cursor: selectedKelas ? 'pointer' : 'not-allowed',
                  opacity: selectedKelas ? 1 : 0.6,
                }}
                onFocus={(e) => (e.target.style.borderColor = colors.emerald[500])}
                onBlur={(e) => (e.target.style.borderColor = colors.gray[200])}
              >
                <option value="">-- Pilih Siswa --</option>
                {siswaList.map((siswa) => (
                  <option key={siswa.id} value={siswa.id}>
                    {siswa.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Tampilkan & Tambah */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <button
                onClick={handleTampilkanData}
                disabled={!selectedSiswa}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: selectedSiswa
                    ? `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`
                    : colors.gray[300],
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: selectedSiswa ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: selectedSiswa ? '0 4px 12px rgba(5, 150, 105, 0.2)' : 'none',
                  transition: 'all 0.3s',
                }}
                onMouseOver={(e) => {
                  if (selectedSiswa) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = selectedSiswa
                    ? '0 4px 12px rgba(5, 150, 105, 0.2)'
                    : 'none';
                }}
              >
                <Search size={18} />
                Tampilkan Data
              </button>

              <button
                onClick={() => handleOpenModal()}
                disabled={!selectedSiswa}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: selectedSiswa
                    ? `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`
                    : colors.gray[300],
                  color: colors.white,
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: selectedSiswa ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: selectedSiswa ? '0 4px 12px rgba(251, 191, 36, 0.2)' : 'none',
                  transition: 'all 0.3s',
                }}
                onMouseOver={(e) => {
                  if (selectedSiswa) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(251, 191, 36, 0.3)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = selectedSiswa
                    ? '0 4px 12px rgba(251, 191, 36, 0.2)'
                    : 'none';
                }}
              >
                <Plus size={18} />
                Tambah Penilaian
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {filteredPenilaian.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <StatCard
              icon={<FileText size={24} color={colors.white} />}
              title="Total Penilaian"
              value={stats.totalPenilaian}
              color="emerald"
            />
            <StatCard
              icon={<Award size={24} color={colors.white} />}
              title="Rata-rata Tajwid"
              value={stats.rataTajwid}
              color="teal"
            />
            <StatCard
              icon={<TrendingUp size={24} color={colors.white} />}
              title="Rata-rata Kelancaran"
              value={stats.rataKelancaran}
              color="amber"
            />
            <StatCard
              icon={<BarChart3 size={24} color={colors.white} />}
              title="Rata-rata Adab"
              value={stats.rataAdab}
              color="violet"
            />
          </div>
        )}

        {/* Table Data Penilaian */}
        <div
          style={{
            background: colors.white,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${colors.gray[200]}`,
            overflowX: 'auto',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: colors.gray[800],
              marginBottom: '20px',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Data Penilaian Hafalan
          </h2>

          {filteredPenilaian.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: colors.gray[500],
              }}
            >
              <BookOpen size={48} color={colors.gray[300]} style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '15px', fontFamily: '"Poppins", sans-serif' }}>
                Pilih kelas dan siswa untuk menampilkan data penilaian
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={tableHeaderStyle}>Tanggal</th>
                  <th style={tableHeaderStyle}>Surah / Ayat</th>
                  <th style={tableHeaderStyle}>Tajwid</th>
                  <th style={tableHeaderStyle}>Kelancaran</th>
                  <th style={tableHeaderStyle}>Adab</th>
                  <th style={tableHeaderStyle}>Catatan</th>
                  <th style={tableHeaderStyle}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredPenilaian.map((penilaian, index) => (
                  <tr
                    key={penilaian.id}
                    style={{
                      borderBottom: `1px solid ${colors.gray[100]}`,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = colors.emerald[50];
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={tableCellStyle}>{penilaian.tanggal}</td>
                    <td style={tableCellStyle}>
                      <span style={{ fontWeight: 600 }}>{penilaian.surah}</span>
                      <br />
                      <span style={{ fontSize: '12px', color: colors.gray[500] }}>
                        Ayat {penilaian.ayat}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: getNilaiColor(penilaian.nilaiTajwid) + '20',
                          color: getNilaiColor(penilaian.nilaiTajwid),
                        }}
                      >
                        {penilaian.nilaiTajwid}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: getNilaiColor(penilaian.nilaiKelancaran) + '20',
                          color: getNilaiColor(penilaian.nilaiKelancaran),
                        }}
                      >
                        {penilaian.nilaiKelancaran}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          background: getNilaiColor(penilaian.nilaiAdab) + '20',
                          color: getNilaiColor(penilaian.nilaiAdab),
                        }}
                      >
                        {penilaian.nilaiAdab}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div
                        style={{
                          maxWidth: '200px',
                          fontSize: '13px',
                          color: colors.gray[600],
                        }}
                      >
                        {penilaian.catatan}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleOpenModal(penilaian)}
                          style={{
                            ...actionButtonStyle,
                            background: colors.teal[50],
                            color: colors.teal[600],
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = colors.teal[100];
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = colors.teal[50];
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(penilaian.id)}
                          style={{
                            ...actionButtonStyle,
                            background: colors.rose[50],
                            color: colors.rose[500],
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = colors.rose[100];
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = colors.rose[50];
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Tambah / Edit */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: colors.white,
                borderRadius: '20px',
                padding: '32px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: colors.gray[800],
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {editingPenilaian ? 'Edit Penilaian' : 'Tambah Penilaian'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: colors.gray[400],
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = colors.gray[600])}
                  onMouseOut={(e) => (e.currentTarget.style.color = colors.gray[400])}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Tanggal */}
                <div>
                  <label style={labelStyle}>
                    Tanggal Setoran <span style={{ color: colors.red[500] }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Surah */}
                <div>
                  <label style={labelStyle}>
                    Surah <span style={{ color: colors.red[500] }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.surah}
                    onChange={(e) => setFormData({ ...formData, surah: e.target.value })}
                    placeholder="Contoh: Al-Baqarah"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Ayat */}
                <div>
                  <label style={labelStyle}>
                    Ayat <span style={{ color: colors.red[500] }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ayat}
                    onChange={(e) => setFormData({ ...formData, ayat: e.target.value })}
                    placeholder="Contoh: 1-5"
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Grid 3 Kolom untuk Nilai */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  {/* Nilai Tajwid */}
                  <div>
                    <label style={labelStyle}>
                      Tajwid <span style={{ color: colors.red[500] }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.nilaiTajwid}
                      onChange={(e) =>
                        setFormData({ ...formData, nilaiTajwid: e.target.value })
                      }
                      placeholder="0-100"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Nilai Kelancaran */}
                  <div>
                    <label style={labelStyle}>
                      Kelancaran <span style={{ color: colors.red[500] }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.nilaiKelancaran}
                      onChange={(e) =>
                        setFormData({ ...formData, nilaiKelancaran: e.target.value })
                      }
                      placeholder="0-100"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Nilai Adab */}
                  <div>
                    <label style={labelStyle}>
                      Adab <span style={{ color: colors.red[500] }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.nilaiAdab}
                      onChange={(e) =>
                        setFormData({ ...formData, nilaiAdab: e.target.value })
                      }
                      placeholder="0-100"
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label style={labelStyle}>Catatan Guru</label>
                  <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    placeholder="Catatan atau feedback untuk siswa..."
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: colors.gray[100],
                      color: colors.gray[700],
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = colors.gray[200];
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = colors.gray[100];
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`,
                      color: colors.white,
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                      transition: 'all 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 150, 105, 0.35)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.25)';
                    }}
                  >
                    <Check size={18} />
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  const colorMap = {
    emerald: {
      bg: colors.emerald[100],
      iconBg: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.teal[600]} 100%)`,
      value: colors.emerald[700],
    },
    teal: {
      bg: colors.teal[100],
      iconBg: `linear-gradient(135deg, ${colors.teal[600]} 0%, ${colors.teal[500]} 100%)`,
      value: colors.teal[600],
    },
    amber: {
      bg: colors.amber[100],
      iconBg: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
      value: colors.amber[600],
    },
    violet: {
      bg: colors.violet[50],
      iconBg: `linear-gradient(135deg, ${colors.violet[500]} 0%, #7C3AED 100%)`,
      value: colors.violet[500],
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      style={{
        background: scheme.bg,
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        border: `1px solid ${colors.gray[100]}`,
        transition: 'all 0.3s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: scheme.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: '12px',
            color: colors.gray[600],
            marginBottom: '4px',
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: scheme.value,
            fontFamily: '"Poppins", sans-serif',
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// Styles
const tableHeaderStyle = {
  textAlign: 'left',
  padding: '12px 16px',
  fontSize: '13px',
  fontWeight: 600,
  color: colors.gray[700],
  borderBottom: `2px solid ${colors.gray[200]}`,
  fontFamily: '"Poppins", sans-serif',
};

const tableCellStyle = {
  padding: '16px',
  fontSize: '14px',
  color: colors.gray[700],
  fontFamily: '"Poppins", sans-serif',
};

const badgeStyle = {
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  fontFamily: '"Poppins", sans-serif',
};

const actionButtonStyle = {
  padding: '8px',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: colors.gray[700],
  marginBottom: '8px',
  fontFamily: '"Poppins", sans-serif',
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: `2px solid ${colors.gray[200]}`,
  borderRadius: '10px',
  fontSize: '14px',
  fontFamily: '"Poppins", sans-serif',
  outline: 'none',
  transition: 'all 0.2s',
};
