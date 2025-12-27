# API Documentation: Student Status Management

Sistem manajemen status siswa yang terintegrasi dengan aktivasi akun user.

## Overview

Sistem ini memungkinkan admin untuk mengelola status lifecycle siswa (AKTIF, LULUS, PINDAH, KELUAR) yang secara otomatis mempengaruhi status aktivasi akun siswa dan orang tua.

## Status Enum

```typescript
enum StatusSiswa {
  AKTIF   // Siswa aktif bersekolah
  LULUS   // Siswa telah lulus
  PINDAH  // Siswa pindah sekolah
  KELUAR  // Siswa keluar/non-aktif
}
```

## Business Rules

1. **Siswa Baru**: Default `statusSiswa = AKTIF`
2. **Status Change**: `statusSiswa !== AKTIF` → `user.isActive = false` (auto)
3. **Reactivation**: `statusSiswa → AKTIF` → `user.isActive = true` + `tanggalKeluar = null`
4. **Parent Status**: Active jika punya ≥1 anak dengan status AKTIF
5. **Login**: Blocked jika `user.isActive = false`
6. **Audit**: Semua perubahan status di-log

---

## API Endpoints

### 1. Update Student Status

Update status siswa dan cascade ke user account.

**Endpoint**: `PATCH /api/admin/siswa/[id]/status`

**Auth**: Admin only

**Request Body**:
```json
{
  "statusSiswa": "LULUS" // AKTIF | LULUS | PINDAH | KELUAR
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Status siswa berhasil diubah menjadi Lulus",
  "data": {
    "id": "clxxx",
    "nis": "2024001",
    "name": "Ahmad Fauzan",
    "statusSiswa": "LULUS",
    "tanggalKeluar": "2024-12-27T07:30:00.000Z",
    "userIsActive": false,
    "badge": {
      "label": "Lulus",
      "color": "gray",
      "emoji": "🎓",
      "description": "Siswa telah lulus"
    }
  }
}
```

**Error Responses**:
- 401: Unauthorized (bukan admin)
- 400: Invalid statusSiswa
- 404: Siswa tidak ditemukan
- 500: Server error

**Contoh Penggunaan**:
```javascript
// Luluskan siswa
const response = await fetch('/api/admin/siswa/clxxx/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ statusSiswa: 'LULUS' })
});

const result = await response.json();
console.log(result.data.badge); // { label: 'Lulus', emoji: '🎓', ... }
```

---

### 2. Get Student Status

Ambil informasi status siswa saat ini.

**Endpoint**: `GET /api/admin/siswa/[id]/status`

**Auth**: Admin only

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "nis": "2024001",
    "name": "Ahmad Fauzan",
    "kelas": "10 A",
    "statusSiswa": "AKTIF",
    "tanggalKeluar": null,
    "userIsActive": true,
    "badge": {
      "label": "Aktif",
      "color": "green",
      "emoji": "✅",
      "description": "Siswa aktif bersekolah"
    }
  }
}
```

**Contoh Penggunaan**:
```javascript
const response = await fetch('/api/admin/siswa/clxxx/status');
const result = await response.json();

// Display badge
const { badge } = result.data;
console.log(`${badge.emoji} ${badge.label}`); // "✅ Aktif"
```

---

## Service Layer Functions

Import dari `@/lib/services/studentStatusService`:

### updateStudentStatus()
```javascript
import { updateStudentStatus } from '@/lib/services/studentStatusService';

// Update status siswa
const updatedSiswa = await updateStudentStatus(
  siswaId,       // ID siswa
  'LULUS',       // New status
  adminId        // ID admin yang melakukan perubahan
);

// Returns: Siswa object with updated status + user.isActive
```

### bulkUpdateStudentStatus()
```javascript
import { bulkUpdateStudentStatus } from '@/lib/services/studentStatusService';

// Batch update (contoh: kelulusan massal)
const results = await bulkUpdateStudentStatus(
  ['siswa1', 'siswa2', 'siswa3'],  // Array of siswa IDs
  'LULUS',                          // New status
  adminId                           // ID admin
);

console.log(results.success);  // Array siswa yang berhasil
console.log(results.failed);   // Array siswa yang gagal + error
```

### getStudentStatusBadge()
```javascript
import { getStudentStatusBadge } from '@/lib/services/studentStatusService';

const badge = getStudentStatusBadge('AKTIF');
// Returns: { label, color, emoji, description }
```

### getStudentStatusStats()
```javascript
import { getStudentStatusStats } from '@/lib/services/studentStatusService';

const stats = await getStudentStatusStats();
// Returns:
// {
//   AKTIF: 150,
//   LULUS: 200,
//   PINDAH: 10,
//   KELUAR: 5,
//   total: 365,
//   percentage: { AKTIF: 41%, LULUS: 55%, ... }
// }
```

---

## Helper Functions

Import dari `@/lib/helpers/statusHelpers`:

### checkUserAccess()
```javascript
import { checkUserAccess } from '@/lib/helpers/statusHelpers';

const access = await checkUserAccess(userId);
// Returns: { isActive: boolean, reason: string|null, statusSiswa: string }

if (!access.isActive) {
  alert(access.reason); // "Akun Anda tidak aktif karena telah lulus..."
}
```

### getStatusBadgeConfig()
```javascript
import { getStatusBadgeConfig } from '@/lib/helpers/statusHelpers';

