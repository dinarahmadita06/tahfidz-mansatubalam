# 🕌 Sistem Desain Modern Islami - Aplikasi Tahfidz

## Deskripsi

Sistem desain ini terinspirasi dari aplikasi **DEEN MUSLIM**, dengan estetika modern Islami yang hangat, elegan, dan menenangkan. Menggunakan palet warna cream, gold, dan coklat dengan ornamen geometris Islami yang subtle.

---

## 📁 Struktur File

```
tahfidz/
├── src/
│   ├── styles/
│   │   └── design-system.js          # Konfigurasi sistem desain
│   └── components/
│       └── ui-islamic/
│           ├── Card.jsx               # Komponen kartu
│           ├── Button.jsx             # Komponen tombol
│           ├── Input.jsx              # Komponen input form
│           ├── Typography.jsx         # Komponen tipografi
│           ├── IslamicIcons.jsx       # Ikon & pattern Islami
│           ├── Layout.jsx             # Komponen layout
│           └── index.js               # Export semua komponen
```

---

## 🎨 Color Palette

### Primary - Warm Gold/Bronze
```javascript
primary: {
  50: '#FFF9F0',   // Sangat terang
  100: '#FFF3E0',
  200: '#FFE4C2',
  300: '#FFD4A3',
  400: '#E8B67A',
  500: '#D4A574',  // ⭐ Main gold
  600: '#C9A961',
  700: '#B08C4F',
  800: '#8B6F3F',
  900: '#6B5530',  // Sangat gelap
}
```

### Secondary - Cream/Beige
```javascript
secondary: {
  50: '#FDFCFA',
  100: '#FFF5E6',  // Background utama
  200: '#F5E6D3',
  // ... dst
}
```

