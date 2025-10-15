# 🕌 PROMPT: Redesign Semua Halaman Aplikasi Tahfidz dengan Islamic Modern Design

## 📋 Overview

Aplikasi tahfidz ini memiliki **47 halaman** yang perlu diubah tampilannya menggunakan Islamic Modern Design System yang sudah dibuat. Design system sudah siap di `src/components/ui-islamic/` dan sudah terimplementasi di halaman `penilaian-kelas` sebagai contoh.

---

## 🎯 Objective

Refactor **SEMUA halaman** aplikasi (Admin, Guru, Orang Tua, Siswa) untuk menggunakan design system baru dengan:
- ✅ Warna Islamic modern (Gold, Cream, Terracotta)
- ✅ Typography yang elegant
- ✅ Islamic icons & patterns
- ✅ Smooth animations & transitions
- ✅ Komponen reusable dari `ui-islamic`

---

## 📂 Struktur Halaman yang Perlu Diubah

### 🔴 **Admin (13 halaman)**
```
/admin/dashboard
/admin/guru
/admin/siswa
/admin/orangtua
/admin/kelas
/admin/kelas/[id]
/admin/tahun-ajaran
/admin/validasi-siswa
/admin/activity-logs
/admin/laporan/hafalan
/admin/laporan/kehadiran
/admin/laporan/statistik
/admin (redirect page)
```

### 🟢 **Guru (16+ halaman)**
```
/guru/dashboard
/guru/penilaian-kelas ✅ (SUDAH SELESAI - GUNAKAN INI SEBAGAI REFERENSI!)
/guru/input-hafalan
/guru/kelola-siswa
/guru/kelola-siswa/kelas-10
/guru/kelola-siswa/kelas-11
/guru/kelola-siswa/kelas-12
/guru/siswa
/guru/tambah-siswa
/guru/aktivitas-siswa
/guru/evaluasi
/guru/laporan
/guru/laporan-guru
/guru/latihan
/guru/mode-latihan
/guru/materi-mingguan
/guru/pengumuman
/guru/setoran-siswa
/guru/ujian-hafalan
/guru (redirect page)
```

### 🔵 **Orang Tua (2+ halaman)**
```
/orangtua/dashboard
/orangtua (redirect page)
```

### 🟡 **Siswa (perlu di-check, mungkin belum ada)**
```
/siswa/dashboard (jika ada)
/siswa/hafalan (jika ada)
/siswa/latihan (jika ada)
```

### 🟣 **General Pages**
```
/dashboard (main dashboard)
/login (jika ada)
/register (jika ada)
/design-showcase ✅ (SUDAH SELESAI - untuk demo)
```

---

## 🎨 Design Guidelines

### 1. **Warna Palette**
```javascript
Primary (Gold): #D4A574 - untuk buttons, highlights, icons
Secondary (Cream): #FFF5E6 - untuk backgrounds, cards
Accent (Terracotta): #D48B6E - untuk special elements
Success: #6FA882 - untuk status sukses
Warning: #E8B67A - untuk peringatan
Error: #E88B8B - untuk error states
```

### 2. **Components yang HARUS Digunakan**

#### Import Statement:
```jsx
import {
  Container,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  StatsCard,
  FeatureCard,
  Grid,
  Flex,
  Stack,
  Button,
  ButtonGroup,
  IconButton,
  Input,
  Textarea,
  Select,
  SearchInput,
  Heading,
  Text,
  ArabicText,
  Badge,
  Divider,
  EmptyState,
  LoadingState,
  Spacer,
} from '@/components/ui-islamic';

import {
  MosqueIcon,
  QuranIcon,
  PrayerIcon,
  KaabaIcon,
  TasbihIcon,
  StarCrescentIcon,
  CalendarIslamicIcon,
  LanternIcon,
  IconContainer,
  FeatureIcon,
} from '@/components/ui-islamic';

import { designSystem } from '@/styles/design-system';
```

#### Pattern yang HARUS Diikuti:

