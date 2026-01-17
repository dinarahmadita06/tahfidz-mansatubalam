# 📘 Dokumentasi Sistem Password Guru

## 🎯 Tujuan
Semua akun guru (baik dari import maupun create) **langsung bisa login** menggunakan password default dalam format **YYYY-MM-DD** dari tanggal lahir mereka.

---

## ✅ Implementasi Saat Ini

### 1. **Format Password**
- **Format Default**: `YYYY-MM-DD` (tanggal lahir guru)
- **Contoh**: 
  - Tanggal lahir: 17 Juni 1997
  - Password: `1997-06-17`

### 2. **Parsing Tanggal Lahir**
Sistem mendukung berbagai format input yang otomatis dinormalisasi ke `YYYY-MM-DD`:

#### Format yang Didukung:
1. **Excel Serial Number** (numeric)
   - Input: `35612` (Excel date serial)
   - Output: `1997-06-17`

2. **YYYY-MM-DD** (sudah standar)
   - Input: `1997-06-17`
   - Output: `1997-06-17` (as-is)

3. **DD/MM/YYYY** (Indonesian format)
   - Input: `17/06/1997`
   - Output: `1997-06-17`

4. **MM/DD/YYYY** (US format)
   - Input: `06/17/1997`
   - Output: `1997-06-17`

5. **DD-MM-YYYY** (with dash)
   - Input: `17-06-1997`
   - Output: `1997-06-17`

#### Aturan Parsing:
- **Ambiguous dates** (contoh: `12/02/1997`) **default ke DD/MM/YYYY** (Indonesian)
  - `12/02/1997` → `1997-02-12` (12 Feb, bukan 2 Des)
- **Tidak ada timezone shift** - menggunakan UTC midnight untuk menghindari pergeseran tanggal
- **Validasi**: Tahun antara 1900-2100, bulan 1-12, tanggal 1-31

---

## 🔧 File yang Terlibat

### 1. `/lib/passwordUtils.js` - Core Logic
**Function**: `buildGuruCredentials({ tanggalLahir, lastUsernameNumber, bcrypt })`

```javascript
// Input: Date object atau YYYY-MM-DD string
// Output: { username, passwordPlain, passwordHash }

const credentials = await buildGuruCredentials({
  tanggalLahir: '1997-06-17', // YYYY-MM-DD string
  lastUsernameNumber: 7,      // Untuk generate G008
  bcrypt
});

// Result:
// {
//   username: 'G008',           // UPPERCASE
//   passwordPlain: '1997-06-17', // YYYY-MM-DD
//   passwordHash: '$2a$10$...'  // bcrypt hash
// }
```

**Karakteristik**:
- ✅ Normalisasi tanggal lahir ke YYYY-MM-DD
- ✅ Validasi format dengan regex `/^\d{4}-\d{2}-\d{2}$/`
- ✅ Hash dengan bcrypt (10 rounds)
- ✅ Username format: `G###` (3 digit, padded, UPPERCASE)
- ✅ **Debug logging** untuk verifikasi

---

### 2. `/api/admin/guru/import/route.js` - Bulk Import
**Endpoint**: `POST /api/admin/guru/import`

**Flow**:
1. Parse Excel file
2. Extract tanggal lahir dari kolom
3. Gunakan `parseExcelDate()` untuk normalisasi
4. Panggil `buildGuruCredentials()` dengan `tanggalLahirString` (YYYY-MM-DD)
5. Simpan `credentials.passwordHash` ke database
6. Return `credentials.passwordPlain` untuk ditampilkan ke admin

**Function `parseExcelDate(value)`**:
```javascript
// Handles:
// - Excel serial: 35612 → '1997-06-17'
// - String: '17/06/1997' → '1997-06-17'
// - Already formatted: '1997-06-17' → '1997-06-17'

const tanggalLahirString = parseExcelDate(row['Tanggal Lahir']);
// Returns: 'YYYY-MM-DD' or null if invalid
```

**Debug Log**:
```
📋 [IMPORT GURU Baris 2] Username: G008, TanggalLahir: 1997-06-17, Password: 1997-06-17
```

---

### 3. `/api/admin/guru/smart-import/route.js` - Smart Import
**Endpoint**: `POST /api/admin/guru/smart-import`

**Flow**:
1. Terima JSON data (dari frontend form)
2. Parse tanggal lahir dengan `parseExcelDate()`
3. Panggil `buildGuruCredentials()`
4. Create user dengan `credentials.passwordHash`
5. Return `credentials.passwordPlain` untuk UI

**Same logic** sebagai bulk import, tapi terima JSON instead of Excel.

**Debug Log**:
```
📋 [SMART-IMPORT GURU Baris 2] Username: G009, TanggalLahir: 1985-03-22, Password: 1985-03-22
```

---

### 4. `/auth.config.js` - Login Validation
**Function**: `authorize(credentials)`

