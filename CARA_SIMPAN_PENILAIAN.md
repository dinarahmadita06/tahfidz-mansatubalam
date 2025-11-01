# 📝 Cara Menyimpan Data Penilaian ke Database

## ✅ API Endpoints yang Sudah Dibuat

### 1. **API Hafalan** (`/api/guru/hafalan`)
- `GET` - Ambil data hafalan
- `POST` - Tambah hafalan baru
- `PUT` - Update hafalan
- `DELETE` - Hapus hafalan

### 2. **API Penilaian** (`/api/guru/penilaian`)
- `GET` - Ambil data penilaian
- `POST` - Tambah penilaian baru
- `PUT` - Update penilaian
- `DELETE` - Hapus penilaian

---

## 🔧 Cara Menggunakan API

### **📝 Tambah Penilaian (Hafalan + Nilai Sekaligus)**

API sudah didesign untuk menerima data hafalan dan penilaian **dalam 1 request**:

```javascript
// POST /api/guru/penilaian
const response = await fetch('/api/guru/penilaian', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    // Data Hafalan
    siswaId: 'cmhe864vt0003vos0...',  // ID siswa dari database
    tanggal: '2025-10-31',            // Optional, default: hari ini
    juz: 1,
    surah: 'Al-Fatihah',
    ayatMulai: 1,
    ayatSelesai: 7,
    keterangan: 'Setoran hafalan pertama', // Optional

    // Data Penilaian
    tajwid: 85,
    kelancaran: 90,
    makhraj: 88,
    adab: 95,
    catatan: 'Sangat bagus, pertahankan!' // Optional
  })
});

const result = await response.json();

// result akan berisi:
// - Data penilaian dengan nilaiAkhir (auto-calculated)
// - Data hafalan yang baru dibuat
// - Data siswa
console.log('Nilai Akhir:', result.nilaiAkhir);
console.log('Hafalan:', result.hafalan);
```

**Keuntungan:**
✅ Satu kali submit langsung ada hafalan + nilai
✅ Atomic transaction (semua berhasil atau semua gagal)
✅ Nilai akhir auto-calculated
✅ Data konsisten

---

## 📊 Contoh Implementasi di Frontend

### **Tambah Penilaian (1 Form untuk Hafalan + Nilai)**

```javascript
const handleSubmitPenilaian = async (formData) => {
  try {
    // formData berisi semua field: siswa, juz, surah, ayat, dan nilai
    const response = await fetch('/api/guru/penilaian', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Data Hafalan
        siswaId: formData.siswaId,
        tanggal: formData.tanggal || new Date().toISOString(),
        juz: formData.juz,
        surah: formData.surah,
        ayatMulai: formData.ayatMulai,
        ayatSelesai: formData.ayatSelesai,
        keterangan: formData.keterangan,

        // Data Penilaian
        tajwid: formData.nilaiTajwid,
        kelancaran: formData.nilaiKelancaran,
        makhraj: formData.nilaiMakhraj,
        adab: formData.nilaiAdab,
        catatan: formData.catatan
      })
    });

    if (response.ok) {
      const result = await response.json();
      toast.success(`Penilaian berhasil disimpan! Nilai Akhir: ${result.nilaiAkhir}`);

      // Cek di Prisma Studio untuk verifikasi
      console.log('✅ Data tersimpan! Buka http://localhost:5556 untuk melihat');
      console.log('Result:', result);

      return result;
    } else {
      const error = await response.json();
      toast.error(error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Gagal menyimpan penilaian');
  }
};
```

### **Contoh Form State**

```javascript
const [formData, setFormData] = useState({
  // Data Siswa
  siswaId: '',

  // Data Hafalan
  tanggal: new Date().toISOString().split('T')[0],
  juz: '',
  surah: '',
  ayatMulai: '',
  ayatSelesai: '',
  keterangan: '',

  // Data Penilaian
  nilaiTajwid: '',
  nilaiKelancaran: '',
  nilaiMakhraj: '',
  nilaiAdab: '',
  catatan: ''
});
```

### **Load Data dari Database**

```javascript
const loadPenilaian = async () => {
  try {
    const response = await fetch('/api/guru/penilaian');
    if (response.ok) {
      const data = await response.json();
      setPenilaianList(data);
    }
  } catch (error) {
    console.error('Error loading penilaian:', error);
  }
};

// Call saat component mount
useEffect(() => {
  loadPenilaian();
}, []);
```

---

## 🔍 Cara Mengecek Data Sudah Tersimpan

### **1. Prisma Studio** (PALING MUDAH)
```bash
npx prisma studio
```
Buka: `http://localhost:5556`
- Klik "Penilaian" di sidebar
- Lihat semua data penilaian

### **2. Script Node.js**
```bash
node check-penilaian.js
```

### **3. Langsung dari Frontend**
Setelah save, langsung fetch ulang data:
```javascript
await handleTambahPenilaian(...);
await loadPenilaian(); // Reload dari database
```

---

## ⚠️ Penting!

**Halaman `/guru/penilaian-hafalan/[kelasId]` saat ini masih menggunakan MOCK DATA.**

Untuk menyimpan ke database, perlu:
1. ✅ API sudah siap (sudah dibuat)
2. ❌ Frontend perlu di-update untuk call API
3. ❌ Perlu ada data kelas dan siswa di database terlebih dahulu

---

## 🎯 Langkah Selanjutnya

1. **Tambah data kelas** (dari halaman Admin > Kelas)
2. **Tambah data siswa** ke kelas (dari halaman Admin > Siswa)
3. **Update halaman penilaian** untuk menggunakan API instead of mock data
4. **Test flow lengkap**: Tambah Hafalan → Tambah Penilaian → Cek di Prisma Studio

---

## 💡 Tips

- Gunakan Prisma Studio untuk monitoring data real-time
- Check console browser untuk error messages
- Pastikan login sebagai GURU
- Nilai harus 1-100 (akan divalidasi oleh API)
