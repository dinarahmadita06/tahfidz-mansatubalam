# 🎨 Panduan Refactoring ke Desain Islami-Modern

## ✅ Halaman yang Sudah Diupdate

### 1. Login Page ✅
**File:** `src/app/login/page.js`

**Update yang dilakukan:**
- Background gradient islami dengan pattern geometri
- Input fields dengan gradient icon badges
- Button dengan gradient modern
- Quick login cards dengan border dan hover effects
- Decorative floating elements

### 2. Admin Dashboard ✅
**File:** `src/app/admin/dashboard/page.js`

**Update yang dilakukan:**
- Full page Islamic pattern background
- Islamic Page Header dengan gradient
- Stat cards dengan pattern dan gradient icons
- Progress bars dengan gradient dan animations
- Alert cards dengan decorative elements
- Semua card menggunakan rounded-3xl dan soft shadows

### 3. Guru Dashboard ✅
**File:** `src/app/guru/dashboard/page.js`

**Update yang dilakukan:**
- Menggunakan IslamicCard dan IslamicCardHeader
- Stat cards custom dengan pattern background
- Jadwal dan agenda cards dengan gradient backgrounds
- Progress bars dengan animations
- Status badges dengan border dan colors yang konsisten
- Link buttons dengan hover transitions

### 4. Admin Siswa Page (Partially) ✅
**File:** `src/app/admin/siswa/page.js`

**Update yang dilakukan:**
- IslamicPageHeader dan IslamicCard sudah diterapkan
- Info box dengan gradient
- **Yang masih bisa diupdate:** Search bar, filter dropdown, stats cards, dan table styling

---

## 📋 Halaman yang Masih Perlu Diupdate

### Priority High (Dashboard pages)

#### 1. Siswa Dashboard
**File:** `src/app/dashboard/page.js`

**Yang perlu diupdate:**
- Header → gunakan gradient header seperti guru dashboard
- Stats cards → ubah ke IslamicStatCard dengan gradient
- Progress card → tambahkan pattern background
- Table → gunakan styling modern dengan rounded corners

#### 2. Orang Tua Dashboard
**File:** `src/app/orangtua/dashboard/page.js`

**Yang perlu diupdate:**
- Header section
- Child cards → tambahkan pattern dan decorative elements
- Weekly progress → gunakan gradient bars
- Communications → styling card lebih modern
- Tips section sudah bagus, tambahkan pattern background

### Priority Medium (Admin pages)

#### 1. Admin Guru Page
**File:** `src/app/admin/guru/page.js`

#### 2. Admin Kelas Page
**File:** `src/app/admin/kelas/page.js`

#### 3. Admin Tahun Ajaran
**File:** `src/app/admin/tahun-ajaran/page.js`

#### 4. Admin Validasi Siswa
**File:** `src/app/admin/validasi-siswa/page.js`

#### 5. Admin Orang Tua
**File:** `src/app/admin/orangtua/page.js`

### Priority Low (Other pages)

- Semua halaman guru lainnya (evaluasi, laporan, dll)
- Semua halaman siswa lainnya (hafalan, jadwal, dll)
- Halaman laporan

---

## 🛠️ Template dan Pattern yang Sudah Ada

### 1. Komponen UI yang Siap Pakai

#### IslamicPageHeader
```jsx
import { IslamicPageHeader } from '@/components/ui/IslamicPageHeader';

<IslamicPageHeader
  icon={Users}
  title="Judul Halaman"
  subtitle="Deskripsi singkat halaman"
  badge="2024/2025" // optional
  actions={<IslamicButton>Action</IslamicButton>} // optional
/>
```

#### IslamicCard & IslamicCardHeader
```jsx
import { IslamicCard, IslamicCardHeader } from '@/components/ui/IslamicCard';

<IslamicCard pattern decorative hover>
  <IslamicCardHeader
    icon={BookOpen}
    title="Judul Card"
    subtitle="Subtitle optional"
    action={<button>Action</button>} // optional
  />
  {/* Content di sini */}
</IslamicCard>
```

#### IslamicButton
```jsx
import { IslamicButton, IslamicIconButton } from '@/components/ui/IslamicButton';

<IslamicButton variant="primary" icon={Plus}>
  Tambah Data
</IslamicButton>

<IslamicIconButton
  icon={Edit}
  variant="secondary"
  tooltip="Edit"
/>
```

### 2. Pattern Backgrounds

