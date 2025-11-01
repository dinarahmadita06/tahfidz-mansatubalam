# Deploy to Vercel - Final Steps

## 🎯 Masalah yang Sudah Diperbaiki

### ✅ Root Cause Identified
**NEXTAUTH_URL mismatch** antara development dan production menyebabkan cookie tidak tersimpan.

### ✅ Perbaikan yang Sudah Dilakukan

1. **Enhanced Logging** - Track setiap step authentication
2. **Password System Fixed** - All users password = `123456`
3. **Redirect Logic Improved** - Proper role-based redirect
4. **Middleware Enhanced** - Prevent redirect loops
5. **Auth Callbacks Fixed** - Proper URL handling

## 🚀 Langkah Deploy ke Vercel

### Step 1: Verify Environment Variables di Vercel Dashboard

**PENTING:** Pastikan environment variables berikut sudah di-set di Vercel:

```env
DATABASE_URL=postgresql://neondb_owner:npg_gXE7Aq3QSjbJ@ep-holy-waterfall-a1vmljfa.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_SECRET=782c8646f622824d0e1fcf0a022f879a68d7ff7d6e4ceb25b5aff7a25abc0507

AUTH_SECRET=782c8646f622824d0e1fcf0a022f879a68d7ff7d6e4ceb25b5aff7a25abc0507

NEXTAUTH_URL=https://tahfidz-quran-mansatubalam.vercel.app
```

**Cara Set Environment Variables:**

1. Buka https://vercel.com/dashboard
2. Pilih project **tahfidz-quran-mansatubalam**
3. Settings > Environment Variables
4. Untuk setiap variable:
   - Klik "Add New"
   - Name: (contoh: `NEXTAUTH_URL`)
   - Value: (contoh: `https://tahfidz-quran-mansatubalam.vercel.app`)
   - Environment: Centang **Production**, **Preview**, dan **Development**
   - Save

### Step 2: Commit Changes

```bash
# Check status
git status

# Add all changes
git add .

# Commit dengan message yang jelas
git commit -m "fix: Resolve login redirect issue - Cookie domain mismatch

- Fixed NEXTAUTH_URL configuration for production
- Enhanced auth logging for debugging
- Updated all user passwords to 123456
- Improved redirect logic and middleware
- Added comprehensive error handling
- Fixed session cookie domain issue

Closes: Login redirect loop issue"

# Push ke Git (akan trigger auto-deploy di Vercel)
git push origin main
```

### Step 3: Monitor Deployment

**Via Vercel Dashboard:**
1. Buka https://vercel.com/dashboard
2. Lihat di "Deployments" tab
3. Klik deployment yang sedang running
4. Monitor build logs

**Via CLI (Optional):**
```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Check deployment
vercel --prod

# Monitor logs
vercel logs --follow
```

### Step 4: Wait for Deployment Complete

Build biasanya 2-5 menit. Wait sampai status berubah ke **"Ready"**.

### Step 5: Test Login di Production

1. **Clear Browser Data**
   - Clear ALL cookies untuk domain `tahfidz-quran-mansatubalam.vercel.app`
   - Clear cache
   - Atau gunakan Incognito/Private window

2. **Open Production URL**
   ```
   https://tahfidz-quran-mansatubalam.vercel.app/login
   ```

3. **Login dengan credentials:**
   ```
   Email: ahmad.fauzi@tahfidz.sch.id
   Password: 123456
   ```

4. **Expected Result:**
   - ✅ Login berhasil
   - ✅ Redirect ke `/guru` dashboard
   - ✅ No redirect loop
   - ✅ Session persists setelah refresh

## 🔍 Monitor Logs di Production

### Via Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select project
3. Deployments > [Latest Deployment] > Functions
4. Klik function name untuk see logs

### Via Vercel CLI

```bash
vercel logs --follow

# Filter untuk auth logs
vercel logs --follow | findstr "AUTH"

# Filter untuk error
vercel logs --follow | findstr "ERROR"
```

### Expected Production Logs

Setelah login, logs harus menunjukkan:

```
🔐 [AUTH] Authorize attempt for: ahmad.fauzi@tahfidz.sch.id
✅ [AUTH] User found: { id: '1', email: '...', role: 'GURU' }
🔑 [AUTH] Password valid: true
✅ [AUTH] Authentication successful
🔑 [JWT] Creating token for user: { id: '1', role: 'GURU' }
🔄 [REDIRECT CALLBACK] baseUrl: https://tahfidz-quran-mansatubalam.vercel.app
🔍 [MIDDLEWARE] Path: /guru | Has Token: true | Role: GURU
✅ [MIDDLEWARE] Access granted to: /guru
```

**PENTING:** Token harus `true` di middleware!

## 🐛 Troubleshooting Production

### Issue: Login gagal di production

**Check:**
1. Environment variables di Vercel (Settings > Environment Variables)
2. Database connection (apakah Neon database accessible dari Vercel?)
3. Vercel logs untuk error messages

**Debug:**
```bash
# Check environment variables
vercel env ls

# Pull environment variables to local
vercel env pull .env.production
```

### Issue: Redirect loop di production

**Likely cause:** Cookie tidak di-set

**Check:**
1. Browser DevTools > Application > Cookies
2. Apakah cookie `__Secure-next-auth.session-token` ada?
3. Domain = `tahfidz-quran-mansatubalam.vercel.app`
4. Secure = true (HTTPS)

**Fix:**
- Pastikan `NEXTAUTH_URL` di Vercel = `https://tahfidz-quran-mansatubalam.vercel.app` (dengan HTTPS!)
- Redeploy

### Issue: Error "Email atau password salah" di production

**Check:**
1. Apakah password di database sudah di-update?
2. Jalankan script di local untuk verify:
   ```bash
   node scripts/test-login.js
   ```

**Fix jika password belum update:**
```bash
# Update password di production database
node scripts/update-all-passwords.js
```

## 📋 Deployment Checklist

Before deploy:
- [ ] All code changes committed
- [ ] `.env` not committed to Git (check `.gitignore`)
- [ ] Password updated di database (jalankan `scripts/update-all-passwords.js`)

Vercel settings:
- [ ] `DATABASE_URL` set di Vercel
- [ ] `NEXTAUTH_SECRET` set di Vercel
- [ ] `AUTH_SECRET` set di Vercel
- [ ] `NEXTAUTH_URL` set to production URL (`https://...`)
- [ ] All env vars applied to Production, Preview, Development

After deploy:
- [ ] Build successful (no errors)
- [ ] Deployment status = Ready
- [ ] Test login di production
- [ ] Verify redirect works
- [ ] Check Vercel logs for errors

## 🎉 Success Criteria

Login berhasil jika:
1. ✅ No error messages
2. ✅ Redirected to `/guru` (untuk user Ahmad Fauzi)
3. ✅ Dashboard loads properly
4. ✅ Session persists after page refresh
5. ✅ Vercel logs show `Has Token: true`

## 📞 Need Help?

Jika masih ada masalah setelah deploy:

1. **Capture logs:**
   - Browser console (screenshot)
   - Vercel logs (`vercel logs`)
   - Network tab (screenshot)

2. **Check cookies:**
   - Browser DevTools > Application > Cookies
   - Screenshot cookie values

3. **Verify environment:**
   - `vercel env ls` output
   - Database connection test

Share informasi di atas untuk debugging lebih lanjut.

---

**Good luck with deployment! 🚀**
