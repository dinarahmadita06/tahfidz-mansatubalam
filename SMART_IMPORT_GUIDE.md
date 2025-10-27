# ✨ Panduan Smart Import Excel

## 🎯 Apa itu Smart Import?

**Smart Import Excel** adalah fitur canggih untuk import data siswa dan orang tua secara massal dengan deteksi kolom otomatis. Tidak perlu format Excel yang strict - sistem akan mendeteksi kolom secara pintar berdasarkan nama header.

---

## 🌟 Keunggulan Smart Import

### vs. Import Biasa:
- ✅ **Auto-detect kolom**: Tidak perlu nama kolom yang exact
- ✅ **Preview sebelum import**: Lihat mapping kolom & data preview
- ✅ **Import siswa + orang tua**: Satu file untuk dua entitas
- ✅ **Auto-link relasi**: Orang tua otomatis ter-link ke siswa
- ✅ **Export akun baru**: Download username & password yang baru dibuat
- ✅ **Statistik detail**: Success, failed, duplicate dengan pesan error

### vs. Input Manual:
- 🚀 **100x lebih cepat**: Import ratusan siswa dalam hitungan detik
- 📊 **Bulk account creation**: Generate akun siswa & orang tua otomatis
- 🔗 **Auto relationship**: Hubungan siswa-orang tua dibuat otomatis
- 📋 **Template flexible**: Terima berbagai format header Excel

---

## 📍 Lokasi Fitur

**Admin → Siswa** (`/admin/siswa`)

Cari tombol dengan gradasi ungu:
```
✨ Smart Import Excel
```

---

## 🎨 Proses Smart Import (4 Langkah)

### Step 1: Upload File Excel
1. Klik tombol **"✨ Smart Import Excel"**
2. Modal wizard akan muncul dengan 4 step indicator
3. Klik atau drag & drop file `.xlsx` atau `.csv`
4. File akan ter-validasi otomatis

### Step 2: Preview & Mapping
Sistem akan menampilkan:
- **Tabel Preview**: 5 baris pertama dari file Excel
- **Column Mapping**: Deteksi otomatis kolom siswa & orang tua
- **Statistics**: Jumlah baris dan kolom yang terdeteksi

**Contoh Column Mapping:**
```
Siswa:
  ✅ Nama Siswa → "Nama Lengkap"
  ✅ NIS → "NIS"
  ✅ Kelas → "Kelas"
  ✅ Tanggal Lahir → "Tgl Lahir"

Orang Tua:
  ✅ Nama Orang Tua → "Nama Wali"
  ✅ No. HP → "No HP"
  ✅ Hubungan → "Status"
```

Jika kolom tidak terdeteksi, akan muncul **"❌ Tidak terdeteksi"**

### Step 3: Processing
- Progress bar animasi
- Real-time processing setiap baris
- Menampilkan "Memproses data..."

### Step 4: Hasil Import
Menampilkan statistik lengkap:
```
✅ Berhasil: 45 data
❌ Gagal: 2 data
📋 Duplikat: 3 data
📊 Total: 50 data
```

**Tombol Aksi:**
- 📥 **Export Akun Baru**: Download Excel dengan username & password
- ✨ **Import Lagi**: Reset wizard untuk import file baru
- ✅ **Selesai**: Tutup modal & refresh data

---

## 📋 Format File Excel

### Template Recommended:

#### **Kolom Siswa:**
| Nama Siswa | NIS | NISN | Kelas | Jenis Kelamin | Tempat Lahir | Tanggal Lahir | Alamat | Email Siswa |
|------------|-----|------|-------|---------------|--------------|---------------|--------|-------------|
| Ahmad Rizki | 2024001 | 0051234567 | 7 A | L | Jakarta | 01/01/2010 | Jl. Merdeka No. 1 | ahmad@email.com |
| Fatimah Az-Zahra | 2024002 | 0051234568 | 7 A | P | Bandung | 15/03/2010 | Jl. Sudirman No. 5 | fatimah@email.com |

