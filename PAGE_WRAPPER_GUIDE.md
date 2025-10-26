# 📄 Panduan PageWrapper - Tahfidz App

## 🎯 Tujuan

Memberikan background yang konsisten dan elegan seperti halaman Profil Admin ke semua halaman dalam sistem Tahfidz App, **tanpa menggunakan global styling**. Setiap halaman memiliki styling lokal sendiri melalui komponen `PageWrapper`.

---

## ✨ Fitur PageWrapper

✅ **Background Gradasi Emerald-Amber Pastel**
```css
background: linear-gradient(135deg, #FAFFF8 0%, #FFFBE9 100%);
```

✅ **Ornamen Geometris Islami Samar**
- Pojok kanan bawah: Emerald dengan pola bintang delapan (opacity 0.04-0.06)
- Pojok kiri atas: Amber dengan pola grid (opacity 0.04-0.05)

✅ **Font Poppins** untuk semua teks

✅ **Class Utilities** untuk konsistensi:
- `.page-card` - Card dengan shadow dan radius 16px
- `.page-header` - Header section dengan background putih transparan
- `.page-content-section` - Content section dengan background amber lembut

✅ **Styling Lokal** - Tidak mengganggu komponen global

---

## 🚀 Cara Menggunakan

### 1. Import Component

```jsx
import PageWrapper from '@/components/PageWrapper';
```

### 2. Bungkus Konten Halaman

```jsx
export default function YourPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        {/* Konten halaman di sini */}
      </PageWrapper>
    </AdminLayout>
  );
}
```

### 3. Gunakan Class Utilities

```jsx
<PageWrapper>
  {/* Header Section */}
  <div className="page-header">
    <h1>Dashboard</h1>
    <p>Ringkasan data hafalan santri</p>
  </div>

  {/* Content Section */}
  <div className="page-content-section">
    {/* Card dengan styling konsisten */}
    <div className="page-card p-6">
      <h2>Statistik Hafalan</h2>
      <p>Data hafalan bulan ini</p>
    </div>

    <div className="page-card p-6 mt-4">
      <h2>Aktivitas Terbaru</h2>
      <table>...</table>
    </div>
  </div>
</PageWrapper>
```

---

## 📚 Contoh Implementasi

### A. Dashboard Page

```jsx
'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import { Home, ChevronRight, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-emerald-100/50 shadow-sm">
            <Home size={16} className="text-emerald-600" strokeWidth={1.5} />
            <ChevronRight size={14} className="text-gray-400" strokeWidth={2} />
            <span className="font-semibold text-emerald-700">Dashboard</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="page-header">
          <div className="flex items-start gap-5">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}
            >
              <BarChart3 className="text-white" size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold" style={{ color: '#064E3B' }}>
                Dashboard Admin
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Ringkasan data hafalan dan aktivitas sistem
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="page-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Santri
            </h3>
            <p className="text-3xl font-bold text-emerald-600">150</p>
          </div>

          <div className="page-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Guru Tahfidz
            </h3>
            <p className="text-3xl font-bold text-blue-600">12</p>
          </div>

          <div className="page-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Kelas Aktif
            </h3>
            <p className="text-3xl font-bold text-purple-600">8</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="page-card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Aktivitas Terbaru
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Waktu</th>
                <th className="text-left py-3 px-4">Aktivitas</th>
                <th className="text-left py-3 px-4">User</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">10:30</td>
                <td className="py-3 px-4">Menambah data hafalan</td>
                <td className="py-3 px-4">Ustadz Ahmad</td>
              </tr>
            </tbody>
          </table>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
```

---

### B. Manajemen Siswa Page

```jsx
'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import { Users, Plus, Search } from 'lucide-react';

export default function ManajemenSiswaPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-5">
              <div
                className="p-4 rounded-2xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                }}
              >
                <Users className="text-white" size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manajemen Siswa
                </h1>
                <p className="text-sm text-gray-600 mt-2">
                  Kelola data santri dan hafalan
                </p>
              </div>
            </div>

            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              }}
            >
              <Plus size={18} strokeWidth={2} />
              Tambah Siswa
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="page-card p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari siswa..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option>Semua Kelas</option>
              <option>X IPA 1</option>
              <option>X IPA 2</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="page-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)' }}>
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-900">NIS</th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-900">Nama</th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-900">Kelas</th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-900">Hafalan</th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-900">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">2024001</td>
                  <td className="px-6 py-4 font-medium">Ahmad Maulana</td>
                  <td className="px-6 py-4">X IPA 1</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                      5 Juz
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Detail
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
```

---

### C. Log Activity Page