**A. Page Structure:**
```jsx
export default function PageName() {
  return (
    <LayoutComponent> {/* Keep existing layout */}
      <div style={{
        background: designSystem.colors.background.secondary,
        minHeight: '100vh'
      }}>
        {/* Page Header with Pattern */}
        <PageHeader
          title="Judul Halaman"
          subtitle="Deskripsi halaman"
          pattern
        />

        <Container size="default">
          {/* Content goes here */}
        </Container>
      </div>
    </LayoutComponent>
  );
}
```

**B. Stats Cards (untuk dashboard):**
```jsx
<Grid cols={4} gap="md" responsive>
  <StatsCard
    icon={<QuranIcon size="md" />}
    title="Total Santri"
    value="150"
    trend={12}
  />
  <StatsCard
    icon={<PrayerIcon size="md" />}
    title="Hadir Hari Ini"
    value="142"
    trend={5}
  />
  {/* ... more stats */}
</Grid>
```

**C. Data Tables:**
```jsx
<Card variant="elevated" padding="none">
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead style={{
        background: designSystem.islamic.gradients.cream,
        borderBottom: `2px solid ${designSystem.colors.border.DEFAULT}`,
      }}>
        <tr>
          <th style={{
            padding: designSystem.spacing[4],
            textAlign: 'left',
            fontSize: designSystem.typography.fontSize.sm,
            fontWeight: designSystem.typography.fontWeight.semibold,
            color: designSystem.colors.text.primary,
          }}>
            Header 1
          </th>
          {/* ... more headers */}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.id} style={{
            borderBottom: `1px solid ${designSystem.colors.border.light}`,
            background: index % 2 === 0 ?
              designSystem.colors.background.primary :
              designSystem.colors.background.secondary,
          }}>
            <td style={{ padding: designSystem.spacing[4] }}>
              {item.name}
            </td>
            {/* ... more cells */}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

**D. Forms:**
```jsx
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Form Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Grid cols={2} gap="md">
      <Input
        label="Nama"
        placeholder="Masukkan nama..."
        fullWidth
      />
      <Select
        label="Kelas"
        options={kelasOptions}
        fullWidth
      />
    </Grid>
    <Spacer size="md" />
    <Textarea
      label="Catatan"
      rows={4}
      fullWidth
    />
  </CardContent>
  <CardFooter align="right">
    <Button variant="secondary">Batal</Button>
    <Button variant="primary">Simpan</Button>
  </CardFooter>
</Card>
```

**E. Empty States:**
```jsx
<Card variant="cream" padding="lg">
  <EmptyState
    icon={<QuranIcon size="lg" />}
    title="Belum Ada Data"
    description="Belum ada data untuk ditampilkan."
    action={
      <Button variant="primary" icon={<Plus size={16} />}>
        Tambah Data Baru
      </Button>
    }
  />
</Card>
```

**F. Action Buttons:**
```jsx
<ButtonGroup spacing="md">
  <Button
    variant="primary"
    icon={<Plus size={16} />}
    onClick={handleAdd}
  >
    Tambah
  </Button>
  <Button
    variant="secondary"
    icon={<Download size={16} />}
    onClick={handleExport}
  >
    Export
  </Button>