### Semantic Colors
- **Success**: Hijau sage (#6FA882)
- **Warning**: Gold (#E8B67A)
- **Error**: Coral lembut (#E88B8B)
- **Info**: Biru soft (#7AB8D4)

---

## 🖋️ Typography

### Font Families
```javascript
arabic: "'Amiri', 'Scheherazade New', serif"  // Untuk teks Arab/Quran
sans: "'Inter', system-ui, sans-serif"         // Untuk UI
serif: "'Playfair Display', 'Georgia', serif"  // Untuk header elegan
```

### Font Sizes
```javascript
xs: '0.75rem',    // 12px
sm: '0.875rem',   // 14px
base: '1rem',     // 16px
lg: '1.125rem',   // 18px
xl: '1.25rem',    // 20px
2xl: '1.5rem',    // 24px
3xl: '1.875rem',  // 30px
4xl: '2.25rem',   // 36px
5xl: '3rem',      // 48px
6xl: '3.75rem',   // 60px
```

---

## 🧩 Komponen Utama

### 1. Card
```jsx
import { Card, CardHeader, CardTitle, CardContent, StatsCard } from '@/components/ui-islamic';

// Card basic
<Card variant="default" padding="md" hover>
  <CardHeader>
    <CardTitle>Judul Card</CardTitle>
  </CardHeader>
  <CardContent>
    Konten card di sini...
  </CardContent>
</Card>

// Stats card
<StatsCard
  icon={<QuranIcon />}
  title="Total Hafalan"
  value="25 Juz"
  trend={15}
/>
```

**Variants:**
- `default` - Background putih dengan border
- `cream` - Background cream lembut
- `gradient` - Background gradasi gold
- `elevated` - Shadow yang lebih tinggi

---

### 2. Button
```jsx
import { Button, IconButton, ButtonGroup } from '@/components/ui-islamic';

// Button basic
<Button variant="primary" size="md" onClick={handleClick}>
  Simpan
</Button>

// Button dengan icon
<Button variant="primary" icon={<QuranIcon />} iconPosition="left">
  Buka Al-Quran
</Button>

// Icon button
<IconButton icon={<SearchIcon />} variant="ghost" />

// Button group
<ButtonGroup spacing="md">
  <Button variant="primary">Simpan</Button>
  <Button variant="secondary">Batal</Button>
</ButtonGroup>
```

**Variants:**
- `primary` - Gold gradient dengan shadow glow
- `secondary` - Background cream dengan border
- `outline` - Transparan dengan border gold
- `ghost` - Transparan tanpa border
- `danger` - Merah untuk aksi berbahaya
- `success` - Hijau untuk konfirmasi

**Sizes:** `sm`, `md`, `lg`

---

### 3. Input
```jsx
import { Input, Textarea, Select, SearchInput } from '@/components/ui-islamic';

// Input basic
<Input
  label="Nama Santri"
  placeholder="Masukkan nama..."
  fullWidth
  icon={<UserIcon />}
  iconPosition="left"
/>

// Textarea
<Textarea
  label="Catatan"
  rows={4}
  fullWidth
/>

// Select
<Select
  label="Pilih Kelas"
  options={[
    { value: '1', label: 'Kelas 1' },
    { value: '2', label: 'Kelas 2' },
  ]}
  fullWidth
/>

// Search input
<SearchInput
  placeholder="Cari santri..."
  onSearch={(value) => console.log(value)}
/>
```

---

### 4. Typography
```jsx
import { Heading, Text, ArabicText, Badge, Label } from '@/components/ui-islamic';

// Heading
<Heading level={1} variant="gradient">
  Dashboard Tahfidz
</Heading>

// Text
<Text size="lg" weight="medium" color="secondary">
  Selamat datang di aplikasi tahfidz
</Text>

// Arabic text
<ArabicText size="2xl">
  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
</ArabicText>

// Badge
<Badge variant="success">Aktif</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="gradient">Premium</Badge>
```

---

### 5. Layout
```jsx
import {
  Container,
  Section,
  Grid,
  Flex,
  PageHeader,
  EmptyState,
  LoadingState
} from '@/components/ui-islamic';

// Page header
<PageHeader
  title="Penilaian Kelas"
  subtitle="Kelola penilaian hafalan santri"
  pattern
/>

// Container
<Container size="default" padding>
  {/* Content */}
</Container>

// Grid responsive
<Grid cols={3} gap="md" responsive>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</Grid>

// Flex layout
<Flex justify="space-between" align="center" gap="md">
  <div>Kiri</div>
  <div>Kanan</div>
</Flex>

// Empty state
<EmptyState
  icon={<QuranIcon />}
  title="Belum Ada Data"
  description="Belum ada penilaian untuk kelas ini"
  action={<Button>Tambah Penilaian</Button>}
/>

// Loading state
<LoadingState size="md" text="Memuat data..." />
```

---

### 6. Islamic Icons
```jsx
import {
  MosqueIcon,
  QuranIcon,
  PrayerIcon,
  KaabaIcon,
  TasbihIcon,
  StarCrescentIcon,
  IconContainer,
  FeatureIcon,
  ArabesquePattern,
  MosqueSilhouette
} from '@/components/ui-islamic';

// Icon basic
<QuranIcon size="lg" color="#D4A574" />

// Icon container
<IconContainer variant="gradient" size="lg">
  <MosqueIcon size="md" />
</IconContainer>

// Feature icon with badge
<FeatureIcon
  icon={<QuranIcon size="lg" />}
  badge="5"
  size="xl"
/>

// Pattern background
<div style={{ position: 'relative' }}>
  <ArabesquePattern opacity={0.1} />
  {/* Content */}
</div>

// Mosque silhouette
<MosqueSilhouette width="200px" height="100px" />
```

**Available Icons:**
- `MosqueIcon` - Icon masjid
- `QuranIcon` - Icon Al-Quran/buku
- `PrayerIcon` - Icon sholat
- `KaabaIcon` - Icon Ka'bah
- `TasbihIcon` - Icon tasbih
- `StarCrescentIcon` - Icon bintang & bulan sabit
- `HijabIcon` - Icon hijab/muslimah
- `CalendarIslamicIcon` - Icon kalender hijriyah
- `LanternIcon` - Icon lentera (Ramadhan)
- `ZakatIcon` - Icon zakat/sedekah

---

## 🌈 Gradients

```javascript
// Tersedia di designSystem.islamic.gradients

gold: 'linear-gradient(135deg, #FFD4A3 0%, #D4A574 50%, #B08C4F 100%)'
cream: 'linear-gradient(135deg, #FFF5E6 0%, #F5E6D3 50%, #E4C8AB 100%)'
sunset: 'linear-gradient(135deg, #FFE4A3 0%, #E8B67A 30%, #D48B6E 100%)'
sky: 'linear-gradient(180deg, #FFE4C2 0%, #FFF5E6 50%, #FFFFFF 100%)'
```

**Penggunaan:**
```jsx
<div style={{ background: designSystem.islamic.gradients.gold }}>
  Content
</div>
```

---

## 💫 Shadows

```javascript
sm: '0 1px 2px 0 rgba(91, 82, 74, 0.05)'
DEFAULT: '0 2px 8px 0 rgba(91, 82, 74, 0.08)'
md: '0 4px 12px 0 rgba(91, 82, 74, 0.10)'
lg: '0 8px 24px 0 rgba(91, 82, 74, 0.12)'
xl: '0 12px 32px 0 rgba(91, 82, 74, 0.15)'
glow: '0 0 20px rgba(212, 165, 116, 0.3)'         // Special glow
glow-strong: '0 0 30px rgba(212, 165, 116, 0.5)'  // Strong glow
```

---

## 🎭 Animations

```javascript
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Dalam komponen
<Button> {/* Sudah include hover & active animations */}
  Click me
</Button>

<Card hover> {/* Auto hover effect */}
  Card content
</Card>
```

**Available animations:**
- `fadeIn` - Fade in dengan slide dari bawah
- `slideUp` - Slide dari bawah ke atas
- `slideDown` - Slide dari atas ke bawah
- `scaleIn` - Scale dari kecil ke normal
- `shimmer` - Effect shimmer untuk skeleton
- `pulse` - Pulse effect

---

## 📱 Responsive Design

Semua komponen responsive by default. Breakpoints:

```javascript
xs: '320px'
sm: '640px'
md: '768px'
lg: '1024px'
xl: '1280px'
2xl: '1536px'
```

**Grid responsive:**
```jsx
<Grid cols={3} responsive> {/* Auto-fit di mobile */}
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</Grid>
```

---

## 🚀 Cara Menggunakan

### 1. Import komponen yang dibutuhkan
```jsx
import {
  Card,
  Button,
  Input,
  Heading,
  Grid,
  Container,
  QuranIcon
} from '@/components/ui-islamic';
```

### 2. Gunakan dalam JSX
```jsx
export default function PenilaianKelasPage() {
  return (
    <Container size="default">
      <PageHeader
        title="Penilaian Kelas"
        subtitle="Kelola penilaian hafalan santri"
        pattern
      />

      <Grid cols={3} gap="lg" responsive>
        <StatsCard
          icon={<QuranIcon />}
          title="Total Santri"
          value="45"
          trend={12}
        />
        <StatsCard
          icon={<PrayerIcon />}
          title="Hadir Hari Ini"
          value="42"
          trend={5}
        />
        <StatsCard
          icon={<TasbihIcon />}
          title="Rata-rata Nilai"
          value="85"
          trend={-3}
        />
      </Grid>

      <Card variant="elevated" style={{ marginTop: '2rem' }}>
        <CardHeader>
          <CardTitle>Daftar Santri</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table atau list santri */}
        </CardContent>
      </Card>
    </Container>
  );
}
```

---

## 🎨 Customization

### Mengakses design system
```jsx
import { designSystem } from '@/styles/design-system';

// Gunakan dalam inline style
<div style={{
  background: designSystem.colors.primary[500],
  padding: designSystem.spacing[4],
  borderRadius: designSystem.borderRadius.lg,
  boxShadow: designSystem.shadows.md,
}}>
  Custom styled div
</div>
```

### Override styles
```jsx
<Button
  variant="primary"
  className="custom-button"
  style={{
    minWidth: '200px',
    textTransform: 'uppercase',
  }}
>
  Custom Button
</Button>
```

---

## 📝 Best Practices

### 1. Konsistensi Warna
- Gunakan `primary` untuk aksi utama
- Gunakan `secondary` untuk aksi sekunder
- Gunakan semantic colors (`success`, `error`, `warning`) untuk status

### 2. Spacing
- Gunakan spacing dari design system untuk konsistensi
- Ikuti 8px grid system

### 3. Typography
- H1-H2 untuk page title
- H3-H4 untuk section title
- Body text menggunakan `Text` component
- Teks Arab selalu menggunakan `ArabicText`

### 4. Accessibility
- Selalu berikan `label` pada input
- Gunakan semantic HTML
- Berikan `alt` text pada gambar
- Pastikan contrast ratio cukup

### 5. Loading States
- Tampilkan loading state saat fetch data
- Gunakan skeleton untuk list items
- Berikan feedback visual untuk user actions

---

## 🔧 Troubleshooting

### Komponen tidak muncul
1. Pastikan sudah import dengan benar
2. Cek console untuk error
3. Pastikan parent container punya dimensi

### Style tidak sesuai
1. Cek apakah ada CSS conflicting
2. Cek order of CSS imports
3. Gunakan `!important` jika perlu (last resort)

### Font tidak load
1. Pastikan koneksi internet untuk Google Fonts
2. Cek `globals.css` sudah di-import
3. Fallback ke font system jika gagal

---

## 📚 Resources

- **Design Inspiration**: DEEN MUSLIM app
- **Color Palette**: Warm Islamic Modern theme
- **Icons**: Custom Islamic-themed SVG icons
- **Fonts**:
  - Arabic: Amiri, Scheherazade New
  - Sans: Inter
  - Serif: Playfair Display

---

## 🎯 Next Steps

Setelah sistem desain ini di-approve, langkah selanjutnya:

1. ✅ Update file `globals.css` dengan CSS variables baru
2. ✅ Refactor halaman `penilaian-kelas` menggunakan komponen baru
3. ✅ Refactor halaman lainnya secara bertahap
4. ✅ Tambahkan dark mode (opsional)
5. ✅ Buat storybook/component showcase (opsional)

---

**Dibuat dengan ❤️ untuk Aplikasi Tahfidz**

Semoga aplikasi ini bermanfaat untuk pendidikan Al-Quran. Barakallahu fiikum! 🤲
