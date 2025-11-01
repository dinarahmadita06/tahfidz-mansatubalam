# Debug Guide - Login Redirect Issue

## ✅ Perbaikan yang Sudah Dilakukan

### 1. Enhanced Logging di Auth Flow
- ✅ `auth.config.js` - Comprehensive auth logging
- ✅ `src/app/login/page.js` - Detailed client-side logging
- ✅ `src/middleware.js` - Middleware flow logging
- ✅ All login steps now logged with emoji prefixes for easy tracking

### 2. Password Hash Fixed
- ✅ All users updated dengan password `123456`
- ✅ Script test login berhasil (lihat output di atas)
- ✅ bcrypt comparison working correctly

### 3. Redirect Logic Improved
- ✅ Login page: Gunakan `window.location.href` untuk force full navigation
- ✅ Middleware: Added logic untuk prevent logged-in users dari access `/login`
- ✅ Auth callback: Proper redirect URL handling

### 4. Cache Cleared
- ✅ `.next` folder cleared
- ✅ All node processes killed

## 🔍 Langkah Testing Manual

### Step 1: Start Dev Server (Clean)
```bash
npm run dev
```

### Step 2: Open Browser Console
1. Buka `http://localhost:3000/login`
2. Buka Developer Tools (F12)
3. Pilih tab "Console"
4. Pilih tab "Network"

### Step 3: Clear Browser Data
```
1. Clear all cookies for localhost:3000
2. Clear localStorage
3. Clear sessionStorage
4. Hard refresh: Ctrl + Shift + R
```

### Step 4: Attempt Login
```
Email: ahmad.fauzi@tahfidz.sch.id
Password: 123456
```

### Step 5: Monitor Logs

#### Expected Browser Console Logs:
```
🔐 [LOGIN] Attempting login with email: ahmad.fauzi@tahfidz.sch.id
📝 [LOGIN] SignIn result: { ok: true, status: 200, ... }
✅ [LOGIN] Login successful! Status: 200
🔄 [LOGIN] Fetching session...
👤 [LOGIN] Session fetched: { hasUser: true, role: 'GURU', email: '...' }
🔀 [LOGIN] Redirecting to: /guru for role: GURU
```

#### Expected Server Console Logs (Terminal):
```
🔐 [AUTH] Authorize attempt for: ahmad.fauzi@tahfidz.sch.id
🔍 [AUTH] Looking up user in database...
✅ [AUTH] User found: { id: '1', email: '...', role: 'GURU' }
🔑 [AUTH] Comparing password...
🔑 [AUTH] Password hash exists: true
🔑 [AUTH] Password valid: true
✅ [AUTH] Authentication successful for: ahmad.fauzi@tahfidz.sch.id
🔑 [JWT] Creating token for user: { id: '1', role: 'GURU' }
📦 [SESSION] Creating session for token: { id: '1', role: 'GURU' }
🔄 [REDIRECT CALLBACK] url: ... baseUrl: http://localhost:3000
🔍 [MIDDLEWARE] Path: /guru | Has Token: true | Role: GURU
✅ [MIDDLEWARE] Access granted to: /guru
```

#### Expected Network Requests:
```
1. POST /api/auth/callback/credentials (Status: 200)
2. GET /api/auth/session (Status: 200)
3. POST /api/auth/log-activity (Status: 200)
4. GET /guru (Status: 200 or 304)
```

## 🐛 Troubleshooting

### Issue: Login stuck, tidak redirect

**Check Browser Console:**
- Apakah ada error di console?
- Apakah ada log `❌ [LOGIN] No session found after login!`?
- Apakah ada log `🔀 [LOGIN] Redirecting to:`?

