# Laporan Hafalan - Portal Orang Tua

## Deskripsi
Halaman **Laporan Hafalan** adalah fitur untuk orang tua memantau perkembangan hafalan anak dalam bentuk visual yang lembut, profesional, dan informatif.

## Fitur Utama

### 1. Header dengan Motivasi
- Judul halaman dengan ikon ChartBar
- Breadcrumb navigasi
- Card kutipan hadits motivasi (HR. Tirmidzi)
- Gradient lembut: emerald → mint → amber

### 2. Filter & Pengaturan Laporan
- **Pilih Anak**: Dropdown untuk memilih anak (multi-children support)
- **Periode Waktu**: Minggu ini / Bulan ini / Semester ini / Tahun Ajaran
- **Format Ekspor**: PDF / Excel
- **Tombol Aksi**:
  - Unduh Laporan (amber)
  - Tampilkan Laporan (emerald)

### 3. Statistik Ringkasan (4 Kartu)
1. **Total Hafalan** (Emerald) - Total surah yang telah dihafal
2. **Hafalan Baru** (Mint) - Hafalan bulan ini
3. **Rata-rata Nilai** (Amber) - Nilai rata-rata dari 100
4. **Pengulangan Muroja'ah** (Lilac) - Total muroja'ah

Setiap kartu memiliki:
- Gradient background lembut
- Hover effect (translate up)
- Shadow halus
- Angka besar dan jelas

### 4. Grafik Perkembangan Hafalan
Menggunakan library **Recharts**:

#### Line Chart
- Total Hafalan (emerald line)
- Nilai Rata-rata (amber line)
- Muroja'ah (purple line)
- X-axis: Minggu
- Tooltip interaktif

#### Bar Chart
- Kategori: Tajwid, Kelancaran, Makhraj
- Warna: Emerald gradient
- Domain: 0-100

### 5. Tabel Detail Hafalan
Kolom:
- No
- Tanggal
- Surah / Ayat
- Nilai Tajwid (badge hijau ≥85, kuning <85)
- Nilai Kelancaran (badge hijau ≥85, kuning <85)
- Nilai Makhraj (badge hijau ≥85, kuning <85)
- Catatan Guru

Fitur:
- Hover effect pada row
- Responsive (horizontal scroll di mobile)
- Empty state dengan ilustrasi
- Header dengan background emerald-50

### 6. Kesimpulan Otomatis
Card amber dengan border-left:
- Nama anak
- Total hafalan & nilai rata-rata
- Persentase peningkatan/penurunan
- Pesan motivasi otomatis
- Icon Sparkles

### 7. Floating Export Buttons
Tombol floating di kanan bawah:
- 🖨️ Cetak Laporan (window.print)
- 📄 PDF (export PDF)
- 📊 Excel (export Excel)

Desain:
- Fixed position bottom-right
- Rounded full pill shape
- White background dengan shadow
- Border emerald

## API Endpoints

### GET `/api/orangtua/laporan-hafalan`
Query params:
- `siswaId`: ID siswa (required)
- `periode`: Periode waktu (optional, default: 'bulan-ini')

Response:
```json
{
  "siswa": {
    "id": "...",
    "nama": "Ahmad Fauzan"
  },
  "statistik": {
    "totalHafalan": 30,
    "hafalanBaru": 5,
    "rataRataNilai": 85,
    "totalMurojaah": 12
  },
  "progressData": [
    {
      "minggu": "Minggu 1",
      "totalHafalan": 25,
      "nilaiRataRata": 82,
      "murojaah": 8
    }
  ],
  "performanceData": [
    {
      "kategori": "Tajwid",
      "nilai": 88
    }
  ],
  "detailHafalan": [
    {
      "id": 1,
      "tanggal": "14 Okt 2025",
      "surah": "Al-Baqarah 1-5",
      "nilaiTajwid": 90,
      "nilaiKelancaran": 85,
      "nilaiMakhraj": 88,
      "catatan": "Hafalan sangat baik"
    }
  ],
  "kesimpulan": {
    "nama": "Ahmad Fauzan",
    "totalHafalan": 30,
    "rataRataNilai": 85,
    "peningkatan": 25
  }
}
```

