# 📥📤 Panduan Import & Export Data

## ✨ Fitur Baru: Import & Export Data Excel

Fitur ini memungkinkan Admin untuk mengelola data Guru, Siswa, dan Orang Tua secara massal menggunakan file Excel.

---

## 🎯 Lokasi Fitur

Toolbar Import/Export tersedia di halaman:
- **Admin → Guru** (`/admin/guru`)
- **Admin → Siswa** (`/admin/siswa`)
- **Admin → Orang Tua** (`/admin/orangtua`)

---

## 🔧 Tombol yang Tersedia

### 1. 📥 **Import Data** (Emerald)
Upload file Excel untuk import data massal
- Format: `.xlsx` atau `.csv`
- Auto-create akun untuk user baru
- Validasi otomatis

### 2. 📤 **Export Data** (Amber)
Download data existing ke file Excel
- Format: `.xlsx` (Excel)
- Include semua kolom penting
- Password ter-encrypt untuk keamanan

### 3. ⚙️ **Generate Akun Otomatis** (Violet)
*(Opsional - jika tersedia)*
Generate username & password otomatis untuk siswa/orang tua

---

## 📥 Cara Import Data

### Step 1: Klik Tombol "📥 Import Data"
Modal popup akan muncul dengan form upload.

### Step 2: Pilih File Excel
- Klik input file dan pilih file `.xlsx` atau `.csv`
- File akan ter-validasi format nya

### Step 3: Opsi Import
✅ **Buat akun otomatis setelah import**
- Jika dicentang: Sistem akan membuat akun user otomatis untuk data baru
- Jika tidak: Hanya import data, akun harus dibuat manual

### Step 4: Upload
- Klik tombol "Upload"
- Progress bar akan muncul
- Tunggu hasil import

### Step 5: Lihat Hasil
Notifikasi akan menampilkan:
- ✅ **Berhasil**: Jumlah data yang sukses di-import
- ❌ **Gagal**: Jumlah data yang gagal (+ detail error)

---

## 📤 Cara Export Data

### Step 1: Klik Tombol "📤 Export Data"
File Excel akan langsung terdownload.

### Step 2: File Tersimpan
File tersimpan dengan format:
```
Data_Guru_2025-10-27.xlsx
Data_Siswa_2025-10-27.xlsx
Data_Orang_Tua_2025-10-27.xlsx
```

### Isi File Export:
- Semua data user dengan kategori terpilih
- Kolom username & password (encrypted)
- Dapat digunakan sebagai template untuk import

---

## 📋 Format File Excel

### **Untuk Guru:**
| Nama Lengkap | Email | NIP | Mata Pelajaran | No. Telepon |
|--------------|-------|-----|----------------|-------------|
| Ahmad Yusuf | ahmad@email.com | 123456 | Tahfidz | 08123456789 |

### **Untuk Siswa:**
| Nama Lengkap | Email | NIS | Kelas | Tanggal Lahir | Jenis Kelamin | Alamat |
|--------------|-------|-----|-------|---------------|---------------|--------|
| Fatimah Az-Zahra | fatimah@email.com | 2024001 | 7 A | 01/01/2010 | P | Jl. Merdeka No. 1 |

### **Untuk Orang Tua:**
| Nama Lengkap | Email | No. Telepon | Hubungan | Nama Siswa |
|--------------|-------|-------------|----------|------------|
| Abdullah Rahman | abdullah@email.com | 08123456789 | Ayah | Fatimah Az-Zahra |

---

## ⚡ Fitur Otomatis

### Auto-Create Account
Jika opsi "Buat akun otomatis" dicentang:

**Guru:**
- Email: Dari file Excel
- Password: Random 8 karakter (ex: `guru12345xyz`)
- Role: GURU

**Siswa:**
- Email: Dari file Excel
- Password: NIS siswa (atau random jika NIS kosong)
- Role: SISWA

**Orang Tua:**
- Email: Dari file Excel
- Password: Random 8 karakter (ex: `ortu98765abc`)
- Role: ORANG_TUA

### Validasi Otomatis
- **Email unique**: Tidak boleh duplikat
- **NIP/NIS unique**: Tidak boleh duplikat
- **Kelas exists**: Kelas harus sudah terdaftar (untuk siswa)
- **Format data**: Tanggal lahir, jenis kelamin, dll.

---

## 🎨 UI & Design

### Warna & Style:
- **Background**: Gradasi emerald-amber pastel
- **Font**: Poppins (konsisten dengan design system)
- **Cards**: Border lembut dengan shadow ringan
- **Icons**: Emoji (📥, 📤, ⚙️) + Lucide icons

### Animasi:
- Modal popup: Smooth fade-in
- Progress bar: Animated gradient
- Buttons: Hover scale + shadow enhancement

### Ornamen Islami:
- Subtle pattern opacity 0.04 di pojok modal
- Radial gradient emerald di background modal
- Harmonious dengan nuansa Tahfidz App

---

## 🐛 Troubleshooting

### Import Gagal?
1. **Check format file**: Harus `.xlsx` atau `.csv`
2. **Check required fields**: Nama & Email wajib diisi
3. **Check duplicate data**: Email/NIP/NIS tidak boleh duplikat
4. **Check kelas**: Untuk siswa, pastikan kelas sudah terdaftar di sistem

### Export Kosong?
1. **Check filter**: Pastikan ada data yang ter-filter
2. **Refresh halaman**: Kadang perlu refresh untuk update data

### Progress Bar Stuck?
1. **Check network**: Pastikan koneksi internet stabil
2. **File terlalu besar**: Max ~1000 rows per upload
3. **Refresh & retry**: Tutup modal dan coba lagi

---

## 📊 Limits & Best Practices

### Upload Limits:
- **Max file size**: 5MB (rekomendasi)
- **Max rows**: ~1000 data per upload
- **Jika lebih**: Split file menjadi beberapa bagian

### Best Practices:
1. **Export dulu**: Download data existing sebagai template
2. **Test dengan data kecil**: Upload 5-10 row dulu untuk test
3. **Backup dulu**: Export data lama sebelum import besar
4. **Consistent format**: Gunakan format tanggal & text yang sama

---

## ✅ Checklist Sebelum Import

- [ ] File format `.xlsx` atau `.csv`
- [ ] Kolom required sudah lengkap (Nama, Email)
- [ ] Email unique (tidak ada duplikat)
- [ ] NIP/NIS unique (untuk guru/siswa)
- [ ] Kelas sudah terdaftar (untuk siswa)
- [ ] Format tanggal benar (DD/MM/YYYY)
- [ ] Opsi "Buat akun otomatis" sesuai kebutuhan

---

## 🎯 Tips Pro

1. **Gunakan Export sebagai template**
   - Export data → Edit di Excel → Import kembali

2. **Batch import untuk data besar**
   - 100 data/upload untuk performance optimal

3. **Validasi di Excel dulu**
   - Gunakan formula Excel untuk validasi sebelum import

4. **Keep backup**
   - Selalu export sebelum import massal

---

**Status**: ✅ Ready to Use
**Lokasi**: Admin → Guru/Siswa/Orang Tua
**Design**: Islamic Modern (Emerald & Amber Gradient)