#### Full Page Background
```jsx
<div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L61.8 38.2 100 38.2 69.1 61.8 80.9 100 50 76.4 19.1 100 30.9 61.8 0 38.2 38.2 38.2 Z' fill='%23059669' fill-opacity='1'/%3E%3C/svg%3E")`,
  backgroundSize: '100px 100px'
}}></div>
```

#### Card Pattern (sudah ada di IslamicCard)
Otomatis ditambahkan jika prop `pattern` di-enable.

### 3. Stat Card Template

```jsx
function IslamicStatCard({ icon: Icon, title, value, gradient = "from-emerald-400 to-teal-500" }) {
  return (
    <div className="group relative bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-sage-100 overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }}></div>

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-sage-600 mb-1">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-br from-sage-700 to-sage-500 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
        </div>
      </div>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/0 to-emerald-400/0 group-hover:from-amber-400/5 group-hover:to-emerald-400/5 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
}
```

### 4. Gradient Header Template

```jsx
<div className="relative rounded-3xl bg-gradient-to-br from-emerald-50 via-amber-50 to-teal-50 p-8 shadow-lg border border-emerald-100 overflow-hidden">
  {/* Decorative circles */}
  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-200/30 to-transparent rounded-full blur-3xl"></div>
  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>

  <div className="relative flex items-center gap-4">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
      <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
    </div>
    <div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-sage-800 to-emerald-700 bg-clip-text text-transparent">
        Judul Halaman
      </h1>
      <p className="text-sage-600 font-medium mt-1">
        Deskripsi halaman
      </p>
    </div>
  </div>
</div>
```

### 5. Progress Bar dengan Gradient

```jsx
<div className="relative w-full h-3 bg-sage-100 rounded-full overflow-hidden">
  <div
    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000 ease-out"
    style={{ width: `${progress}%` }}
  >
    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
  </div>
</div>
```

### 6. Status Badge Modern

```jsx
<span className="px-3 py-1.5 text-xs font-bold rounded-xl border-2 bg-emerald-50 text-emerald-700 border-emerald-200">
  Status Text
</span>
```

### 7. Search Bar Modern

```jsx
<div className="relative">
  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
    <Search size={18} className="text-white" strokeWidth={2.5} />
  </div>
  <input
    type="text"
    placeholder="Cari..."
    className="w-full pl-16 pr-4 py-3.5 border-2 border-sage-200 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-sage-50/30 text-sage-800 placeholder:text-sage-400 font-medium transition-all duration-300"
  />
</div>
```

### 8. Table Styling Modern

```jsx
<div className="relative bg-white rounded-3xl p-6 shadow-md border border-sage-100 overflow-hidden">
  {/* Pattern background */}
  <div className="absolute inset-0 opacity-[0.02]" style={{...}}></div>

  <div className="relative overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b-2 border-sage-100">
          <th className="px-6 py-4 text-left text-xs font-bold text-sage-700 uppercase tracking-wider">
            Header
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-sage-100">
        <tr className="hover:bg-sage-50 transition-colors duration-200">
          <td className="px-6 py-4 text-sm text-sage-800 font-medium">
            Data
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

## 🎨 Color Palette Reference

### Sage (Primary)
```
sage-50: #f8faf7
sage-100: #e8f0e5
sage-200: #d1e1cc
sage-600: #4a7046
sage-700: #3c5a39
sage-800: #32482f
sage-900: #2a3d28
```

### Cream (Accent)
```
cream-50: #fdfcfa
cream-100: #faf7f2
cream-200: #f5ede0
```

### Gradients yang Sering Dipakai

#### Primary (Emerald to Teal)
```jsx
className="bg-gradient-to-r from-emerald-400 to-teal-500"
className="bg-gradient-to-r from-emerald-500 to-teal-600"
```

#### Secondary (Amber to Orange)
```jsx
className="bg-gradient-to-r from-amber-400 to-orange-500"
className="bg-gradient-to-r from-amber-500 to-orange-600"
```

#### Info (Blue to Indigo)
```jsx
className="bg-gradient-to-r from-blue-400 to-indigo-500"
```

#### Special (Purple to Violet)
```jsx
className="bg-gradient-to-r from-purple-400 to-violet-500"
```

#### Danger (Red to Rose)
```jsx
className="bg-gradient-to-r from-red-400 to-rose-500"
```

---

## 📝 Step-by-Step Guide untuk Update Halaman

### Langkah 1: Import Komponen
```jsx
import { IslamicPageHeader } from '@/components/ui/IslamicPageHeader';
import { IslamicCard, IslamicCardHeader } from '@/components/ui/IslamicCard';
import { IslamicButton } from '@/components/ui/IslamicButton';
```

### Langkah 2: Tambahkan Full Page Background
Letakkan di awal return statement, setelah layout wrapper:
```jsx
<AdminLayout> {/* atau layout lainnya */}
  {/* Full Page Pattern Background */}
  <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{...}}></div>

  <div className="relative space-y-6 pb-8">
    {/* Konten halaman */}
  </div>
</AdminLayout>
```

### Langkah 3: Replace Header
```jsx
// ❌ Sebelum
<div className="mb-6">
  <h1 className="text-2xl font-bold">Judul</h1>
</div>

// ✅ Sesudah
<IslamicPageHeader
  icon={Users}
  title="Judul"
  subtitle="Deskripsi"
/>
```

### Langkah 4: Replace Cards
```jsx
// ❌ Sebelum
<div className="bg-white p-6 rounded-lg shadow">
  <h2 className="text-lg font-bold mb-4">Card Title</h2>
  {/* Content */}
</div>

// ✅ Sesudah
<IslamicCard pattern decorative hover>
  <IslamicCardHeader
    icon={BookOpen}
    title="Card Title"
  />
  {/* Content */}
</IslamicCard>
```

### Langkah 5: Update Stat Cards
Gunakan template `IslamicStatCard` yang sudah disediakan di atas.

### Langkah 6: Update Buttons
```jsx
// ❌ Sebelum
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Action
</button>

// ✅ Sesudah
<IslamicButton variant="primary" icon={Plus}>
  Action
</IslamicButton>
```

### Langkah 7: Update Status Badges
```jsx
// ❌ Sebelum
<span className="bg-green-100 text-green-800 px-2 py-1 rounded">
  Active
</span>

// ✅ Sesudah
<span className="px-3 py-1.5 text-xs font-bold rounded-xl border-2 bg-emerald-50 text-emerald-700 border-emerald-200">
  Active
</span>
```

### Langkah 8: Update Progress Bars
Gunakan template progress bar dengan gradient yang sudah disediakan.

---

## ⚠️ Hal yang TIDAK Boleh Diubah

1. **Jangan ubah struktur data dan API calls**
   - Semua `fetch()`, `useState`, `useEffect` tetap sama
   - Props dan parameter function tidak berubah

2. **Jangan ubah logika bisnis**
   - Event handlers tetap sama (onClick, onChange, onSubmit)
   - Validasi dan kondisi logika tidak berubah

3. **Jangan ubah routing**
   - Semua Link dan router.push() tetap sama

4. **Jangan ubah nama function dan component**
   - Export default tetap sama
   - Function names tidak berubah

---

## 🚀 Quick Refactoring Checklist

Untuk setiap halaman yang akan diupdate, pastikan:

- [ ] Import IslamicPageHeader, IslamicCard, IslamicButton
- [ ] Tambahkan full page background pattern
- [ ] Replace header dengan IslamicPageHeader
- [ ] Wrap konten utama dalam IslamicCard
- [ ] Update stat cards dengan gradient dan pattern
- [ ] Update buttons ke IslamicButton
- [ ] Update status badges dengan border dan rounded-xl
- [ ] Update progress bars dengan gradient
- [ ] Update input fields dengan gradient icons
- [ ] Update tables dengan styling modern
- [ ] Test functionality masih jalan (data, API, navigation)

---

## 💡 Tips dan Best Practices

### 1. Consistency is Key
Gunakan warna gradient yang konsisten:
- Primary actions: emerald-to-teal
- Secondary actions: amber-to-orange
- Info: blue-to-indigo
- Success: emerald
- Warning: amber
- Danger: red-to-rose

### 2. Spacing and Rhythm
- Gunakan `space-y-6` atau `space-y-8` untuk spacing antar section
- Gunakan `gap-6` untuk grid layouts
- Padding card: `p-6` atau `p-8` untuk desktop

### 3. Border Radius
- Cards utama: `rounded-3xl`
- Cards kecil/nested: `rounded-2xl`
- Buttons dan badges: `rounded-xl`
- Input fields: `rounded-xl`

### 4. Shadows
- Default: `shadow-md`
- Hover: `hover:shadow-xl`
- Icon badges: `shadow-md`

### 5. Transitions
Selalu tambahkan transitions untuk smooth UX:
```jsx
className="transition-all duration-300"
```

### 6. Icons
- Gunakan `strokeWidth={2.5}` untuk icons yang lebih bold
- Size icons dalam badges: `w-5 h-5` atau `w-6 h-6`
- Size icons dalam stat cards: `w-7 h-7`

---

## 🔍 Troubleshooting

### Problem: Warna sage/cream tidak muncul
**Solution:** Pastikan warna sudah didefinisikan di `tailwind.config.js`:
```js
colors: {
  sage: {
    50: '#f8faf7',
    100: '#e8f0e5',
    // ... dst
  },
  cream: {
    50: '#fdfcfa',
    // ... dst
  }
}
```

### Problem: Pattern background tidak terlihat
**Solution:** Cek opacity. Pattern harus sangat subtle:
```jsx
className="opacity-[0.015]"  // untuk full page
className="opacity-[0.02]"   // untuk card
className="opacity-[0.03]"   // untuk emphasis
```

### Problem: Component import error
**Solution:** Pastikan path import benar:
```jsx
import { IslamicCard } from '@/components/ui/IslamicCard';
```

---

## 📚 Referensi Lengkap

Lihat file-file berikut untuk referensi lengkap:
1. `ISLAMIC_DESIGN_GUIDE.md` - Design system lengkap
2. `src/app/login/page.js` - Contoh halaman login
3. `src/app/admin/dashboard/page.js` - Contoh dashboard admin
4. `src/app/guru/dashboard/page.js` - Contoh dashboard guru
5. `src/components/ui/IslamicCard.js` - Komponen card
6. `src/components/ui/IslamicButton.js` - Komponen button
7. `src/components/ui/IslamicPageHeader.js` - Komponen header

---

**Happy Refactoring! 🎨✨**

*Untuk pertanyaan atau bantuan, refer ke file-file di atas atau lihat ISLAMIC_DESIGN_GUIDE.md*