#### **Kolom Orang Tua:**
| Nama Orang Tua | No HP Orang Tua | Email Orang Tua | Hubungan |
|----------------|-----------------|-----------------|----------|
| Abdullah Rahman | 08123456789 | abdullah@email.com | Ayah |
| Aminah Siti | 08198765432 | aminah@email.com | Ibu |

---

## 🧠 Smart Column Detection

Sistem mendeteksi kolom berdasarkan **pattern matching**. Kolom yang terdeteksi otomatis:

### Kolom Siswa:
- **Nama**: "nama siswa", "nama lengkap siswa", "nama", "name", "student name", "fullname"
- **NIS**: "nis", "nomor induk siswa", "no induk", "student id"
- **NISN**: "nisn", "nomor induk siswa nasional", "nisn siswa"
- **Kelas**: "kelas", "class", "tingkat"
- **Jenis Kelamin**: "jenis kelamin", "jk", "kelamin", "gender", "sex", "l/p"
- **Tempat Lahir**: "tempat lahir", "place of birth", "pob", "kota lahir"
- **Tanggal Lahir**: "tanggal lahir", "tgl lahir", "date of birth", "dob", "birth date"
- **Alamat**: "alamat", "address", "alamat lengkap"
- **Email**: "email siswa", "email", "e-mail", "mail"

### Kolom Orang Tua:
- **Nama**: "nama orang tua", "nama ortu", "nama wali", "parent name", "guardian"
- **No. HP**: "no hp orang tua", "no hp ortu", "telepon orang tua", "phone", "hp", "no telepon"
- **Email**: "email orang tua", "email ortu", "email wali"
- **Hubungan**: "hubungan", "status", "relationship", "relation", "hubungan keluarga"

**Note**: Deteksi **case-insensitive** dan menghilangkan spasi/karakter khusus.

---

## ⚡ Auto-Create Account

### Untuk Siswa:
- **Email**:
  - Jika ada di Excel: Gunakan email dari file
  - Jika kosong: Generate `{nis}@tahfidz.siswa`
  - Jika duplikat: Generate `{nama_depan}{timestamp}@tahfidz.siswa`

- **Password**:
  - Default: NIS siswa (untuk kemudahan login pertama kali)
  - Jika NIS kosong: Random 8 karakter (huruf + angka)

- **Username**: Email (sebelum @)

- **Status**: Auto-approved (langsung aktif)

### Untuk Orang Tua:
- **Email**:
  - Jika ada di Excel: Gunakan email dari file
  - Jika kosong: Generate `{nama_depan}{timestamp}@tahfidz.ortu`
  - Jika duplikat: Generate alternative dengan timestamp baru

- **Password**: Random 8 karakter (huruf + angka)

- **Username**: Email (sebelum @)

- **Hubungan ke Siswa**: Foreign key `orangTuaId` pada tabel siswa

---

## 📤 Export Akun Baru

Setelah import berhasil, klik **"📥 Export Akun Baru"** untuk download file Excel berisi:

| Nama | Role | Email | Password | Keterangan |
|------|------|-------|----------|------------|
| Ahmad Rizki | SISWA | 2024001@tahfidz.siswa | 2024001 | Kelas: 7 A |
| Abdullah Rahman | ORANG_TUA | abdullah3456@tahfidz.ortu | xY9kL2mP | Orang tua dari Ahmad Rizki |

**Kegunaan:**
- 📋 Distribusikan ke siswa & orang tua untuk login pertama kali
- 🔐 Password asli (sebelum di-hash) hanya ada di file ini
- 📊 Dokumentasi akun yang baru dibuat

**Keamanan:**
- ⚠️ Simpan file ini dengan aman (jangan share publik)
- 🔒 Instruksikan user untuk **ganti password** setelah login pertama
- 🗑️ Hapus file setelah distribusi selesai

---

## 🐛 Troubleshooting

### Import Gagal?

