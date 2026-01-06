"use client";

import { useState, useEffect } from 'react';
import GuruLayout from '@/components/layout/GuruLayout';
import FormPenilaianModal from '@/components/guru/FormPenilaianModal';
import {
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  Users,
  BookOpen
} from 'lucide-react';

// Mock data untuk kelas
const KELAS_OPTIONS = [
  { id: 'xi-ipa-1', name: 'XI IPA 1' },
  { id: 'xi-ipa-2', name: 'XI IPA 2' },
  { id: 'xii-ips-1', name: 'XII IPS 1' },
  { id: 'x-mia-3', name: 'X MIA 3' },
];

// Mock data siswa
const SISWA_DATA = {
  'xi-ipa-1': [
    { id: 1, nama: 'Ahmad Rizki Pratama' },
    { id: 2, nama: 'Siti Fatimah Azzahra' },
    { id: 3, nama: 'Muhammad Alif Rahman' },
    { id: 4, nama: 'Zahra Amelia Putri' },
    { id: 5, nama: 'Dafi Rahman Hakim' },
    { id: 6, nama: 'Nur Aisyah Kamila' },
    { id: 7, nama: 'Bayu Saputra Wicaksono' },
    { id: 8, nama: 'Dewi Kartika Sari' },
  ],
  'xi-ipa-2': [
    { id: 9, nama: 'Andi Firmansyah' },
    { id: 10, nama: 'Rizka Aulia' },
    { id: 11, nama: 'Fajar Nugraha' },
    { id: 12, nama: 'Laila Safitri' },
  ],
  'xii-ips-1': [
    { id: 13, nama: 'Kevin Ananda' },
    { id: 14, nama: 'Nabila Putri' },
    { id: 15, nama: 'Rendi Pratama' },
  ],
  'x-mia-3': [
    { id: 16, nama: 'Cahya Permata' },
    { id: 17, nama: 'Dinda Maharani' },
    { id: 18, nama: 'Eko Prasetyo' },
  ]
};

// Mock data setoran hafalan
const SETORAN_DATA = {
  1: { // Ahmad Rizki Pratama
    '2025-09-22': { surat: 'Al-Baqarah', ayat: '1-15', nilai: 'A', status: 'hafal', nilaiKelancaran: 95, nilaiTajwid: 90 },
    '2025-09-24': { surat: 'Al-Baqarah', ayat: '16-30', nilai: 'A-', status: 'hafal', nilaiKelancaran: 85, nilaiTajwid: 90 },
    '2025-09-26': { surat: 'Al-Baqarah', ayat: '31-45', nilai: 'B+', status: 'kurang_hafal', nilaiKelancaran: 75, nilaiTajwid: 80 },
  },
  2: { // Siti Fatimah
    '2025-09-23': { surat: 'Al-Mulk', ayat: '1-10', nilai: 'A', status: 'hafal', nilaiKelancaran: 95, nilaiTajwid: 95 },
    '2025-09-25': { surat: 'Al-Mulk', ayat: '11-20', nilai: 'A', status: 'hafal', nilaiKelancaran: 92, nilaiTajwid: 88 },
  },
  3: { // Muhammad Alif
    '2025-09-22': { surat: 'Ar-Rahman', ayat: '1-25', nilai: 'B+', status: 'kurang_hafal', nilaiKelancaran: 70, nilaiTajwid: 75 },
    '2025-09-27': { surat: 'Ar-Rahman', ayat: '26-50', nilai: 'A-', status: 'hafal', nilaiKelancaran: 80, nilaiTajwid: 85 },
  },
  4: { // Zahra Amelia
    '2025-09-23': { surat: 'Al-Waqiah', ayat: '1-20', nilai: 'A', status: 'hafal', nilaiKelancaran: 90, nilaiTajwid: 95 },
    '2025-09-25': { surat: 'Al-Waqiah', ayat: '21-40', nilai: 'A-', status: 'hafal', nilaiKelancaran: 85, nilaiTajwid: 80 },
    '2025-09-27': { surat: 'Al-Waqiah', ayat: '41-60', nilai: 'B+', status: 'kurang_hafal', nilaiKelancaran: 75, nilaiTajwid: 70 },
  },
  5: { // Dafi Rahman
    '2025-09-24': { surat: 'Al-Kahf', ayat: '1-15', nilai: 'A', status: 'hafal', nilaiKelancaran: 88, nilaiTajwid: 92 },
    '2025-09-26': { surat: 'Al-Kahf', ayat: '16-30', nilai: 'B+', status: 'kurang_hafal', nilaiKelancaran: 70, nilaiTajwid: 75 },
  }
};