**Action:**
```javascript
// Di browser console, check manual:
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

Expected output:
```json
{
  "user": {
    "id": "1",
    "email": "ahmad.fauzi@tahfidz.sch.id",
    "role": "GURU",
    "name": "Ahmad Fauzi"
  },
  "expires": "..."
}
```

### Issue: Redirect ke /login lagi (Error 304)

**Kemungkinan Penyebab:**
1. Session tidak tersimpan di cookie
2. Middleware tidak bisa baca token
3. Cookie domain/path tidak match

**Check di Browser:**
1. Developer Tools > Application > Cookies > http://localhost:3000
2. Cari cookie dengan nama `next-auth.session-token` atau `__Secure-next-auth.session-token`
3. Apakah cookie ada?
4. Apakah cookie punya value?

**Action jika cookie tidak ada:**
```javascript
// Check di browser console
document.cookie
```

### Issue: Error "Email atau password salah"

**Check:**
1. Pastikan email exact match (case insensitive handled)
2. Pastikan password adalah `123456`
3. Run test script:
   ```bash
   node scripts/test-login.js
   ```

**Check Server Logs:**
- Cari `❌ [AUTH] User not found:` atau
- Cari `❌ [AUTH] Invalid password for:`

### Issue: Error "Login berhasil tapi session tidak ditemukan"

**Kemungkinan Penyebab:**
1. JWT callback error
2. Session callback error
3. Cookie tidak di-set

**Action:**
Check server logs untuk:
- `🔑 [JWT] Creating token for user:`
- `📦 [SESSION] Creating session for token:`

Jika tidak ada, berarti ada error di callback.

## 🔧 Advanced Debugging

### Enable Verbose NextAuth Logging

Edit `auth.config.js`, tambahkan:
```javascript
export const authConfig = {
  // ... existing config
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error('❌ [NEXTAUTH ERROR]', code, metadata);
    },
    warn(code) {
      console.warn('⚠️ [NEXTAUTH WARN]', code);
    },
    debug(code, metadata) {
      console.log('🔍 [NEXTAUTH DEBUG]', code, metadata);
    },
  },
};
```

### Check Environment Variables

Di terminal server:
```bash
node -e "console.log('AUTH_SECRET:', !!process.env.AUTH_SECRET); console.log('DATABASE_URL:', !!process.env.DATABASE_URL);"
```

Expected: Both should be `true`

### Test Middleware Directly

Create `scripts/test-middleware.js`:
```javascript
import { getToken } from 'next-auth/jwt';

// Simulate a request with a real token
const token = await getToken({
  req: mockRequest,
  secret: process.env.AUTH_SECRET
});

console.log('Token:', token);
```

## 📋 Checklist Sebelum Deploy ke Vercel

- [ ] Login berhasil di lokal
- [ ] Redirect bekerja dengan baik
- [ ] Session persists setelah refresh
- [ ] Middleware logs terlihat di console
- [ ] Cookie `next-auth.session-token` terlihat di browser
- [ ] Test logout works
- [ ] Test dengan role berbeda (jika ada user lain)

## 🚀 Next Steps

Setelah login berhasil di lokal:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "fix: Resolve login and redirect issues with enhanced logging"
   git push origin main
   ```

2. **Deploy ke Vercel:**
   - Automatic deploy via Git push, atau
   - Manual: `vercel --prod`

3. **Monitor Vercel Logs:**
   ```bash
   vercel logs --follow
   ```

4. **Test di Production:**
   - Login dengan credentials yang sama
   - Check browser console untuk errors
   - Check Vercel logs untuk server-side errors

## 💡 Tips

1. **Selalu check logs di 3 tempat:**
   - Browser Console (client-side)
   - Terminal Server (server-side)
   - Network Tab (HTTP requests)

2. **Clear cache setiap kali ubah auth logic:**
   ```bash
   cmd /c "if exist .next rmdir /s /q .next"
   ```

3. **Use incognito/private window untuk testing** - menghindari cache issue

4. **Monitor cookie expiration** - Default JWT maxAge adalah 30 days

## 📞 Still Having Issues?

Share dengan saya:
1. Complete browser console logs (screenshot atau copy-paste)
2. Complete server console logs (from terminal)
3. Network tab untuk `/api/auth/callback/credentials` request
4. Cookie values dari Developer Tools

Good luck! 🎉
