# Guru Update Endpoint - Error Handling Guide

## Overview
Endpoint `PUT /api/guru/[id]` telah diperbaiki dengan comprehensive error handling dan validation.

## HTTP Status Codes

### ✅ 200 OK
Guru berhasil diupdate
```json
{
  "id": "...",
  "name": "Guru Updated",
  "nip": "...",
  "email": "...",
  ...
}
```

### ⚠️ 400 Bad Request
**Validation Errors:**

**Missing Required Field:**
```json
{
  "error": "Nama guru wajib diisi",
  "field": "name"
}
```

**Invalid Date Format:**
```json
{
  "error": "Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD (contoh: 1990-05-15)",
  "field": "tanggalLahir"
}
```

**Invalid Jenis Kelamin:**
```json
{
  "error": "Jenis kelamin harus 'L' atau 'P', diterima: 'X'",
  "field": "jenisKelamin",
  "received": "X"
}
```

**Invalid Kelas:**
```json
{
  "error": "Beberapa kelas tidak valid atau tidak aktif",
  "field": "kelasIds",
  "invalidIds": ["xxx", "yyy"]
}
```

### ❌ 404 Not Found
Guru tidak ditemukan (mungkin sudah dihapus)
```json
{
  "error": "Data tidak ditemukan. Mungkin sudah dihapus.",
  "code": "RECORD_NOT_FOUND"
}
```

### 🚫 409 Conflict
**Duplicate Data:**

**Duplicate NIP:**
```json
{
  "error": "NIP 197001011998031001 sudah digunakan oleh guru lain",
  "field": "nip",
  "code": "DUPLICATE_NIP"
}
```

**Duplicate Username:**
```json
{
  "error": "Username 'johndoe' sudah digunakan. Silakan pilih username lain.",
  "field": "username",
  "code": "DUPLICATE_USERNAME"
}
```

### 💥 500 Internal Server Error
Unexpected error (dengan logging detail di server)
```json
{
  "error": "Gagal mengupdate data guru. Silakan coba lagi atau hubungi administrator.",
  "code": "INTERNAL_SERVER_ERROR"
}
```

## Request Payload Example
```json
{
  "name": "Ahmad Fauzan",
  "nip": "197001011998031001",
  "username": "ahmad.fauzan",
  "jenisKelamin": "L",
  "tanggalLahir": "1970-01-01",
  "password": "newpassword123", // Optional
  "kelasIds": ["kelas-id-1", "kelas-id-2"]
}
```

**Note:** Email field is NOT used for Guru. Login uses Username + Password only.

## Validation Rules

### Required Fields
- `name` - Tidak boleh kosong

### Format Validation
- `jenisKelamin` - Harus 'L' atau 'P'
- `tanggalLahir` - Format YYYY-MM-DD (contoh: 1990-05-15)

### Uniqueness Constraints
- `nip` - Harus unik (jika diisi)
- `username` - Harus unik

**Note:** Email is NOT required for Guru accounts

### Referential Integrity
- `kelasIds` - Semua ID kelas harus valid dan berstatus AKTIF

## Frontend Error Handling

### Alert Format
Frontend menampilkan error dengan format yang lebih informatif:

**409 Conflict:**
```
❌ NIP 197001011998031001 sudah digunakan oleh guru lain

Data sudah digunakan oleh guru lain. Silakan gunakan nilai yang berbeda.

Field: nip
```

**400 Validation:**
```
⚠️ Nama guru wajib diisi

Periksa kembali data yang Anda masukkan.

Field: name
```

**404 Not Found:**
```
❌ Data guru tidak ditemukan. Mungkin sudah dihapus.
```

## Testing

Run test suite:
```bash
node test-guru-update-errors.js
```

Tests include:
1. ✅ Duplicate NIP (409)
2. ✅ Invalid date format (400)
3. ✅ Missing required field (400)
4. ✅ Invalid jenis kelamin (400)
5. ✅ Successful update (200)

## Logging

Server logs include detailed information with emoji prefixes:
- 📝 Request received
- ✅ Success
- ❌ Error
- ⚠️ Warning/Validation

Example console output:
```
📝 PUT /api/guru/cm5kcn19e0003eeegbocapy8w - Updating guru
⚠️ PUT /api/guru/cm5kcn19e0003eeegbocapy8w - NIP already exists: 197001011998031001
```

## Cache Invalidation

On successful update, the following caches are invalidated:
- `invalidateCache('guru-list')`
- `invalidateCacheByPrefix('kelas-list')` - All variants

## Database Transaction

The update operation uses Prisma transaction to ensure:
1. Guru data is updated
2. Old kelas associations are deleted
3. New kelas associations are created
4. All succeed or all fail (atomicity)

## Security

- Passwords are hashed using bcrypt before storage
- Sensitive error details are NOT exposed to client
- Detailed errors are logged server-side only
- Username from session is validated before update

## Performance Considerations

- Uniqueness checks are performed BEFORE database transaction
- Kelas validation is batched in single query
- Cache invalidation is prefix-based (efficient for multiple variants)
- Date normalization uses Date.UTC() (no timezone conversion overhead)