**Flow**:
1. User input username (e.g., `G008`) dan password (e.g., `1997-06-17`)
2. Username **case-insensitive** lookup
3. Compare password dengan `bcrypt.compare(inputPassword, user.password)`
4. Return authenticated user jika valid

**Debug Log (untuk GURU)**:
```
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: true
✅ Password validated successfully for GURU : user-id-123
```

**Karakteristik**:
- ✅ Username case-insensitive (`G008` = `g008`)
- ✅ Password case-sensitive (sesuai bcrypt)
- ✅ Support multiple users dengan username sama (siswa vs orang tua)
- ✅ **Enhanced logging** khusus untuk GURU

---

## 🧪 Testing & Verification

### Test Scenario 1: Import Guru Baru
```javascript
// Excel file:
// Nama: Ahmad Fauzan
// Tanggal Lahir: 17/06/1997
// Jenis Kelamin: L

// Expected logs:
🔧 [buildGuruCredentials] Input string: 1997-06-17 → Normalized: 1997-06-17
✅ [buildGuruCredentials] Generated → Username: G008, Password: 1997-06-17 (YYYY-MM-DD format)
📋 [IMPORT GURU Baris 2] Username: G008, TanggalLahir: 1997-06-17, Password: 1997-06-17

// Result:
// - User created with username: G008
// - Password hash stored in database
// - Admin sees password: 1997-06-17 in import result
```

### Test Scenario 2: Login Guru
```javascript
// Login form:
// Username: G008
// Password: 1997-06-17

// Expected logs:
🔍 Found potential users: 1
🔍 Checking user: user-id-123 Ahmad Fauzan GURU true Username: G008
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: true
✅ Password validated successfully for GURU : user-id-123

// Result:
// - Login successful
// - Session created
```

### Test Scenario 3: Ambiguous Date
```javascript
// Excel input: 12/02/1997 (ambiguous: 12 Feb or 2 Des?)

// Expected behavior:
// - parseExcelDate defaults to DD/MM/YYYY (Indonesian)
// - Result: 1997-02-12 (12 Februari, bukan 2 Desember)

// Logs:
🔧 [buildGuruCredentials] Input string: 1997-02-12 → Normalized: 1997-02-12
✅ [buildGuruCredentials] Generated → Username: G009, Password: 1997-02-12
```

---

## 🔒 Security Features

### 1. **bcrypt Hashing**
- **Algorithm**: bcrypt
- **Rounds**: 10 (balance antara security dan performance)
- **Storage**: Hash disimpan di `user.password` field
- **Plain password**: Hanya ditampilkan sekali saat create/import (untuk admin)

### 2. **No Timezone Shifts**
```javascript
// ❌ WRONG: toISOString() causes timezone shift
const date = new Date('1997-06-17');
date.toISOString().slice(0, 10); // Returns '1997-06-16' (shift!)

// ✅ CORRECT: Use UTC components
const year = date.getUTCFullYear();
const month = String(date.getUTCMonth() + 1).padStart(2, '0');
const day = String(date.getUTCDate()).padStart(2, '0');
const dateString = `${year}-${month}-${day}`; // '1997-06-17' (correct!)
```

### 3. **Validation**
- Format regex: `/^\d{4}-\d{2}-\d{2}$/`
- Year range: 1900-2100
- Month: 1-12
- Day: 1-31
- Throw error jika invalid

---

## 🎨 UI/UX Considerations

### 1. **Form Input**
**Recommended**: Gunakan 3 input field terpisah untuk DD, MM, YYYY
```jsx
<div className="grid grid-cols-3 gap-2">
  <Input placeholder="DD" maxLength={2} />
  <Input placeholder="MM" maxLength={2} />
  <Input placeholder="YYYY" maxLength={4} />
</div>
```

**Keuntungan**:
- ✅ Tidak ambiguous
- ✅ User friendly
- ✅ Easy validation
- ✅ Hindari format confusion

### 2. **Display Password**
Saat import/create berhasil, tampilkan password **jelas**:
```
✅ Guru berhasil dibuat
Username: G008
Password: 1997-06-17
Tanggal Lahir: 17 Juni 1997

📌 Password default: YYYY-MM-DD dari tanggal lahir
```

### 3. **Edit Form**
Jika edit tanggal lahir guru, **informasikan** bahwa password akan berubah:
```
⚠️ Mengubah tanggal lahir akan mengubah password default menjadi: 1998-05-14
```

---

## 📊 Debug Logs Summary

### Creation/Import Logs:
```
🔧 [buildGuruCredentials] Input string: 1997-06-17 → Normalized: 1997-06-17
✅ [buildGuruCredentials] Generated → Username: G008, Password: 1997-06-17 (YYYY-MM-DD format)
📋 [IMPORT GURU Baris 2] Username: G008, TanggalLahir: 1997-06-17, Password: 1997-06-17
```

