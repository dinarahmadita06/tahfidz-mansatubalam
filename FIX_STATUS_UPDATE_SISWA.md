# Fix: Error 500 pada Update Status Siswa

## Masalah
Error 500 saat mencoba mengubah status siswa dari AKTIF menjadi LULUS, PINDAH, atau KELUAR.
```
500 {"error":"Failed to update student status"}
```

## Root Cause
Field LogActivity.create() menggunakan field yang salah:
- **Dikirim:** `jenis`, `detail`
- **Schema Prisma memerlukan:** `role`, `aktivitas`, `modul`, `deskripsi`

Schema LogActivity:
```prisma
model LogActivity {
  id          String         @id @default(cuid())
  userId      String
  role        Role           // ← REQUIRED
  aktivitas   JenisAktivitas // ← REQUIRED (UPDATE, CREATE, DELETE, dll)
  modul       String         // ← REQUIRED
  deskripsi   String?        // ← Optional
  // ... other fields
}
```

## Solusi

### 1. Perbaiki Backend Service (`studentStatusService.js`)

**Yang diubah:**
- Fetch admin user untuk mendapatkan role field
- Update LogActivity.create() dengan field yang benar

```javascript
// Sebelum (SALAH):
await tx.logActivity.create({
  data: {
    userId: adminId,
    jenis: 'UPDATE',
    detail: `...`
  },
});

// Sesudah (BENAR):
const adminUser = await prisma.user.findUnique({
  where: { id: adminId },
  select: { role: true },
});

await tx.logActivity.create({
  data: {
    userId: adminId,
    role: adminUser.role,        // ← Dari user data
    aktivitas: 'UPDATE',          // ← Enum value
    modul: 'Manajemen Siswa',     // ← Module name
    deskripsi: `...`,             // ← Description
  },
});
```

### 2. Tingkatkan Error Logging (route.js)

**Yang ditambahkan:**
- Console logging untuk debug request/response
- Error handling untuk JSON parsing
- Detail error response untuk development

```javascript
// Logging request
console.log('📝 Update Status Request:', { siswaId, params });
console.log('📋 Received payload:', { statusSiswa, body });

// Logging service call
console.log('🔄 Calling updateStudentStatus with:', {...});

// Detailed error response
{
  error: 'Failed to update student status',
  errorType: 'INTERNAL_ERROR',
  message: error.message,
  details: isDev ? {
    code: error.code,
    prismaCode: error.code,
    meta: error.meta,
  } : undefined,
}
```

### 3. Tingkatkan Frontend Error Handling (siswa/page.js)

**Yang ditambahkan:**
- Console logging untuk track request/response
- Detailed error messages dari API
- Better error UI display

## Files Modified
1. ✅ `src/lib/services/studentStatusService.js` - Fix LogActivity fields
2. ✅ `src/app/api/admin/siswa/[id]/status/route.js` - Enhanced logging & error handling
3. ✅ `src/app/admin/siswa/page.js` - Better frontend error display

## Testing
Untuk verify update status siswa berfungsi:

1. **Buka Admin Dashboard → Manajemen Siswa**
2. **Pilih siswa dan klik menu action (3 dots)**
3. **Pilih "Ubah Status"**
4. **Pilih status baru (LULUS, PINDAH, atau KELUAR)**
5. **Klik Simpan**

Expected result:
- ✅ Modal tutup
- ✅ Toast success: "Status siswa berhasil diubah menjadi [status]"
- ✅ Table refresh dengan status baru
- ✅ User siswa otomatis non-aktif (isActive: false)
- ✅ Orang tua otomatis non-aktif jika semua anak tidak AKTIF

## Validasi

### Enum Status Valid
```
✅ AKTIF   - Siswa aktif bersekolah
✅ LULUS   - Siswa telah lulus
✅ PINDAH  - Siswa pindah sekolah
✅ KELUAR  - Siswa keluar/non-aktif
```

### Cascade Logic
- Saat status siswa berubah dari AKTIF → LULUS/PINDAH/KELUAR
  - `user.isActive` siswa → false
  - Cek semua anak orang tua
  - Jika semua anak non-AKTIF → `orangTua.user.isActive` → false
  - Jika ada 1+ anak AKTIF → `orangTua.user.isActive` → true

### LogActivity Fields
| Field | Value | Type |
|-------|-------|------|
| userId | [admin id] | String |
| role | ADMIN | Role enum |
| aktivitas | UPDATE | JenisAktivitas enum |
| modul | Manajemen Siswa | String |
| deskripsi | Detail perubahan | String |

## Debugging Tips

Jika masih error 500:
1. Cek browser console (F12) untuk error detail
2. Cek server logs untuk console.log output
3. Verify admin user memiliki role = 'ADMIN'
4. Verify siswa dengan status AKTIF ada di database

