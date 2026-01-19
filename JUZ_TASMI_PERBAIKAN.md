# Perbaikan Sistem Penentuan Juz Hafalan & Kelayakan Tasmi'

## 📋 Ringkasan Perubahan

Sistem telah diperbarui untuk menggunakan **Juz Tertinggi yang Dicapai** (integer 1-30) sebagai metrik kelayakan Tasmi', menggantikan sistem persentase progres yang ambigu.

## 🎯 Tujuan Perbaikan

1. **Akurat**: Siswa yang sudah melewati batas juz terdeteksi dengan benar
2. **Dinamis**: Syarat minimal Tasmi' dapat berubah dari pengaturan sekolah tanpa ubah kode
3. **Jelas**: UI menampilkan angka konkret (X Juz) bukan desimal ambigu (0.05 Juz)
4. **Informatif**: Pesan status jelas menunjukkan "Siap / Belum Siap" dengan penjelasan

## 🔧 Perubahan Teknis

### 1. **quranProgress.js** - Tambah Fungsi Baru
```javascript
export function getHighestJuzAchieved(juzProgress) {
  // Cari juz tertinggi dengan coverage ≥80%
  // Return: integer 1-30 atau 0 jika belum ada
}
```

**Kriteria Pencapaian Juz:**
- Progress ≥ 80% dianggap "tercapai" penuh
- Hanya juz dengan coverage ≥80% yang dihitung
- Return nilai integer (bukan float)

### 2. **siswaProgressService.js** - Update Logika Validasi

**Perubahan di `calculateStudentProgress()`:**
- Menghitung `highestJuzAchieved` menggunakan fungsi baru
- Simpan ke database: `Siswa.latestJuzAchieved = highestJuzAchieved` (integer)
- Return object tambahan: `{ highestJuzAchieved, ... }`

**Update `isEligibleForTasmi()`:**
```javascript
// Sebelum: isEligibleForTasmi(0.75, 3) → false (ambigu)
// Sesudah: isEligibleForTasmi(1, 3) → { isEligible: false, remainingJuz: 2, message: "..." }

// Parameter: juzTertinggi (integer), targetMinimal (integer)
// Return: { isEligible, remainingJuz, message }
```

**Pesan Informatif:**
- ✅ Siap: `"Siap Mendaftar (Sudah mencapai X Juz)"`
- ❌ Belum: `"Belum Siap. Butuh Y Juz lagi (Target: Z Juz)"`

### 3. **API Route - `/api/siswa/tasmi` (GET & POST)**

**GET Response (tambahan fields):**
```json
{
  "highestJuzAchieved": 3,           // NEW: integer juz tertinggi
  "totalJuzHafalan": 3.42,           // OLD: untuk statistik/visual saja
  "targetJuzSekolah": 3,             // dari TahunAjaran.targetHafalan
  "isEligible": true,                // NEW: boolean result
  "eligibilityMessage": "Siap Mendaftar...",  // NEW: pesan detail
  "remainingJuz": 0,                 // NEW: juz yang masih dibutuhkan
  "tasmi": [...],
  "pagination": {...}
}
```

**POST Validasi:**
- Gunakan `highestJuzAchieved` (bukan float `totalJuz`)
- Simpan ke `Tasmi.jumlahHafalan` sebagai integer akurat
- Return error dengan `eligibilityMessage` jika tidak lolos

### 4. **TasmiClient.js - Update UI**

**Stats Cards Update:**
```
┌─────────────────────────────┐
│ Juz Tertinggi Dicapai: 3    │  ← NEW: Tampilkan integer
│ Syarat Minimal: 3 Juz       │  ← NEW: Clarity
└─────────────────────────────┘
```

**Status Display:**
```
Status: Siap Mendaftar
"Belum Siap. Butuh 1 Juz lagi (Target: 3 Juz)"  ← Pesan dari API
```

**Form Initialization:**
```javascript
jumlahHafalan: highestJuzAchieved  // Gunakan nilai akurat, bukan float
```

## 📊 Mapping Juz Al-Qur'an

Sistem sudah memiliki `JUZ_MAPPING` yang lengkap (30 juz, per surah & ayat):
- Juz 1-30 dipetakan berdasarkan ayat tertinggi
- Contoh: Juz 1 berakhir di Al-Baqarah:141
- Fungsi `getHighestJuzAchieved()` membaca mapping ini

## 🔄 Alur Data

```
Siswa Setoran Hafalan
        ↓
Hafalan Records (surah, ayat_mulai, ayat_selesai)
        ↓
calculateJuzProgress() → juzProgress array
        ↓
getHighestJuzAchieved() → integer (1-30 atau 0)
        ↓
Siswa.latestJuzAchieved = integer ✅
        ↓
isEligibleForTasmi(highestJuz, targetMinimal) → { isEligible, message }
        ↓
API Response + UI Display
```

## ✅ Testing Checklist

- [x] Siswa dengan 2.5 Juz (81% Juz 3) → highestJuzAchieved = 3 ✓
- [x] Siswa dengan 2.1 Juz (70% Juz 3) → highestJuzAchieved = 2 ✓
- [x] Siswa dengan 1 Juz penuh → isEligible = true (jika target 1) ✓
- [x] Perubahan minimalJuz dari TahunAjaran langsung mempengaruhi status ✓
- [x] Pesan error jelas dan informatif ✓
- [x] Tidak ada lagi angka ambigu di UI ✓

## 📦 Files Modified

1. `src/lib/utils/quranProgress.js` - Tambah `getHighestJuzAchieved()`
2. `src/lib/services/siswaProgressService.js` - Update fungsi & return
3. `src/app/api/siswa/tasmi/route.js` - GET & POST update
4. `src/app/siswa/tasmi/TasmiClient.js` - UI update

## 🚀 Deployment Notes

- Perubahan backward-compatible (field lama `totalJuzHafalan` tetap ada untuk statistik)
- Tidak ada migration database diperlukan (`latestJuzAchieved` sudah exist)
- Konfigurasi minimal juz otomatis dari `TahunAjaran.targetHafalan` (sudah dinamis)

## 💡 Fitur Tambahan (Future)

- Admin dapat mengatur `minimalJuzTasmi` per-kelas atau per-tahun ajaran
- Notifikasi real-time ketika siswa mencapai threshold juz
- Analytics: Dashboard menunjukkan distribusi juz siswa per kelas

---

**Status**: ✅ Implementation Complete  
**Testing**: ✅ No Errors  
**Ready for Production**: ✅ Yes
