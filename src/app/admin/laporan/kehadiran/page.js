'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { FileText, Download, Loader, AlertTriangle, Users, TrendingUp, Activity } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function LaporanKehadiranPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [filterType, setFilterType] = useState('range'); // 'range', 'bulanan', 'semester'
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [semester, setSemester] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await fetch('/api/kelas');
      if (res.ok) {
        const data = await res.json();
        setKelasList(data);
      }
    } catch (error) {
      console.error('Error fetching kelas:', error);
    }
  };

  const handleGenerateReport = async () => {
    let startDate, endDate;

    if (filterType === 'semester') {
      if (!selectedKelas || !semester) {
        alert('Mohon lengkapi semua filter (kelas dan semester)');
        return;
      }
      const year = new Date().getFullYear();
      if (semester === '1') {
        // Semester 1: Juli - Desember
        startDate = new Date(year, 6, 1).toISOString().split('T')[0];
        endDate = new Date(year, 11, 31).toISOString().split('T')[0];
      } else {
        // Semester 2: Januari - Juni
        startDate = new Date(year, 0, 1).toISOString().split('T')[0];
        endDate = new Date(year, 5, 30).toISOString().split('T')[0];
      }
    } else if (filterType === 'bulanan') {
      if (!selectedKelas || !bulan || !tahun) {
        alert('Mohon lengkapi semua filter (kelas, bulan, tahun)');
        return;
      }
      const monthNum = parseInt(bulan);
      const yearNum = parseInt(tahun);
      startDate = new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0];
      endDate = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];
    } else {
      if (!selectedKelas || !tanggalMulai || !tanggalSelesai) {
        alert('Mohon lengkapi semua filter');
        return;
      }
      if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
        alert('Tanggal mulai tidak boleh lebih dari tanggal selesai');
        return;
      }
      startDate = tanggalMulai;
      endDate = tanggalSelesai;
    }

    setLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams({
        kelasId: selectedKelas,
        tanggalMulai: startDate,
        tanggalSelesai: endDate,
      });
      const res = await fetch(`/api/admin/laporan/kehadiran?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      } else {
        const error = await res.json();
        alert(error.error || 'Gagal membuat laporan');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Terjadi kesalahan saat membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
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
    doc.text('LAPORAN KEHADIRAN TAHFIDZ AL-QUR\'AN', pageWidth / 2, 40, { align: 'center' });

    // Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Periode: ${reportData.periodeText}`, 14, 50);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 55);
    doc.text(`Kelas: ${reportData.kelasNama}`, 14, 60);

    // Summary
    let yPos = 70;
    doc.setFont('helvetica', 'bold');
    doc.text('RINGKASAN STATISTIK:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 5;
    doc.text(`Jumlah Siswa: ${reportData.summary.jumlahSiswa} orang`, 14, yPos);
    yPos += 5;
    doc.text(`Total Pertemuan: ${reportData.summary.totalPertemuan} kali`, 14, yPos);
    yPos += 5;
    doc.text(`Rata-rata Kehadiran: ${reportData.summary.rataKehadiran}%`, 14, yPos);
    yPos += 5;
    doc.text(`Persentase Hadir: ${reportData.summary.persenHadir}%`, 14, yPos);
    yPos += 5;
    doc.text(`Persentase Izin: ${reportData.summary.persenIzin}%`, 14, yPos);
    yPos += 5;
    doc.text(`Persentase Sakit: ${reportData.summary.persenSakit}%`, 14, yPos);
    yPos += 5;
    doc.text(`Persentase Alpa: ${reportData.summary.persenAlpa}%`, 14, yPos);
    yPos += 10;

    // Table
    const tableData = reportData.siswaData.map((s, idx) => [
      idx + 1,
      s.nama,
      s.nisn,
      `${s.hadir} (${s.persenHadir}%)`,
      `${s.izin} (${s.persenIzin}%)`,
      `${s.sakit} (${s.persenSakit}%)`,
      `${s.alpa} (${s.persenAlpa}%)`,
      `${s.totalKehadiran}%`,
      s.status
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Nama Siswa', 'NISN', 'Hadir', 'Izin', 'Sakit', 'Alpa', 'Total', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 8 },
      margin: { bottom: 60 }
    });

    // Signature section - Dynamic positioning following table
    const tableEndY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || 100;
    const pageHeight = doc.internal.pageSize.getHeight();

    // Check if there's enough space for signature, otherwise add new page
    let signatureY = tableEndY + 15;
    if (signatureY + 35 > pageHeight - 20) {
      doc.addPage();
      signatureY = 20;
    }

    // Date and location
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Bandar Lampung, ${today}`, pageWidth - 14, signatureY, { align: 'right' });

    signatureY += 10;

    // Left signature (Guru Tahfidz)
    doc.text('Mengetahui,', 14, signatureY);
    doc.text('Guru Tahfidz', 14, signatureY + 20);
    doc.text('_____________________', 14, signatureY + 25);

    // Right signature (Kepala Sekolah)
    doc.text('Kepala Sekolah', pageWidth - 14, signatureY, { align: 'right' });
    doc.text('_____________________', pageWidth - 14, signatureY + 25, { align: 'right' });

    doc.save(`Laporan_Kehadiran_${reportData.kelasNama}_${new Date().getTime()}.pdf`);
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
        
        /* Mobile Responsive Padding */
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
        {/* Header Section */}
        <div className="laporan-header">
          <h1 className="text-4xl font-bold" style={{ color: '#2F3E3A', fontWeight: 700, fontSize: '24px', letterSpacing: '-0.3px' }}>Laporan Kehadiran</h1>
          <p className="mt-2" style={{ color: '#6B7E75', fontSize: '15px' }}>Generate dan download laporan kehadiran tahfidz</p>
        </div>

        {/* Main Container */}
        <div className="laporan-container">
          {/* Filter Card */}
          <div className="filter-card p-8 mb-8">
            <h2 className="text-xl font-bold mb-8" style={{ color: '#2F3E3A', fontWeight: 700, letterSpacing: '-0.3px' }}>Filter Laporan</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Tipe Filter</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="select-input w-full px-4"
                >
                  <option value="range">Range Tanggal</option>
                  <option value="bulanan">Bulanan</option>
                  <option value="semester">Per Semester</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Kelas <span style={{ color: '#F9844A' }}>*</span></label>
                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="select-input w-full px-4"
                >
                  <option value="">Pilih Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>
                  ))}
                </select>
              </div>

              {filterType === 'semester' && (
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="select-input w-full px-4"
                  >
                    <option value="">Pilih Semester</option>
                    <option value="1">Semester 1 (Juli - Desember)</option>
                    <option value="2">Semester 2 (Januari - Juni)</option>
                  </select>
                </div>
              )}

              {filterType === 'bulanan' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Bulan</label>
                    <select
                      value={bulan}
                      onChange={(e) => setBulan(e.target.value)}
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
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Tahun</label>
                    <select
                      value={tahun}
                      onChange={(e) => setTahun(e.target.value)}
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

              {filterType === 'range' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Tanggal Mulai</label>
                    <input
                      type="date"
                      value={tanggalMulai}
                      onChange={(e) => setTanggalMulai(e.target.value)}
                      className="select-input w-full px-4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#2F3E3A' }}>Tanggal Selesai</label>
                    <input
                      type="date"
                      value={tanggalSelesai}
                      onChange={(e) => setTanggalSelesai(e.target.value)}
                      className="select-input w-full px-4"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <button
                onClick={handleGenerateReport}
                disabled={loading || !selectedKelas}
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

        {/* Loading State */}
        {loading && (
          <div className="filter-card p-12 text-center">
            <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#00C98D' }} />
            <p className="font-medium" style={{ color: '#2F3E3A' }}>Memproses data laporan...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && reportData === null && selectedKelas && (
          <div className="filter-card p-6 flex items-start gap-4" style={{ border: '1px solid #FED7AA', background: '#FEFCE8' }}>
            <AlertTriangle className="flex-shrink-0 mt-1" size={24} style={{ color: '#D97706' }} />
            <div>
              <h3 className="font-semibold" style={{ color: '#92400E' }}>Perhatian</h3>
              <p className="text-sm mt-1" style={{ color: '#B45309' }}>
                Tidak ada data kehadiran untuk periode yang dipilih. Coba ubah filter atau periode tanggal.
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!reportData && !loading && !selectedKelas && (
          <div className="preview-empty text-center">
            <FileText size={48} className="mx-auto mb-4" style={{ color: '#00C98D', opacity: 0.9 }} />
            <p style={{ color: '#6B7E75', fontSize: '15px' }}>
              Pilih kelas dan klik 'Tampilkan Laporan' untuk melihat laporan kehadiran
            </p>
          </div>
        )}

        {/* Report Preview */}
        {reportData && !loading && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="filter-card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg" style={{ background: '#F3FCF8' }}>
                    <Users size={28} style={{ color: '#00C98D' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Jumlah Siswa</p>
                    <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.jumlahSiswa}</p>
                  </div>
                </div>
              </div>
              <div className="filter-card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg" style={{ background: '#FFE7C2' }}>
                    <Activity size={28} style={{ color: '#F9844A' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Total Pertemuan</p>
                    <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.totalPertemuan}</p>
                  </div>
                </div>
              </div>
              <div className="filter-card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg" style={{ background: '#F3FCF8' }}>
                    <TrendingUp size={28} style={{ color: '#00C98D' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Rata-rata Kehadiran</p>
                    <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.rataKehadiran}%</p>
                  </div>
                </div>
              </div>
              <div className="filter-card p-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-lg" style={{ background: '#FFE7C2' }}>
                    <TrendingUp size={28} style={{ color: '#F9844A' }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: '#6B7E75' }}>Persentase Hadir</p>
                    <p className="text-2xl font-bold" style={{ color: '#2F3E3A' }}>{reportData.summary.persenHadir}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Table */}
            <div className="filter-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ background: '#F3FCF8', borderBottom: '2px solid #DDE6E1' }}>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>No</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Nama Siswa</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>NISN</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Hadir</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Izin</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Sakit</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Alpa</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Total</th>
                      <th className="px-6 py-3 text-left text-xs font-bold uppercase" style={{ color: '#2F3E3A', borderBottom: '1px solid #DDE6E1' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '2px solid #DDE6E1' }}>
                    {reportData.siswaData.map((siswa, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #DDE6E1' }}>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{idx + 1}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nama}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.nisn}</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.hadir} ({siswa.persenHadir}%)</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.izin} ({siswa.persenIzin}%)</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.sakit} ({siswa.persenSakit}%)</td>
                        <td className="px-6 py-4 text-sm" style={{ color: '#2F3E3A' }}>{siswa.alpa} ({siswa.persenAlpa}%)</td>
                        <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#2F3E3A' }}>{siswa.totalKehadiran}%</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                            background: siswa.status === 'Sangat Baik' ? '#D4F8E8' : siswa.status === 'Baik' ? '#FFF4E6' : siswa.status === 'Cukup' ? '#FFF4E6' : '#FEE2E2',
                            color: siswa.status === 'Sangat Baik' ? '#00A57A' : siswa.status === 'Baik' ? '#D97706' : siswa.status === 'Cukup' ? '#D97706' : '#DC2626'
                          }}>
                            {siswa.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Export Buttons */}
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
        </div>
      </div>
    </AdminLayout>
  );
}
