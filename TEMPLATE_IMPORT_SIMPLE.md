# 📥 Template Import Siswa SIMTAQ - Simplified Version

## 🎯 Tujuan
Template ini digunakan untuk **import massal akun siswa** dengan format yang **lebih sederhana dan mudah**.

Semua siswa hasil import otomatis:
- ✅ Terdaftar pada **tahun ajaran aktif saat ini**
- ✅ Dibuatkan akun siswa dan akun wali secara otomatis
- ✅ Status langsung **AKTIF** dan **APPROVED**

---

## 📋 Format Template Excel

### Kolom WAJIB (urutan harus sama):

| No | Nama Kolom | Keterangan | Contoh |
|----|------------|------------|--------|
| 1  | **Nama Lengkap Siswa** | Nama lengkap siswa | Abdullah Rahman |
| 2  | **NISN** | Nomor Induk Siswa Nasional (10 digit) | 0012345678 |
| 3  | **NIS** | Nomor Induk Sekolah | 24001 |
| 4  | **Tanggal Lahir** | Format: YYYY-MM-DD | 2010-05-15 |
| 5  | **Jenis Kelamin** | L (Laki-laki) atau P (Perempuan) | L |
| 6  | **Nama Wali** | Nama lengkap wali/orang tua | Ahmad Rahman |

### ⚠️ Ketentuan Penting:
1. **Tidak boleh ada kolom lain** selain 6 kolom di atas
2. **Baris pertama wajib header** (nama kolom)
3. **Data dimulai dari baris ke-2**
4. **Urutan kolom harus sama** seperti tabel di atas

---

## 📝 Contoh Isi Template

```
Nama Lengkap Siswa    NISN        NIS     Tanggal Lahir   Jenis Kelamin   Nama Wali
Abdullah Rahman       0012345678  24001   2010-05-15      L               Ahmad Rahman
Fatimah Azzahra       0012345679  24002   2010-08-22      P               Siti Aminah
Muhammad Yusuf        0012345680  24003   2009-12-10      L               Umar bin Khattab
```

---

## ✅ Validasi Sistem

### Field yang WAJIB diisi:
- ❌ **Nama Lengkap Siswa** tidak boleh kosong
- ❌ **NISN** tidak boleh kosong
- ❌ **NIS** tidak boleh kosong
- ❌ **Tanggal Lahir** tidak boleh kosong dan harus format valid (YYYY-MM-DD)
- ❌ **Jenis Kelamin** harus L atau P
- ❌ **Nama Wali** tidak boleh kosong

### Validasi Duplikat:
- ⚠️ **NIS & NISN** harus unique (tidak boleh duplikat)
- ⚠️ Jika ada duplikat, data tersebut akan **dilewati** dan masuk kategori **Duplicate**

---

## 🔐 Password Otomatis

### Password Siswa:
- **Format**: NISN (langsung)
- **Contoh**: NISN `0012345678` → Password: `0012345678`

### Password Wali:
- **Format**: DDMMYYYY (dari tanggal lahir siswa)
- **Contoh**: 
  - Tanggal Lahir: `2010-05-15`
  - Password Wali: `15052010`

### 🔒 Keamanan:
- Setelah login pertama kali, **instruksikan user untuk mengganti password**
- Password default hanya untuk kemudahan distribusi akun

---

## 🎓 Tahun Ajaran Otomatis

✅ **Semua siswa yang diimport otomatis terdaftar ke Tahun Ajaran Aktif saat ini**

Tidak perlu input manual tahun ajaran di Excel. Sistem akan:
1. Cek tahun ajaran mana yang sedang `isActive = true`
2. Assign semua siswa hasil import ke tahun ajaran tersebut
3. Jika tidak ada tahun ajaran aktif, import akan **gagal** dengan pesan error

---

## 📊 Hasil Import

Setelah import selesai, sistem akan menampilkan statistik:

```
✅ Berhasil: 45 data
❌ Gagal: 2 data
📋 Duplikat: 3 data
📊 Total: 50 data
```

