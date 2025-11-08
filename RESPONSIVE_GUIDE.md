# Panduan Responsive Design untuk Admin Pages

## 📱 Overview

Semua halaman admin di aplikasi SIMTAQ (Sistem Informasi Manajemen Tahfidz Qur'an) telah dibuat responsive agar dapat diakses dengan optimal di berbagai ukuran device:

- 📱 **Mobile**: 320px - 640px
- 📱 **Tablet**: 641px - 1024px
- 💻 **Desktop**: 1025px - 1536px
- 🖥️ **Large Desktop**: 1537px+

## 🎨 Komponen Responsive

### 1. ResponsiveContainer

Wrapper utama untuk halaman dengan padding yang menyesuaikan ukuran layar.

```jsx
import { ResponsiveContainer } from '@/components/admin/ResponsiveWrapper';

<ResponsiveContainer>
  {/* Konten halaman */}
</ResponsiveContainer>
```

**Breakpoints:**
- Mobile (sm): `px-4 py-4`
- Tablet (md): `px-6 py-6`
- Desktop (lg): `px-8 py-8`

---

### 2. ResponsiveGrid

Grid layout yang otomatis menyesuaikan jumlah kolom.

```jsx
import { ResponsiveGrid } from '@/components/admin/ResponsiveWrapper';

<ResponsiveGrid
  cols={{ sm: 1, md: 2, lg: 3, xl: 4 }}
  gap="md"
>
  {/* Item grid */}
</ResponsiveGrid>
```

**Props:**
- `cols`: Jumlah kolom per breakpoint
  - `sm`: Mobile (default: 1)
  - `md`: Tablet (default: 2)
  - `lg`: Desktop (default: 3)
  - `xl`: Large Desktop (default: 4)
- `gap`: Jarak antar item (`sm`, `md`, `lg`)

**Contoh Penggunaan:**

```jsx
// 3 kolom di desktop, 2 di tablet, 1 di mobile
<ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
  <StatCard />
  <StatCard />
  <StatCard />
</ResponsiveGrid>
```

---

### 3. ResponsiveCard

Card dengan padding dan border radius responsive.

```jsx
import { ResponsiveCard } from '@/components/admin/ResponsiveWrapper';

<ResponsiveCard
  padding="default"
  className="bg-white shadow-lg"
>
  {/* Konten card */}
</ResponsiveCard>
```

**Props:**
- `padding`: Ukuran padding (`sm`, `default`, `lg`)
- `className`: CSS classes tambahan

---

### 4. ResponsiveStatCard

Stat card khusus dengan icon, title, dan value.

```jsx
import { ResponsiveStatCard } from '@/components/admin/ResponsiveWrapper';
import { Users } from 'lucide-react';

<ResponsiveStatCard
  icon={Users}
  title="Total Siswa"
  value="250"
  subtitle="Aktif"
  color="emerald"
/>
```

**Props:**
- `icon`: Lucide icon component
- `title`: Judul card
- `value`: Nilai utama
- `subtitle`: (Opsional) Text tambahan
- `color`: Skema warna (`emerald`, `amber`, `blue`, `purple`)

---

### 5. ResponsiveHeading

Heading dengan ukuran text responsive.

```jsx
import { ResponsiveHeading } from '@/components/admin/ResponsiveWrapper';

<ResponsiveHeading
  level={1}
  gradient={true}
  className="text-gray-900"
>
  Dashboard Admin
</ResponsiveHeading>
```

**Props:**
- `level`: 1-4 (h1, h2, h3, h4)
- `gradient`: Boolean untuk gradient text
- `className`: CSS classes tambahan

**Ukuran per level:**

| Level | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| 1     | text-2xl | text-3xl | text-4xl |
| 2     | text-xl | text-2xl | text-3xl |
| 3     | text-lg | text-xl | text-2xl |
| 4     | text-base | text-lg | text-xl |

---

### 6. ResponsiveTableWrapper

Wrapper untuk table dengan horizontal scroll di mobile.

```jsx
import { ResponsiveTableWrapper } from '@/components/admin/ResponsiveWrapper';

<ResponsiveTableWrapper className="bg-white shadow-xl">
  <table className="w-full min-w-full">
    <thead>
      {/* ... */}
    </thead>
    <tbody>
      {/* ... */}
    </tbody>
  </table>
</ResponsiveTableWrapper>
```

**Fitur:**
- Auto horizontal scroll di mobile
- Rounded corners yang menyesuaikan
- Custom scrollbar styling

---

### 7. ResponsiveModal

Modal dialog responsive.

```jsx
import { ResponsiveModal } from '@/components/admin/ResponsiveWrapper';

<ResponsiveModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Tambah Data"
  maxWidth="xl"
>
  <form>
    {/* Form content */}
  </form>
</ResponsiveModal>
```

**Props:**
- `isOpen`: Boolean untuk show/hide
- `onClose`: Callback function
- `title`: (Opsional) Judul modal
- `maxWidth`: Ukuran maksimal (`sm`, `md`, `lg`, `xl`, `2xl`)

---

### 8. ResponsiveChartContainer

Container khusus untuk chart/grafik.

```jsx
import { ResponsiveChartContainer } from '@/components/admin/ResponsiveWrapper';
import { LineChart } from 'recharts';

<ResponsiveChartContainer title="Grafik Hafalan">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* Chart components */}
    </LineChart>
  </ResponsiveContainer>
</ResponsiveChartContainer>
```

**Ukuran Chart:**
- Mobile: `h-64` (256px)
- Tablet: `h-72` (288px)
- Desktop: `h-80` (320px)

---

## 🎯 CSS Utility Classes

File: `src/styles/responsive.css`

### Grid Layouts

```css
.stats-grid        /* 4 -> 3 -> 2 -> 1 columns */
.charts-grid       /* 2 -> 1 columns */
.three-col-grid    /* 3 -> 2 -> 1 columns */
```

### Typography

```css
.responsive-heading-xl    /* 32px -> 28px -> 24px -> 22px */
.responsive-heading-lg    /* 24px -> 22px -> 20px -> 18px */
.responsive-text-base     /* 14px -> 13px */
.responsive-text-sm       /* 12px -> 11px */
```

### Spacing

```css
.responsive-gap-lg        /* 24px -> 16px -> 12px */
.responsive-gap-md        /* 16px -> 12px */
.responsive-container     /* Padding menyesuaikan */
```

### Visibility

```css
.hide-on-mobile          /* Display: none di mobile */
.show-on-mobile          /* Display: block di mobile */
```

---

## 📐 Breakpoint Reference

Gunakan Tailwind CSS breakpoints:

```css
/* Mobile First Approach */
.class              /* Mobile (0-639px) */
sm:class            /* Tablet (640px+) */
md:class            /* Desktop Small (768px+) */
lg:class            /* Desktop (1024px+) */
xl:class            /* Desktop Large (1280px+) */
2xl:class           /* Desktop XL (1536px+) */
```

---

## ✅ Best Practices

### 1. Mobile First Approach

Selalu mulai desain dari mobile, kemudian tambahkan breakpoint untuk layar yang lebih besar.

```jsx
// ✅ Good
<div className="text-sm sm:text-base lg:text-lg">

// ❌ Bad
<div className="text-lg md:text-base sm:text-sm">
```

### 2. Gunakan Flexbox yang Responsive

```jsx
// Stack di mobile, horizontal di tablet+
<div className="flex flex-col sm:flex-row gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### 3. Responsive Padding & Margin

```jsx
<div className="p-4 sm:p-6 lg:p-8">
  {/* Konten */}
</div>
```

### 4. Icon Sizing

```jsx
<Icon size={18} className="sm:hidden" />        {/* Mobile */}
<Icon size={20} className="hidden sm:block lg:hidden" />  {/* Tablet */}
<Icon size={24} className="hidden lg:block" />   {/* Desktop */}
```

### 5. Button Responsive

```jsx
<button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3">
  <span className="text-sm sm:text-base">Click Me</span>
</button>
```

---

## 🔧 Testing Responsiveness

### Browser DevTools

1. Buka Chrome/Firefox DevTools (F12)
2. Toggle device toolbar (Ctrl + Shift + M)
3. Test di berbagai ukuran:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1280px+)

### Real Device Testing

Test di device fisik untuk hasil terbaik:
- Android smartphone
- iPhone
- iPad/tablet
- Desktop monitor

---

## 📊 Contoh Lengkap: Halaman Admin

```jsx
'use client';

import { useState } from 'react';
import { Users, BookOpen, Target } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveHeading,
  ResponsiveStatCard,
  ResponsiveTableWrapper,
  ResponsiveModal
} from '@/components/admin/ResponsiveWrapper';