#### 1. **Kolom Tidak Terdeteksi**
- **Masalah**: Preview menampilkan "❌ Tidak terdeteksi"
- **Solusi**:
  - Rename kolom Excel sesuai pattern (lihat Smart Column Detection)
  - Minimal harus ada: Nama Siswa & NIS
  - Contoh: "Nama" → "Nama Siswa" atau "Name" → "Nama"

#### 2. **Duplikat NIS**
- **Masalah**: Error "NIS {xxx} sudah terdaftar"
- **Solusi**:
  - Check database: Apakah NIS memang sudah ada?
  - Hapus data lama atau ubah NIS di Excel
  - NIS harus unique per siswa

#### 3. **Format Tanggal Invalid**
- **Masalah**: Tanggal lahir tidak ter-parse
- **Solusi**:
  - Gunakan format: `DD/MM/YYYY` atau `YYYY-MM-DD`
  - Contoh valid: `01/01/2010` atau `2010-01-01`
  - Hindari format: `1 Januari 2010` (text)

#### 4. **Kelas Tidak Ditemukan**
- **Masalah**: Siswa tanpa kelas / kelas tidak ter-assign
- **Solusi**:
  - Pastikan kelas sudah terdaftar di **Admin → Kelas**
  - Nama kelas di Excel harus match (case-insensitive)
  - Jika tidak ditemukan, sistem akan assign ke kelas aktif pertama

#### 5. **Email Duplikat**
- **Masalah**: Error "Email sudah terdaftar"
- **Solusi**:
  - Sistem akan auto-generate email alternative
  - Jika tetap gagal, check manual di database
  - Hapus user lama atau gunakan email berbeda

---

## 📊 Error Handling

### Statistik Gagal:
Jika ada data yang gagal, sistem akan menampilkan:
```
Baris 3: NIS 2024001 sudah terdaftar
Baris 7: Nama dan NIS siswa harus diisi
Baris 15: Email abdullah@email.com sudah terdaftar
...
(Max 20 error ditampilkan)
```

### Tindakan:
1. **Perbaiki data di Excel** sesuai pesan error
2. **Hapus baris yang sudah berhasil** (check via duplikat atau database)
3. **Re-import** hanya baris yang gagal
4. **Atau**: Import ulang semua (sistem akan skip duplikat)

---

## 🎯 Best Practices

### Sebelum Import:

1. **Backup Data Lama**
   - Export data siswa existing sebelum import massal
   - Gunakan fitur **"📤 Export Data"** di toolbar

2. **Test dengan Data Kecil**
   - Import 5-10 baris dulu untuk test mapping
   - Verifikasi akun ter-create dengan benar
   - Baru import data lengkap

3. **Clean Data di Excel**
   - Hapus baris kosong
   - Hapus duplikat NIS/Email
   - Validasi format tanggal
   - Trim spasi di awal/akhir text

4. **Gunakan Template**
   - Download template dengan header recommended
   - Copy-paste data existing ke template
   - Lebih mudah dari pada rename kolom manual

### Saat Import:

1. **Preview Dulu**
   - Always check preview table & column mapping
   - Pastikan semua kolom penting terdeteksi
   - Jika ada yang tidak terdeteksi, cancel & fix Excel

2. **Read Error Messages**
   - Jika ada yang gagal, baca pesan error dengan teliti
   - Catat baris yang error untuk diperbaiki
   - Jangan langsung import ulang tanpa fix

3. **Monitor Progress**
   - Tunggu hingga progress bar selesai
   - Jangan close browser/tab saat processing
   - Untuk data >500 baris, bisa butuh 1-2 menit

### Setelah Import:

1. **Export Akun Baru**
   - ALWAYS export akun setelah import sukses
   - Simpan file di tempat aman (password manager/encrypted folder)
   - Ini satu-satunya kesempatan dapat password asli

2. **Verifikasi Data**
   - Check beberapa siswa random di database
   - Test login dengan akun yang baru dibuat
   - Pastikan relasi siswa-orang tua benar