### Kategori:
- **Berhasil**: Data berhasil diimport, akun siswa & wali dibuat
- **Gagal**: Data tidak valid (format salah, field kosong, dll)
- **Duplikat**: NIS/NISN sudah terdaftar di database

### Export Akun Baru:
Setelah import berhasil, sistem akan menyediakan **file Excel berisi username & password** untuk diserahkan ke siswa dan wali.

---

## 📥 Cara Menggunakan

### 1. Download Template
- Jalankan script: `node generate-template-import-siswa.cjs`
- File akan dibuat: `Template_Import_Siswa_SIMTAQ.xlsx`

### 2. Isi Data
- Buka file Excel
- **Jangan ubah header** di baris 1
- Isi data mulai dari baris 2
- Pastikan format tanggal: `YYYY-MM-DD`
- Pastikan jenis kelamin: `L` atau `P`

### 3. Upload File
- Login sebagai **Admin**
- Masuk ke menu **Manajemen Siswa**
- Klik tombol **Import Siswa**
- Pilih file Excel yang sudah diisi
- Klik **Upload & Import**

### 4. Verifikasi Hasil
- Check statistik import (Berhasil / Gagal / Duplikat)
- Download file akun baru (username & password)
- Distribusikan akun ke siswa dan wali

---

## ⚙️ API Endpoint

### POST `/api/admin/siswa/import-simple`

**Authorization**: Admin only

**Request Body**:
```json
{
  "siswaData": [
    {
      "Nama Lengkap Siswa": "Abdullah Rahman",
      "NISN": "0012345678",
      "NIS": "24001",
      "Tanggal Lahir": "2010-05-15",
      "Jenis Kelamin": "L",
      "Nama Wali": "Ahmad Rahman"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Import selesai. Berhasil: 1, Gagal: 0, Duplikat: 0",
  "tahunAjaran": "2024/2025",
  "results": {
    "success": [...],
    "failed": [...],
    "duplicate": [...]
  }
}
```

---

## 🐛 Troubleshooting

### Import Gagal Semua?
1. ✅ Pastikan ada **Tahun Ajaran Aktif** di sistem
2. ✅ Cek nama kolom di baris 1 (harus exact match)
3. ✅ Cek format tanggal lahir (YYYY-MM-DD)
4. ✅ Cek jenis kelamin (hanya L atau P)
5. ✅ Pastikan tidak ada baris kosong di tengah data

### Beberapa Data Gagal?
- Check error message di hasil import
- Perbaiki data yang gagal
- Import ulang hanya data yang gagal

### NIS/NISN Duplikat?
- Data akan masuk kategori **Duplicate**
- Cek database: apakah memang sudah terdaftar?
- Gunakan NIS/NISN yang berbeda

---

## 📚 Catatan Sistem

### Data yang TIDAK diinput saat import:
- ❌ Nomor HP siswa
- ❌ Alamat lengkap
- ❌ Kelas (assignment ke kelas)
- ❌ Email siswa & wali (auto-generated)

### Data tambahan:
Setelah akun siswa aktif, admin/guru dapat melengkapi data tambahan via:
- Menu **Manajemen Siswa** (untuk update data siswa)
- Menu **Penempatan Kelas** (untuk assign siswa ke kelas)

---

## ✨ Keunggulan Import Simple

### vs. Import Lengkap:
- ✅ **Lebih cepat** - hanya 6 kolom vs 14 kolom
- ✅ **Lebih mudah** - format sederhana, minim error
- ✅ **Auto tahun ajaran** - tidak perlu input manual

### vs. Input Manual:
- 🚀 **100x lebih cepat** - import ratusan siswa dalam hitungan detik
- 📊 **Bulk account creation** - akun siswa & wali dibuat otomatis
- 🔗 **Auto relationship** - relasi siswa-wali dibuat otomatis

---

**Status**: ✅ Ready to Use  
**API Route**: `/api/admin/siswa/import-simple`  
**Template Generator**: `generate-template-import-siswa.cjs`  
**Last Updated**: January 12, 2026
