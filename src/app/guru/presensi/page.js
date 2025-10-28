'use client';

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import {
  CalendarCheck2,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  XCircle,
  Calendar,
  Printer,
  ChevronDown,
  FileText,
  Download,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Data Dummy Kelas
const kelasList = [
  { id: 'x-a1', nama: 'X A1' },
  { id: 'x-a2', nama: 'X A2' },
  { id: 'xi-a1', nama: 'XI A1' },
  { id: 'xi-a2', nama: 'XI A2' },
  { id: 'xii-a1', nama: 'XII A1' },
  { id: 'xii-a2', nama: 'XII A2' },
];

// Data Dummy Siswa per Kelas
const mockSiswaByKelas = {
  'x-a1': [
    { id: 1, nama: 'Ahmad Fauzan', nis: '2024001' },
    { id: 2, nama: 'Fatimah Zahra', nis: '2024002' },
    { id: 3, nama: 'Muhammad Rizki', nis: '2024003' },
    { id: 4, nama: 'Aisyah Nur Halimah', nis: '2024004' },
    { id: 5, nama: 'Abdullah Rahman', nis: '2024005' },
    { id: 6, nama: 'Zainab Husna', nis: '2024006' },
    { id: 7, nama: 'Hasan Basri', nis: '2024007' },
  ],
  'x-a2': [
    { id: 8, nama: 'Khadijah Amira', nis: '2024008' },
    { id: 9, nama: 'Ali Akbar', nis: '2024009' },
    { id: 10, nama: 'Maryam Siddiq', nis: '2024010' },
  ],
  'xi-a1': [
    { id: 11, nama: 'Ibrahim Khalil', nis: '2024011' },
    { id: 12, nama: 'Aminah Zahra', nis: '2024012' },
    { id: 13, nama: 'Yusuf Hakim', nis: '2024013' },
  ],
  'xi-a2': [
    { id: 14, nama: 'Ruqayyah Maryam', nis: '2024014' },
    { id: 15, nama: 'Umar Faruq', nis: '2024015' },
  ],
  'xii-a1': [
    { id: 16, nama: 'Hafshah Aisyah', nis: '2024016' },
    { id: 17, nama: 'Bilal Hassan', nis: '2024017' },
  ],
  'xii-a2': [
    { id: 18, nama: 'Salsabil Zahra', nis: '2024018' },
    { id: 19, nama: 'Salman Alfarisi', nis: '2024019' },
  ],
};

export default function PresensiPage() {
  const [kelasId, setKelasId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [presensiData, setPresensiData] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showPrintDropdown, setShowPrintDropdown] = useState(false);

  // Load presensi dari localStorage saat komponen mount atau saat data loaded berubah
  useEffect(() => {
    if (kelasId && tanggal && isDataLoaded) {
      loadPresensiFromStorage();
    }
  }, [kelasId, tanggal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPrintDropdown && !event.target.closest('[data-dropdown]')) {
        setShowPrintDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPrintDropdown]);

  const loadPresensiFromStorage = () => {
    const storageKey = `presensi_${kelasId}_${tanggal}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setPresensiData(parsedData);
      } catch (e) {
        console.error('Error loading presensi:', e);
      }
    }
  };

  const handleTampilkanData = () => {
    if (!kelasId) {
      toast.error('Pilih kelas terlebih dahulu!');
      return;
    }

    const siswaList = mockSiswaByKelas[kelasId] || [];

    // Coba load dari localStorage dulu
    const storageKey = `presensi_${kelasId}_${tanggal}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setPresensiData(parsedData);
        setIsDataLoaded(true);
        toast.success('Data presensi berhasil dimuat!');
        return;
      } catch (e) {
        console.error('Error loading presensi:', e);
      }
    }

    // Jika tidak ada di localStorage, buat data baru dengan status default 'hadir'
    const newData = siswaList.map((siswa) => ({
      siswaId: siswa.id,
      nama: siswa.nama,
      nis: siswa.nis,
      status: 'hadir',
      catatan: '',
    }));

    setPresensiData(newData);
    setIsDataLoaded(true);
    toast.success('Data presensi berhasil ditampilkan!');
  };

  const handleStatusChange = (siswaId, newStatus) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId ? { ...item, status: newStatus } : item
      )
    );
  };

  const handleCatatanChange = (siswaId, catatan) => {
    setPresensiData((prev) =>
      prev.map((item) =>
        item.siswaId === siswaId ? { ...item, catatan } : item
      )
    );
  };

  const handleSimpanPresensi = () => {
    if (!kelasId || presensiData.length === 0) {
      toast.error('Tidak ada data untuk disimpan!');
      return;
    }

    const storageKey = `presensi_${kelasId}_${tanggal}`;
    localStorage.setItem(storageKey, JSON.stringify(presensiData));

    // Simpan juga ke history
    const historyKey = 'presensi_history';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

    const kelasNama = kelasList.find(k => k.id === kelasId)?.nama || kelasId;

    const newEntry = {
      kelas: kelasId,
      kelasNama,
      tanggal,
      timestamp: new Date().toISOString(),
      totalSiswa: presensiData.length,
    };

    // Cek apakah sudah ada entry untuk kelas dan tanggal yang sama
    const existingIndex = history.findIndex(
      (h) => h.kelas === kelasId && h.tanggal === tanggal
    );

    if (existingIndex >= 0) {
      history[existingIndex] = newEntry;
    } else {
      history.push(newEntry);
    }

    localStorage.setItem(historyKey, JSON.stringify(history));

    toast.success('✅ Data presensi berhasil disimpan!', {
      duration: 3000,
      style: {
        background: '#ECFDF5',
        color: '#059669',
        border: '1px solid #A7F3D0',
      },
    });
  };

  // Shortcut: Tandai Semua Hadir
  const handleTandaiSemuaHadir = () => {
    if (presensiData.length === 0) {
      toast.error('Tidak ada data untuk ditandai!');
      return;
    }
    setPresensiData((prev) =>
      prev.map((item) => ({ ...item, status: 'hadir' }))
    );
    toast.success('✅ Semua siswa ditandai HADIR');
  };

  // Print Rekap Harian
  const handlePrintHarian = () => {
    if (!kelasId || presensiData.length === 0) {
      toast.error('Tidak ada data untuk dicetak!');
      return;
    }

    const kelasNama = kelasList.find(k => k.id === kelasId)?.nama || kelasId;
    const tanggalFormatted = new Date(tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const getStatusBadge = (status) => {
      const badges = {
        hadir: { text: 'Hadir', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' },
        izin: { text: 'Izin', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
        sakit: { text: 'Sakit', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
        alfa: { text: 'Alfa', bg: '#FEE2E2', color: '#B91C1C', border: '#FECACA' },
      };
      return badges[status] || badges.hadir;
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Presensi Harian - ${kelasNama}</title>
        <style>
          @page {
            margin: 2cm 1.5cm;
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #1F2937;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #059669;
          }
          .header h1 {
            color: #059669;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            font-family: 'Poppins', sans-serif;
          }
          .header .subtitle {
            color: #6B7280;
            font-size: 14px;
          }
          .info-box {
            background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
            border: 1.5px solid #A7F3D0;
            border-radius: 10px;
            padding: 16px 20px;
            margin-bottom: 24px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .info-item {
            font-size: 13px;
          }
          .info-item strong {
            color: #059669;
            font-weight: 600;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            color: #065F46;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 14px 12px;
            text-align: left;
            border: 1px solid #A7F3D0;
          }
          th.center {
            text-align: center;
          }
          td {
            padding: 12px;
            border: 1px solid #E5E7EB;
            font-size: 13px;
          }
          td.center {
            text-align: center;
          }
          tr:nth-child(even) {
            background: #FAFBFC;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            border: 1.5px solid;
          }
          .summary {
            background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
            border: 1.5px solid #FDE68A;
            border-radius: 10px;
            padding: 16px 20px;
            margin: 24px 0;
          }
          .summary h3 {
            color: #D97706;
            font-size: 15px;
            font-weight: 700;
            margin-bottom: 12px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            text-align: center;
          }
          .summary-item {
            font-size: 12px;
          }
          .summary-value {
            font-size: 20px;
            font-weight: 700;
            color: #D97706;
            display: block;
            margin-bottom: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
            color: #9CA3AF;
            font-size: 11px;
          }
          .signature {
            margin-top: 50px;
            text-align: right;
          }
          .signature-line {
            width: 200px;
            border-top: 1.5px solid #374151;
            margin: 60px 0 8px auto;
          }
          .signature p {
            font-size: 13px;
            color: #374151;
          }
          @media print {
            body {
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Laporan Presensi Harian</h1>
          <p class="subtitle">Aplikasi Tahfidz Al-Qur'an</p>
        </div>

        <div class="info-box">
          <div class="info-item"><strong>Kelas:</strong> ${kelasNama}</div>
          <div class="info-item"><strong>Tanggal:</strong> ${tanggalFormatted}</div>
          <div class="info-item"><strong>Total Siswa:</strong> ${presensiData.length} siswa</div>
          <div class="info-item"><strong>Dicetak:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="center" style="width: 50px;">No</th>
              <th>Nama Siswa</th>
              <th class="center" style="width: 100px;">NIS</th>
              <th class="center" style="width: 120px;">Status Kehadiran</th>
              <th style="width: 250px;">Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${presensiData.map((item, index) => {
              const badge = getStatusBadge(item.status);
              return `
                <tr>
                  <td class="center">${index + 1}</td>
                  <td><strong>${item.nama}</strong></td>
                  <td class="center">${item.nis}</td>
                  <td class="center">
                    <span class="status-badge" style="background: ${badge.bg}; color: ${badge.color}; border-color: ${badge.border};">
                      ${badge.text}
                    </span>
                  </td>
                  <td>${item.catatan || '-'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="summary">
          <h3>📊 Ringkasan Kehadiran</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-value">${stats.total}</span>
              <span>Total Siswa</span>
            </div>
            <div class="summary-item">
              <span class="summary-value" style="color: #059669;">${stats.hadir}</span>
              <span>Hadir</span>
            </div>
            <div class="summary-item">
              <span class="summary-value" style="color: #D97706;">${stats.izin}</span>
              <span>Izin</span>
            </div>
            <div class="summary-item">
              <span class="summary-value" style="color: #1D4ED8;">${stats.sakit}</span>
              <span>Sakit</span>
            </div>
            <div class="summary-item">
              <span class="summary-value" style="color: #B91C1C;">${stats.alfa}</span>
              <span>Alfa</span>
            </div>
          </div>
        </div>

        <div class="signature">
          <p>Guru Pembimbing,</p>
          <div class="signature-line"></div>
          <p>( .............................. )</p>
        </div>

        <div class="footer">
          <p>Dokumen ini dibuat secara otomatis oleh Aplikasi Tahfidz Al-Qur'an</p>
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);

    toast.success('🖨️ Preview cetak dibuka!');
    setShowPrintDropdown(false);
  };

  // Print Rekap Bulanan
  const handlePrintBulanan = () => {
    if (!kelasId) {
      toast.error('Pilih kelas terlebih dahulu!');
      return;
    }

    const kelasNama = kelasList.find(k => k.id === kelasId)?.nama || kelasId;
    const bulanTahun = new Date(tanggal).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric'
    });

    // Get bulan dan tahun dari tanggal yang dipilih
    const selectedDate = new Date(tanggal);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Hitung jumlah hari dalam bulan
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const siswaList = mockSiswaByKelas[kelasId] || [];

    // Build rekap bulanan data
    const rekapBulanan = siswaList.map(siswa => {
      const siswaPresensi = {};
      let countHadir = 0, countIzin = 0, countSakit = 0, countAlfa = 0;

      // Loop untuk setiap hari dalam bulan
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const storageKey = `presensi_${kelasId}_${dateKey}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            const siswaData = parsedData.find(p => p.siswaId === siswa.id);

            if (siswaData) {
              const status = siswaData.status;
              siswaPresensi[day] = status;

              if (status === 'hadir') countHadir++;
              else if (status === 'izin') countIzin++;
              else if (status === 'sakit') countSakit++;
              else if (status === 'alfa') countAlfa++;
            }
          } catch (e) {
            console.error('Error parsing:', e);
          }
        }
      }

      return {
        nama: siswa.nama,
        nis: siswa.nis,
        presensi: siswaPresensi,
        hadir: countHadir,
        izin: countIzin,
        sakit: countSakit,
        alfa: countAlfa,
      };
    });

    // Hitung persentase kehadiran
    const totalHadir = rekapBulanan.reduce((sum, s) => sum + s.hadir, 0);
    const totalPossible = siswaList.length * daysInMonth;
    const persentaseKehadiran = totalPossible > 0 ? ((totalHadir / totalPossible) * 100).toFixed(1) : 0;

    const getStatusInitial = (status) => {
      const initials = {
        hadir: { text: 'H', color: '#059669', bg: '#ECFDF5' },
        izin: { text: 'I', color: '#D97706', bg: '#FFFBEB' },
        sakit: { text: 'S', color: '#1D4ED8', bg: '#EFF6FF' },
        alfa: { text: 'A', color: '#B91C1C', bg: '#FEE2E2' },
      };
      return initials[status] || { text: '-', color: '#9CA3AF', bg: '#F9FAFB' };
    };

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Presensi Bulanan - ${kelasNama}</title>
        <style>
          @page {
            margin: 1.5cm 1cm;
            size: A4 landscape;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #1F2937;
            background: white;
            font-size: 10px;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #059669;
          }
          .header h1 {
            color: #059669;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .header .subtitle {
            color: #6B7280;
            font-size: 11px;
          }
          .info-box {
            background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
            border: 1px solid #A7F3D0;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 16px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
          }
          .info-item {
            font-size: 11px;
          }
          .info-item strong {
            color: #059669;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          th {
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            color: #065F46;
            font-weight: 700;
            font-size: 9px;
            text-transform: uppercase;
            padding: 8px 4px;
            text-align: center;
            border: 1px solid #A7F3D0;
          }
          th.nama {
            text-align: left;
            padding-left: 8px;
          }
          td {
            padding: 6px 4px;
            border: 1px solid #E5E7EB;
            font-size: 10px;
            text-align: center;
          }
          td.nama {
            text-align: left;
            padding-left: 8px;
          }
          tr:nth-child(even) {
            background: #FAFBFC;
          }
          .status-cell {
            font-weight: 700;
            font-size: 9px;
            padding: 4px;
          }
          .summary {
            background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
            border: 1px solid #FDE68A;
            border-radius: 8px;
            padding: 12px 16px;
            margin-top: 16px;
            font-size: 11px;
          }
          .summary strong {
            color: #D97706;
          }
          .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #E5E7EB;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #9CA3AF;
          }
          @media print {
            body {
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Rekap Presensi Bulanan</h1>
          <p class="subtitle">Aplikasi Tahfidz Al-Qur'an</p>
        </div>

        <div class="info-box">
          <div class="info-item"><strong>Kelas:</strong> ${kelasNama}</div>
          <div class="info-item"><strong>Bulan:</strong> ${bulanTahun}</div>
          <div class="info-item"><strong>Total Siswa:</strong> ${siswaList.length} siswa</div>
          <div class="info-item"><strong>Dicetak:</strong> ${new Date().toLocaleDateString('id-ID')}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th class="nama" style="width: 150px;">Nama Siswa</th>
              ${Array.from({ length: daysInMonth }, (_, i) => `<th style="width: 20px;">${i + 1}</th>`).join('')}
              <th style="width: 35px; background: #ECFDF5;">H</th>
              <th style="width: 35px; background: #FFFBEB;">I</th>
              <th style="width: 35px; background: #EFF6FF;">S</th>
              <th style="width: 35px; background: #FEE2E2;">A</th>
            </tr>
          </thead>
          <tbody>
            ${rekapBulanan.map((siswa, index) => `
              <tr>
                <td>${index + 1}</td>
                <td class="nama"><strong>${siswa.nama}</strong></td>
                ${Array.from({ length: daysInMonth }, (_, day) => {
                  const status = siswa.presensi[day + 1];
                  const initial = getStatusInitial(status);
                  return `<td class="status-cell" style="background: ${initial.bg}; color: ${initial.color};">${initial.text}</td>`;
                }).join('')}
                <td style="font-weight: 700; color: #059669;">${siswa.hadir}</td>
                <td style="font-weight: 700; color: #D97706;">${siswa.izin}</td>
                <td style="font-weight: 700; color: #1D4ED8;">${siswa.sakit}</td>
                <td style="font-weight: 700; color: #B91C1C;">${siswa.alfa}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <strong>Keterangan:</strong> H = Hadir, I = Izin, S = Sakit, A = Alfa  |
          <strong>Rata-rata Kehadiran Kelas:</strong> ${persentaseKehadiran}%
        </div>

        <div class="footer">
          <div>Aplikasi Tahfidz Al-Qur'an • ${new Date().toLocaleString('id-ID')}</div>
          <div>Guru Pembimbing: ________________</div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 250);

    toast.success('🖨️ Preview rekap bulanan dibuka!');
    setShowPrintDropdown(false);
  };

  // Calculate statistics
  const stats = {
    total: presensiData.length,
    hadir: presensiData.filter((p) => p.status === 'hadir').length,
    izin: presensiData.filter((p) => p.status === 'izin').length,
    sakit: presensiData.filter((p) => p.status === 'sakit').length,
    alfa: presensiData.filter((p) => p.status === 'alfa').length,
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      {/* Background Gradient Container */}
      <div
        className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50"
        style={{ margin: '-32px', padding: '32px' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
              }}
            >
              <CalendarCheck2 size={28} style={{ color: 'white' }} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#065F46',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '-0.5px',
                }}
              >
                Presensi Siswa
              </h1>
              <p
                style={{
                  margin: 0,
                  color: '#6B7280',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Catat kehadiran siswa setiap hari
              </p>
            </div>
          </div>
        </div>

        {/* Filter Form */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            marginBottom: '28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid rgba(5, 150, 105, 0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '20px',
            }}
          >
            {/* Pilih Kelas */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pilih Kelas
              </label>
              <select
                value={kelasId}
                onChange={(e) => {
                  setKelasId(e.target.value);
                  setIsDataLoaded(false);
                  setPresensiData([]);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#059669')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              >
                <option value="">-- Pilih Kelas --</option>
                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    Kelas {kelas.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* Tanggal */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => {
                  setTanggal(e.target.value);
                  setIsDataLoaded(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1.5px solid #E5E7EB',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#059669')}
                onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleTampilkanData}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.2)';
              }}
            >
              Tampilkan Data
            </button>

            <button
              onClick={handleSimpanPresensi}
              disabled={presensiData.length === 0}
              style={{
                padding: '12px 24px',
                background:
                  presensiData.length === 0
                    ? '#E5E7EB'
                    : 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                color: presensiData.length === 0 ? '#9CA3AF' : 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: presensiData.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow:
                  presensiData.length === 0
                    ? 'none'
                    : '0 2px 8px rgba(251, 191, 36, 0.2)',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (presensiData.length > 0) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (presensiData.length > 0) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.2)';
                }
              }}
            >
              Simpan Presensi
            </button>

            {/* Print Rekap Button with Dropdown */}
            <div style={{ position: 'relative' }} data-dropdown>
              <button
                onClick={() => setShowPrintDropdown(!showPrintDropdown)}
                disabled={!kelasId}
                style={{
                  padding: '12px 24px',
                  background:
                    !kelasId
                      ? '#E5E7EB'
                      : 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
                  color: !kelasId ? '#9CA3AF' : 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !kelasId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: !kelasId ? 'none' : '0 2px 8px rgba(14, 165, 233, 0.2)',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  if (kelasId) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (kelasId) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(14, 165, 233, 0.2)';
                  }
                }}
              >
                <Printer size={18} />
                Print Rekap
                <ChevronDown size={16} />
              </button>

              {/* Dropdown Menu */}
              {showPrintDropdown && kelasId && (
                <div
                  style={{
                    position: 'absolute',
                    top: '60px',
                    left: 0,
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #E5E7EB',
                    minWidth: '260px',
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                      borderBottom: '1px solid #BAE6FD',
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#075985',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    >
                      Pilih Tipe Rekap
                    </p>
                  </div>

                  {/* Option 1: Rekap Harian */}
                  <button
                    onClick={handlePrintHarian}
                    disabled={presensiData.length === 0}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: 'none',
                      borderBottom: '1px solid #F3F4F6',
                      textAlign: 'left',
                      cursor: presensiData.length === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: presensiData.length === 0 ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (presensiData.length > 0) {
                        e.target.style.background = '#F0F9FF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <FileText size={20} style={{ color: '#059669', marginTop: '2px' }} />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1F2937',
                            fontFamily: 'Inter, sans-serif',
                            marginBottom: '4px',
                          }}
                        >
                          📋 Rekap Harian
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#6B7280',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Cetak presensi untuk tanggal tertentu
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Rekap Bulanan */}
                  <button
                    onClick={handlePrintBulanan}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'white',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#F0F9FF';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'white';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <Calendar size={20} style={{ color: '#D97706', marginTop: '2px' }} />
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1F2937',
                            fontFamily: 'Inter, sans-serif',
                            marginBottom: '4px',
                          }}
                        >
                          📅 Rekap Bulanan
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#6B7280',
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          Cetak rekap kehadiran per bulan
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {isDataLoaded && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '28px',
            }}
          >
            {/* Total Siswa */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #A7F3D0',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(5, 150, 105, 0.2)',
                  }}
                >
                  <Users size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#047857',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Total Siswa
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#059669',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Hadir */}
            <div
              style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #86EFAC',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <UserCheck size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#047857',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Hadir
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#10B981',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {stats.hadir}
                  </p>
                </div>
              </div>
            </div>

            {/* Izin */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #FDE68A',
                boxShadow: '0 2px 6px rgba(251, 191, 36, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(251, 191, 36, 0.2)',
                  }}
                >
                  <Clock size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#D97706',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Izin
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#FBBF24',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {stats.izin}
                  </p>
                </div>
              </div>
            </div>

            {/* Sakit */}
            <div
              style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #BFDBFE',
                boxShadow: '0 2px 6px rgba(59, 130, 246, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(59, 130, 246, 0.2)',
                  }}
                >
                  <AlertCircle size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#1D4ED8',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Sakit
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#3B82F6',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {stats.sakit}
                  </p>
                </div>
              </div>
            </div>

            {/* Alfa */}
            <div
              style={{
                background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                borderRadius: '14px',
                padding: '20px',
                border: '1px solid #FCA5A5',
                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <XCircle size={22} style={{ color: 'white' }} />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      color: '#B91C1C',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    Alfa
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '28px',
                      fontWeight: '700',
                      color: '#EF4444',
                      fontFamily: 'Poppins, sans-serif',
                    }}
                  >
                    {stats.alfa}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shortcut Button: Tandai Semua Hadir */}
        {isDataLoaded && presensiData.length > 0 && (
          <div
            style={{
              background: 'white',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '28px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              border: '1px solid rgba(5, 150, 105, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: '#6B7280',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              💡 <strong style={{ color: '#374151' }}>Tips:</strong> Gunakan tombol "Tandai Semua
              Hadir" untuk kelas besar
            </p>
            <button
              onClick={handleTandaiSemuaHadir}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                color: '#059669',
                border: '1.5px solid #A7F3D0',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)';
                e.target.style.borderColor = '#6EE7B7';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)';
                e.target.style.borderColor = '#A7F3D0';
              }}
            >
              ✅ Tandai Semua Hadir
            </button>
          </div>
        )}

        {/* Table Presensi */}
        {isDataLoaded ? (
          presensiData.length > 0 ? (
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
                border: '1px solid rgba(5, 150, 105, 0.08)',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr
                      style={{
                        background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                        borderBottom: '2px solid #E5E7EB',
                      }}
                    >
                      <th
                        style={{
                          padding: '16px 14px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#374151',
                          width: '60px',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        No
                      </th>
                      <th
                        style={{
                          padding: '16px 14px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#374151',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Nama Siswa
                      </th>
                      <th
                        style={{
                          padding: '16px 14px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#374151',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          minWidth: '400px',
                        }}
                      >
                        Status Kehadiran
                      </th>
                      <th
                        style={{
                          padding: '16px 14px',
                          textAlign: 'left',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#374151',
                          fontFamily: 'Inter, sans-serif',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {presensiData.map((item, index) => {
                      const isEven = index % 2 === 0;

                      return (
                        <tr
                          key={item.siswaId}
                          style={{
                            background: isEven ? '#FAFBFC' : 'white',
                            borderBottom: '1px solid #F3F4F6',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#F0FDF4';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isEven ? '#FAFBFC' : 'white';
                          }}
                        >
                          <td
                            style={{
                              padding: '16px 14px',
                              textAlign: 'center',
                              fontSize: '14px',
                              color: '#6B7280',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {index + 1}
                          </td>
                          <td
                            style={{
                              padding: '16px 14px',
                              fontSize: '15px',
                              color: '#1F2937',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontWeight: '600' }}>{item.nama}</span>
                              <span style={{ fontSize: '13px', color: '#9CA3AF' }}>
                                NIS: {item.nis}
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 14px' }}>
                            <div
                              style={{
                                display: 'flex',
                                gap: '16px',
                                justifyContent: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              {/* Hadir */}
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s',
                                  background:
                                    item.status === 'hadir'
                                      ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)'
                                      : 'transparent',
                                  border:
                                    item.status === 'hadir' ? '1.5px solid #A7F3D0' : '1.5px solid transparent',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.siswaId}`}
                                  value="hadir"
                                  checked={item.status === 'hadir'}
                                  onChange={(e) => handleStatusChange(item.siswaId, e.target.value)}
                                  style={{
                                    cursor: 'pointer',
                                    accentColor: '#10B981',
                                    width: '18px',
                                    height: '18px',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: item.status === 'hadir' ? '600' : '500',
                                    color: item.status === 'hadir' ? '#059669' : '#6B7280',
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  ✅ Hadir
                                </span>
                              </label>

                              {/* Izin */}
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s',
                                  background:
                                    item.status === 'izin'
                                      ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)'
                                      : 'transparent',
                                  border:
                                    item.status === 'izin' ? '1.5px solid #FDE68A' : '1.5px solid transparent',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.siswaId}`}
                                  value="izin"
                                  checked={item.status === 'izin'}
                                  onChange={(e) => handleStatusChange(item.siswaId, e.target.value)}
                                  style={{
                                    cursor: 'pointer',
                                    accentColor: '#FBBF24',
                                    width: '18px',
                                    height: '18px',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: item.status === 'izin' ? '600' : '500',
                                    color: item.status === 'izin' ? '#D97706' : '#6B7280',
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  🟡 Izin
                                </span>
                              </label>

                              {/* Sakit */}
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s',
                                  background:
                                    item.status === 'sakit'
                                      ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                                      : 'transparent',
                                  border:
                                    item.status === 'sakit' ? '1.5px solid #BFDBFE' : '1.5px solid transparent',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.siswaId}`}
                                  value="sakit"
                                  checked={item.status === 'sakit'}
                                  onChange={(e) => handleStatusChange(item.siswaId, e.target.value)}
                                  style={{
                                    cursor: 'pointer',
                                    accentColor: '#3B82F6',
                                    width: '18px',
                                    height: '18px',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: item.status === 'sakit' ? '600' : '500',
                                    color: item.status === 'sakit' ? '#1D4ED8' : '#6B7280',
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  🔵 Sakit
                                </span>
                              </label>

                              {/* Alfa */}
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  transition: 'all 0.2s',
                                  background:
                                    item.status === 'alfa'
                                      ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
                                      : 'transparent',
                                  border:
                                    item.status === 'alfa' ? '1.5px solid #FCA5A5' : '1.5px solid transparent',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${item.siswaId}`}
                                  value="alfa"
                                  checked={item.status === 'alfa'}
                                  onChange={(e) => handleStatusChange(item.siswaId, e.target.value)}
                                  style={{
                                    cursor: 'pointer',
                                    accentColor: '#EF4444',
                                    width: '18px',
                                    height: '18px',
                                  }}
                                />
                                <span
                                  style={{
                                    fontSize: '14px',
                                    fontWeight: item.status === 'alfa' ? '600' : '500',
                                    color: item.status === 'alfa' ? '#B91C1C' : '#6B7280',
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  🔴 Alfa
                                </span>
                              </label>
                            </div>
                          </td>
                          <td style={{ padding: '16px 14px' }}>
                            <input
                              type="text"
                              value={item.catatan}
                              onChange={(e) => handleCatatanChange(item.siswaId, e.target.value)}
                              placeholder="Tambahkan catatan..."
                              style={{
                                width: '100%',
                                padding: '10px 14px',
                                border: '1.5px solid #E5E7EB',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                transition: 'all 0.2s',
                              }}
                              onFocus={(e) => {
                                e.target.style.borderColor = '#059669';
                                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.08)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#E5E7EB';
                                e.target.style.boxShadow = 'none';
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '80px 20px',
                textAlign: 'center',
                border: '2px dashed #E5E7EB',
              }}
            >
              <Users size={64} style={{ color: '#D1D5DB', margin: '0 auto 20px' }} />
              <p
                style={{
                  fontSize: '18px',
                  color: '#6B7280',
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Tidak ada siswa di kelas ini
              </p>
            </div>
          )
        ) : (
          <div
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
              borderRadius: '16px',
              padding: '80px 20px',
              textAlign: 'center',
              border: '2px dashed #D1D5DB',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}
          >
            <Calendar size={64} style={{ color: '#9CA3AF', margin: '0 auto 20px' }} />
            <p
              style={{
                fontSize: '18px',
                color: '#374151',
                margin: '0 0 8px 0',
                fontWeight: '600',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              📄 Belum ada data presensi
            </p>
            <p
              style={{
                fontSize: '15px',
                color: '#9CA3AF',
                margin: 0,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Pilih kelas dan tanggal untuk mulai mencatat kehadiran.
            </p>
          </div>
        )}
      </div>
    </GuruLayout>
  );
}
