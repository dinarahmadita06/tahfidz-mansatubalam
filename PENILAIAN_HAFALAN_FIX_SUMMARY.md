# Fix: Penilaian Hafalan 500 Internal Server Error

## 📋 Ringkasan Bug
Backend menolak request POST ke `/api/guru/penilaian-hafalan` dengan error:
```
Unknown argument surahTambahan
```

Masalah: Frontend mengirim array `surahTambahan` yang berisi item kosong/invalid, dan backend tidak membersihkan data sebelum menyimpan ke database.

---

## ✅ Solusi yang Diimplementasikan

### **A. Fix Backend - API Validation & Cleaning**

#### File 1: `/api/guru/penilaian-hafalan/route.js`
**Perubahan:**
- ✅ Tambah helper function `cleanSurahTambahan()` yang:
  - Filter item dengan surah kosong
  - Validasi ayatMulai & ayatSelesai (angka valid, positif, ayatMulai ≤ ayatSelesai)
  - Transform data ke format yang benar (string trim, number)
  - Return `null` jika array kosong setelah filter
  
- ✅ Terapkan cleaning pada CREATE hafalan (line 195)
- ✅ Terapkan cleaning pada UPDATE hafalan (line 169)
- ✅ Improve error handling dengan Prisma error codes (P2025, P2003)
- ✅ Return response dengan `hafalanTambahan` untuk feedback

**Code Pattern:**
```javascript
// Clean surahTambahan sebelum save
const cleanedSurahTambahan = cleanSurahTambahan(surahTambahan);

// Save dengan conditional - null jika kosong
await prisma.hafalan.create({
  data: {
    ...
    surahTambahan: cleanedSurahTambahan.length > 0 ? cleanedSurahTambahan : null,
  }
});
```

#### File 2: `/api/guru/hafalan/route.js`
**Perubahan:**
- ✅ Tambah support untuk `surahTambahan` di POST handler
- ✅ Tambah support untuk `surahTambahan` di PUT handler
- ✅ Implement same cleaning logic sebagai di penilaian-hafalan route
- ✅ Improve error handling dengan Prisma error codes

---

### **B. Frontend Helper Utility**

#### File: `/lib/helpers/sanitizeSurahTambahan.js` (BARU)
**Export Functions:**

1. **`cleanSurahTambahan(surahArray)`**
   - Digunakan backend di API routes
   - Digunakan frontend sebelum send API
   - Filter + transform invalid items

2. **`validateSurahItem(item)`**
   - Validasi single item dengan error message
   - Gunakan untuk real-time form validation
   - Return: `{ isValid: boolean, error?: string }`

3. **`preparePenilaianPayload(formData)`**
   - Convenience function untuk frontend
   - Auto-clean surahTambahan sebelum send
   - Return payload siap kirim ke API

**Usage di Frontend:**
```javascript
import { preparePenilaianPayload, validateSurahItem } from '@/lib/helpers/sanitizeSurahTambahan';

// Option 1: Prepare payload otomatis
const payload = preparePenilaianPayload(formData);
await fetch('/api/guru/penilaian-hafalan', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// Option 2: Validasi realtime saat input
const validation = validateSurahItem(userInputItem);
if (!validation.isValid) {
  toast.error(validation.error);
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Valid Data
**Input:**
```javascript
{
  siswaId: "xxx",
  tanggal: "2025-01-03",
  surah: "Al-Fatihah",
  ayatMulai: 1,
  ayatSelesai: 7,
  surahTambahan: [
    { surah: "Al-Baqarah", ayatMulai: 1, ayatSelesai: 10 }
  ],
  tajwid: 85,
  kelancaran: 90,
  makhraj: 88,
  implementasi: 95,
  catatan: "Bagus"
}
```
**Expected:** ✅ 200 OK, data tersimpan dengan surahTambahan

---

### Scenario 2: Empty Surah Tambahan
**Input:**
```javascript
{
  ...sameAsAbove,
  surahTambahan: [
    { surah: "", ayatMulai: "", ayatSelesai: "" },
    { surah: "Al-Imran", ayatMulai: 1, ayatSelesai: 5 }
  ]
}
```
**Expected:** ✅ 200 OK, hanya Al-Imran yang disimpan (item kosong difilter)

---

### Scenario 3: Invalid Ayat Numbers
**Input:**
```javascript
{
  ...sameAsAbove,
  surahTambahan: [
    { surah: "Al-Nisa", ayatMulai: 10, ayatSelesai: 5 }, // ayatMulai > ayatSelesai
    { surah: "Al-Maidah", ayatMulai: 1, ayatSelesai: 10 }
  ]
}
```
**Expected:** ✅ 200 OK, hanya Al-Maidah yang disimpan (invalid item difilter)

---

### Scenario 4: No surahTambahan (Backward Compatibility)
**Input:**
```javascript
{
  siswaId: "xxx",
  tanggal: "2025-01-03",
  surah: "Al-Fatihah",
  ayatMulai: 1,
  ayatSelesai: 7,
  // surahTambahan tidak dikirim
  tajwid: 85,
  ...
}
```
**Expected:** ✅ 200 OK, surahTambahan di DB menjadi null (backward compatible)

---

### Scenario 5: Error Handling
**Input:**
```javascript
{
  // siswaId kosong - missing required field
  tanggal: "2025-01-03",
  surah: "Al-Fatihah",
  ...
}
```
**Expected:** ✅ 400 Bad Request dengan error message jelas

---

## 📊 Validation Rules

### surahTambahan Item Validation:
```
✅ surah field:
   - Tidak boleh kosong (after trim)
   - String, required