```jsx
'use client';

import AdminLayout from '@/components/layout/AdminLayout';
import PageWrapper from '@/components/PageWrapper';
import { Activity } from 'lucide-react';

export default function LogActivityPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        {/* Header */}
        <div className="page-header">
          <div className="flex items-start gap-5">
            <div
              className="p-4 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
              }}
            >
              <Activity className="text-white" size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Log Aktivitas
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Riwayat aktivitas pengguna sistem
              </p>
            </div>
          </div>
        </div>

        {/* Log Table */}
        <div className="page-card overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-lg font-bold text-gray-900">
              Aktivitas 30 Hari Terakhir
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Waktu</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Aktivitas</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">2024-01-27 10:30:15</td>
                  <td className="px-6 py-4 font-medium">Admin</td>
                  <td className="px-6 py-4">Login ke sistem</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Success
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
```

---

## 🎨 Customization

### Nonaktifkan Ornamen

Jika tidak ingin menampilkan ornamen islami di halaman tertentu:

```jsx
<PageWrapper showOrnaments={false}>
  {/* Konten tanpa ornamen */}
</PageWrapper>
```

### Custom Class

Tambahkan class custom jika diperlukan:

```jsx
<PageWrapper className="custom-class">
  {/* Konten */}
</PageWrapper>
```

---

## 📐 Layout Pattern yang Disarankan

### Pattern 1: Halaman dengan Header + Cards

```jsx
<PageWrapper>
  {/* Breadcrumb */}
  <div className="breadcrumb">...</div>

  {/* Header */}
  <div className="page-header">
    <h1>Judul Halaman</h1>
    <p>Deskripsi</p>
  </div>

  {/* Cards Grid */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="page-card p-6">Card 1</div>
    <div className="page-card p-6">Card 2</div>
    <div className="page-card p-6">Card 3</div>
  </div>
</PageWrapper>
```

### Pattern 2: Halaman dengan Tabel

```jsx
<PageWrapper>
  {/* Header */}
  <div className="page-header">
    <h1>Data Table</h1>
  </div>

  {/* Search/Filter */}
  <div className="page-card p-6 mb-6">
    <input type="search" placeholder="Cari..." />
  </div>

  {/* Table */}
  <div className="page-card overflow-hidden">
    <table>...</table>
  </div>
</PageWrapper>
```

### Pattern 3: Halaman dengan Form

```jsx
<PageWrapper>
  {/* Header */}
  <div className="page-header">
    <h1>Form Input</h1>
  </div>

  {/* Form Card */}
  <div className="page-card p-8 max-w-2xl mx-auto">
    <form>
      <div className="space-y-6">
        <div>
          <label>Field 1</label>
          <input type="text" />
        </div>
        <div>
          <label>Field 2</label>
          <input type="text" />
        </div>
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
</PageWrapper>
```

---

## ✅ Checklist Implementasi

Untuk setiap halaman baru, pastikan:

- [ ] Import `PageWrapper` dari `@/components/PageWrapper`
- [ ] Bungkus konten utama dengan `<PageWrapper>`
- [ ] Gunakan `.page-header` untuk bagian header
- [ ] Gunakan `.page-card` untuk semua card/container
- [ ] Gunakan `.page-content-section` untuk grouping konten (opsional)
- [ ] Breadcrumb menggunakan bg-white/60 dengan backdrop-blur
- [ ] Tombol action menggunakan gradient emerald
- [ ] Tabel header menggunakan gradient emerald pastel

---

## 🌟 Keunggulan Sistem Ini

✅ **Konsistensi Visual** - Semua halaman terlihat seragam
✅ **Styling Lokal** - Tidak bentrok dengan komponen global
✅ **Mudah Maintenance** - Perubahan di PageWrapper berlaku ke semua
✅ **Ringan & Performa** - Styling scoped, tidak membebani global CSS
✅ **Reusable** - Cukup import dan wrap, langsung jadi
✅ **Nuansa Islami** - Ornamen geometris yang elegan

---

## 🔄 Update Halaman yang Sudah Ada

Untuk update halaman existing:

1. Import PageWrapper
2. Wrap konten dengan PageWrapper
3. Ganti class custom card dengan `.page-card`
4. Ganti background lokal dengan class utilities
5. Test tampilan

**Contoh Before-After:**

**Before:**
```jsx
export default function MyPage() {
  return (
    <AdminLayout>
      <div style={{ background: '#f5f5f5' }}>
        <div className="custom-card">
          Content
        </div>
      </div>
    </AdminLayout>
  );
}
```

**After:**
```jsx
import PageWrapper from '@/components/PageWrapper';

export default function MyPage() {
  return (
    <AdminLayout>
      <PageWrapper>
        <div className="page-card p-6">
          Content
        </div>
      </PageWrapper>
    </AdminLayout>
  );
}
```

---

## 🎯 Kesimpulan

Dengan menggunakan `PageWrapper`, setiap halaman akan:

🌿 **Memiliki gradasi emerald-amber pastel yang menenangkan**
🕌 **Menampilkan ornamen geometris islami yang elegan**
📐 **Menggunakan card dengan shadow dan radius konsisten**
🎨 **Terlihat profesional dan harmonis**
⚡ **Tetap ringan dan performant**

**"Konsistensi visual tanpa global styling - setiap halaman indah, terisolasi, dan terkontrol."**