3. **Distribusi Akun**
   - Berikan username & password ke siswa/orang tua
   - Instruksikan untuk ganti password pertama kali login
   - Set reminder untuk follow-up

4. **Delete File Sensitive**
   - Setelah distribusi selesai, hapus file export akun
   - Atau simpan di encrypted storage (BitLocker, VeraCrypt, dll)

---

## 🔢 Limits & Performance

### Upload Limits:
- **Max file size**: 10MB (recommended)
- **Max rows**: ~1000 data per upload (optimal: 100-500)
- **Max columns**: Unlimited (sistem ambil yang terdeteksi saja)

### Processing Time:
- **100 rows**: ~10-15 detik
- **500 rows**: ~45-60 detik
- **1000 rows**: ~2-3 menit

**Note**: Waktu tergantung server load & kompleksitas data (create orang tua, check duplikat, dll)

### Recommendation:
- Untuk data >500 rows: Split ke beberapa file
- Optimal: 100-200 rows per batch
- Trade-off: Lebih banyak batch vs. waktu per batch

---

## 💡 Tips Pro

### 1. Gunakan Formula Excel untuk Validasi
```excel
// Check duplikat NIS
=COUNTIF(B:B, B2) > 1

// Format email otomatis
=LOWER(SUBSTITUTE(A2, " ", "")) & "@tahfidz.siswa"

// Generate NIS otomatis
="2024" & TEXT(ROW()-1, "000")
```

### 2. Batch Processing untuk Data Besar
- Import 100 data per hari untuk kontrol kualitas
- Lebih mudah troubleshoot jika ada error
- Siswa/orang tua bisa langsung test login

### 3. Keep Excel Template
- Simpan template kosong dengan header yang sudah benar
- Setiap import, copy-paste data ke template
- Lebih cepat dari pada rename header manual

### 4. Koordinasi dengan Staff
- Tentukan PIC untuk import data
- Training dulu sebelum import massal
- Buat SOP internal untuk import

---

## ✅ Checklist Pre-Import

- [ ] File format `.xlsx` atau `.csv`
- [ ] Header kolom jelas (minimal: Nama Siswa, NIS)
- [ ] Tidak ada baris kosong di tengah data
- [ ] NIS unique (tidak ada duplikat)
- [ ] Email unique (jika ada)
- [ ] Format tanggal valid (DD/MM/YYYY)
- [ ] Jenis kelamin konsisten (L/P atau Laki-laki/Perempuan)
- [ ] Kelas sudah terdaftar di sistem
- [ ] Data sudah di-backup
- [ ] Test import dengan 5-10 baris dulu

---

## 🆚 Perbandingan Fitur Import

| Fitur | Import Biasa | Smart Import |
|-------|-------------|--------------|
| **Auto-detect kolom** | ❌ Harus exact header | ✅ Flexible header |
| **Preview mapping** | ❌ Tidak ada | ✅ Preview table + mapping |
| **Import siswa + orang tua** | ❌ Terpisah | ✅ Satu file |
| **Auto-link relasi** | ❌ Manual | ✅ Otomatis |
| **Export akun baru** | ❌ Tidak ada | ✅ Excel dengan password |
| **Statistik detail** | ⚠️ Basic | ✅ Lengkap dengan error message |
| **Error handling** | ⚠️ Stop saat error | ✅ Continue + report |
| **Column flexibility** | ⚠️ Strict | ✅ Pattern matching |
| **UX** | ⚠️ Single step | ✅ 4-step wizard |

**Recommendation**:
- **Import Biasa**: Untuk update data existing (guru, siswa tanpa orang tua)
- **Smart Import**: Untuk onboarding siswa baru dengan orang tua

---

## 📚 Use Cases

### Use Case 1: Onboarding Siswa Baru (Awal Tahun Ajaran)
**Scenario**: 100 siswa baru mendaftar, perlu create akun siswa + orang tua