const config = getStatusBadgeConfig('LULUS');
// Returns:
// {
//   label: 'Lulus',
//   bgColor: 'bg-gray-50',
//   textColor: 'text-gray-700',
//   borderColor: 'border-gray-200',
//   emoji: '🎓'
// }

// Usage in Tailwind
<span className={`${config.bgColor} ${config.textColor} ${config.borderColor}`}>
  {config.emoji} {config.label}
</span>
```

### canPerformAction()
```javascript
import { canPerformAction } from '@/lib/helpers/statusHelpers';

const canAdd = canPerformAction('LULUS', 'add_hafalan');  // false
const canView = canPerformAction('LULUS', 'view_history'); // true

// Only AKTIF students can add hafalan
// All students can view history
```

---

## UI Badge Configuration

Untuk konsistensi UI, gunakan config berikut:

### AKTIF (Green)
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
  ✅ Aktif
</span>
```

### LULUS (Gray)
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
  🎓 Lulus
</span>
```

### PINDAH (Yellow)
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
  ↗️ Pindah
</span>
```

### KELUAR (Red)
```jsx
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
  ❌ Keluar
</span>
```

---

## UI Implementation Examples

### Admin: Status Dropdown
```jsx
function StudentStatusDropdown({ siswa, onUpdate }) {
  const statuses = ['AKTIF', 'LULUS', 'PINDAH', 'KELUAR'];

  const handleChange = async (newStatus) => {
    const confirmed = confirm(`Ubah status siswa menjadi ${newStatus}?`);
    if (!confirmed) return;

    const response = await fetch(`/api/admin/siswa/${siswa.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusSiswa: newStatus })
    });

    if (response.ok) {
      const result = await response.json();
      alert(result.message);
      onUpdate(result.data);
    }
  };

  return (
    <select value={siswa.statusSiswa} onChange={(e) => handleChange(e.target.value)}>
      {statuses.map(status => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>
  );
}
```

### Admin: Bulk Graduation
```jsx
async function graduateStudents(siswaIds) {
  const response = await fetch('/api/admin/siswa/bulk-status', {
    method: 'PATCH',
    body: JSON.stringify({
      siswaIds,
      statusSiswa: 'LULUS'
    })
  });

  const result = await response.json();
  alert(`${result.success.length} siswa berhasil diluluskan`);
}
```

### User: Display Badge
```jsx
import { getStatusBadgeConfig } from '@/lib/helpers/statusHelpers';

function StudentStatusBadge({ statusSiswa }) {
  const config = getStatusBadgeConfig(statusSiswa);

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
      {config.emoji} {config.label}
    </span>
  );
}
```

---

## Error Messages

Pesan error yang ditampilkan saat login gagal:

| Status | Message |
|--------|---------|
| LULUS | "Akun Anda tidak aktif karena telah lulus. Silakan hubungi admin sekolah." |
| PINDAH | "Akun Anda tidak aktif karena telah pindah sekolah. Silakan hubungi admin sekolah." |
| KELUAR | "Akun Anda sudah tidak aktif. Silakan hubungi admin sekolah." |
| user.isActive = false | "Akun Anda tidak aktif. Silakan hubungi admin sekolah." |

---

## Database Schema

```prisma
enum StatusSiswa {
  AKTIF
  LULUS
  PINDAH
  KELUAR
}

model Siswa {
  // ... existing fields
  statusSiswa    StatusSiswa @default(AKTIF)
  tanggalKeluar  DateTime?

  @@index([statusSiswa])
}

model User {
  isActive Boolean @default(true)
  // ... existing fields
}
```

---

## Testing

### Manual Testing

1. **Update Status via API**:
```bash
curl -X PATCH http://localhost:3000/api/admin/siswa/SISWA_ID/status \
  -H "Content-Type: application/json" \
  -H "Cookie: authjs.session-token=YOUR_TOKEN" \
  -d '{"statusSiswa":"LULUS"}'
```

2. **Test Login Block**:
   - Update status siswa ke LULUS
   - Coba login dengan akun siswa tersebut
   - Expected: Login ditolak dengan pesan "Akun Anda tidak aktif karena telah lulus..."

3. **Test Parent Account**:
   - Siswa dengan status AKTIF → Parent AKTIF
   - Ubah semua anak ke LULUS → Parent NONAKTIF (auto)
   - Kembalikan 1 anak ke AKTIF → Parent AKTIF (auto)

---

## Migration Notes

**PENTING**: Database sudah di-update dengan `prisma db push`.

Untuk production, run migration:
```bash
npx prisma migrate deploy
```

Semua siswa existing akan memiliki `statusSiswa = AKTIF` (default).

---

## Next Steps

1. **UI Admin**:
   - [ ] Add status dropdown di halaman siswa admin
   - [ ] Add bulk graduation feature
   - [ ] Add confirm modal sebelum update status
   - [ ] Add status badge di list siswa
   - [ ] Add statistics dashboard (AKTIF/LULUS/PINDAH/KELUAR count)

2. **UI Siswa**:
   - [ ] Display status badge di profil siswa
   - [ ] Show tanggalKeluar if applicable

3. **UI Orang Tua**:
   - [ ] Display status badge untuk setiap anak
   - [ ] Show warning jika tidak ada anak AKTIF

---

## Support

Untuk pertanyaan atau issue terkait student status system:
- Check logs: `console.log` di auth flow dan API responses
- Validate database: `npx prisma studio` untuk cek data
- Review service layer: `src/lib/services/studentStatusService.js`
- Check helper functions: `src/lib/helpers/statusHelpers.js`
