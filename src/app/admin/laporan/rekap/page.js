'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Loader, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LaporanRekapPage() {
  const [kelas, setKelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [filters, setFilters] = useState({
    kelasId: '',
    periode: 'harian',
    tanggal: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    bulan: '',
    tahun: new Date().getFullYear().toString(),
    semester: ''
  });

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const response = await fetch('/api/kelas');
      const data = await response.json();
      setKelas(data);
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const handleGeneratePreview = async () => {
    if (!filters.kelasId) {
      alert('Pilih kelas terlebih dahulu');
      return;
    }

    let params = new URLSearchParams({
      kelasId: filters.kelasId,
      periode: filters.periode
    });

    if (filters.periode === 'harian') {
      if (!filters.tanggal) {
        alert('Pilih tanggal untuk laporan harian');
        return;
      }
      params.append('tanggal', filters.tanggal);
    } else if (filters.periode === 'bulanan') {
      if (!filters.bulan || !filters.tahun) {
        alert('Pilih bulan dan tahun untuk laporan bulanan');
        return;
      }
      const monthNum = parseInt(filters.bulan);
      const yearNum = parseInt(filters.tahun);
      const startDate = new Date(yearNum, monthNum - 1, 1).toISOString();
      const endDate = new Date(yearNum, monthNum, 0).toISOString();
      params.append('tanggalMulai', startDate);
      params.append('tanggalSelesai', endDate);
    } else if (filters.periode === 'semester') {
      if (!filters.semester) {
        alert('Pilih semester untuk laporan semesteran');
        return;
      }
      const year = parseInt(filters.tahun);
      let startDate, endDate;
      if (filters.semester === '1') {
        // Semester 1: Juli - Desember
        startDate = new Date(year, 6, 1).toISOString();
        endDate = new Date(year, 11, 31).toISOString();
      } else {
        // Semester 2: Januari - Juni
        startDate = new Date(year, 0, 1).toISOString();
        endDate = new Date(year, 5, 30).toISOString();
      }
      params.append('tanggalMulai', startDate);
      params.append('tanggalSelesai', endDate);
    }

    setLoading(true);
    setReportData(null);

    try {
      const response = await fetch(`/api/admin/laporan/rekap?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch report data`);
      }

      const data = await response.json();

      if (!data || !data.siswaData || data.siswaData.length === 0) {
        alert('Tidak ada data untuk periode ini');
        setReportData(null);
        return;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert(`Gagal generate laporan: ${error.message}`);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // Kop Surat - Professional Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MAN 1 BANDAR LAMPUNG', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Jl. Letnan Kolonel Jl. Endro Suratmin, Harapan Jaya, Kec. Sukarame', pageWidth / 2, 22, { align: 'center' });
    doc.text('Kota Bandar Lampung, Lampung 35131', pageWidth / 2, 27, { align: 'center' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(14, 30, pageWidth - 14, 30);
    doc.setLineWidth(0.2);
    doc.line(14, 31, pageWidth - 14, 31);

    // Document title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LAPORAN REKAP KEHADIRAN DAN PENILAIAN HAFALAN', pageWidth / 2, 40, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${reportData.periodeText}`, 14, 50);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 55);
    doc.text(`Kelas: ${reportData.kelasNama}`, 14, 60);

    let yPos = 70;

    // Table data
    if (reportData.type === 'harian') {
      // Daily mode table
      const tableData = reportData.siswaData.map((s, idx) => {
        const kehadiranText = s.kehadiran === 'HADIR' ? 'Hadir' :
                             s.kehadiran === 'SAKIT' ? 'Sakit' :
                             s.kehadiran === 'IZIN' ? 'Izin' : 'Alpa';

        return [
          idx + 1,
          s.nama,
          s.kelas,
          kehadiranText,
          s.tajwid ?? '-',
          s.kelancaran ?? '-',
          s.makhraj ?? '-',
          s.implementasi ?? '-',
          s.totalNilai ?? '-'
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Nama Siswa', 'Kelas', 'Kehadiran', 'Tajwid', 'Kelancaran', 'Makhraj', 'Implementasi', 'Total Nilai']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 201, 141],
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8 },
        margin: { bottom: 60 },
        styles: {
          cellPadding: 2,
          overflow: 'linebreak'
        }
      });
    } else {
      // Monthly/Semester mode table
      const tableData = reportData.siswaData.map((s, idx) => [
        idx + 1,
        s.nama,
        s.hadir || 0,
        s.sakit || 0,
        s.izin || 0,
        s.alpa || 0,
        s.tajwid ?? '-',
        s.kelancaran ?? '-',
        s.makhraj ?? '-',
        s.implementasi ?? '-',
        s.totalNilai ?? '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['No', 'Nama Siswa', 'Hadir', 'Sakit', 'Izin', 'Alpa', 'Tajwid', 'Kelancaran', 'Makhraj', 'Implementasi', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [0, 201, 141],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7 },
        margin: { bottom: 60 },
        styles: {
          cellPadding: 1.5,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 8 },  // No
          1: { cellWidth: 35 }, // Nama
          2: { cellWidth: 12 }, // Hadir
          3: { cellWidth: 12 }, // Sakit
          4: { cellWidth: 12 }, // Izin
          5: { cellWidth: 12 }, // Alpa
          6: { cellWidth: 15 }, // Tajwid
          7: { cellWidth: 18 }, // Kelancaran
          8: { cellWidth: 15 }, // Makhraj
          9: { cellWidth: 20 }, // Implementasi
          10: { cellWidth: 12 } // Total
        }
      });
    }

    // Signature section
    const tableEndY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 100;
    const pageHeight = doc.internal.pageSize.getHeight();

    let signatureY = tableEndY + 15;
    if (signatureY + 35 > pageHeight - 20) {
      doc.addPage();
      signatureY = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Bandar Lampung, ${today}`, pageWidth - 14, signatureY, { align: 'right' });

    signatureY += 10;

    doc.text('Mengetahui,', 14, signatureY);
    doc.text('Guru Tahfidz', 14, signatureY + 20);
    doc.text('_____________________', 14, signatureY + 25);

    doc.text('Kepala Sekolah', pageWidth - 14, signatureY, { align: 'right' });
    doc.text('_____________________', pageWidth - 14, signatureY + 25, { align: 'right' });

    doc.save(`Laporan_Rekap_${reportData.kelasNama}_${new Date().getTime()}.pdf`);
  };

  return (
    <AdminLayout>
      <style jsx>{`
        .filter-card {
          background: #FFFFFF;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
          border-radius: 20px;
          border: 1px solid #E6F4EF;
        }
        .filter-card:hover {
          border-color: #00C98D;
        }
        .preview-empty {
          background: #F3FCF8;
          border-radius: 16px;
          padding: 32px;
        }
        .select-input {
          height: 48px;
          border: 1px solid #DDE6E1;
          border-radius: 12px;
          background: white;
          color: #2F3E3A;
          transition: border-color 0.2s ease;
        }
        .select-input:hover {
          border-color: #00C98D;
        }
        .select-input:focus {
          border-color: #00C98D;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 201, 141, 0.3);
        }
        .btn-primary {
          background: linear-gradient(90deg, #00C98D, #00B77E);
          color: white;
          border-radius: 12px;
          padding: 12px 28px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #00B77E;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 201, 141, 0.3);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .laporan-header {
          padding: 48px;
          margin-bottom: 24px;
        }

        .laporan-container {
          padding: 0 48px 48px 48px;
        }

        @media (max-width: 768px) {
          .laporan-header {
            padding: 24px 16px 20px 16px;
            margin-bottom: 16px;
          }

          .laporan-container {
            padding: 0 16px 24px 16px;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FEFFD9 0%, #F7FFE5 40%, #F5FBEF 100%)'
      }}>
        <div className="laporan-header">
          <h1 className="text-4xl font-bold" style={{ color: '#2F3E3A', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.3px' }}>
            Laporan Rekap Kehadiran & Penilaian
          </h1>
          <p className="mt-2" style={{ color: '#6B7E75', fontSize: '15px' }}>
            Laporan terintegrasi kehadiran dan penilaian hafalan siswa (Read-Only)
          </p>
        </div>

        <div className="laporan-container">
          <div className="filter-card p-8 mb-8">
            <h2 className="text-xl font-bold mb-8" style={{ color: '#2F3E3A', fontWeight: 700, letterSpacing: '-0.3px' }}>
              Filter Laporan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                  Pilih Kelas <span style={{ color: '#F9844A' }}>*</span>
                </label>
                <select
                  value={filters.kelasId}
                  onChange={(e) => setFilters({ ...filters, kelasId: e.target.value })}
                  className="select-input w-full px-4"
                >
                  <option value="">Pilih Kelas</option>
                  {kelas.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                  Periode <span style={{ color: '#F9844A' }}>*</span>
                </label>
                <select
                  value={filters.periode}
                  onChange={(e) => setFilters({ ...filters, periode: e.target.value })}
                  className="select-input w-full px-4"
                >
                  <option value="harian">Harian</option>
                  <option value="bulanan">Bulanan</option>
                  <option value="semester">Semesteran</option>
                </select>
              </div>

              {filters.periode === 'harian' && (
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                    Tanggal <span style={{ color: '#F9844A' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={filters.tanggal}
                    onChange={(e) => setFilters({ ...filters, tanggal: e.target.value })}
                    className="select-input w-full px-4"
                  />
                </div>
              )}

              {filters.periode === 'bulanan' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                      Bulan <span style={{ color: '#F9844A' }}>*</span>
                    </label>
                    <select
                      value={filters.bulan}
                      onChange={(e) => setFilters({ ...filters, bulan: e.target.value })}
                      className="select-input w-full px-4"
                    >
                      <option value="">Pilih Bulan</option>
                      <option value="1">Januari</option>
                      <option value="2">Februari</option>
                      <option value="3">Maret</option>
                      <option value="4">April</option>
                      <option value="5">Mei</option>
                      <option value="6">Juni</option>
                      <option value="7">Juli</option>
                      <option value="8">Agustus</option>
                      <option value="9">September</option>
                      <option value="10">Oktober</option>
                      <option value="11">November</option>
                      <option value="12">Desember</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                      Tahun <span style={{ color: '#F9844A' }}>*</span>
                    </label>
                    <select
                      value={filters.tahun}
                      onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                      className="select-input w-full px-4"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year.toString()}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}

              {filters.periode === 'semester' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                      Semester <span style={{ color: '#F9844A' }}>*</span>
                    </label>
                    <select
                      value={filters.semester}
                      onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
                      className="select-input w-full px-4"
                    >
                      <option value="">Pilih Semester</option>
                      <option value="1">Semester 1 (Juli - Desember)</option>
                      <option value="2">Semester 2 (Januari - Juni)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>
                      Tahun Ajaran <span style={{ color: '#F9844A' }}>*</span>
                    </label>
                    <select
                      value={filters.tahun}
                      onChange={(e) => setFilters({ ...filters, tahun: e.target.value })}
                      className="select-input w-full px-4"
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <option key={year} value={year.toString()}>{year}</option>;
                      })}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleGeneratePreview}
                disabled={loading || !filters.kelasId}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Memproses...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Tampilkan Laporan
                  </>
                )}
              </button>
            </div>
          </div>

          {loading && (
            <div className="filter-card p-12 text-center">
              <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#00C98D' }} />
              <p className="font-medium" style={{ color: '#2F3E3A' }}>Memproses data laporan...</p>
            </div>
          )}

          {!loading && reportData === null && filters.kelasId && (
            <div className="filter-card p-6 flex items-start gap-4" style={{ border: '1px solid #FED7AA', background: '#FEFCE8' }}>
              <AlertTriangle className="flex-shrink-0 mt-1" size={24} style={{ color: '#D97706' }} />
              <div>
                <h3 className="font-semibold" style={{ color: '#92400E' }}>Perhatian</h3>
                <p className="text-sm mt-1" style={{ color: '#B45309' }}>
                  Tidak ada data untuk periode yang dipilih. Coba ubah filter atau periode tanggal.
                </p>
              </div>
            </div>
          )}

          {reportData && !loading && (
            <>
              <div className="filter-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ background: '#F3FCF8', borderBottom: '2px solid #DDE6E1' }}>
                      <tr>
                        {reportData.type === 'harian' ? (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>No</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nama Siswa</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Kelas</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Kehadiran</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Tajwid</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Kelancaran</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Makhraj</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Implementasi</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Total Nilai</th>
                          </>
                        ) : (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>No</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nama Siswa</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Hadir</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Sakit</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Izin</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Alpa</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Tajwid</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Kelancaran</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Makhraj</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Implementasi</th>
                            <th className="px-6 py-3 text-center text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Total</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '2px solid #DDE6E1' }}>
                      {reportData.siswaData.map((siswa, idx) => (
                        <tr key={siswa.id || idx} style={{ borderBottom: '1px solid #DDE6E1' }}>
                          {reportData.type === 'harian' ? (
                            <>
                              <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{idx + 1}</td>
                              <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nama}</td>
                              <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.kelas}</td>
                              <td className="px-6 py-4 text-sm text-center">
                                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{
                                  background: siswa.kehadiran === 'HADIR' ? '#D4F8E8' :
                                             siswa.kehadiran === 'SAKIT' ? '#FEE2E2' :
                                             siswa.kehadiran === 'IZIN' ? '#FEF3C7' : '#FEE2E2',
                                  color: siswa.kehadiran === 'HADIR' ? '#00A57A' :
                                        siswa.kehadiran === 'SAKIT' ? '#DC2626' :
                                        siswa.kehadiran === 'IZIN' ? '#D97706' : '#DC2626'
                                }}>
                                  {siswa.kehadiran === 'HADIR' ? 'Hadir' :
                                   siswa.kehadiran === 'SAKIT' ? 'Sakit' :
                                   siswa.kehadiran === 'IZIN' ? 'Izin' : 'Alpa'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.tajwid !== null ? siswa.tajwid : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.kelancaran !== null ? siswa.kelancaran : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.makhraj !== null ? siswa.makhraj : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.implementasi !== null ? siswa.implementasi : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center font-semibold" style={{ color: '#00C98D' }}>
                                {siswa.totalNilai !== null ? siswa.totalNilai : '-'}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{idx + 1}</td>
                              <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nama}</td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#00C98D', fontWeight: 600 }}>
                                {siswa.hadir || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#EF4444', fontWeight: 600 }}>
                                {siswa.sakit || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#F59E0B', fontWeight: 600 }}>
                                {siswa.izin || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#DC2626', fontWeight: 600 }}>
                                {siswa.alpa || 0}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.tajwid !== null ? siswa.tajwid : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.kelancaran !== null ? siswa.kelancaran : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.makhraj !== null ? siswa.makhraj : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center" style={{ color: '#2F3E3A' }}>
                                {siswa.implementasi !== null ? siswa.implementasi : '-'}
                              </td>
                              <td className="px-6 py-4 text-sm text-center font-semibold" style={{ color: '#00C98D' }}>
                                {siswa.totalNilai !== null ? siswa.totalNilai : '-'}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={exportPDF}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(90deg, #00C98D, #00B77E)' }}
                  onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 12px rgba(0, 201, 141, 0.3)'}
                  onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
                >
                  <Download size={20} />
                  Export PDF
                </button>
              </div>
            </>
          )}

          {!reportData && !loading && !filters.kelasId && (
            <div className="preview-empty text-center">
              <FileText size={48} className="mx-auto mb-4" style={{ color: '#00C98D', opacity: 0.9 }} />
              <p style={{ color: '#6B7E75', fontSize: '15px' }}>
                Pilih kelas dan periode, lalu klik "Tampilkan Laporan" untuk melihat data
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
