'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {
  FileText, Download, Calendar, Users, TrendingUp,
  ChevronDown, ChevronUp, Filter, FileSpreadsheet,
  Sparkles, BookOpen, CheckCircle, XCircle, Clock
} from 'lucide-react';

// Islamic Modern Color Palette
const colors = {
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#1A936F',
    600: '#059669',
    700: '#047857',
  },
  amber: {
    50: '#FEF3C7',
    100: '#FDE68A',
    200: '#FCD34D',
    300: '#FBBF24',
    400: '#F7C873',
    500: '#F59E0B',
    600: '#D97706',
  },
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
  },
  text: {
    primary: '#1B1B1B',
    secondary: '#444444',
    tertiary: '#6B7280',
    muted: '#9CA3AF',
  },
};

export default function LaporanGuruPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('harian'); // harian, bulanan, semesteran
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');
  const [laporanData, setLaporanData] = useState([]);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchLaporanData();
  }, [viewMode, selectedKelas, selectedPeriod]);

  const fetchLaporanData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        viewMode,
        periode: selectedPeriod,
      });

      if (selectedKelas) {
        params.append('kelasId', selectedKelas);
      }

      const response = await fetch(`/api/guru/laporan?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setLaporanData(result.data);
      } else {
        console.error('Failed to fetch data:', result.error);
        // Fallback to mock data if API fails
        const mockData = generateMockData(viewMode);
        setLaporanData(mockData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on error
      const mockData = generateMockData(viewMode);
      setLaporanData(mockData);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (mode) => {
    if (mode === 'harian') {
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          sesi: [
            {
              tanggal: '2025-01-05',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 85,
              nilaiKelancaran: 88,
              nilaiMakhraj: 82,
              nilaiImplementasi: 86,
              statusHafalan: 'LANJUT',
              catatan: 'Bagus, terus tingkatkan'
            },
            {
              tanggal: '2025-01-12',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 87,
              nilaiKelancaran: 90,
              nilaiMakhraj: 85,
              nilaiImplementasi: 88,
              statusHafalan: 'LANJUT',
              catatan: 'Progres sangat baik'
            },
            {
              tanggal: '2025-01-19',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 90,
              nilaiKelancaran: 92,
              nilaiMakhraj: 88,
              nilaiImplementasi: 91,
              statusHafalan: 'LANJUT',
              catatan: 'Excellent!'
            },
            {
              tanggal: '2025-01-26',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 88,
              nilaiKelancaran: 89,
              nilaiMakhraj: 86,
              nilaiImplementasi: 87,
              statusHafalan: 'LANJUT',
              catatan: 'Konsisten'
            }
          ]
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          sesi: [
            {
              tanggal: '2025-01-05',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 92,
              nilaiKelancaran: 94,
              nilaiMakhraj: 90,
              nilaiImplementasi: 93,
              statusHafalan: 'LANJUT',
              catatan: 'Sangat baik'
            },
            {
              tanggal: '2025-01-12',
              statusKehadiran: 'SAKIT',
              nilaiTajwid: null,
              nilaiKelancaran: null,
              nilaiMakhraj: null,
              nilaiImplementasi: null,
              statusHafalan: '-',
              catatan: 'Sakit'
            },
            {
              tanggal: '2025-01-19',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 91,
              nilaiKelancaran: 93,
              nilaiMakhraj: 89,
              nilaiImplementasi: 92,
              statusHafalan: 'LANJUT',
              catatan: 'Kembali dengan baik'
            },
            {
              tanggal: '2025-01-26',
              statusKehadiran: 'HADIR',
              nilaiTajwid: 93,
              nilaiKelancaran: 95,
              nilaiMakhraj: 91,
              nilaiImplementasi: 94,
              statusHafalan: 'LANJUT',
              catatan: 'Outstanding'
            }
          ]
        }
      ];
    } else if (mode === 'bulanan') {
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          totalHadir: 4,
          totalTidakHadir: 0,
          rataRataTajwid: 87.5,
          rataRataKelancaran: 89.8,
          rataRataMakhraj: 85.3,
          rataRataImplementasi: 88.0,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Progres sangat baik sepanjang bulan'
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          totalHadir: 3,
          totalTidakHadir: 1,
          rataRataTajwid: 92.0,
          rataRataKelancaran: 94.0,
          rataRataMakhraj: 90.0,
          rataRataImplementasi: 93.0,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Excellent, satu kali sakit'
        }
      ];
    } else { // semesteran
      return [
        {
          siswaId: '1',
          namaLengkap: 'Ahmad Fadli Ramadhan',
          totalHadir: 22,
          totalTidakHadir: 2,
          rataRataTajwid: 88.2,
          rataRataKelancaran: 90.1,
          rataRataMakhraj: 86.5,
          rataRataImplementasi: 89.3,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Progres konsisten selama semester'
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          totalHadir: 21,
          totalTidakHadir: 3,
          rataRataTajwid: 93.5,
          rataRataKelancaran: 95.2,
          rataRataMakhraj: 91.8,
          rataRataImplementasi: 94.1,
          statusHafalan: 'LANJUT',
          catatanAkhir: 'Outstanding performance selama semester'
        }
      ];
    }
  };

  const toggleRowExpand = (siswaId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(siswaId)) {
      newExpanded.delete(siswaId);
    } else {
      newExpanded.add(siswaId);
    }
    setExpandedRows(newExpanded);
  };

  const handleExport = async (format) => {
    try {
      const response = await fetch('/api/guru/laporan/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          viewMode,
          kelasId: selectedKelas,
          periode: selectedPeriod,
          data: laporanData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (format === 'Excel' && result.csv) {
          // Download CSV directly
          const blob = new Blob([result.csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename || `laporan-${viewMode}-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          alert(`${format} berhasil diunduh! URL: ${result.downloadUrl}`);
        }
      } else {
        alert(`Gagal mengunduh ${format}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert(`Terjadi kesalahan saat mengunduh ${format}`);
    }
  };

  const getNilaiColor = (nilai) => {
    if (!nilai) return colors.gray[300];
    if (nilai >= 90) return colors.emerald[500];
    if (nilai >= 80) return colors.amber[400];
    if (nilai >= 70) return colors.amber[600];
    return colors.gray[500];
  };

  const getStatusKehadiranBadge = (status) => {
    const styles = {
      HADIR: { bg: colors.emerald[100], text: colors.emerald[700], icon: CheckCircle },
      SAKIT: { bg: colors.amber[100], text: colors.amber[700], icon: Clock },
      IZIN: { bg: colors.amber[100], text: colors.amber[700], icon: Clock },
      ALFA: { bg: '#FEE2E2', text: '#991B1B', icon: XCircle }
    };
    const style = styles[status] || styles.ALFA;
    const Icon = style.icon;

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 12px',
        borderRadius: '100px',
        background: style.bg,
        color: style.text,
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'Poppins, system-ui, sans-serif',
      }}>
        <Icon size={14} />
        {status}
      </div>
    );
  };

  if (loading) {
    return (
      <GuruLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
          <LoadingIndicator text="Memuat laporan..." />
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div style={{
        background: `linear-gradient(to bottom right, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        minHeight: '100vh',
        position: 'relative',
      }}>
        {/* Islamic Pattern Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='none' stroke='%231A936F' stroke-width='0.5' opacity='0.05'/%3E%3Ccircle cx='30' cy='30' r='8' fill='none' stroke='%23F7C873' stroke-width='0.5' opacity='0.05'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
          opacity: 0.3,
          zIndex: 0,
        }} />

        {/* Header */}
        <div style={{
          position: 'relative',
          padding: '32px 48px 24px',
          borderBottom: `1px solid ${colors.gray[200]}`,
          background: `linear-gradient(135deg, ${colors.white}98 0%, ${colors.white}95 100%)`,
          backdropFilter: 'blur(10px)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h1 style={{
                fontSize: '36px',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${colors.emerald[600]} 0%, ${colors.emerald[500]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Laporan Hafalan & Kehadiran
              </h1>
              <p style={{
                fontSize: '15px',
                fontWeight: 500,
                color: colors.text.secondary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Laporan terpadu hafalan dan kehadiran siswa dengan berbagai mode tampilan
              </p>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div style={{
          position: 'relative',
          padding: '24px 48px',
          zIndex: 2,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`,
            borderRadius: '20px',
            padding: '20px 24px',
            boxShadow: '0 6px 20px rgba(247, 200, 115, 0.25)',
            border: `2px solid ${colors.amber[300]}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: `${colors.white}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Sparkles size={22} color={colors.white} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: colors.white,
                  fontFamily: 'Poppins, system-ui, sans-serif',
                  fontStyle: 'italic',
                  marginBottom: '8px',
                  lineHeight: '1.6',
                }}>
                  &ldquo;Sebaik-baik kalian adalah yang mempelajari Al-Qur&apos;an dan mengajarkannya.&rdquo;
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: colors.amber[50],
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  — HR. Bukhari
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ position: 'relative', padding: '0 48px 48px', zIndex: 2 }}>
          {/* Control Panel */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: `2px solid ${colors.emerald[100]}`,
            marginBottom: '24px',
          }}>
            {/* Mode Toggle Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <button
                  onClick={() => setViewMode('harian')}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: viewMode === 'harian'
                      ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                      : colors.gray[100],
                    color: viewMode === 'harian' ? colors.white : colors.text.secondary,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  className="mode-btn"
                >
                  <Calendar size={18} />
                  Harian/Mingguan
                </button>
                <button
                  onClick={() => setViewMode('bulanan')}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: viewMode === 'bulanan'
                      ? `linear-gradient(135deg, ${colors.amber[400]} 0%, ${colors.amber[500]} 100%)`
                      : colors.gray[100],
                    color: viewMode === 'bulanan' ? colors.white : colors.text.secondary,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  className="mode-btn"
                >
                  <TrendingUp size={18} />
                  📊 Rekap Bulanan
                </button>
                <button
                  onClick={() => setViewMode('semesteran')}
                  style={{
                    flex: 1,
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: viewMode === 'semesteran'
                      ? `linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%)`
                      : colors.gray[100],
                    color: viewMode === 'semesteran' ? colors.white : colors.text.secondary,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  className="mode-btn"
                >
                  <BookOpen size={18} />
                  📆 Rekap Semesteran
                </button>
              </div>

              {/* Export Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleExport('PDF')}
                  style={{
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: `2px solid ${colors.emerald[500]}`,
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    color: colors.emerald[600],
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  className="export-btn"
                >
                  <FileText size={18} />
                  PDF
                </button>
                <button
                  onClick={() => handleExport('Excel')}
                  style={{
                    padding: '14px 20px',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: `2px solid ${colors.emerald[500]}`,
                    cursor: 'pointer',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    color: colors.emerald[600],
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  className="export-btn"
                >
                  <FileSpreadsheet size={18} />
                  Excel
                </button>
              </div>
            </div>

            {/* Filter Section */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Periode
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="bulan-ini">Bulan Ini</option>
                  <option value="bulan-lalu">Bulan Lalu</option>
                  <option value="semester-ini">Semester Ini</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  Kelas
                </label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '14px',
                    border: `2px solid ${colors.emerald[200]}`,
                    borderRadius: '12px',
                    outline: 'none',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                    background: colors.white,
                    cursor: 'pointer',
                  }}
                >
                  <option value="">Semua Kelas</option>
                  <option value="xii-ipa-1">XII IPA 1</option>
                  <option value="xi-ipa-2">XI IPA 2</option>
                  <option value="x-mia-3">X MIA 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div style={{
            background: colors.white,
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            border: `2px solid ${colors.emerald[100]}`,
            overflowX: 'auto',
          }}>
            {viewMode === 'harian' ? (
              // Harian/Mingguan View - Multiple Rows per Student
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.emerald[200]}` }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>No</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nama Lengkap</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Tanggal</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Kehadiran</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nilai Tajwid</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nilai Kelancaran</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nilai Makhraj</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nilai Implementasi</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Hafalan</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanData.map((siswa, siswaIdx) => (
                    <>
                      {siswa.sesi.map((sesi, sesiIdx) => (
                        <tr key={`${siswa.siswaId}-${sesiIdx}`} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
                          {sesiIdx === 0 && (
                            <>
                              <td rowSpan={siswa.sesi.length} style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', verticalAlign: 'top' }}>
                                {siswaIdx + 1}
                              </td>
                              <td rowSpan={siswa.sesi.length} style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', verticalAlign: 'top' }}>
                                {siswa.namaLengkap}
                              </td>
                            </>
                          )}
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: colors.text.secondary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {new Date(sesi.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center' }}>
                            {getStatusKehadiranBadge(sesi.statusKehadiran)}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(sesi.nilaiTajwid), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.nilaiTajwid || '-'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(sesi.nilaiKelancaran), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.nilaiKelancaran || '-'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(sesi.nilaiMakhraj), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.nilaiMakhraj || '-'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(sesi.nilaiImplementasi), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.nilaiImplementasi || '-'}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: sesi.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.statusHafalan}
                          </td>
                          <td style={{ padding: '16px', fontSize: '13px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                            {sesi.catatan}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            ) : (
              // Bulanan/Semesteran View - One Row per Student (Aggregated)
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${colors.emerald[200]}` }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>No</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Nama Lengkap</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Total Hadir</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Total Tidak Hadir</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Tajwid</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Kelancaran</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Makhraj</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Rata-rata Implementasi</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Hafalan</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Catatan Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanData.map((siswa, idx) => (
                    <tr key={siswa.siswaId} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.namaLengkap}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.emerald[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.totalHadir}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.totalTidakHadir}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataTajwid), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.rataRataTajwid.toFixed(1)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataKelancaran), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.rataRataKelancaran.toFixed(1)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataMakhraj), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.rataRataMakhraj.toFixed(1)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataImplementasi), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.rataRataImplementasi.toFixed(1)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: siswa.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.statusHafalan}
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                        {siswa.catatanAkhir}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary Statistics */}
          <div style={{
            marginTop: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              background: colors.white,
              borderRadius: '16px',
              padding: '20px',
              border: `2px solid ${colors.emerald[100]}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: colors.emerald[600],
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {laporanData.length}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Total Siswa
              </div>
            </div>

            <div style={{
              background: colors.white,
              borderRadius: '16px',
              padding: '20px',
              border: `2px solid ${colors.amber[100]}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: colors.amber[600],
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {viewMode === 'harian' ? '-' : Math.round(laporanData.reduce((acc, s) => acc + s.totalHadir, 0) / laporanData.length)}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Rata-rata Hadir
              </div>
            </div>

            <div style={{
              background: colors.white,
              borderRadius: '16px',
              padding: '20px',
              border: `2px solid ${colors.emerald[100]}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: colors.emerald[600],
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {viewMode === 'harian' ? '-' : ((laporanData.reduce((acc, s) => acc + s.rataRataTajwid + s.rataRataKelancaran + s.rataRataMakhraj + s.rataRataImplementasi, 0) / (laporanData.length * 4)).toFixed(1))}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Rata-rata Nilai Keseluruhan
              </div>
            </div>

            <div style={{
              background: colors.white,
              borderRadius: '16px',
              padding: '20px',
              border: `2px solid ${colors.amber[100]}`,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 700,
                color: colors.amber[600],
                marginBottom: '8px',
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                {viewMode === 'harian'
                  ? laporanData.reduce((acc, s) => acc + s.sesi.length, 0)
                  : (viewMode === 'bulanan' ? '4x' : '24x')}
              </div>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: colors.text.tertiary,
                fontFamily: 'Poppins, system-ui, sans-serif',
              }}>
                Total Sesi Penilaian
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .mode-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .export-btn:hover {
          background: linear-gradient(135deg, ${colors.emerald[500]} 0%, ${colors.emerald[600]} 100%) !important;
          color: ${colors.white} !important;
          transform: translateY(-2px);
        }
      `}</style>
    </GuruLayout>
  );
}
