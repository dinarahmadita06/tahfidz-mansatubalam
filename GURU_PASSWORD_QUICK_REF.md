# 🚀 GURU PASSWORD SYSTEM - QUICK REFERENCE

## ✅ Status: SUDAH BENAR & LENGKAP

Sistem password guru **sudah terimplementasi dengan benar**. Yang baru ditambahkan adalah **debug logging** untuk verifikasi.

---

## 📋 Format Password

```
Password Guru = YYYY-MM-DD (tanggal lahir)

Contoh:
Tanggal Lahir: 17 Juni 1997
Password: 1997-06-17
```

---

## 🔧 Files Modified (Debug Logging Added)

### 1. `/lib/passwordUtils.js`
**Function**: `buildGuruCredentials()`

**Added Logs**:
```javascript
🔧 [buildGuruCredentials] Input Date object → Normalized: 1997-06-17
✅ [buildGuruCredentials] Generated → Username: G008, Password: 1997-06-17 (YYYY-MM-DD format)
```

### 2. `/api/admin/guru/import/route.js`
**Endpoint**: Bulk Excel import

**Added Logs**:
```javascript
📋 [IMPORT GURU Baris 2] Username: G008, TanggalLahir: 1997-06-17, Password: 1997-06-17
```

### 3. `/api/admin/guru/smart-import/route.js`
**Endpoint**: Smart import (JSON)

**Added Logs**:
```javascript
📋 [SMART-IMPORT GURU Baris 2] Username: G009, TanggalLahir: 1985-03-22, Password: 1985-03-22
```

### 4. `/auth.config.js`
**Function**: `authorize()` - Login validation

**Added Logs**:
```javascript
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: true
✅ Password validated successfully for GURU : user-id-123
```

---

## 📊 Parsing Rules (Already Implemented)

### Supported Formats:
1. **Excel Serial**: `35612` → `1997-06-17`
2. **YYYY-MM-DD**: `1997-06-17` → `1997-06-17` (as-is)
3. **DD/MM/YYYY**: `17/06/1997` → `1997-06-17`
4. **MM/DD/YYYY**: `06/17/1997` → `1997-06-17`
5. **DD-MM-YYYY**: `17-06-1997` → `1997-06-17`

### Ambiguous Date Default:
```
Input: 12/02/1997 (ambiguous)
Output: 1997-02-12 (interpreted as DD/MM/YYYY = 12 Februari)
```

---

## 🧪 Testing Flow

### 1. Import Guru Baru
```bash
# Upload Excel dengan tanggal lahir: 17/06/1997
# Check console logs:
```
Expected logs:
```
🔧 [buildGuruCredentials] Input string: 1997-06-17 → Normalized: 1997-06-17
✅ [buildGuruCredentials] Generated → Username: G008, Password: 1997-06-17
📋 [IMPORT GURU Baris 2] Username: G008, TanggalLahir: 1997-06-17, Password: 1997-06-17
```

### 2. Login dengan Guru Account
```bash
# Username: G008
# Password: 1997-06-17
# Check console logs:
```
Expected logs:
```
🔍 Found potential users: 1
🔍 Checking user: ... Ahmad Fauzan GURU true Username: G008
🔐 [GURU LOGIN] Username: G008, Input Password: 1997-06-17, Valid: true
✅ Password validated successfully for GURU : user-id-123
```

---

## ✅ Implementation Checklist

- [x] **buildGuruCredentials()** - Normalize tanggal lahir ke YYYY-MM-DD
- [x] **parseExcelDate()** - Support multiple formats dengan DD/MM/YYYY default
- [x] **bcrypt hashing** - 10 rounds, stored in user.password
- [x] **Login validation** - bcrypt.compare dengan field yang sama
- [x] **No timezone shifts** - Use UTC components instead of toISOString()
- [x] **Debug logging** - Creation, import, dan login
- [x] **Username format** - G### (UPPERCASE, 3 digits padded)
- [x] **Validation** - Regex, year range, month/day bounds
- [x] **Case-insensitive** - Username lookup case-insensitive
- [x] **Documentation** - Lengkap di GURU_PASSWORD_SYSTEM_DOCS.md

---

## 🔍 Verification Commands

### Check Database:
```sql
-- Verify password hash exists
SELECT id, name, username, password, role FROM "User" WHERE role = 'GURU';

-- Check guru with tanggal lahir
SELECT 
  u.username, 
  u.name, 
  g.tanggalLahir,
  u.password -- should be bcrypt hash
FROM "User" u
JOIN "Guru" g ON g.userId = u.id
WHERE u.role = 'GURU';
```

### Test Login (API):
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "G008",
    "password": "1997-06-17"
  }'
```

---

## 🚨 Troubleshooting

### Login Gagal?
1. **Check console logs** untuk melihat:
   - Password yang di-input
   - bcrypt.compare result
   - User yang ditemukan

2. **Verify database**:
   - Password hash exists?
   - Username match (case-insensitive)?

3. **Common issues**:
   - Whitespace di password input → trim()
   - Timezone shift saat generate → use UTC
   - Typo di tanggal lahir saat import

### Password Tidak Cocok?
```bash
# Re-import guru dengan debug logging enabled
# Check logs:
📋 [IMPORT GURU Baris X] Username: G00X, TanggalLahir: YYYY-MM-DD, Password: YYYY-MM-DD

# Then test login:
🔐 [GURU LOGIN] Username: G00X, Input Password: YYYY-MM-DD, Valid: true/false
```

---

## 📖 Full Documentation

Lihat: [GURU_PASSWORD_SYSTEM_DOCS.md](./GURU_PASSWORD_SYSTEM_DOCS.md)

---

## 🎯 Summary

**Sistem sudah benar sejak awal**. Yang ditambahkan:
- ✅ Debug logging di 4 critical points
- ✅ Enhanced logging untuk GURU login
- ✅ Comprehensive documentation

**Semua guru account (import & create) sudah bisa login dengan password YYYY-MM-DD** 🎉