</ButtonGroup>
```

---

## 🔄 Proses Refactoring

### **Step by Step untuk SETIAP Halaman:**

1. **Baca halaman existing** - Pahami struktur dan fungsionalitas
2. **Identifikasi komponen** - List apa saja yang ada (table, form, cards, etc)
3. **Replace dengan ui-islamic components**:
   - `<div className="card">` → `<Card variant="elevated">`
   - `<button className="btn">` → `<Button variant="primary">`
   - `<input type="text">` → `<Input label="..." />`
   - Tables → Gunakan design system styling
   - Colors → Gunakan `designSystem.colors.*`
4. **Tambahkan PageHeader** dengan pattern
5. **Update icons** - Ganti dengan Islamic icons jika relevant
6. **Test functionality** - Pastikan semua fungsi masih jalan
7. **Check responsiveness** - Test di mobile & desktop

### **Prioritas Refactoring:**

#### 🔥 **Priority 1: Dashboards (Paling Sering Dilihat)**
1. `/admin/dashboard`
2. `/guru/dashboard`
3. `/orangtua/dashboard`
4. `/siswa/dashboard` (jika ada)

#### 🔥 **Priority 2: Core Admin Pages**
5. `/admin/guru`
6. `/admin/siswa`
7. `/admin/kelas`
8. `/admin/tahun-ajaran`

#### 🔥 **Priority 3: Core Guru Pages**
9. `/guru/input-hafalan`
10. `/guru/kelola-siswa`
11. `/guru/evaluasi`
12. `/guru/laporan`

#### 🔥 **Priority 4: Reports & Analytics**
13. `/admin/laporan/*`
14. `/guru/laporan-guru`

#### 🔥 **Priority 5: Other Pages**
15. Semua halaman lainnya

---

## 📝 Template Code untuk Berbagai Jenis Halaman

### **Template 1: Dashboard Page**
```jsx
"use client";

import { useState, useEffect } from 'react';
import LayoutComponent from '@/components/...';
import {
  Container,
  PageHeader,
  Grid,
  StatsCard,
  Card,
  CardContent,
  Heading,
  Text,
  Button,
} from '@/components/ui-islamic';
import {
  QuranIcon,
  PrayerIcon,
  TasbihIcon,
  MosqueIcon,
} from '@/components/ui-islamic';
import { designSystem } from '@/styles/design-system';

export default function DashboardPage() {
  // State & data fetching

  return (
    <LayoutComponent>
      <div style={{
        background: designSystem.colors.background.secondary,
        minHeight: '100vh'
      }}>
        <PageHeader
          title="Dashboard"
          subtitle="Selamat datang di aplikasi tahfidz"
          pattern
        />

        <Container size="default">
          {/* Stats Cards */}
          <Grid cols={4} gap="md" responsive>
            <StatsCard
              icon={<QuranIcon size="md" />}
              title="Total Santri"
              value="150"
              trend={12}
            />
            {/* ... more stats */}
          </Grid>

          <Spacer size="xl" />

          {/* Main Content */}
          <Grid cols={2} gap="lg">
            <Card variant="elevated" padding="lg">
              <CardContent>
                {/* Content */}
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </div>
    </LayoutComponent>
  );
}
```

### **Template 2: Data List/Table Page**
```jsx
"use client";

import { useState } from 'react';
import LayoutComponent from '@/components/...';
import {
  Container,
  PageHeader,
  Card,
  Grid,
  Button,
  SearchInput,
  Badge,
  EmptyState,
  Flex,
} from '@/components/ui-islamic';
import { designSystem } from '@/styles/design-system';

export default function DataListPage() {
  return (
    <LayoutComponent>
      <div style={{
        background: designSystem.colors.background.secondary,
        minHeight: '100vh'
      }}>
        <PageHeader
          title="Daftar Data"
          subtitle="Kelola data di sini"
          pattern
        />

        <Container size="default">
          {/* Search & Actions */}
          <Card variant="elevated" padding="lg">
            <Flex justify="space-between" align="center">
              <SearchInput
                placeholder="Cari..."
                onSearch={handleSearch}
                style={{ width: '300px' }}
              />
              <Button variant="primary" icon={<Plus />}>
                Tambah Data
              </Button>
            </Flex>
          </Card>

          <Spacer size="md" />

          {/* Data Table */}
          <Card variant="elevated" padding="none">
            {/* Table content */}
          </Card>
        </Container>
      </div>
    </LayoutComponent>
  );
}
```

### **Template 3: Form Page**
```jsx
"use client";

import { useState } from 'react';
import LayoutComponent from '@/components/...';
import {
  Container,
  PageHeader,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Grid,
  Input,
  Select,
  Textarea,
  Button,
} from '@/components/ui-islamic';
import { designSystem } from '@/styles/design-system';