✅ ayatMulai & ayatSelesai:
   - Harus berupa angka (Number)
   - Harus > 0
   - ayatMulai <= ayatSelesai
```

### Array Handling:
```
✅ Input: surahTambahan = []
   → Save: surahTambahan = null (default di schema)

✅ Input: surahTambahan = [item1, item2, ...]
   → Filter invalid items
   → Save: [cleaned_item1, cleaned_item2, ...] atau null jika semua invalid
```

---

## 🔒 Error Messages (User Friendly)

| Error | HTTP | Message |
|-------|------|---------|
| Missing required fields | 400 | Data tidak lengkap |
| Invalid surah format | 400 | Format data tidak sesuai - periksa struktur surahTambahan |
| Siswa/Guru not found | 404 | Data siswa atau guru tidak ditemukan |
| Reference invalid | 400 | Referensi data tidak valid (siswa atau guru tidak ada) |
| Database error | 500 | Gagal menyimpan penilaian |

---

## 🎯 Integration Checklist

Frontend Form Handling:
- [ ] Import `preparePenilaianPayload` dari utility
- [ ] Gunakan `validateSurahItem()` untuk real-time validation
- [ ] Call `preparePenilaianPayload(formData)` sebelum fetch
- [ ] Handle error response dengan toast.error(response.error)
- [ ] Handle success response dengan toast.success('Penilaian berhasil disimpan')
- [ ] Refresh data list setelah sukses

Example Frontend Code:
```javascript
import { preparePenilaianPayload } from '@/lib/helpers/sanitizeSurahTambahan';
import { toast } from 'react-toastify';

const handleSavePenilaian = async (formData) => {
  try {
    // Clean & prepare payload
    const payload = preparePenilaianPayload(formData);
    
    const response = await fetch('/api/guru/penilaian-hafalan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      toast.success('Penilaian berhasil disimpan');
      // Refresh data
      await fetchPenilaianList();
    } else {
      const error = await response.json();
      toast.error(error.error); // Detailed error message
    }
  } catch (error) {
    toast.error('Terjadi kesalahan: ' + error.message);
  }
};
```

---

## 📝 Prisma Schema Status
✅ Field `surahTambahan Json @default("[]")` sudah ada di model Hafalan (line 304)
✅ Tidak perlu migrate - field sudah exist

---

## 🚀 Files Modified

1. **`d:\tahfidz\tahfidz\src\app\api\guru\penilaian-hafalan\route.js`**
   - Add cleanSurahTambahan() helper
   - Improve error handling
   - Apply cleaning on create/update

2. **`d:\tahfidz\tahfidz\src\app\api\guru\hafalan\route.js`**
   - Add surahTambahan support (POST & PUT)
   - Add cleanSurahTambahan() helper
   - Improve error handling

3. **`d:\tahfidz\tahfidz\src\lib\helpers\sanitizeSurahTambahan.js`** (NEW)
   - cleanSurahTambahan()
   - validateSurahItem()
   - preparePenilaianPayload()

---

## 📚 Next Steps

1. **Frontend Integration:**
   - Update penilaian form component to use `preparePenilaianPayload()`
   - Add real-time validation with `validateSurahItem()`
   - Improve error message display

2. **Testing:**
   - Test dengan Postman/curl untuk verify API works
   - Test dengan frontend form
   - Test error cases

3. **Documentation:**
   - Update form component docs
   - Add API usage examples

---

## ⚠️ Important Notes

- ✅ Backward compatible - old requests tanpa surahTambahan tetap berfungsi
- ✅ Validation terjadi di backend (tidak hanya frontend)
- ✅ surahTambahan akan menjadi `null` jika kosong (sesuai schema default)
- ✅ Error handling memberikan detail message untuk debugging
- ❌ Jangan kirim array kosong `[]` - will be converted to `null`
- ❌ Jangan kirim object kosong - akan difilter oleh backend