export default function ExamplePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <AdminLayout>
      <ResponsiveContainer>
        <ResponsiveCard className="bg-gradient-to-br from-emerald-50/30">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <ResponsiveHeading level={1} gradient={true}>
              Dashboard Example
            </ResponsiveHeading>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Halaman contoh responsive design
            </p>
          </div>

          {/* Statistics */}
          <ResponsiveGrid cols={{ sm: 1, md: 3 }} gap="md" className="mb-8">
            <ResponsiveStatCard
              icon={Users}
              title="Total Siswa"
              value="250"
              color="emerald"
            />
            <ResponsiveStatCard
              icon={BookOpen}
              title="Hafalan Selesai"
              value="45"
              color="amber"
            />
            <ResponsiveStatCard
              icon={Target}
              title="Target Bulan Ini"
              value="2 Juz"
              color="blue"
            />
          </ResponsiveGrid>

          {/* Table */}
          <ResponsiveTableWrapper className="bg-white">
            <table className="w-full">
              <thead>
                <tr className="bg-emerald-100">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm">
                    Nama
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm">
                    Kelas
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Table rows */}
              </tbody>
            </table>
          </ResponsiveTableWrapper>

          {/* Button */}
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 w-full sm:w-auto px-6 py-3 bg-emerald-500 text-white rounded-xl"
          >
            Tambah Data
          </button>

          {/* Modal */}
          <ResponsiveModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Form Input"
            maxWidth="lg"
          >
            <form>
              {/* Form fields */}
            </form>
          </ResponsiveModal>
        </ResponsiveCard>
      </ResponsiveContainer>
    </AdminLayout>
  );
}
```

---

## 📝 Checklist Responsive

Sebelum deploy, pastikan:

- [ ] Halaman tampil baik di mobile (< 640px)
- [ ] Halaman tampil baik di tablet (640-1024px)
- [ ] Halaman tampil baik di desktop (> 1024px)
- [ ] Table bisa di-scroll horizontal di mobile
- [ ] Button tidak terlalu kecil di mobile (min 44x44px)
- [ ] Text readable di semua ukuran
- [ ] Modal tidak keluar layar di mobile
- [ ] Chart/grafik menyesuaikan lebar container
- [ ] Spacing konsisten antar breakpoint
- [ ] Navigation/menu accessible di mobile

---

## 🐛 Troubleshooting

### 1. Table terlalu lebar di mobile

```jsx
// Gunakan ResponsiveTableWrapper
<ResponsiveTableWrapper>
  <table className="w-full min-w-[600px]">
    {/* Set min-width sesuai kebutuhan */}
  </table>
</ResponsiveTableWrapper>
```

### 2. Text terpotong (truncate)

```jsx
// Gunakan truncate untuk text panjang
<p className="truncate sm:whitespace-normal">
  Long text here...
</p>
```

### 3. Grid tidak responsive

```jsx
// Pastikan menggunakan ResponsiveGrid atau Tailwind responsive classes
<ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
  {/* Items */}
</ResponsiveGrid>
```

### 4. Modal terlalu besar di mobile

```jsx
// Gunakan ResponsiveModal dengan maxWidth
<ResponsiveModal maxWidth="sm">
  {/* Content */}
</ResponsiveModal>
```

---

## 📚 Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev: Responsive Images](https://web.dev/responsive-images/)

---

## 🎓 Tips & Tricks

1. **Test early, test often** - Jangan tunggu sampai selesai untuk test responsive
2. **Use real devices** - Emulator bagus, tapi device fisik lebih baik
3. **Consider touch targets** - Minimal 44x44px untuk elemen yang bisa diklik
4. **Optimize images** - Gunakan responsive images untuk performance
5. **Think mobile first** - Lebih mudah scale up daripada scale down

---

**Dibuat oleh**: Tim Development SIMTAQ
**Terakhir diupdate**: November 2025
**Versi**: 1.0.0
