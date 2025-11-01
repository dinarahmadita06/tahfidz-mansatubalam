# Panduan Deployment ke Vercel - Sistem Tahfidz Qur'an

## Masalah yang Sudah Diperbaiki

### 1. Password Hash yang Salah
- **Masalah**: Password hash di database tidak cocok dengan password `123456`
- **Solusi**: Script `scripts/update-user-password.js` sudah mengenerate hash yang benar
- **Status**: ✅ Sudah diperbaiki (password user `ahmad.fauzi@tahfidz.sch.id` sudah diupdate)

### 2. Error Handling di NextAuth
- **Masalah**: Error tidak ter-log dengan baik di Vercel
- **Solusi**: Menambahkan console.log lengkap di `auth.config.js`
- **Status**: ✅ Sudah diperbaiki

### 3. Email Case Sensitivity
- **Masalah**: Email tidak dinormalisasi
- **Solusi**: Menambahkan `.toLowerCase().trim()` pada email
- **Status**: ✅ Sudah diperbaiki

## Environment Variables yang Harus Ada di Vercel

Pastikan semua environment variables berikut sudah di-set di Vercel Dashboard:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_gXE7Aq3QSjbJ@ep-holy-waterfall-a1vmljfa.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# NextAuth Configuration
NEXTAUTH_SECRET="782c8646f622824d0e1fcf0a022f879a68d7ff7d6e4ceb25b5aff7a25abc0507"
AUTH_SECRET="782c8646f622824d0e1fcf0a022f879a68d7ff7d6e4ceb25b5aff7a25abc0507"
NEXTAUTH_URL="https://tahfidz-quran-mansatubalam.vercel.app"
```

## Langkah Deployment ke Vercel

### 1. Update Environment Variables di Vercel

```bash
# Cara 1: Via Vercel Dashboard
1. Buka https://vercel.com/dashboard
2. Pilih project "tahfidz-quran-mansatubalam"
3. Settings > Environment Variables
4. Tambahkan/update semua variable di atas
5. Apply untuk Production, Preview, dan Development

# Cara 2: Via Vercel CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add AUTH_SECRET production
vercel env add NEXTAUTH_URL production
```

### 2. Deploy ke Vercel

```bash
# Push ke Git (akan trigger auto-deploy)
git add .
git commit -m "fix: Update NextAuth configuration for Vercel deployment"
git push origin main

# Atau deploy manual dengan Vercel CLI
vercel --prod
```

### 3. Monitoring Deployment

Setelah deploy, cek log di Vercel:

```bash
# Via CLI
vercel logs --follow

# Via Dashboard
https://vercel.com/dashboard > Project > Deployments > [Latest] > Logs
```

Cari log berikut untuk memastikan auth berjalan:
- `🔐 [AUTH] Authorize attempt for: ahmad.fauzi@tahfidz.sch.id`
- `✅ [AUTH] User found: { id: '1', email: '...', role: 'GURU' }`
- `🔑 [AUTH] Password valid: true`
- `✅ [AUTH] Authentication successful for: ...`

### 4. Testing Login

Setelah deployment selesai, test login dengan:

```
URL: https://tahfidz-quran-mansatubalam.vercel.app/login
Email: ahmad.fauzi@tahfidz.sch.id
Password: 123456
```

## Troubleshooting

### Jika Login Masih Gagal di Vercel

1. **Cek Vercel Logs**
   ```bash
   vercel logs --follow
   ```
   Cari error message dari log `[AUTH]`

2. **Verify Database Connection**
   - Pastikan Neon database bisa diakses dari Vercel
   - Cek connection string sudah benar
   - Test query manual di Prisma Studio

3. **Verify Environment Variables**
   ```bash
   vercel env ls
   ```
   Pastikan semua variable ada dan nilainya benar

4. **Cek Password Hash di Production Database**
   Jalankan query di Neon console:
   ```sql
   SELECT email, LENGTH(password), LEFT(password, 10)
   FROM "User"
   WHERE email = 'ahmad.fauzi@tahfidz.sch.id';
   ```

   Hash harus:
   - Panjang: 60 karakter
   - Mulai dengan: `$2b$10$`

5. **Force Redeploy**
   ```bash
   vercel --prod --force
   ```

### Error: "Email atau password salah" (Persistent)

Jika masih muncul error ini setelah deploy:

1. Pastikan password hash di database sudah diupdate:
   ```bash
   node scripts/update-user-password.js
   ```

2. Cek bahwa bcryptjs versi sama di lokal dan production:
   ```bash
   npm list bcryptjs
   ```

3. Regenerate AUTH_SECRET jika perlu:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Error: "Terjadi kesalahan konfigurasi"

Ini biasanya karena:
- `AUTH_SECRET` atau `NEXTAUTH_SECRET` tidak di-set
- `NEXTAUTH_URL` salah atau tidak sesuai production URL
- Database connection failed

**Solusi**:
1. Pastikan semua env vars di-set di Vercel
2. Redeploy setelah update env vars
3. Cek Vercel logs untuk error detail

## Checklist Deployment

- [x] Password hash sudah diupdate dengan benar
- [x] auth.config.js sudah ada logging lengkap
- [x] Email normalization (toLowerCase, trim) sudah ada
- [x] bcryptjs sudah di-install di package.json
- [ ] Environment variables sudah di-set di Vercel
- [ ] Deploy ke Vercel
- [ ] Test login di production
- [ ] Monitor logs untuk errors

## User Credentials untuk Testing

### Admin/Guru
```
Email: ahmad.fauzi@tahfidz.sch.id
Password: 123456
Role: GURU
```

## Files yang Dimodifikasi

1. `auth.config.js` - Error handling dan logging
2. `scripts/update-user-password.js` - Script untuk update password
3. `src/lib/auth.js` - NextAuth configuration dengan trustHost

## Kontak Support

Jika masih ada masalah:
1. Cek Vercel logs untuk detail error
2. Pastikan database connection string benar
3. Verify semua environment variables sudah di-set