// Utility functions
const formatDateRange = (startDate) => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  return `${start.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const getWeekDays = (startDate) => {
  const days = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push({
      date: day.toISOString().split('T')[0],
      dayName: day.toLocaleDateString('id-ID', { weekday: 'short' }),
      dayNumber: day.getDate()
    });
  }
  return days;
};

const getNilaiColor = (nilai) => {
  if (nilai?.includes('A')) return 'text-green-600 bg-green-50';
  if (nilai?.includes('B')) return 'text-blue-600 bg-blue-50';
  if (nilai?.includes('C')) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

export default function PenilaianKelasPage() {
  const [selectedKelas, setSelectedKelas] = useState('xi-ipa-1');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Set to Monday of current week
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [selectedTanggal, setSelectedTanggal] = useState(null);
  const [editingData, setEditingData] = useState(null);

  // Get current class students
  const currentStudents = SISWA_DATA[selectedKelas] || [];
  const weekDays = getWeekDays(currentWeekStart);

  // Navigation functions
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek.toISOString().split('T')[0]);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek.toISOString().split('T')[0]);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    setCurrentWeekStart(monday.toISOString().split('T')[0]);
  };

  // Main interaction function
  const handleOpenFormPenilaian = (siswaId, tanggal) => {
    const siswa = currentStudents.find(s => s.id === siswaId);
    const existingData = getSetoranData(siswaId, tanggal);
    
    setSelectedSiswa(siswa);
    setSelectedTanggal(tanggal);
    setEditingData(existingData ? {
      surah: existingData.surat || '',
      rentangAyat: existingData.ayat || '',
      statusHafalan: existingData.status || 'hafal',
      nilaiKelancaran: existingData.nilaiKelancaran || '',
      nilaiTajwid: existingData.nilaiTajwid || '',
      catatan: existingData.catatan || ''
    } : null);
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmitPenilaian = async (data) => {
    console.log('Submitting penilaian:', data);
    
    // TODO: Here you would typically save to your backend/database
    // For now, we'll just update the local mock data
    if (!SETORAN_DATA[data.siswaId]) {
      SETORAN_DATA[data.siswaId] = {};
    }
    
    SETORAN_DATA[data.siswaId][data.tanggal] = {
      surat: data.surah,
      ayat: data.rentangAyat,
      nilai: calculateGrade(data.nilaiKelancaran, data.nilaiTajwid),
      status: data.statusHafalan,
      nilaiKelancaran: data.nilaiKelancaran,
      nilaiTajwid: data.nilaiTajwid,
      catatan: data.catatan,
      timestamp: data.timestamp
    };

    // Show success message (you might want to use a toast library)
    alert('Penilaian berhasil disimpan!');
  };

  // Calculate grade based on scores
  const calculateGrade = (kelancaran, tajwid) => {
    const average = (parseInt(kelancaran) + parseInt(tajwid)) / 2;
    if (average >= 90) return 'A';
    if (average >= 80) return 'A-';
    if (average >= 70) return 'B+';
    if (average >= 60) return 'B';
    if (average >= 50) return 'B-';
    if (average >= 40) return 'C+';
    return 'C';
  };

  // Download PDF report for individual student
  const handleDownloadPDF = async (siswaId) => {
    const siswa = currentStudents.find(s => s.id === siswaId);
    console.log('Downloading PDF report for:', siswa?.nama);
    
    try {
      // For testing purposes, use January 2025 where we have seed data
      const periode = '2025-01';
      
      // Call our API to generate PDF
      const response = await fetch(`/api/laporan/individu?siswaId=${siswaId}&periode=${periode}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Hafalan_${siswa?.nama.replace(/ /g, '_')}_${periode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(`Gagal mengunduh PDF: ${error.message}`);
    }
  };

  // Get setoran data for specific student and date
  const getSetoranData = (siswaId, tanggal) => {
    return SETORAN_DATA[siswaId]?.[tanggal] || null;
  };

  return (
    <GuruLayout>
      <div className="p-6 max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Buku Digital Kelas</h1>
          </div>
          <p className="text-gray-600">
            Kelola dan pantau setoran hafalan siswa per kelas dan minggu
          </p>
        </div>

        {/* Class Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-gray-500" />
            <label htmlFor="kelas-select" className="text-sm font-medium text-gray-700">
              Pilih Kelas:
            </label>
            <select
              id="kelas-select"
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              {KELAS_OPTIONS.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.name}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-500">
              ({currentStudents.length} siswa)
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousWeek}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Minggu Sebelumnya
            </button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">
                  {formatDateRange(currentWeekStart)}
                </span>
              </div>
              <button
                onClick={goToCurrentWeek}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Minggu Ini
              </button>
            </div>

            <button
              onClick={goToNextWeek}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Minggu Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-48">
                    Nama Siswa
                  </th>
                  {weekDays.map((day) => (
                    <th key={day.date} className="px-4 py-4 text-center text-sm font-semibold text-gray-900 min-w-32">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-600">{day.dayName}</span>
                        <span className="text-lg">{day.dayNumber}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 min-w-24">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentStudents.map((siswa) => (
                  <tr key={siswa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {siswa.nama.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{siswa.nama}</p>
                          <p className="text-xs text-gray-500">ID: {siswa.id}</p>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const setoranData = getSetoranData(siswa.id, day.date);
                      return (
                        <td key={day.date} className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleOpenFormPenilaian(siswa.id, day.date)}
                            className="w-full h-16 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {setoranData ? (
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-green-600 text-lg">✅</span>
                                <div className="text-xs text-gray-600 mt-1">
                                  <div className="font-medium">{setoranData.surat}</div>
                                  <div className="text-gray-500">
                                    {setoranData.ayat}
                                  </div>
                                  <span className={`px-1 py-0.5 text-xs rounded ${getNilaiColor(setoranData.nilai)}`}>
                                    {setoranData.nilai}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-gray-400 text-xl">⚪</span>
                                <span className="text-xs text-gray-400 mt-1">Belum Setor</span>
                              </div>
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownloadPDF(siswa.id)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Cetak Laporan Individual"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>Total Siswa: <strong>{currentStudents.length}</strong></span>
              <span>•</span>
              <span>Periode: <strong>{formatDateRange(currentWeekStart)}</strong></span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-green-600">✅</span>
                <span>Sudah Setor</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">⚪</span>
                <span>Belum Setor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Penilaian Modal */}
        <FormPenilaianModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSiswa(null);
            setSelectedTanggal(null);
            setEditingData(null);
          }}
          onSubmit={handleSubmitPenilaian}
          siswaData={selectedSiswa}
          tanggal={selectedTanggal}
          initialData={editingData}
        />
      </div>
    </GuruLayout>
  );
}