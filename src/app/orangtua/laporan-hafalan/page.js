'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import OrangtuaLayout from '@/components/layout/OrangtuaLayout'
import ParentingMotivationalCard from '@/components/ParentingMotivationalCard'
import {
  ChartBar,
  Filter,
  BookOpen,
  Download,
  Printer,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Home,
  ChevronRight,
  TrendingUp,
  Award,
  RefreshCw,
  BookMarked
} from 'lucide-react'

// Dynamic import untuk Recharts - mencegah SSR issues
const LineChart = dynamic(
  () => import('recharts').then(mod => mod.LineChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div> }
)
const Line = dynamic(
  () => import('recharts').then(mod => mod.Line),
  { ssr: false }
)
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div> }
)
const Bar = dynamic(
  () => import('recharts').then(mod => mod.Bar),
  { ssr: false }
)
const XAxis = dynamic(
  () => import('recharts').then(mod => mod.XAxis),
  { ssr: false }
)
const YAxis = dynamic(
  () => import('recharts').then(mod => mod.YAxis),
  { ssr: false }
)
const CartesianGrid = dynamic(
  () => import('recharts').then(mod => mod.CartesianGrid),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('recharts').then(mod => mod.Tooltip),
  { ssr: false }
)
const Legend = dynamic(
  () => import('recharts').then(mod => mod.Legend),
  { ssr: false }
)
const ResponsiveContainer = dynamic(
  () => import('recharts').then(mod => mod.ResponsiveContainer),
  { ssr: false }
)

