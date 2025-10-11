'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LaporanKehadiranPage() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [filterType, setFilterType] = useState('range'); // 'range' or 'monthly'
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [bulan, setBulan] = useState('');
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

    if (filterType === 'monthly') {
      if (!selectedKelas || !bulan || !tahun) {
        toast({
          title: 'Error',
          description: 'Mohon lengkapi semua filter (kelas, bulan, tahun)',
          variant: 'destructive',
        });
        return;
      }

      // Calculate first and last day of selected month
      const monthNum = parseInt(bulan);
      const yearNum = parseInt(tahun);
      startDate = new Date(yearNum, monthNum - 1, 1).toISOString().split('T')[0];
      endDate = new Date(yearNum, monthNum, 0).toISOString().split('T')[0];
    } else {
      if (!selectedKelas || !tanggalMulai || !tanggalSelesai) {
        toast({
          title: 'Error',
          description: 'Mohon lengkapi semua filter',
          variant: 'destructive',
        });
        return;
      }

      if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
        toast({
          title: 'Error',
          description: 'Tanggal mulai tidak boleh lebih dari tanggal selesai',
          variant: 'destructive',
        });
        return;
      }

      startDate = tanggalMulai;
      endDate = tanggalSelesai;
    }

    setLoading(true);
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
        toast({
          title: 'Berhasil',
          description: 'Laporan berhasil dibuat',
        });
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.error || 'Gagal membuat laporan',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat membuat laporan',
        variant: 'destructive',
      });
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
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Laporan Kehadiran</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Generate dan download laporan kehadiran tahfidz
            </p>
          </div>
        </div>

        {/* Filter Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="filterType">Tipe Filter</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="range">Range Tanggal</SelectItem>
                    <SelectItem value="monthly">Bulanan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kelas" />
                </SelectTrigger>
                <SelectContent>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filterType === 'range' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tanggalMulai">Tanggal Mulai</Label>
                  <input
                    type="date"
                    id="tanggalMulai"
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                  <input
                    type="date"
                    id="tanggalSelesai"
                    value={tanggalSelesai}
                    onChange={(e) => setTanggalSelesai(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bulan">Bulan</Label>
                  <Select value={bulan} onValueChange={setBulan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bulan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Januari</SelectItem>
                      <SelectItem value="2">Februari</SelectItem>
                      <SelectItem value="3">Maret</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">Mei</SelectItem>
                      <SelectItem value="6">Juni</SelectItem>
                      <SelectItem value="7">Juli</SelectItem>
                      <SelectItem value="8">Agustus</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">Oktober</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">Desember</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tahun">Tahun</Label>
                  <Select value={tahun} onValueChange={setTahun}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleGenerateReport} disabled={loading}>
              <FileText className="w-4 h-4 mr-2" />
              {loading ? 'Memuat...' : 'Tampilkan Laporan'}
            </Button>
            {reportData && (
              <Button onClick={exportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Statistik</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {reportData.summary.jumlahSiswa}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jumlah Siswa</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {reportData.summary.totalPertemuan}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Pertemuan</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {reportData.summary.rataKehadiran}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Rata-rata Kehadiran</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {reportData.summary.persenHadir}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Persentase Hadir</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {reportData.summary.persenIzin}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Izin</div>
                </div>
                <div className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                    {reportData.summary.persenSakit}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sakit</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {reportData.summary.persenAlpa}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Alpa</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Kehadiran Siswa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">No</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Nama Siswa</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">NISN</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Hadir</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Izin</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Sakit</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Alpa</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Total</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.siswaData.map((siswa, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {siswa.nama}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                          {siswa.nisn}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {siswa.hadir} ({siswa.persenHadir}%)
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {siswa.izin} ({siswa.persenIzin}%)
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {siswa.sakit} ({siswa.persenSakit}%)
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          {siswa.alpa} ({siswa.persenAlpa}%)
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center font-semibold">
                          {siswa.totalKehadiran}%
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              siswa.status === 'Sangat Baik'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : siswa.status === 'Baik'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : siswa.status === 'Cukup'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            {siswa.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      </div>
    </AdminLayout>
  );
}