**Steps**:
1. Staff admin export data pendaftaran ke Excel
2. Rename kolom sesuai pattern (atau gunakan template)
3. Smart Import Excel → Preview → Confirm
4. Export akun baru ke Excel
5. Print atau kirim via email/WhatsApp ke orang tua
6. Follow-up untuk ganti password

**Result**:
- ✅ 100 siswa + 100 orang tua ter-create dalam <5 menit
- ✅ Relasi siswa-orang tua otomatis
- ✅ Semua akun langsung aktif

---

### Use Case 2: Migrasi Data dari Sistem Lama
**Scenario**: Pindah dari sistem manual/Excel ke Tahfidz App

**Steps**:
1. Export data dari sistem lama ke Excel
2. Clean data: Hapus duplikat, fix format
3. Split data jadi batch 100-200 rows
4. Smart Import batch pertama → Test akun
5. Jika OK, lanjut import batch berikutnya
6. Verifikasi total data match

**Result**:
- ✅ Migrasi ratusan data dalam hitungan jam (vs. hari)
- ✅ Minimal error dengan preview & validation
- ✅ Database clean & relasi benar

---

### Use Case 3: Update Data Massal
**Scenario**: Update alamat/no HP orang tua untuk 50 siswa

**Steps**:
1. Export data existing via **"📤 Export Data"**
2. Update kolom yang perlu di Excel
3. Hapus kolom yang tidak berubah (optional)
4. Smart Import → Sistem detect duplikat → Update data
5. Verifikasi perubahan di database

**Result**:
- ✅ Update massal tanpa input manual satu-satu
- ✅ History perubahan (via timestamp database)

---

## 🎨 Design & UX

### Wizard Steps:
1. **Upload** (🔵 Blue indicator)
2. **Preview** (🟡 Yellow indicator)
3. **Processing** (🟠 Orange indicator)
4. **Result** (🟢 Green indicator)

### Color Scheme:
- **Primary**: Violet gradient (#8B5CF6 → #7C3AED)
- **Success**: Emerald (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Rose (#EF4444)
- **Neutral**: Gray (#6B7280)

### Animations:
- **Modal**: Fade-in dengan scale (0.95 → 1)
- **Progress bar**: Animated gradient shimmer
- **Step indicator**: Active step dengan pulse animation
- **Buttons**: Hover dengan scale up + shadow enhancement

### Islamic Ornaments:
- Subtle arabesque pattern (opacity 0.05) di background modal
- Radial gradient emerald di header
- Harmonis dengan design system Tahfidz App

---

## 🔐 Security Considerations

### Password Generation:
- ✅ Random 8 karakter (huruf + angka)
- ✅ Hindari karakter ambigu (0, O, I, l)
- ✅ Hashed dengan bcryptjs (10 rounds)

### Email Generation:
- ✅ Auto-generate jika kosong
- ✅ Unique check sebelum create
- ✅ Domain `@tahfidz.siswa` / `@tahfidz.ortu` untuk internal

### Data Privacy:
- ⚠️ File export akun mengandung password plaintext
- ⚠️ Instruksikan user untuk ganti password ASAP
- ⚠️ Simpan file di secure location
- ⚠️ Hapus setelah distribusi selesai

### Access Control:
- 🔒 Hanya ADMIN yang bisa akses Smart Import
- 🔒 Auth check di API endpoint
- 🔒 Session validation via NextAuth

---

**Status**: ✅ Ready to Use
**Lokasi**: Admin → Siswa → ✨ Smart Import Excel
**Design**: Islamic Modern (Violet Gradient + Emerald Accent)
**Version**: 1.0
**Last Updated**: 2025-10-27

---

**💬 Need Help?**
Jika ada kendala, hubungi administrator sistem atau lihat dokumentasi lain:
- `IMPORT_EXPORT_GUIDE.md` - Guide untuk import/export biasa
- `SPA_OPTIMIZATION_GUIDE.md` - Optimisasi performa aplikasi
- `REFACTOR_SUMMARY.md` - Summary refactoring & best practices
