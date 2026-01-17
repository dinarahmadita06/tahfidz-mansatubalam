# Guru Authentication - Email Removal

## Summary
Email field telah dihapus total dari modul Guru. Login guru sekarang **hanya menggunakan Username + Password**.

## Changes Made

### ✅ Frontend (page.js)
- ❌ Removed `email` field from `formData` state
- ❌ Removed email input from Add/Edit Guru modal
- ❌ Removed email from `handleEdit` prefill
- ❌ Removed email from `resetForm`
- ❌ Removed `generateGuruEmail` import (unused)

### ✅ Backend API
**POST /api/guru** (Create):
- ❌ Removed email from request body destructuring
- ❌ Removed email validation/uniqueness check
- ✅ Auto-generates internal email: `guru.{timestamp}@internal.tahfidz`

**PUT /api/guru/[id]** (Update):
- ❌ Removed email from request body destructuring
- ❌ Removed email uniqueness validation
- ❌ Removed email from updateData.user.update
- ✅ Keeps existing internal email in database

**Import Routes**:
- ✅ Already use internal email generation
- ❌ Removed `generateGuruEmail` import from smart-import

### ✅ Auth & Login
**auth.config.js**:
- ✅ Already uses username-based authentication
- ✅ Password comparison with bcrypt hash

**Login Page**:
- ✅ Added helper text: "Guru: Password format YYYY-MM-DD (tanggal lahir)"
- ✅ Clear instruction for guru login

### ✅ Documentation
**GURU_UPDATE_ERROR_HANDLING.md**:
- ❌ Removed email from request payload example
- ❌ Removed email format validation docs
- ❌ Removed email uniqueness constraint docs
- ❌ Removed duplicate email error example

## Authentication Flow

### Guru Login (Username + Password)
```
Input: 
  - Username: "guru001"
  - Password: "1985-05-20" (YYYY-MM-DD format dari tanggal lahir)

Process:
  1. User enters username (e.g., "guru001")
  2. User enters password in YYYY-MM-DD format (e.g., "1985-05-20")
  3. System validates credentials using bcrypt.compare()
  4. Session created with user data (NO email in session for GURU)
```

### Password Rules for Guru
- **Format**: YYYY-MM-DD (date-only string)
- **Source**: Tanggal lahir guru
- **Example**: Tanggal lahir 20 Mei 1985 → Password: `1985-05-20`
- **Storage**: Hashed dengan bcrypt (NOT plain text)

## Template & Export
**Download Template** (`handleDownloadTemplate`):
```javascript
{
  'Nama Lengkap': 'Ahmad Fauzi',
  'NIP': '198501012010011001',
  'Jenis Kelamin': 'L',
  'Tanggal Lahir': '1985-05-20',
  'Kelas Binaan': '7A, 7B'
}
// NO Email column
```

**Export Data** (`handleExportData`):
```javascript
{
  'Nama Lengkap': item.user?.name || '',
  'NIP': item.nip || '',
  'Jenis Kelamin': item.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P',
  'Tanggal Lahir': formatDateOnly(item.tanggalLahir),
  'Kelas Binaan': aktifKelas,
  'Status': item.user?.isActive ? 'Aktif' : 'Non-Aktif',
  'Tanggal Bergabung': formatDateOnly(item.user?.createdAt)
}
// NO Email column
```

## Database Compatibility

### Existing Data
- Old guru records may still have `email` in database
- ✅ These emails are **NOT used** and **NOT displayed**
- ✅ Internal emails remain for DB compatibility: `guru.{timestamp}@internal.tahfidz`

### Other Roles (NOT affected)
- ✅ **ADMIN**: Still can use email for login
- ✅ **SISWA**: Not affected (uses NIS)
- ✅ **ORANG_TUA**: Not affected (uses username_wali)

## API Response Changes

### Before (with email):
```json
{
  "id": "xxx",
  "user": {
    "name": "Ahmad Fauzan",
    "email": "ahmad@example.com",  // ❌ REMOVED
    "username": "guru001"
  }
}
```

### After (no email):
```json
{
  "id": "xxx",
  "user": {
    "name": "Ahmad Fauzan",
    "username": "guru001"
  }
}
```

**Note**: Email still exists in DB for compatibility, but NOT returned in API response for GURU role.

## Testing Checklist

- [x] ✅ Create guru without email → Success
- [x] ✅ Update guru without email → Success
- [x] ✅ Login guru with username + YYYY-MM-DD password → Success
- [x] ✅ Import guru Excel (no email column) → Success
- [x] ✅ Export guru data (no email column) → Success
- [x] ✅ Download template (no email column) → Success
- [x] ✅ Form modal has NO email field → Success
- [x] ✅ Login page shows guru password hint → Success

## Migration Notes

### No Migration Needed
- Existing guru accounts work without changes
- Internal emails remain in database (for compatibility)
- Username + password authentication already in place

### For Users
1. **Guru login**: Use username (e.g., "guru001") + tanggal lahir in YYYY-MM-DD format
2. **Password format**: Exactly YYYY-MM-DD (e.g., "1985-05-20")
3. **NO email required**: Email field removed from all guru forms

## Benefits
- ✅ Simplified guru account creation (no email needed)
- ✅ Clear authentication flow (username + date password)
- ✅ Reduced validation complexity (no email format checks)
- ✅ Better UX (fewer fields to fill, clearer password rules)
- ✅ Maintains backward compatibility (existing data untouched)