### POST `/api/orangtua/laporan-hafalan`
Body:
```json
{
  "siswaId": "...",
  "periode": "bulan-ini",
  "format": "pdf"
}
```

Response:
```json
{
  "success": true,
  "message": "Laporan dalam format PDF akan segera diunduh",
  "downloadUrl": "/api/orangtua/laporan-hafalan/download?..."
}
```

## Teknologi

### Frontend
- Next.js 14 (App Router)
- React Hooks (useState, useEffect)
- Lucide React Icons
- Recharts (Line & Bar Charts)
- Tailwind CSS

### Styling
- Palet Warna:
  - **Emerald 500-700**: Warna utama
  - **Amber 400-500**: Aksen penting
  - **Mint 50-200**: Background lembut
  - **Lilac/Purple 200-300**: Variasi dekoratif
- Font: Inter / Poppins
- Border radius: rounded-xl / rounded-2xl
- Shadow: shadow-sm hover:shadow-md
- Background: gradient from-mint-50 via-white to-amber-50

### Backend
- Prisma ORM
- NextAuth (session management)
- PostgreSQL/MySQL

## Responsivitas

### Mobile (< 640px)
- Statistik cards: scroll horizontal
- Grafik: 100% width, auto height
- Tabel: horizontal scroll (`overflow-x-auto`)
- Floating buttons: pindah ke dalam layout
- Menu text hidden, icon only

### Tablet (640px - 1024px)
- Grid 2 kolom untuk statistik
- Grafik responsive
- Tabel tetap horizontal scroll

### Desktop (≥ 1024px)
- Grid 4 kolom untuk statistik
- Grafik full width
- Tabel full view tanpa scroll (jika muat)
- Floating buttons tetap fixed

## Interaktivitas

1. **Dropdown Change**
   - Ketika user mengubah pilih anak → auto fetch data baru
   - Ketika user mengubah periode → auto fetch data baru

2. **Tombol Tampilkan**
   - Manual refresh data
   - Loading spinner saat fetching

3. **Tombol Unduh**
   - Trigger download file (PDF/Excel)
   - Alert konfirmasi

4. **Grafik Tooltip**
   - Hover pada line/bar → tampilkan detail nilai & tanggal
   - White background, emerald border, rounded

5. **Tabel Hover**
   - Row hover → background mint-50
   - Smooth transition

## Security

- Authentication required (NextAuth session)
- Role check: ORANGTUA only
- Siswa verification: pastikan siswa adalah anak dari orang tua yang login
- Input validation: siswaId required
- SQL injection protection (Prisma ORM)

## TODO / Future Enhancements

- [ ] Implementasi actual PDF generation (jsPDF)
- [ ] Implementasi actual Excel export (xlsx library)
- [ ] Add loading skeleton untuk better UX
- [ ] Cache data untuk mengurangi API calls
- [ ] Print-friendly CSS untuk window.print()
- [ ] Add date range picker untuk custom periode
- [ ] Export dengan preview sebelum download
- [ ] Add perbandingan antar anak (multi-child)
- [ ] Notifikasi push saat laporan siap diunduh

## File Structure

```
src/app/orangtua/laporan-hafalan/
├── page.js                          # Main page component
└── README.md                        # Documentation

src/app/api/orangtua/laporan-hafalan/
└── route.js                         # API endpoint (GET & POST)

src/components/layout/
└── OrangtuaLayout.js                # Sidebar with navigation
```

## Instalasi Dependencies

Jika belum terinstall, jalankan:

```bash
npm install recharts
npm install lucide-react
```

## Testing

1. Login sebagai orang tua
2. Navigasi ke menu "Laporan Hafalan"
3. Pilih anak dari dropdown
4. Ubah periode waktu
5. Cek grafik dan tabel update otomatis
6. Test tombol ekspor dan cetak
7. Test responsive di berbagai screen size

## Author
Tahfidz App Development Team

## Last Updated
29 Oktober 2025