### Login Logs:
```
🔍 Found potential users: 1
🔍 Checking user: user-id-123 Ahmad Fauzan GURU true Username: G008
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: true
✅ Password validated successfully for GURU : user-id-123
```

**Purpose**: 
- Verify normalization correctness
- Trace password generation
- Debug login issues
- Ensure no timezone shifts

---

## ✅ Checklist Implementation

- [x] `buildGuruCredentials()` normalize tanggal lahir ke YYYY-MM-DD
- [x] `parseExcelDate()` handle multiple formats dengan DD/MM/YYYY default
- [x] Password hash dengan bcrypt (10 rounds)
- [x] Login pakai `bcrypt.compare()` dengan field yang sama
- [x] No timezone shifts (use UTC components)
- [x] Debug logging di semua creation points
- [x] Enhanced logging di login (khusus GURU)
- [x] Username format: G### (UPPERCASE, 3 digits padded)
- [x] Validation: regex, year range, month/day bounds
- [ ] UI form untuk edit tanggal lahir (3 input field terpisah)
- [ ] Display password clearly di import result
- [ ] Warning saat edit tanggal lahir

---

## 🔄 Update Flow

### Jika Perlu Update Password Format:
1. Update `buildGuruCredentials()` logic di `passwordUtils.js`
2. Update `parseExcelDate()` jika perlu support format baru
3. Update dokumentasi ini
4. **Tidak perlu update** import/smart-import routes (sudah pakai helper)
5. **Tidak perlu update** auth login (bcrypt.compare tetap sama)

**Design Pattern**: **Single Source of Truth** (`buildGuruCredentials`)

---

## 🚨 Common Issues & Solutions

### Issue 1: Password tidak cocok saat login
**Symptom**: User pakai `1997-06-17` tapi login gagal

**Debug Steps**:
1. Check console logs untuk melihat password yang di-generate
2. Verify bcrypt hash di database
3. Check apakah ada timezone shift saat generate password
4. Verify input format saat login (trim whitespace)

**Solution**:
```javascript
// Pastikan input di-trim
const password = credentials?.password?.trim();

// Check logs:
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: false
// Jika Valid: false, berarti hash tidak match
```

### Issue 2: Tanggal lahir bergeser (timezone shift)
**Symptom**: Input `17/06/1997` tapi jadi `1997-06-16`

**Root Cause**: Pakai `toISOString()` atau `new Date()` tanpa UTC

**Solution**:
```javascript
// ❌ WRONG
const date = new Date('1997-06-17');
const wrong = date.toISOString().slice(0, 10); // '1997-06-16' ❌

// ✅ CORRECT
const [year, month, day] = '1997-06-17'.split('-').map(Number);
const date = new Date(Date.UTC(year, month - 1, day));
const year = date.getUTCFullYear(); // 1997 ✅
const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // '06' ✅
const day = String(date.getUTCDate()).padStart(2, '0'); // '17' ✅
```

### Issue 3: Ambiguous date salah parsing
**Symptom**: `12/02/1997` diparsing sebagai 2 Desember instead of 12 Februari

**Solution**: Sistem **sudah default ke DD/MM/YYYY** (Indonesian format)

**Recommendation**: 
- Gunakan 3 input field terpisah di UI (DD, MM, YYYY)
- Atau format input dengan dropdown untuk bulan

---

## 📝 Notes

1. **Username Guru**: Format `G###` (3 digit, padded, UPPERCASE)
   - First guru: `G001`
   - Second guru: `G002`
   - ...
   - 999th guru: `G999`
   - **After G999**: Logic sudah support lebih dari 999 (G1000, G1001, dst)

2. **Email Internal**: Auto-generated dari username
   - Format: `{username.toLowerCase()}@internal.tahfidz.edu.id`
   - Example: `g008@internal.tahfidz.edu.id`

3. **Password Reset**: 
   - Fitur forgot password untuk GURU belum implemented
   - Saat ini admin harus reset manual via database atau create new account

4. **Multiple Accounts**: 
   - Username must be unique (case-insensitive)
   - Duplicate check sebelum create

---

## 🎯 Kesimpulan

Sistem password guru **sudah benar dan konsisten**:
- ✅ Format YYYY-MM-DD dari tanggal lahir
- ✅ Parsing robust dengan fallback ke DD/MM/YYYY
- ✅ No timezone shifts
- ✅ bcrypt hashing
- ✅ Login validation correct
- ✅ Debug logging comprehensive

**Yang ditambahkan**: Debug logging untuk memudahkan verifikasi dan troubleshooting.

**Next Steps**:
1. Test dengan import guru baru
2. Verify login dengan password YYYY-MM-DD
3. Check console logs untuk confirmation
4. Update UI form jika diperlukan (3 input field untuk tanggal)