export default function LaporanHafalanPage() {
  const [selectedChild, setSelectedChild] = useState('')
  const [children, setChildren] = useState([])
  const [periode, setPeriode] = useState('bulan-ini')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [laporanData, setLaporanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Fetch daftar anak saat component mount
  useEffect(() => {
    fetchChildren()
  }, [])

  // Auto-load laporan ketika anak dipilih
  useEffect(() => {
    if (selectedChild) {
      fetchLaporanData()
    }
  }, [selectedChild, periode])

  const fetchChildren = async () => {
    try {
      const response = await fetch('/api/orangtua/hafalan-anak')
      if (response.ok) {
        const data = await response.json()

        // Jika data kosong atau error, gunakan contoh data
        if (!data || data.length === 0) {
          const sampleChildren = [
            { id: 'sample-1', nama: 'Ahmad Zaki', kelas: '10 IPA 1' },
            { id: 'sample-2', nama: 'Fatimah Azzahra', kelas: '11 IPA 2' }
          ]
          setChildren(sampleChildren)
          setSelectedChild(sampleChildren[0].id)
        } else {
          setChildren(data)
          // Auto-select anak pertama jika ada
          if (data.length > 0) {
            setSelectedChild(data[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error)
      // Gunakan contoh data jika error
      const sampleChildren = [
        { id: 'sample-1', nama: 'Ahmad Zaki', kelas: '10 IPA 1' },
        { id: 'sample-2', nama: 'Fatimah Azzahra', kelas: '11 IPA 2' }
      ]
      setChildren(sampleChildren)
      setSelectedChild(sampleChildren[0].id)
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchLaporanData = async () => {
    if (!selectedChild) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/orangtua/laporan-hafalan?siswaId=${selectedChild}&periode=${periode}`
      )

      if (response.ok) {
        const data = await response.json()
        setLaporanData(data)
      } else {
        console.error('Failed to fetch laporan data')
      }
    } catch (error) {
      console.error('Error fetching laporan:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTampilkanLaporan = () => {
    fetchLaporanData()
  }

  const handleExport = async (format) => {
    if (!selectedChild) {
      alert('Silakan pilih anak terlebih dahulu')
      return
    }

    try {
      const response = await fetch('/api/orangtua/laporan-hafalan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          siswaId: selectedChild,
          periode,
          format
        })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        // TODO: Trigger actual download
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Gagal mengekspor laporan')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  // Default data jika belum ada data dari API - Dengan contoh data untuk demo
  const progressData = laporanData?.progressData || [
    { minggu: 'Minggu 1', totalHafalan: 8, nilaiRataRata: 85, murojaah: 12 },
    { minggu: 'Minggu 2', totalHafalan: 12, nilaiRataRata: 88, murojaah: 15 },
    { minggu: 'Minggu 3', totalHafalan: 15, nilaiRataRata: 90, murojaah: 18 },
    { minggu: 'Minggu 4', totalHafalan: 18, nilaiRataRata: 87, murojaah: 20 },
    { minggu: 'Minggu 5', totalHafalan: 22, nilaiRataRata: 92, murojaah: 25 },
    { minggu: 'Minggu 6', totalHafalan: 25, nilaiRataRata: 89, murojaah: 28 }
  ]

  const performanceData = laporanData?.performanceData || [
    { kategori: 'Tajwid', nilai: 88 },
    { kategori: 'Kelancaran', nilai: 85 },
    { kategori: 'Hafalan Baru', nilai: 90 },
    { kategori: 'Murojaah', nilai: 87 }
  ]

  const detailHafalan = laporanData?.detailHafalan || [
    {
      id: 1,
      tanggal: '15 Jan 2024',
      surah: 'Al-Fatihah (1-7)',
      nilaiTajwid: 90,
      nilaiKelancaran: 88,
      nilaiMakhraj: 92,
      nilaiImplementasi: 91,
      catatan: 'Sangat baik, bacaan tartil dan jelas'
    },
    {
      id: 2,
      tanggal: '22 Jan 2024',
      surah: 'Al-Baqarah (1-25)',
      nilaiTajwid: 85,
      nilaiKelancaran: 87,
      nilaiMakhraj: 86,
      nilaiImplementasi: 88,
      catatan: 'Perlu perbaikan pada mad'
    },
    {
      id: 3,
      tanggal: '05 Feb 2024',
      surah: 'Al-Baqarah (26-50)',
      nilaiTajwid: 88,
      nilaiKelancaran: 90,
      nilaiMakhraj: 89,
      nilaiImplementasi: 92,
      catatan: 'Bacaan sudah lancar'
    },
    {
      id: 4,
      tanggal: '18 Feb 2024',
      surah: 'Al-Baqarah (51-75)',
      nilaiTajwid: 92,
      nilaiKelancaran: 91,
      nilaiMakhraj: 93,
      nilaiImplementasi: 94,
      catatan: 'Excellent! Semua aspek baik'
    },
    {
      id: 5,
      tanggal: '10 Mar 2024',
      surah: 'Al-Baqarah (76-100)',
      nilaiTajwid: 87,
      nilaiKelancaran: 85,
      nilaiMakhraj: 88,
      nilaiImplementasi: 90,
      catatan: 'Tingkatkan tempo bacaan'
    }
  ]

  const statistik = laporanData?.statistik || {
    totalHafalan: 15,
    hafalanBaru: 5,
    rataRataNilai: 88,
    totalMurojaah: 35
  }

  const kesimpulan = laporanData?.kesimpulan || {
    predikat: 'Baik Sekali',
    komentar: 'Progress hafalan sangat baik. Tetap semangat dan tingkatkan kualitas bacaan.',
    rekomendasi: 'Fokus pada pengulangan hafalan lama agar tidak lupa.'
  }

  if (initialLoading) {
    return (
      <OrangtuaLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Memuat data...</p>
          </div>
        </div>
      </OrangtuaLayout>
    )
  }

  return (
    <OrangtuaLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* SECTION 1: Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <ChartBar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">Laporan Hafalan</h1>
                <p className="text-emerald-100 mt-2">Pantau perkembangan hafalan anak Anda secara menyeluruh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Card Slider */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <ParentingMotivationalCard theme="mint" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* SECTION 2: Filter & Summary Cards */}
          <div className="space-y-6">
            {/* Filter Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 rounded-lg">
                    <Filter className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Pengaturan Laporan</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Pilih periode dan anak untuk melihat laporan</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 mb-6">
                {/* Pilih Anak */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Anak</label>
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 transition-all"
                  >
                    <option value="">Pilih anak...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Periode Waktu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Periode Waktu</label>
                  <select
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 transition-all"
                  >
                    <option value="minggu-ini">Minggu Ini</option>
                    <option value="bulan-ini">Bulan Ini</option>
                    <option value="semester-ini">Semester Ini</option>
                    <option value="tahun-ajaran">Tahun Ajaran</option>
                  </select>
                </div>

                {/* Format Ekspor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Format Ekspor</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-gray-900 transition-all"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleTampilkanLaporan}
                  disabled={loading || !selectedChild}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Tampilkan Laporan
                </button>
                <button
                  onClick={() => handleExport(exportFormat)}
                  className="px-6 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Unduh
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Hafalan */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-emerald-600">{statistik.totalHafalan}</span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Total Hafalan</p>
                <p className="text-gray-400 text-xs mt-1">Surah yang dihafal</p>
              </div>

              {/* Hafalan Baru */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-blue-600">{statistik.hafalanBaru}</span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Hafalan Baru</p>
                <p className="text-gray-400 text-xs mt-1">Dalam periode ini</p>
              </div>

              {/* Rata-rata Nilai */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-amber-600">{statistik.rataRataNilai}</span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Rata-rata Nilai</p>
                <p className="text-gray-400 text-xs mt-1">Dari 100</p>
              </div>

              {/* Muroja'ah */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <BookMarked className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl lg:text-3xl font-bold text-purple-600">{statistik.totalMurojaah}</span>
                </div>
                <p className="text-gray-600 text-sm font-medium">Pengulangan</p>
                <p className="text-gray-400 text-xs mt-1">Muroja'ah</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: Tabel Detail Hafalan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Detail Hafalan</h2>
                <p className="text-sm text-gray-500 mt-0.5">Riwayat lengkap setoran hafalan dan penilaian</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tanggal</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Surah / Ayat</th>
                    <th className="px-8 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Tajwid</th>
                    <th className="px-8 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Kelancaran</th>
                    <th className="px-8 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Makhraj</th>
                    <th className="px-8 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Implementasi</th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detailHafalan.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4 text-sm text-gray-900 font-medium">{index + 1}</td>
                      <td className="px-8 py-4 text-sm text-gray-700">{item.tanggal}</td>
                      <td className="px-8 py-4 text-sm text-gray-900 font-semibold">{item.surah}</td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.nilaiTajwid >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.nilaiTajwid}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.nilaiKelancaran >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.nilaiKelancaran}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.nilaiMakhraj >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.nilaiMakhraj}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.nilaiImplementasi >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.nilaiImplementasi}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-600">{item.catatan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {detailHafalan.length === 0 && (
              <div className="text-center py-16 px-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Belum ada data hafalan</p>
                <p className="text-gray-400 text-sm mt-1">Data akan muncul setelah setoran hafalan tersimpan</p>
              </div>
            )}
          </div>

          {/* SECTION 5: Catatan Otomatis */}
          {kesimpulan && (
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-sm border border-yellow-200 p-8">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-yellow-100 rounded-lg flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-900 mb-3">Kesimpulan Otomatis</h3>
                  <div className="space-y-2 text-sm text-yellow-800">
                    <p>
                      Ananda <span className="font-semibold">{kesimpulan.nama || 'telah'}</span> menunjukkan progres yang{' '}
                      <span className="font-semibold">{kesimpulan.predikat}</span> dengan menghafal{' '}
                      <span className="font-semibold">{statistik.totalHafalan} surah</span> dan rata-rata nilai{' '}
                      <span className="font-semibold">{statistik.rataRataNilai}/100</span>.
                    </p>
                    <p className="mt-3">
                      <span className="font-semibold">Rekomendasi:</span> {kesimpulan.rekomendasi}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </OrangtuaLayout>
  )
}
