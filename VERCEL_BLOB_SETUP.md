# Setup Vercel Blob Storage untuk File Upload

File upload pada fitur "Tambah Materi Tahsin" menggunakan **Vercel Blob Storage** untuk menyimpan file PDF dan video di production.

## Mengapa Perlu Vercel Blob?

Di Vercel (serverless environment), filesystem bersifat **read-only** sehingga kita tidak bisa menyimpan file secara permanen ke folder `public/uploads`. Oleh karena itu, kita menggunakan **Vercel Blob** sebagai cloud storage.

## Cara Setup Vercel Blob

### 1. Buat Blob Store di Vercel Dashboard

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project Anda (tahfidz-mansatubalam)
3. Klik tab **Storage** di sidebar
4. Klik tombol **Create Database** atau **Create Store**
5. Pilih **Blob**
6. Beri nama: `tahfidz-uploads` (atau nama lain sesuai keinginan)
7. Klik **Create**

### 2. Copy Token Environment Variable

Setelah Blob store dibuat:

1. Vercel akan menampilkan environment variable yang diperlukan
2. Copy value dari `BLOB_READ_WRITE_TOKEN`
3. Token akan terlihat seperti: `vercel_blob_rw_XXXXXXXXXXXXXXXXXX`

### 3. Set Environment Variable di Vercel

Ada 2 cara:

#### Cara A: Otomatis (Recommended)
Ketika Anda membuat Blob store, Vercel otomatis menambahkan environment variable ke project Anda. **Tidak perlu setting manual!**

#### Cara B: Manual (jika perlu)
1. Di Vercel Dashboard, buka project Anda
2. Klik **Settings** → **Environment Variables**
3. Tambahkan variable baru:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Token yang Anda copy tadi
   - **Environment**: Pilih `Production`, `Preview`, dan `Development` (semua)
4. Klik **Save**

### 4. Redeploy Project

Setelah environment variable ditambahkan:

1. Kembali ke tab **Deployments**
2. Pilih deployment terakhir
3. Klik titik tiga (⋯) → **Redeploy**
4. Atau push commit baru ke GitHub untuk trigger deployment otomatis

## Testing

Setelah deployment selesai:

1. Buka aplikasi production Anda
2. Login sebagai Guru
3. Buka halaman "Tahsin Al-Qur'an"
4. Klik tab "Materi Tahsin"
5. Klik "Tambah Materi"
6. Upload file PDF atau video
7. Klik "Simpan Materi"
8. **Expected**: File berhasil diupload dan materi tersimpan tanpa error 500

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN is not defined"
- Pastikan environment variable sudah ditambahkan di Vercel
- Redeploy project setelah menambahkan env variable

### Error: "Access denied"
- Pastikan token yang digunakan adalah `BLOB_READ_WRITE_TOKEN` (bukan READ_ONLY)
- Regenerate token di Vercel Dashboard jika perlu

### File tidak muncul setelah upload
- Cek URL yang dikembalikan oleh API (pastikan menggunakan Vercel Blob URL, bukan local path)
- Vercel Blob URL format: `https://xxxxxxxxxx.public.blob.vercel-storage.com/...`

## File Upload Flow

```
User uploads file
    ↓
Frontend sends to /api/upload
    ↓
API validates file (type, size)
    ↓
API uploads to Vercel Blob using @vercel/blob
    ↓
Vercel Blob returns public URL
    ↓
API saves URL to database (MateriTahsin table)
    ↓
Frontend displays uploaded materi
```

## Limits

Vercel Blob **Free Tier**:
- 100 GB bandwidth/month
- 1 GB storage
- Unlimited requests

Untuk project production dengan banyak file, consider upgrade ke Pro plan.

## Resources

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [@vercel/blob npm package](https://www.npmjs.com/package/@vercel/blob)