export default function FormPage() {
  return (
    <LayoutComponent>
      <div style={{
        background: designSystem.colors.background.secondary,
        minHeight: '100vh'
      }}>
        <PageHeader
          title="Form Input"
          subtitle="Isi form di bawah ini"
          pattern
        />

        <Container size="default">
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <CardTitle>Informasi Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Grid cols={2} gap="md">
                <Input
                  label="Nama"
                  fullWidth
                />
                <Select
                  label="Kelas"
                  options={[]}
                  fullWidth
                />
              </Grid>
              <Spacer size="md" />
              <Textarea
                label="Catatan"
                rows={4}
                fullWidth
              />
            </CardContent>
            <CardFooter align="right">
              <Button variant="secondary">Batal</Button>
              <Button variant="primary">Simpan</Button>
            </CardFooter>
          </Card>
        </Container>
      </div>
    </LayoutComponent>
  );
}
```

---

## ✅ Checklist untuk Setiap Halaman

Saat refactor setiap halaman, pastikan:

- [ ] Import `ui-islamic` components
- [ ] Wrap dengan background cream (`designSystem.colors.background.secondary`)
- [ ] Tambah `<PageHeader>` dengan pattern
- [ ] Replace semua hardcoded colors dengan `designSystem.colors.*`
- [ ] Replace buttons dengan `<Button>` component
- [ ] Replace inputs dengan `<Input>`, `<Select>`, `<Textarea>`
- [ ] Replace cards dengan `<Card>` component
- [ ] Gunakan `<Grid>` untuk layouts
- [ ] Tambah Islamic icons yang relevan
- [ ] Tambah `<EmptyState>` untuk empty data
- [ ] Tambah `<LoadingState>` untuk loading
- [ ] Test responsiveness (mobile & desktop)
- [ ] Test all functionality still works
- [ ] Remove unused old CSS classes
- [ ] Clean up code & add comments if needed

---

## 🎯 Hasil yang Diharapkan

Setelah refactoring SEMUA halaman, aplikasi akan memiliki:

✅ **Visual Consistency** - Semua halaman pakai design system yang sama
✅ **Islamic Modern Look** - Gold, cream, Islamic icons everywhere
✅ **Better UX** - Smooth animations, clear hierarchy
✅ **Responsive** - Works great on mobile & desktop
✅ **Maintainable** - Reusable components, clean code
✅ **Professional** - Elegan dan menenangkan seperti DEEN MUSLIM app

---

## 📚 References

- **Contoh Implementasi**: `src/app/guru/penilaian-kelas/page.js` ✅ (SUDAH SELESAI)
- **Component Demo**: http://localhost:3002/design-showcase
- **Dokumentasi**: `DESIGN_SYSTEM_DOCS.md`
- **Design System**: `src/styles/design-system.js`

---

## 🚀 Execution Prompt

**Copy prompt ini untuk memulai refactoring:**

```
Tolong refactor SEMUA halaman aplikasi tahfidz (47 halaman) untuk menggunakan Islamic Modern Design System yang sudah dibuat.

Referensi:
- Design system: src/components/ui-islamic/
- Contoh implementasi: src/app/guru/penilaian-kelas/page.js (SUDAH SELESAI)
- Dokumentasi: DESIGN_SYSTEM_DOCS.md
- Guidelines: PROMPT_REDESIGN_ALL.md (file ini)

Prioritas:
1. Dashboard pages (admin, guru, orangtua, siswa)
2. Core admin pages (guru, siswa, kelas)
3. Core guru pages (input-hafalan, kelola-siswa, evaluasi)
4. Reports & analytics pages
5. Semua halaman lainnya

Guidelines:
- Gunakan PageHeader dengan pattern untuk semua halaman
- Replace semua components dengan ui-islamic components
- Gunakan designSystem.colors.* untuk semua warna
- Tambahkan Islamic icons yang relevan
- Pastikan responsive & functional
- Test setiap halaman setelah refactor

Mulai dengan Priority 1 (Dashboards), lakukan satu per satu dengan teliti, pastikan tidak ada yang break!
```

---

## 💡 Tips

1. **Jangan sekaligus** - Refactor 1-2 halaman dulu, test, baru lanjut
2. **Keep functionality** - Focus on UI, jangan ubah logic
3. **Test immediately** - Setelah refactor 1 halaman, langsung test
4. **Check mobile** - Jangan lupa test responsive
5. **Use Git** - Commit setelah selesai 1 halaman
6. **Ask if stuck** - Jika ada error atau bingung, tanya!

---

**Barakallahu fiikum! Semoga lancar refactoringnya!** 🤲🕌

**Total Pages to Refactor: 47 halaman**
**Estimated Time: 2-3 hari (jika fokus)**
**Result: Aplikasi tahfidz yang cantik & profesional!** ✨
