# 🎨 Design System Guide - Tahfidz App

## Palet Warna Final

```css
/* Primary Colors */
--primary: #1A936F;        /* Hijau zamrud utama */
--secondary: #F7C873;      /* Keemasan lembut */
--accent: #8B5CF6;         /* Ungu lembut */

/* Background */
--background-main: linear-gradient(to bottom right, #ECFDF5, #FEF3C7);
--background-card: #FFFFFF;

/* Text */
--text-main: #064E3B;      /* Hijau tua untuk heading */
--text-secondary: #6B7280; /* Abu-abu untuk subtitle */
```

## Komponen Reusable

### 1. MotivasiHarian
Lokasi: `src/components/shared/MotivasiHarian.js`

```jsx
import MotivasiHarian from '@/components/shared/MotivasiHarian';

<MotivasiHarian
  quote="Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya."
  source="HR. Bukhari"
/>
```

### 2. StatCard
Lokasi: `src/components/shared/StatCard.js`

```jsx
import StatCard from '@/components/shared/StatCard';

<StatCard
  title="Total Siswa"
  value={siswaList.length}
  icon={Users}
  bgColor="from-emerald-100 to-teal-100"
  iconColor="text-emerald-700"
  textColor="text-emerald-900"
  iconBg="bg-emerald-400"
/>
```

### 3. IslamicPattern
Lokasi: `src/components/shared/IslamicPattern.js`

```jsx
import IslamicPattern from '@/components/shared/IslamicPattern';

<div className="relative">
  <IslamicPattern />
  {/* Your content here */}
</div>
```

## Template Halaman Standar

```jsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import GuruLayout from '@/components/layout/GuruLayout';
import MotivasiHarian from '@/components/shared/MotivasiHarian';
import StatCard from '@/components/shared/StatCard';
import IslamicPattern from '@/components/shared/IslamicPattern';

export default function HalamanGuru() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <GuruLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
          <div className="text-center animate-fadeInUp">
            <div className="w-20 h-20 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-emerald-700 font-medium text-lg">Memuat...</p>
          </div>
        </div>
      </GuruLayout>
    );
  }

  return (
    <GuruLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 relative overflow-hidden">
        {/* Islamic Pattern Background */}
        <IslamicPattern />

        <div className="relative z-10 px-8 py-8 max-w-7xl mx-auto">
          {/* Motivasi Harian */}
          <MotivasiHarian
            quote="Quote hadits di sini"
            source="Sumber hadits"
          />

          {/* Header */}
          <div className="mb-8 animate-fadeInUp-delay-2">
            <h1 className="text-4xl font-bold text-emerald-900 mb-2">
              Judul Halaman
            </h1>
            <p className="text-emerald-700 font-medium">
              Deskripsi halaman
            </p>
          </div>

          {/* Stats Cards (Opsional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeInUp-delay-3">
            <StatCard
              title="Stat 1"
              value="100"
              icon={YourIcon}
              bgColor="from-emerald-100 to-teal-100"
              iconColor="text-emerald-700"
              textColor="text-emerald-900"
              iconBg="bg-emerald-400"
            />
            {/* More stat cards */}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 animate-fadeInUp-delay-4">
            {/* Your content here */}
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-in-out;
        }

        .animate-fadeInUp-delay-1 {
          animation: fadeInUp 0.5s ease-in-out 0.1s both;
        }

        .animate-fadeInUp-delay-2 {
          animation: fadeInUp 0.5s ease-in-out 0.2s both;
        }

        .animate-fadeInUp-delay-3 {
          animation: fadeInUp 0.5s ease-in-out 0.3s both;
        }

        .animate-fadeInUp-delay-4 {
          animation: fadeInUp 0.5s ease-in-out 0.4s both;
        }
      `}</style>
    </GuruLayout>
  );
}
```

## Warna untuk Stat Cards

### Emerald (Hijau Zamrud)
```jsx
bgColor="from-emerald-100 to-teal-100"
iconColor="text-emerald-700"
textColor="text-emerald-900"
iconBg="bg-emerald-400"
```

### Teal (Hijau Toska)
```jsx
bgColor="from-teal-100 to-cyan-100"
iconColor="text-teal-700"
textColor="text-teal-900"
iconBg="bg-teal-400"
```

### Amber (Kuning Keemasan)
```jsx
bgColor="from-amber-100 to-yellow-100"
iconColor="text-amber-700"
textColor="text-amber-900"
iconBg="bg-amber-400"
```

### Purple (Ungu)
```jsx
bgColor="from-purple-100 to-violet-100"
iconColor="text-purple-700"
textColor="text-purple-900"
iconBg="bg-purple-400"
```

## Buttons

### Primary Button (Hijau Emerald)
```jsx
className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
```

### Secondary Button (White with Border)
```jsx
className="px-5 py-3 bg-white border-2 border-emerald-300 text-emerald-700 rounded-xl hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
```

### Danger Button
```jsx
className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
```

## Tables

```jsx
<div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
  <table className="w-full">
    <thead className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-100">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-bold text-emerald-800 uppercase tracking-wider">
          Header
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-emerald-50">
      <tr className="hover:bg-emerald-50 transition-colors duration-200">
        <td className="px-6 py-5 text-sm text-emerald-800">
          Data
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Form Inputs

```jsx
<input
  type="text"
  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400 transition-all duration-300 text-emerald-900 placeholder-emerald-400 font-medium outline-none"
  placeholder="Placeholder"
/>
```

## Badges

### Status Aktif
```jsx
className="inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500 text-white shadow-md"
```

### Status Pending
```jsx
className="inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-400 text-white shadow-md"
```

### Status Inactive
```jsx
className="inline-flex px-3 py-1.5 text-xs font-bold rounded-xl bg-gray-200 text-gray-700"
```

## Checklist Update Halaman

- [x] Kelola Siswa (`/guru/siswa`)
- [ ] Dashboard Guru (`/guru`)
- [ ] Verifikasi Hafalan (`/guru/input-hafalan`)
- [ ] Mode Latihan (`/guru/latihan`)
- [ ] Materi Mingguan (`/guru/materi-mingguan`)
- [ ] Laporan (`/guru/laporan`)
- [ ] Pengumuman (`/guru/pengumuman`)
- [ ] Profil (`/guru/profil`)

## Tips
1. Selalu gunakan `animate-fadeInUp-delay-X` untuk animasi bertahap
2. Background halaman: `bg-gradient-to-br from-emerald-50 to-amber-50`
3. Card: `bg-white rounded-2xl shadow-lg border border-emerald-100`
4. Warna teks heading: `text-emerald-900`
5. Warna teks subtitle: `text-emerald-700`
