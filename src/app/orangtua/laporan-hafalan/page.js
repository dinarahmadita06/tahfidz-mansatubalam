'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import OrangtuaLayout from '@/components/layout/OrangtuaLayout'
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
        setChildren(data)

        // Auto-select anak pertama jika ada
        if (data.length > 0) {
          setSelectedChild(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error)
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

  // Default data jika belum ada data dari API
  const progressData = laporanData?.progressData || []
  const performanceData = laporanData?.performanceData || []
  const detailHafalan = laporanData?.detailHafalan || []
  const statistik = laporanData?.statistik || {
    totalHafalan: 0,
    hafalanBaru: 0,
    rataRataNilai: 0,
    totalMurojaah: 0
  }
  const kesimpulan = laporanData?.kesimpulan || null

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
      <div className="-m-6 lg:-m-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-400 via-mint-300 to-amber-200 px-6 lg:px-8 py-8 lg:py-10 shadow-md">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-emerald-800 text-sm mb-4">
            <Home className="w-4 h-4" />
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium">Laporan Hafalan</span>
          </div>

          {/* Title */}
          <div className="flex items-center gap-3 mb-3">
            <ChartBar className="w-10 h-10 text-emerald-700" />
            <div>
              <h1 className="text-4xl font-bold text-emerald-800">Laporan Hafalan</h1>
              <p className="text-emerald-700 mt-1">
                Pantau perkembangan hafalan anak Anda dalam berbagai periode waktu.
              </p>
            </div>
          </div>

          {/* Motivasi Card */}
          <div className="bg-amber-100 text-amber-700 italic border-l-4 border-amber-400 rounded-xl px-5 py-4 mt-5 shadow-sm">
            <p className="text-sm leading-relaxed">
              "Barang siapa membaca satu huruf dari Kitabullah, maka baginya satu kebaikan, dan setiap kebaikan dilipatgandakan sepuluh kali."
            </p>
            <p className="text-xs mt-2 font-semibold not-italic">— HR. Tirmidzi</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Filter & Pengaturan */}
        <div className="bg-white shadow-sm border border-emerald-100 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-800">Pengaturan Laporan Hafalan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilih Anak */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Anak
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periode Waktu
              </label>
              <select
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              >
                <option value="minggu-ini">Minggu Ini</option>
                <option value="bulan-ini">Bulan Ini</option>
                <option value="semester-ini">Semester Ini</option>
                <option value="tahun-ajaran">Tahun Ajaran</option>
              </select>
            </div>

            {/* Format Ekspor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format Ekspor
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-4 py-2 border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col gap-2 justify-end">
              <button
                onClick={() => handleExport(exportFormat)}
                className="bg-amber-400 hover:bg-amber-500 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Unduh Laporan
              </button>
              <button
                onClick={handleTampilkanLaporan}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Tampilkan
              </button>
            </div>
          </div>
        </div>

        {/* Statistik Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Hafalan */}
          <div className="bg-gradient-to-br from-emerald-50 via-mint-50 to-white rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 text-emerald-600" />
              <span className="text-3xl font-semibold text-emerald-700">{statistik.totalHafalan}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Hafalan</p>
            <p className="text-emerald-600 font-medium">Surah</p>
          </div>

          {/* Hafalan Baru */}
          <div className="bg-gradient-to-br from-mint-50 via-emerald-50 to-white rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer border border-emerald-100">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-emerald-600" />
              <span className="text-3xl font-semibold text-emerald-700">{statistik.hafalanBaru}</span>
            </div>
            <p className="text-gray-600 text-sm">Hafalan Baru</p>
            <p className="text-emerald-600 font-medium">Bulan Ini</p>
          </div>

          {/* Rata-rata Nilai */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-white rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer border border-amber-100">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-amber-600" />
              <span className="text-3xl font-semibold text-amber-700">{statistik.rataRataNilai}</span>
            </div>
            <p className="text-gray-600 text-sm">Rata-rata Nilai</p>
            <p className="text-amber-600 font-medium">/ 100</p>
          </div>

          {/* Muroja'ah */}
          <div className="bg-gradient-to-br from-purple-50 via-lilac-50 to-white rounded-2xl p-6 shadow-sm hover:-translate-y-1 transition-transform cursor-pointer border border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <BookMarked className="w-8 h-8 text-purple-600" />
              <span className="text-3xl font-semibold text-purple-700">{statistik.totalMurojaah}</span>
            </div>
            <p className="text-gray-600 text-sm">Pengulangan</p>
            <p className="text-purple-600 font-medium">Muroja'ah</p>
          </div>
        </div>

        {/* Grafik Perkembangan */}
        <div className="bg-white shadow-sm border border-emerald-100 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            📈 Grafik Perkembangan Hafalan Bulanan
          </h2>

          <div className="space-y-8">
            {/* Line Chart - Progress Over Time */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-4">Progress Hafalan & Nilai</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="minggu" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalHafalan"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Total Hafalan"
                    dot={{ fill: '#10b981', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nilaiRataRata"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    name="Nilai Rata-rata"
                    dot={{ fill: '#f59e0b', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="murojaah"
                    stroke="#a855f7"
                    strokeWidth={3}
                    name="Muroja'ah"
                    dot={{ fill: '#a855f7', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart - Performance */}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-4">Performa Berdasarkan Kategori</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="kategori" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #d1fae5',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="nilai"
                    fill="#10b981"
                    name="Nilai"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabel Detail Hafalan */}
        <div className="bg-white shadow-sm border border-emerald-100 rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-emerald-100">
            <h2 className="text-xl font-semibold text-gray-800">
              🧾 Detail Hafalan
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Surah / Ayat
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Tajwid
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Kelancaran
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Makhraj
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-emerald-700 uppercase tracking-wider">
                    Catatan Guru
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-emerald-100">
                {detailHafalan.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-mint-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tanggal}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.surah}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.nilaiTajwid >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.nilaiTajwid}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.nilaiKelancaran >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.nilaiKelancaran}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.nilaiMakhraj >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.nilaiMakhraj}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.catatan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {detailHafalan.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400 italic">Belum ada hafalan dalam periode ini.</p>
            </div>
          )}
        </div>

        {/* Kesimpulan Otomatis */}
        {kesimpulan && (
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800 italic">
                <p className="leading-relaxed">
                  Ananda <span className="font-semibold not-italic">{kesimpulan.nama}</span> telah menyelesaikan{' '}
                  <span className="font-semibold not-italic">{kesimpulan.totalHafalan} surah</span> dengan nilai rata-rata{' '}
                  <span className="font-semibold not-italic">{kesimpulan.rataRataNilai}</span>.
                </p>
                <p className="mt-2 leading-relaxed">
                  Hafalan baru {kesimpulan.peningkatan >= 0 ? 'meningkat' : 'menurun'}{' '}
                  <span className={`font-semibold not-italic ${kesimpulan.peningkatan >= 0 ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {Math.abs(kesimpulan.peningkatan)}%
                  </span>{' '}
                  dibanding periode sebelumnya.
                  {kesimpulan.peningkatan >= 0 ? ' Masya Allah, pertahankan semangat belajarnya! 🌟' : ' Yuk, tingkatkan lagi semangat belajarnya! 💪'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Export Buttons */}
      <div className="fixed bottom-5 right-5 z-50">
        <div className="bg-white shadow-lg rounded-full px-6 py-3 flex gap-3 border border-emerald-100">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
            title="Cetak Laporan"
          >
            <Printer className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Cetak</span>
          </button>

          <div className="w-px bg-gray-300"></div>

          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
            title="Unduh PDF"
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">PDF</span>
          </button>

          <div className="w-px bg-gray-300"></div>

          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
            title="Unduh Excel"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
      </div>
    </OrangtuaLayout>
  )
}
