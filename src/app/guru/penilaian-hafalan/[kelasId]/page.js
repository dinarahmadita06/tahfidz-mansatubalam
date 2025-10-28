'use client';

import { useState, useEffect, useRef } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Printer,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileText,
  TrendingUp,
  Award,
  Star,
  Mic,
  ArrowLeft,
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

// Helper function untuk menangani NaN
const safeValue = (value) => {
  // Jika null, undefined, NaN, atau empty string, return kosong (tampilkan "-")
  if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) return '';
  // Kembalikan nilai aslinya (termasuk 0 jika ada)
  return value;
};

const safeNumber = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return num;
};

// Daftar 114 Surah Al-Quran
const surahList = [
  'Al-Fatihah', 'Al-Baqarah', 'Ali Imran', 'An-Nisa', 'Al-Ma\'idah',
  'Al-An\'am', 'Al-A\'raf', 'Al-Anfal', 'At-Taubah', 'Yunus',
  'Hud', 'Yusuf', 'Ar-Ra\'d', 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Taha',
  'Al-Anbiya', 'Al-Hajj', 'Al-Mu\'minun', 'An-Nur', 'Al-Furqan',
  'Asy-Syu\'ara', 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba\'', 'Fatir',
  'Yasin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Asy-Syura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jasiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Az-Zariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  'Al-Waqi\'ah', 'Al-Hadid', 'Al-Mujadilah', 'Al-Hasyr', 'Al-Mumtahanah',
  'As-Saff', 'Al-Jumu\'ah', 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', 'Al-Ma\'arij',
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddassir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', 'An-Naba', 'An-Nazi\'at', 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Insyiqaq', 'Al-Buruj',
  'At-Tariq', 'Al-A\'la', 'Al-Ghasyiyah', 'Al-Fajr', 'Al-Balad',
  'Asy-Syams', 'Al-Lail', 'Ad-Duha', 'Asy-Syarh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  'Al-Qari\'ah', 'At-Takasur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraisy', 'Al-Ma\'un', 'Al-Kausar', 'Al-Kafirun', 'An-Nasr',
  'Al-Lahab', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
];

// Mock Data Siswa per Kelas
const mockSiswaByKelas = {
  'x-a1': [
    { id: 1, nama: 'Ahmad Fauzan' },
    { id: 2, nama: 'Fatimah Zahra' },
    { id: 3, nama: 'Muhammad Rizki' },
  ],
  'x-a2': [
    { id: 4, nama: 'Aisyah Nur' },
    { id: 5, nama: 'Umar Abdullah' },
  ],
  'xi-a1': [
    { id: 6, nama: 'Khadijah Amira' },
    { id: 7, nama: 'Hasan Basri' },
  ],
  'xi-a2': [
    { id: 8, nama: 'Zainab Husna' },
    { id: 9, nama: 'Ali Akbar' },
  ],
  'xii-a1': [
    { id: 10, nama: 'Maryam Siddiq' },
    { id: 11, nama: 'Ibrahim Khalil' },
  ],
  'xii-a2': [
    { id: 12, nama: 'Aminah Zahra' },
    { id: 13, nama: 'Yusuf Hakim' },
  ],
};

// Initial Penilaian Data
const initialPenilaianByKelas = {
  'x-a1': [
    {
      id: 1,
      siswaId: 1,
      namaSiswa: 'Ahmad Fauzan',
      tanggal: '2025-01-15',
      surah: 'Al-Baqarah',
      ayat: '1-5',
      statusHafalan: 'Hafal',
      nilaiTajwid: 90,
      nilaiKelancaran: 88,
      nilaiMakhraj: 92,
      nilaiAdab: 95,
      catatan: 'Sangat baik, pertahankan',
    },
    {
      id: 2,
      siswaId: 2,
      namaSiswa: 'Fatimah Zahra',
      tanggal: '2025-01-14',
      surah: 'Ali Imran',
      ayat: '10-15',
      statusHafalan: 'Hafal',
      nilaiTajwid: 85,
      nilaiKelancaran: 82,
      nilaiMakhraj: 88,
      nilaiAdab: 90,
      catatan: 'Perlu perbaikan di mad lazim',
    },
  ],
  'x-a2': [],
  'xi-a1': [],
  'xi-a2': [],
  'xii-a1': [],
  'xii-a2': [],
};

export default function PenilaianHafalanKelasPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = params.kelasId;

  // Mendapatkan nama kelas dari ID
  const getNamaKelas = (id) => {
    const kelasMap = {
      'x-a1': 'Kelas X A1',
      'x-a2': 'Kelas X A2',
      'xi-a1': 'Kelas XI A1',
      'xi-a2': 'Kelas XI A2',
      'xii-a1': 'Kelas XII A1',
      'xii-a2': 'Kelas XII A2',
    };
    return kelasMap[id] || 'Kelas Tidak Diketahui';
  };

  // State Management
  const [siswaId, setSiswaId] = useState('');
  const isInitialMount = useRef(true);

  const [penilaianList, setPenilaianList] = useState(() => {
    // Load dari localStorage atau fallback ke initial data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('penilaianHafalan');
      if (saved) {
        try {
          const allData = JSON.parse(saved);
          // Cek apakah key kelasId ada (even jika array kosong, tetap gunakan dari localStorage)
          if (allData.hasOwnProperty(kelasId)) {
            console.log(`📖 Loaded ${allData[kelasId].length} penilaian from localStorage for ${kelasId}`);
            return allData[kelasId];
          }
        } catch (e) {
          console.error('❌ Error parsing localStorage:', e);
        }
      }
    }
    // Jika belum ada di localStorage, gunakan initial data
    console.log(`📁 Using initial data for ${kelasId}: ${(initialPenilaianByKelas[kelasId] || []).length} items`);
    return initialPenilaianByKelas[kelasId] || [];
  });
  const [filteredPenilaian, setFilteredPenilaian] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sorting
  const [sortField, setSortField] = useState('tanggal');
  const [sortDirection, setSortDirection] = useState('desc');

  // Form State
  const [formData, setFormData] = useState({
    siswaId: '',
    tanggal: new Date().toISOString().split('T')[0],
    surah: '',
    ayat: '',
    statusHafalan: 'Hafal',
    nilaiTajwid: '',
    nilaiKelancaran: '',
    nilaiMakhraj: '',
    nilaiAdab: '',
    catatan: '',
  });

  const [errors, setErrors] = useState({});

  // State untuk searchable surah
  const [surahQuery, setSurahQuery] = useState('');
  const [showSurahDropdown, setShowSurahDropdown] = useState(false);
  const [isWajibNilai, setIsWajibNilai] = useState(true);

  // Get siswa untuk kelas ini
  const siswaList = mockSiswaByKelas[kelasId] || [];

  // Filter surah berdasarkan query
  const filteredSurahList = surahList.filter(surah =>
    surah.toLowerCase().includes(surahQuery.toLowerCase())
  );

  // Simpan penilaianList ke localStorage setiap kali berubah (kecuali initial mount)
  useEffect(() => {
    // Skip pada initial mount untuk mencegah overwrite localStorage dengan initial data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log('⏭️ Skipping initial save to prevent overwrite');
      return;
    }

    if (typeof window !== 'undefined' && penilaianList !== undefined) {
      const saved = localStorage.getItem('penilaianHafalan');
      const allData = saved ? JSON.parse(saved) : {};
      allData[kelasId] = penilaianList;
      localStorage.setItem('penilaianHafalan', JSON.stringify(allData));
      console.log(`💾 Saved ${penilaianList.length} penilaian to localStorage for ${kelasId}`);
    }
  }, [penilaianList, kelasId]);

  // Effect untuk mengatur isWajibNilai berdasarkan statusHafalan
  useEffect(() => {
    if (formData.statusHafalan === 'Hafal') {
      setIsWajibNilai(true);
    } else if (formData.statusHafalan === 'Kurang Hafal') {
      setIsWajibNilai(false);
      // Clear nilai jika sudah terisi
    } else if (formData.statusHafalan === 'Tidak Hafal') {
      setIsWajibNilai(false);
      // Clear semua nilai dan disable input
      setFormData(prev => ({
        ...prev,
        nilaiTajwid: '',
        nilaiKelancaran: '',
        nilaiMakhraj: '',
        nilaiAdab: '',
      }));
    }
  }, [formData.statusHafalan]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSurahDropdown && !event.target.closest('.surah-input-container')) {
        setShowSurahDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSurahDropdown]);

  // Handle Tampilkan Data
  const handleTampilkanData = () => {
    let filtered = penilaianList;

    if (siswaId) {
      filtered = filtered.filter(p => p.siswaId === parseInt(siswaId));
    }

    setFilteredPenilaian(filtered);
    setCurrentPage(1);
    toast.success('Data berhasil ditampilkan!');
  };

  // Sorting Function
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
  };

  // Apply sorting
  const sortedData = [...filteredPenilaian].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'tanggal') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Calculate Statistics
  const calculateStats = () => {
    if (filteredPenilaian.length === 0) {
      return {
        total: 0,
        rataTajwid: '',
        rataKelancaran: '',
        rataMakhraj: '',
        rataAdab: '',
      };
    }

    const total = filteredPenilaian.length;

    // Filter hanya nilai yang valid (bukan null/undefined/NaN)
    const validTajwid = filteredPenilaian.filter(p => p.nilaiTajwid != null && !isNaN(p.nilaiTajwid));
    const validKelancaran = filteredPenilaian.filter(p => p.nilaiKelancaran != null && !isNaN(p.nilaiKelancaran));
    const validMakhraj = filteredPenilaian.filter(p => p.nilaiMakhraj != null && !isNaN(p.nilaiMakhraj));
    const validAdab = filteredPenilaian.filter(p => p.nilaiAdab != null && !isNaN(p.nilaiAdab));

    const sumTajwid = validTajwid.reduce((acc, p) => acc + safeNumber(p.nilaiTajwid), 0);
    const sumKelancaran = validKelancaran.reduce((acc, p) => acc + safeNumber(p.nilaiKelancaran), 0);
    const sumMakhraj = validMakhraj.reduce((acc, p) => acc + safeNumber(p.nilaiMakhraj), 0);
    const sumAdab = validAdab.reduce((acc, p) => acc + safeNumber(p.nilaiAdab), 0);

    return {
      total,
      rataTajwid: validTajwid.length > 0 ? (sumTajwid / validTajwid.length).toFixed(1) : '',
      rataKelancaran: validKelancaran.length > 0 ? (sumKelancaran / validKelancaran.length).toFixed(1) : '',
      rataMakhraj: validMakhraj.length > 0 ? (sumMakhraj / validMakhraj.length).toFixed(1) : '',
      rataAdab: validAdab.length > 0 ? (sumAdab / validAdab.length).toFixed(1) : '',
    };
  };

  const stats = calculateStats();

  // Grade Badge Color
  const getGradeBadgeColor = (nilai) => {
    const safeNilai = safeNumber(nilai);
    if (safeNilai === 0 || nilai === null || nilai === undefined || nilai === '') {
      return { bg: '#F3F4F6', text: '#9CA3AF', border: '#E5E7EB' };
    }
    if (safeNilai >= 90) return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
    if (safeNilai >= 75) return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    return { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' };
  };

  // Modal Handlers
  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      siswaId: siswaId || '',
      tanggal: new Date().toISOString().split('T')[0],
      surah: '',
      ayat: '',
      statusHafalan: 'Hafal',
      nilaiTajwid: '',
      nilaiKelancaran: '',
      nilaiMakhraj: '',
      nilaiAdab: '',
      catatan: '',
    });
    setErrors({});
    setSurahQuery('');
    setShowSurahDropdown(false);
    setShowModal(true);
  };

  const openEditModal = (penilaian) => {
    setEditingId(penilaian.id);
    setFormData({
      siswaId: penilaian.siswaId,
      tanggal: penilaian.tanggal,
      surah: penilaian.surah,
      ayat: penilaian.ayat,
      statusHafalan: penilaian.statusHafalan,
      nilaiTajwid: penilaian.nilaiTajwid,
      nilaiKelancaran: penilaian.nilaiKelancaran,
      nilaiMakhraj: penilaian.nilaiMakhraj,
      nilaiAdab: penilaian.nilaiAdab,
      catatan: penilaian.catatan,
    });
    setErrors({});
    setSurahQuery(penilaian.surah);
    setShowSurahDropdown(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      siswaId: '',
      tanggal: new Date().toISOString().split('T')[0],
      surah: '',
      ayat: '',
      statusHafalan: 'Hafal',
      nilaiTajwid: '',
      nilaiKelancaran: '',
      nilaiMakhraj: '',
      nilaiAdab: '',
      catatan: '',
    });
    setErrors({});
    setSurahQuery('');
    setShowSurahDropdown(false);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.siswaId) newErrors.siswaId = 'Pilih siswa terlebih dahulu';
    if (!formData.surah) newErrors.surah = 'Surah wajib diisi';
    if (!formData.ayat) newErrors.ayat = 'Ayat wajib diisi';

    // Validasi nilai hanya wajib jika status = 'Hafal'
    if (formData.statusHafalan === 'Hafal') {
      if (!formData.nilaiTajwid) newErrors.nilaiTajwid = 'Nilai Tajwid wajib diisi';
      if (!formData.nilaiKelancaran) newErrors.nilaiKelancaran = 'Nilai Kelancaran wajib diisi';
      if (!formData.nilaiMakhraj) newErrors.nilaiMakhraj = 'Nilai Makhraj wajib diisi';
      if (!formData.nilaiAdab) newErrors.nilaiAdab = 'Nilai Adab wajib diisi';
    }

    // Validate range 1-100 untuk field yang terisi
    ['nilaiTajwid', 'nilaiKelancaran', 'nilaiMakhraj', 'nilaiAdab'].forEach(field => {
      const val = parseInt(formData[field]);
      if (formData[field] && (val < 1 || val > 100)) {
        newErrors[field] = 'Nilai harus antara 1-100';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    const siswa = siswaList.find(s => s.id === parseInt(formData.siswaId));

    if (editingId) {
      // Update existing
      const updated = penilaianList.map(p =>
        p.id === editingId
          ? {
              ...p,
              ...formData,
              siswaId: parseInt(formData.siswaId),
              namaSiswa: siswa.nama,
              nilaiTajwid: formData.nilaiTajwid ? parseInt(formData.nilaiTajwid) : null,
              nilaiKelancaran: formData.nilaiKelancaran ? parseInt(formData.nilaiKelancaran) : null,
              nilaiMakhraj: formData.nilaiMakhraj ? parseInt(formData.nilaiMakhraj) : null,
              nilaiAdab: formData.nilaiAdab ? parseInt(formData.nilaiAdab) : null,
            }
          : p
      );
      setPenilaianList(updated);

      // Update filtered
      if (filteredPenilaian.length > 0) {
        const updatedFiltered = filteredPenilaian.map(p =>
          p.id === editingId
            ? {
                ...p,
                ...formData,
                siswaId: parseInt(formData.siswaId),
                namaSiswa: siswa.nama,
                nilaiTajwid: formData.nilaiTajwid ? parseInt(formData.nilaiTajwid) : null,
                nilaiKelancaran: formData.nilaiKelancaran ? parseInt(formData.nilaiKelancaran) : null,
                nilaiMakhraj: formData.nilaiMakhraj ? parseInt(formData.nilaiMakhraj) : null,
                nilaiAdab: formData.nilaiAdab ? parseInt(formData.nilaiAdab) : null,
              }
            : p
        );
        setFilteredPenilaian(updatedFiltered);
      }

      toast.success('Penilaian berhasil diperbarui!');
    } else {
      // Add new - Generate unique ID dengan timestamp
      const newId = Date.now();
      const newPenilaian = {
        id: newId,
        ...formData,
        siswaId: parseInt(formData.siswaId),
        namaSiswa: siswa.nama,
        nilaiTajwid: formData.nilaiTajwid ? parseInt(formData.nilaiTajwid) : null,
        nilaiKelancaran: formData.nilaiKelancaran ? parseInt(formData.nilaiKelancaran) : null,
        nilaiMakhraj: formData.nilaiMakhraj ? parseInt(formData.nilaiMakhraj) : null,
        nilaiAdab: formData.nilaiAdab ? parseInt(formData.nilaiAdab) : null,
      };

      const updatedPenilaianList = [...penilaianList, newPenilaian];
      setPenilaianList(updatedPenilaianList);

      // Always update filtered list to auto-refresh table
      const shouldInclude = !siswaId || parseInt(formData.siswaId) === parseInt(siswaId);
      if (shouldInclude) {
        setFilteredPenilaian([...filteredPenilaian, newPenilaian]);
      }

      toast.success('Penilaian berhasil ditambahkan!');
    }

    closeModal();
  };

  // Handle Delete
  const handleDelete = (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus penilaian ini?')) {
      setPenilaianList(penilaianList.filter(p => p.id !== id));
      setFilteredPenilaian(filteredPenilaian.filter(p => p.id !== id));
      toast.success('Penilaian berhasil dihapus!');
    }
  };

  // Print Functions
  const handlePrintIndividu = (penilaian) => {
    const siswa = siswaList.find(s => s.id === penilaian.siswaId);

    // Get all penilaian for this student
    const siswaData = filteredPenilaian.filter(p => p.siswaId === penilaian.siswaId);

    // Calculate averages
    const avgTajwid = (siswaData.reduce((acc, p) => acc + p.nilaiTajwid, 0) / siswaData.length).toFixed(1);
    const avgKelancaran = (siswaData.reduce((acc, p) => acc + p.nilaiKelancaran, 0) / siswaData.length).toFixed(1);
    const avgMakhraj = (siswaData.reduce((acc, p) => acc + p.nilaiMakhraj, 0) / siswaData.length).toFixed(1);
    const avgAdab = (siswaData.reduce((acc, p) => acc + p.nilaiAdab, 0) / siswaData.length).toFixed(1);

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Penilaian Hafalan - ${siswa?.nama}</title>
        <style>
          @page { margin: 2cm; }
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #1f2937;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #059669;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #059669;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #6b7280;
          }
          .info-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .info-box p {
            margin: 5px 0;
            font-size: 14px;
          }
          .info-box strong {
            color: #059669;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background: #059669;
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .stats {
            background: #fffbeb;
            border: 1px solid #fde68a;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .stats h3 {
            color: #d97706;
            margin-top: 0;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .stat-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
          }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
          }
          .signature {
            margin-top: 50px;
            text-align: right;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin: 50px 0 5px auto;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 11px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📗 Laporan Penilaian Hafalan</h1>
          <p>Sistem Manajemen Tahfidz Al-Qur'an</p>
        </div>

        <div class="info-box">
          <p><strong>Nama Siswa:</strong> ${siswa?.nama}</p>
          <p><strong>Kelas:</strong> ${getNamaKelas(kelasId)}</p>
          <p><strong>Periode:</strong> ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</p>
          <p><strong>Total Penilaian:</strong> ${siswaData.length} kali setoran</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Surah</th>
              <th>Ayat</th>
              <th>Status</th>
              <th>Tajwid</th>
              <th>Kelancaran</th>
              <th>Makhraj</th>
              <th>Adab</th>
              <th>Catatan</th>
            </tr>
          </thead>
          <tbody>
            ${siswaData.map((p, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${new Date(p.tanggal).toLocaleDateString('id-ID')}</td>
                <td>${p.surah}</td>
                <td>${p.ayat}</td>
                <td>${p.statusHafalan}</td>
                <td>${p.nilaiTajwid}</td>
                <td>${p.nilaiKelancaran}</td>
                <td>${p.nilaiMakhraj}</td>
                <td>${p.nilaiAdab}</td>
                <td>${p.catatan}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="stats">
          <h3>📊 Rata-rata Nilai</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">${avgTajwid}</div>
              <div class="stat-label">Tajwid</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${avgKelancaran}</div>
              <div class="stat-label">Kelancaran</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${avgMakhraj}</div>
              <div class="stat-label">Makhraj</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${avgAdab}</div>
              <div class="stat-label">Adab</div>
            </div>
          </div>
        </div>

        <div class="signature">
          <p>Guru Pembimbing</p>
          <div class="signature-line"></div>
          <p>(...........................)</p>
        </div>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>© 2025 Sistem Manajemen Tahfidz Al-Qur'an</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintKelas = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Kelas - ${getNamaKelas(kelasId)}</title>
        <style>
          @page { margin: 2cm; }
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            color: #1f2937;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #059669;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #059669;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #6b7280;
          }
          .info-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background: #059669;
            color: white;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 11px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📗 Rekap Penilaian Hafalan Kelas</h1>
          <p>Sistem Manajemen Tahfidz Al-Qur'an</p>
        </div>

        <div class="info-box">
          <p><strong>Kelas:</strong> ${getNamaKelas(kelasId)}</p>
          <p><strong>Periode:</strong> ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</p>
          <p><strong>Total Siswa:</strong> ${siswaList.length} siswa</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Total Setoran</th>
              <th>Rata-rata Tajwid</th>
              <th>Rata-rata Kelancaran</th>
              <th>Rata-rata Makhraj</th>
              <th>Rata-rata Adab</th>
              <th>Rata-rata Total</th>
            </tr>
          </thead>
          <tbody>
            ${siswaList.map((siswa, idx) => {
              const siswaPenilaian = filteredPenilaian.filter(p => p.siswaId === siswa.id);
              const count = siswaPenilaian.length;

              if (count === 0) {
                return `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${siswa.nama}</td>
                    <td colspan="6" style="text-align: center; color: #9ca3af;">Belum ada penilaian</td>
                  </tr>
                `;
              }

              const avgTajwid = (siswaPenilaian.reduce((acc, p) => acc + p.nilaiTajwid, 0) / count).toFixed(1);
              const avgKelancaran = (siswaPenilaian.reduce((acc, p) => acc + p.nilaiKelancaran, 0) / count).toFixed(1);
              const avgMakhraj = (siswaPenilaian.reduce((acc, p) => acc + p.nilaiMakhraj, 0) / count).toFixed(1);
              const avgAdab = (siswaPenilaian.reduce((acc, p) => acc + p.nilaiAdab, 0) / count).toFixed(1);
              const avgTotal = ((parseFloat(avgTajwid) + parseFloat(avgKelancaran) + parseFloat(avgMakhraj) + parseFloat(avgAdab)) / 4).toFixed(1);

              return `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${siswa.nama}</td>
                  <td>${count}</td>
                  <td>${avgTajwid}</td>
                  <td>${avgKelancaran}</td>
                  <td>${avgMakhraj}</td>
                  <td>${avgAdab}</td>
                  <td><strong>${avgTotal}</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
          <p>© 2025 Sistem Manajemen Tahfidz Al-Qur'an</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <GuruLayout>
      <Toaster position="top-right" />

      {/* Background Gradient Container */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-amber-50" style={{ margin: '-32px', padding: '32px' }}>
        {/* Back Button & Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          href="/guru/penilaian-hafalan"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: '#F3F4F6',
            borderRadius: '8px',
            textDecoration: 'none',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '16px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#E5E7EB';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F3F4F6';
          }}
        >
          <ArrowLeft size={16} />
          Kembali ke Daftar Kelas
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BookOpen size={24} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: 0,
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Penilaian Hafalan – {getNamaKelas(kelasId)}
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
              Nilai & catatan hasil setoran siswa
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          {/* Pilih Siswa */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Pilih Siswa
            </label>
            <select
              value={siswaId}
              onChange={(e) => setSiswaId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              <option value="">Semua Siswa</option>
              {siswaList.map(s => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleTampilkanData}
            style={{
              padding: '10px 20px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#047857'}
            onMouseLeave={(e) => e.target.style.background = '#059669'}
          >
            Tampilkan Data
          </button>

          <button
            onClick={openAddModal}
            style={{
              padding: '10px 20px',
              background: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#D97706'}
            onMouseLeave={(e) => e.target.style.background = '#F59E0B'}
          >
            <Plus size={18} />
            Tambah Penilaian
          </button>

          <button
            onClick={handlePrintKelas}
            style={{
              padding: '10px 20px',
              background: 'white',
              color: '#374151',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#F9FAFB';
              e.target.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#E5E7EB';
            }}
          >
            <Printer size={18} />
            Print Kelas
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Total Penilaian */}
        <div style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #A7F3D0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#047857', fontWeight: '500' }}>Total Penilaian</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#059669' }}>{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Rata-rata Tajwid */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #99F6E4',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#14B8A6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#0D9488', fontWeight: '500' }}>Rata-rata Tajwid</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#14B8A6' }}>
                {stats.rataTajwid || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Rata-rata Kelancaran */}
        <div style={{
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #FDE68A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Star size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#D97706', fontWeight: '500' }}>Rata-rata Kelancaran</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#F59E0B' }}>
                {stats.rataKelancaran || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Rata-rata Makhraj */}
        <div style={{
          background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #93C5FD',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mic size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8', fontWeight: '500' }}>Rata-rata Makhraj</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#3B82F6' }}>
                {stats.rataMakhraj || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Rata-rata Adab */}
        <div style={{
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E9D5FF',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#8B5CF6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Award size={20} style={{ color: 'white' }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#7C3AED', fontWeight: '500' }}>Rata-rata Adab</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#8B5CF6' }}>
                {stats.rataAdab || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th
                  onClick={() => handleSort('namaSiswa')}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Nama Siswa
                    {sortField === 'namaSiswa' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('tanggal')}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Tanggal
                    {sortField === 'tanggal' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  Surah / Ayat
                </th>
                <th
                  onClick={() => handleSort('nilaiTajwid')}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Tajwid
                    {sortField === 'nilaiTajwid' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nilaiKelancaran')}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Kelancaran
                    {sortField === 'nilaiKelancaran' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nilaiMakhraj')}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Makhraj
                    {sortField === 'nilaiMakhraj' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('nilaiAdab')}
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    Adab
                    {sortField === 'nilaiAdab' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  Catatan
                </th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    Tidak ada data penilaian. Klik "Tambah Penilaian" untuk menambahkan data.
                  </td>
                </tr>
              ) : (
                paginatedData.map((p) => {
                  const tajwidColor = getGradeBadgeColor(p.nilaiTajwid);
                  const kelancaranColor = getGradeBadgeColor(p.nilaiKelancaran);
                  const makhrajColor = getGradeBadgeColor(p.nilaiMakhraj);
                  const adabColor = getGradeBadgeColor(p.nilaiAdab);

                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                        {p.namaSiswa}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                        {new Date(p.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1f2937' }}>
                        {p.surah} <span style={{ color: '#9ca3af' }}>({p.ayat})</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {safeValue(p.nilaiTajwid) !== '' ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: tajwidColor.bg,
                            color: tajwidColor.text,
                            border: `1px solid ${tajwidColor.border}`,
                          }}>
                            {safeValue(p.nilaiTajwid)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {safeValue(p.nilaiKelancaran) !== '' ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: kelancaranColor.bg,
                            color: kelancaranColor.text,
                            border: `1px solid ${kelancaranColor.border}`,
                          }}>
                            {safeValue(p.nilaiKelancaran)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {safeValue(p.nilaiMakhraj) !== '' ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: makhrajColor.bg,
                            color: makhrajColor.text,
                            border: `1px solid ${makhrajColor.border}`,
                          }}>
                            {safeValue(p.nilaiMakhraj)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {safeValue(p.nilaiAdab) !== '' ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            background: adabColor.bg,
                            color: adabColor.text,
                            border: `1px solid ${adabColor.border}`,
                          }}>
                            {safeValue(p.nilaiAdab)}
                          </span>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#d1d5db' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280', maxWidth: '200px' }}>
                        {p.catatan}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handlePrintIndividu(p)}
                            title="Print Individu"
                            style={{
                              padding: '6px',
                              background: '#3B82F6',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#2563EB'}
                            onMouseLeave={(e) => e.target.style.background = '#3B82F6'}
                          >
                            <Printer size={16} style={{ color: 'white' }} />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            title="Edit"
                            style={{
                              padding: '6px',
                              background: '#F59E0B',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#D97706'}
                            onMouseLeave={(e) => e.target.style.background = '#F59E0B'}
                          >
                            <Edit2 size={16} style={{ color: 'white' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            title="Hapus"
                            style={{
                              padding: '6px',
                              background: '#EF4444',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => e.target.style.background = '#DC2626'}
                            onMouseLeave={(e) => e.target.style.background = '#EF4444'}
                          >
                            <Trash2 size={16} style={{ color: 'white' }} />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                background: currentPage === 1 ? '#f3f4f6' : '#059669',
                color: currentPage === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} />
              Sebelumnya
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  background: currentPage === page ? '#059669' : 'white',
                  color: currentPage === page ? 'white' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '40px',
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                background: currentPage === totalPages ? '#f3f4f6' : '#059669',
                color: currentPage === totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Berikutnya
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: '700',
                color: '#059669',
              }}>
                {editingId ? 'Edit Penilaian Hafalan' : 'Form Penilaian Hafalan'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  padding: '6px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                <X size={20} style={{ color: '#6b7280' }} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Pilih Siswa */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Pilih Siswa <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    value={formData.siswaId}
                    onChange={(e) => setFormData({ ...formData, siswaId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.siswaId ? '1px solid #DC2626' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  >
                    <option value="">-- Pilih Siswa --</option>
                    {siswaList.map(s => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                  {errors.siswaId && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.siswaId}</p>
                  )}
                </div>

                {/* Tanggal */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Tanggal <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>

                {/* Surah - Searchable Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Surah <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div className="surah-input-container" style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={surahQuery || formData.surah}
                      onChange={(e) => {
                        setSurahQuery(e.target.value);
                        setShowSurahDropdown(true);
                        setFormData({ ...formData, surah: e.target.value });
                      }}
                      onFocus={() => setShowSurahDropdown(true)}
                      placeholder="Ketik atau pilih nama surah..."
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors.surah ? '1px solid #DC2626' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                      }}
                    />
                    {showSurahDropdown && filteredSurahList.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '300px',
                        overflowY: 'auto',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        marginTop: '4px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        zIndex: 1000,
                      }}>
                        {filteredSurahList.map((surah, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setFormData({ ...formData, surah });
                              setSurahQuery(surah);
                              setShowSurahDropdown(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              borderBottom: idx < filteredSurahList.length - 1 ? '1px solid #f3f4f6' : 'none',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F0FDF4'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            {surah}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors.surah && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.surah}</p>
                  )}
                </div>

                {/* Rentang Ayat */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Rentang Ayat <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ayat}
                    onChange={(e) => setFormData({ ...formData, ayat: e.target.value })}
                    placeholder="Contoh: 1-5"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: errors.ayat ? '1px solid #DC2626' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                  {errors.ayat && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.ayat}</p>
                  )}
                </div>

                {/* Status Hafalan */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Status Hafalan <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {['Hafal', 'Kurang Hafal', 'Tidak Hafal'].map(status => (
                      <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="statusHafalan"
                          value={status}
                          checked={formData.statusHafalan === status}
                          onChange={(e) => setFormData({ ...formData, statusHafalan: e.target.value })}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px', color: '#374151' }}>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Grid 2 columns for nilai */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Nilai Tajwid */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Nilai Tajwid (1-100) {isWajibNilai && <span style={{ color: '#DC2626' }}>*</span>}
                      {!isWajibNilai && <span style={{ color: '#9ca3af', fontSize: '12px' }}>(Opsional)</span>}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.nilaiTajwid}
                      onChange={(e) => setFormData({ ...formData, nilaiTajwid: e.target.value })}
                      disabled={formData.statusHafalan === 'Tidak Hafal'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors.nilaiTajwid ? '1px solid #DC2626' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: formData.statusHafalan === 'Tidak Hafal' ? '#f3f4f6' : 'white',
                        cursor: formData.statusHafalan === 'Tidak Hafal' ? 'not-allowed' : 'text',
                      }}
                    />
                    {errors.nilaiTajwid && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.nilaiTajwid}</p>
                    )}
                  </div>

                  {/* Nilai Kelancaran */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Nilai Kelancaran (1-100) {isWajibNilai && <span style={{ color: '#DC2626' }}>*</span>}
                      {!isWajibNilai && <span style={{ color: '#9ca3af', fontSize: '12px' }}>(Opsional)</span>}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.nilaiKelancaran}
                      onChange={(e) => setFormData({ ...formData, nilaiKelancaran: e.target.value })}
                      disabled={formData.statusHafalan === 'Tidak Hafal'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors.nilaiKelancaran ? '1px solid #DC2626' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: formData.statusHafalan === 'Tidak Hafal' ? '#f3f4f6' : 'white',
                        cursor: formData.statusHafalan === 'Tidak Hafal' ? 'not-allowed' : 'text',
                      }}
                    />
                    {errors.nilaiKelancaran && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.nilaiKelancaran}</p>
                    )}
                  </div>

                  {/* Nilai Makhraj */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Nilai Makhrajul Huruf (1-100) {isWajibNilai && <span style={{ color: '#DC2626' }}>*</span>}
                      {!isWajibNilai && <span style={{ color: '#9ca3af', fontSize: '12px' }}>(Opsional)</span>}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.nilaiMakhraj}
                      onChange={(e) => setFormData({ ...formData, nilaiMakhraj: e.target.value })}
                      disabled={formData.statusHafalan === 'Tidak Hafal'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors.nilaiMakhraj ? '1px solid #DC2626' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: formData.statusHafalan === 'Tidak Hafal' ? '#f3f4f6' : 'white',
                        cursor: formData.statusHafalan === 'Tidak Hafal' ? 'not-allowed' : 'text',
                      }}
                    />
                    {errors.nilaiMakhraj && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.nilaiMakhraj}</p>
                    )}
                  </div>

                  {/* Nilai Adab */}
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Nilai Adab (1-100) {isWajibNilai && <span style={{ color: '#DC2626' }}>*</span>}
                      {!isWajibNilai && <span style={{ color: '#9ca3af', fontSize: '12px' }}>(Opsional)</span>}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.nilaiAdab}
                      onChange={(e) => setFormData({ ...formData, nilaiAdab: e.target.value })}
                      disabled={formData.statusHafalan === 'Tidak Hafal'}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: errors.nilaiAdab ? '1px solid #DC2626' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: formData.statusHafalan === 'Tidak Hafal' ? '#f3f4f6' : 'white',
                        cursor: formData.statusHafalan === 'Tidak Hafal' ? 'not-allowed' : 'text',
                      }}
                    />
                    {errors.nilaiAdab && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#DC2626' }}>{errors.nilaiAdab}</p>
                    )}
                  </div>
                </div>

                {/* Catatan */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Catatan/Komentar Guru
                  </label>
                  <textarea
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    rows="3"
                    placeholder="Masukkan catatan atau komentar..."
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                      resize: 'vertical',
                    }}
                  />
                  {formData.statusHafalan === 'Tidak Hafal' && (
                    <div style={{
                      marginTop: '8px',
                      padding: '12px',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                    }}>
                      <span style={{ fontSize: '16px' }}>⚠️</span>
                      <p style={{
                        fontSize: '13px',
                        color: '#B45309',
                        margin: 0,
                        lineHeight: '1.5',
                      }}>
                        Siswa belum menguasai hafalan ini. Mohon berikan catatan pembinaan yang detail untuk membantu perkembangan siswa.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid #e5e7eb',
              }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Simpan Penilaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Close Background Gradient Container */}
      </div>
    </GuruLayout>
  );
}
