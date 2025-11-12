'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  FileText, Download, Calendar, Users, TrendingUp,
  ChevronDown, ChevronUp, Filter, FileSpreadsheet,
  Sparkles, BookOpen, CheckCircle, XCircle, Clock
} from 'lucide-react';
import TabelHarian from '@/components/laporan/TabelHarian';
import PopupPenilaian from '@/components/laporan/PopupPenilaian';
import { colors } from '@/components/laporan/constants';

export default function LaporanGuruPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('harian'); // harian, bulanan, semesteran
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('bulan-ini');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // For harian mode date picker
  const [laporanData, setLaporanData] = useState([]);

  // State for editable harian mode
  const [showPenilaianPopup, setShowPenilaianPopup] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [penilaianForm, setPenilaianForm] = useState({
    surah: '',
    ayatMulai: '',
    ayatSelesai: '',
    tajwid: '',
    kelancaran: '',
    makhraj: '',
    implementasi: '',
  });

  useEffect(() => {
    fetchLaporanData();
  }, [viewMode, selectedKelas, selectedPeriod, selectedDate]);

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

      // Add selected date for harian mode
      if (viewMode === 'harian' && selectedDate) {
        params.append('tanggal', selectedDate);
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
          pertemuan: {
            tanggal: '2025-01-05',
            statusKehadiran: 'HADIR',
            nilaiTajwid: 85,
            nilaiKelancaran: 88,
            nilaiMakhraj: 82,
            nilaiImplementasi: 86,
            statusHafalan: 'LANJUT',
            catatan: 'Bagus, terus tingkatkan'
          }
        },
        {
          siswaId: '2',
          namaLengkap: 'Siti Aisyah Rahmawati',
          pertemuan: {
            tanggal: '2025-01-05',
            statusKehadiran: 'HADIR',
            nilaiTajwid: 92,
            nilaiKelancaran: 94,
            nilaiMakhraj: 90,
            nilaiImplementasi: 93,
            statusHafalan: 'LANJUT',
            catatan: 'Sangat baik'
          }
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
          const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = result.filename || `laporan-${viewMode}-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'PDF' && result.html) {
          // Open PDF in new window for printing
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(result.html);
            printWindow.document.close();
          } else {
            alert('Pop-up blocker mencegah membuka window cetak. Silakan izinkan pop-up untuk situs ini.');
          }
        } else {
          alert(`${format} berhasil diunduh!`);
        }
      } else {
        alert(`Gagal mengunduh ${format}: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting:', error);
      alert(`Terjadi kesalahan saat mengunduh ${format}`);
    }
  };

  const handleStatusChange = async (siswaId, status) => {
    try {
      const response = await fetch('/api/guru/laporan/presensi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          tanggal: selectedDate,
          status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchLaporanData();
        alert('Status kehadiran disimpan');
      } else {
        alert('Gagal menyimpan status kehadiran');
      }
    } catch (error) {
      console.error('Error saving status:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handlePenilaianClick = (siswa) => {
    setSelectedSiswa(siswa);

    // Load existing data if available
    if (siswa.pertemuan) {
      setPenilaianForm({
        surah: siswa.pertemuan.surah || '',
        ayatMulai: siswa.pertemuan.ayatMulai || '',
        ayatSelesai: siswa.pertemuan.ayatSelesai || '',
        tajwid: siswa.pertemuan.nilaiTajwid || '',
        kelancaran: siswa.pertemuan.nilaiKelancaran || '',
        makhraj: siswa.pertemuan.nilaiMakhraj || '',
        implementasi: siswa.pertemuan.nilaiImplementasi || '',
      });
    } else {
      setPenilaianForm({
        surah: '',
        ayatMulai: '',
        ayatSelesai: '',
        tajwid: '',
        kelancaran: '',
        makhraj: '',
        implementasi: '',
      });
    }

    setShowPenilaianPopup(true);
  };

  const handleSavePenilaian = async () => {
    try {
      // Validation
      if (!penilaianForm.surah || !penilaianForm.ayatMulai || !penilaianForm.ayatSelesai) {
        alert('Surah dan ayat harus diisi');
        return;
      }

      if (!penilaianForm.tajwid || !penilaianForm.kelancaran || !penilaianForm.makhraj || !penilaianForm.implementasi) {
        alert('Semua nilai penilaian harus diisi');
        return;
      }

      const response = await fetch('/api/guru/laporan/penilaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedSiswa.siswaId,
          tanggal: selectedDate,
          surah: penilaianForm.surah,
          ayatMulai: parseInt(penilaianForm.ayatMulai),
          ayatSelesai: parseInt(penilaianForm.ayatSelesai),
          tajwid: parseInt(penilaianForm.tajwid),
          kelancaran: parseInt(penilaianForm.kelancaran),
          makhraj: parseInt(penilaianForm.makhraj),
          implementasi: parseInt(penilaianForm.implementasi),
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Penilaian berhasil disimpan');
        setShowPenilaianPopup(false);
        fetchLaporanData();
      } else {
        alert('Gagal menyimpan penilaian');
      }
    } catch (error) {
      console.error('Error saving penilaian:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleCatatanChange = async (siswaId, catatan) => {
    try {
      const response = await fetch('/api/guru/laporan/catatan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId,
          tanggal: selectedDate,
          catatan,
        }),
      });

      const result = await response.json();

      if (result.success) {
        fetchLaporanData();
      }
    } catch (error) {
      console.error('Error saving catatan:', error);
    }
  };

  const getNilaiColor = (nilai) => {
    if (!nilai) return colors.gray[300];
    if (nilai >= 90) return colors.emerald[500];
    if (nilai >= 80) return colors.amber[400];
    if (nilai >= 70) return colors.amber[600];
    return colors.gray[500];
  };

  // Helper function untuk format angka (bulat jika tidak pecahan, koma jika pecahan)
  const formatNilai = (nilai) => {
    if (nilai == null) return '-';
    const rounded = Math.round(nilai);
    // Jika nilai sama dengan nilai bulatannya, tampilkan bulat
    if (Math.abs(nilai - rounded) < 0.01) {
      return rounded.toString();
    }
    // Jika ada pecahan, tampilkan dengan 1 desimal
    return nilai.toFixed(1);
  };

  // Helper function untuk hitung rata-rata
  const hitungRataRata = (tajwid, kelancaran, makhraj, implementasi) => {
    const values = [tajwid, kelancaran, makhraj, implementasi].filter(v => v != null);
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${colors.emerald[50]} 0%, ${colors.amber[50]} 100%)`,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: `4px solid ${colors.emerald[200]}`,
              borderTopColor: colors.emerald[500],
              borderRadius: '50%',
              margin: '0 auto 16px',
              animation: 'spin 1s linear infinite',
            }} />
            <p style={{
              fontSize: '16px',
              fontWeight: 500,
              color: colors.text.secondary,
              fontFamily: 'Poppins, system-ui, sans-serif',
            }}>
              Memuat laporan...
            </p>
          </div>
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
                  Rekap Bulanan
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
                  Rekap Semesteran
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
              gridTemplateColumns: viewMode === 'harian' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
              gap: '16px',
            }}>
              {viewMode === 'harian' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: colors.text.secondary,
                    marginBottom: '8px',
                    fontFamily: 'Poppins, system-ui, sans-serif',
                  }}>
                    Tanggal Pertemuan
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
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
                      color: colors.text.primary,
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: colors.text.secondary,
                  marginBottom: '8px',
                  fontFamily: 'Poppins, system-ui, sans-serif',
                }}>
                  {viewMode === 'harian' ? 'Bulan' : 'Periode'}
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
              <TabelHarian
                data={laporanData}
                onStatusChange={handleStatusChange}
                onPenilaianClick={handlePenilaianClick}
                onCatatanChange={handleCatatanChange}
              />
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
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>Rata-rata Nilai</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Status Hafalan</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: 700, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>Catatan Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanData.map((siswa, idx) => {
                    const rataRataNilai = hitungRataRata(
                      siswa.rataRataTajwid,
                      siswa.rataRataKelancaran,
                      siswa.rataRataMakhraj,
                      siswa.rataRataImplementasi
                    );

                    return (
                      <tr key={siswa.siswaId} style={{ borderBottom: `1px solid ${colors.gray[200]}` }}>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: colors.text.primary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {siswa.namaLengkap}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.emerald[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {siswa.totalHadir || 0}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {siswa.totalTidakHadir || 0}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataTajwid), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {formatNilai(siswa.rataRataTajwid)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataKelancaran), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {formatNilai(siswa.rataRataKelancaran)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataMakhraj), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {formatNilai(siswa.rataRataMakhraj)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 700, color: getNilaiColor(siswa.rataRataImplementasi), fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {formatNilai(siswa.rataRataImplementasi)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '15px', fontWeight: 700, color: getNilaiColor(rataRataNilai), fontFamily: 'Poppins, system-ui, sans-serif', background: `${colors.emerald[50]}` }}>
                          {formatNilai(rataRataNilai)}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: siswa.statusHafalan === 'LANJUT' ? colors.emerald[600] : colors.amber[600], fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {siswa.statusHafalan || '-'}
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', color: colors.text.tertiary, fontFamily: 'Poppins, system-ui, sans-serif' }}>
                          {siswa.catatanAkhir || '-'}
                        </td>
                      </tr>
                    );
                  })}
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
                {viewMode === 'harian' ? '-' : (laporanData.length > 0 ? Math.round(laporanData.reduce((acc, s) => acc + (s.totalHadir || 0), 0) / laporanData.length) : 0)}
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
                {viewMode === 'harian' ? '-' : (laporanData.length > 0 ? ((laporanData.reduce((acc, s) => acc + (s.rataRataTajwid || 0) + (s.rataRataKelancaran || 0) + (s.rataRataMakhraj || 0) + (s.rataRataImplementasi || 0), 0) / (laporanData.length * 4)).toFixed(1)) : '0.0')}
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
                  ? laporanData.length
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

      {/* Popup Penilaian */}
      <PopupPenilaian
        show={showPenilaianPopup}
        onClose={() => setShowPenilaianPopup(false)}
        siswa={selectedSiswa}
        form={penilaianForm}
        onFormChange={setPenilaianForm}
        onSave={handleSavePenilaian}
      />

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
