# 📢 Halaman Pengumuman - Portal Orang Tua

## 🎯 Tujuan
Halaman Pengumuman di Portal Orang Tua Tahfidz App dirancang untuk menampilkan berbagai informasi resmi dari guru dan admin, seperti wisuda tahfidz, jadwal muroja'ah, ujian tahsin, dan kegiatan sekolah.

## ✨ Fitur Utama

### 1. **Header dengan Motivasi**
- Header gradient lembut: `from-emerald-400 via-mint-300 to-amber-200`
- Ikon Megaphone
- Card motivasi hadits islami

### 2. **Filter dan Pencarian**
- **Pencarian**: Cari pengumuman berdasarkan judul atau konten
- **Filter Kategori**:
  - Semua Kategori
  - Kegiatan
  - Penilaian
  - Informasi
  - Wisuda
- **Filter Periode**:
  - Semua Periode
  - Bulan Ini
  - Semester Ini

### 3. **Daftar Pengumuman**
Setiap card pengumuman menampilkan:
- Judul pengumuman
- Tanggal unggah
- Nama pengirim (Admin/Guru)
- Label "🆕 Baru" untuk pengumuman < 3 hari
- Label kategori dengan warna berbeda
- Ringkasan isi (maksimal 150 karakter)
- Tombol "Lihat Detail"

### 4. **Modal Detail Pengumuman**
- Konten pengumuman lengkap
- Informasi kategori dan tanggal
- Nama pengirim
- Tombol unduh lampiran (jika ada)
- Animasi fade in saat dibuka
- Tombol kembali ke daftar

## 🎨 Desain & Warna

### Palet Warna:
- **Primary**: Emerald 500-700 (judul & ikon)
- **Secondary**: Amber 400-500 (tombol & aksen)
- **Background**: Gradient `from-mint-50 via-white to-amber-50`

### Label Kategori:
- **Kegiatan**: `bg-emerald-100 text-emerald-700`
- **Wisuda**: `bg-amber-100 text-amber-700`
- **Informasi**: `bg-purple-100 text-purple-700`
- **Penilaian**: `bg-blue-100 text-blue-700`

## 📱 Responsivitas

### Mobile:
- Card pengumuman dalam satu kolom
- Filter bar collapse (dapat ditampilkan/disembunyikan)
- Modal detail menjadi fullscreen
- Tombol kembali lebar penuh di modal

### Desktop:
- Layout responsif maksimal 5xl
- Sidebar tetap terlihat
- Modal terpusat dengan max-width 3xl

## 🔌 API Endpoints

### GET `/api/orangtua/pengumuman`

**Query Parameters:**
- `search` (string): Pencarian berdasarkan judul/konten
- `kategori` (string): Filter kategori (semua|kegiatan|penilaian|informasi|wisuda)
- `periode` (string): Filter periode (semua|bulan_ini|semester_ini)

**Response:**
```json
[
  {
    "id": "string",
    "judul": "string",
    "konten": "string",
    "kategori": "string",
    "isPenting": boolean,
    "lampiran": "string | null",
    "createdAt": "datetime",
    "isBaru": boolean,
    "pengirim": {
      "name": "string",
      "role": "string"
    }
  }
]
```

## 🗄️ Database Schema

### Model Pengumuman
```prisma
model Pengumuman {
  id              String
  guruId          String
  judul           String
  konten          String
  kategori        String (default: "informasi")
  isPenting       Boolean (default: false)
  isPublished     Boolean (default: true)
  lampiran        String?
  targetRole      Role[]
  createdBy       String?
  createdAt       DateTime
  updatedAt       DateTime
  publishedAt     DateTime?
  guru            Guru
}
```

## 🚀 Setup & Testing

### 1. Migrasi Database
```bash
npx prisma migrate dev --name add_pengumuman_fields
npx prisma generate
```

### 2. Seed Data Dummy
```bash
node prisma/seeds/pengumuman.seed.js
```

### 3. Akses Halaman
Navigasi ke: `/orangtua/pengumuman`

## 📋 Status Implementasi

- ✅ Struktur folder dan file
- ✅ API route dengan filter
- ✅ UI header dengan motivasi
- ✅ Komponen card pengumuman
- ✅ Modal detail dengan animasi
- ✅ Filter dan pencarian
- ✅ Responsivitas mobile & desktop
- ✅ Model Prisma
- ✅ Menu navigasi di sidebar
- ✅ Data seed untuk testing

## 💡 Fitur Tambahan (Opsional)

### Untuk Pengembangan Lebih Lanjut:
1. **Real-time Updates**: Auto-refresh setiap 30 detik
2. **Notifikasi Push**: Untuk pengumuman penting
3. **Bookmark**: Simpan pengumuman favorit
4. **Share**: Bagikan ke WhatsApp/Email
5. **Print**: Cetak pengumuman
6. **Attachment Upload**: Upload file lampiran (PDF, gambar)
7. **Rich Text Editor**: Format konten dengan rich text
8. **Komentar**: Fitur komentar dari orang tua

## 🐛 Troubleshooting

### Pengumuman tidak muncul?
- Pastikan `isPublished` = true di database
- Cek `targetRole` apakah mencakup 'ORANG_TUA'
- Periksa koneksi database

### Filter tidak bekerja?
- Periksa console browser untuk error
- Pastikan query parameters dikirim dengan benar
- Cek API response di Network tab

### Modal tidak menutup?
- Periksa state management `showModal`
- Pastikan `closeModal` function dipanggil
- Cek overflow body style

## 📞 Kontak

Jika ada pertanyaan atau issue, silakan hubungi tim development.

---

**Version**: 1.0.0
**Last Updated**: Maret 2025
**Author**: Tahfidz App Development Team
