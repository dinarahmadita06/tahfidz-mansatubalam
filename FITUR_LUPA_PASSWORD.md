# 🔐 Fitur Reset Password - SIMTAQ

## 📋 Deskripsi
Sistem reset password di SIMTAQ dirancang dengan konsep yang aman dan terpusat:

### Untuk Admin
- Admin dapat reset password sendiri melalui halaman **Lupa Password** di login page
- Link reset password dikirim ke email Admin
- Token berlaku 1 jam

### Untuk Guru, Siswa, dan Orang Tua
- **TIDAK BISA** reset password sendiri via halaman lupa password
- **HARUS** meminta Admin untuk reset password mereka
- Admin dapat reset password user lain melalui menu **Reset Password User** di dashboard Admin

## 🚀 Cara Menggunakan

### A. Admin yang Lupa Password

1. **Buka halaman login** di http://localhost:3001/login
2. **Klik link "Lupa Password?"** di bawah tombol Login
3. **Masukkan email Admin** (contoh: admin@tahfidz.sch.id)
4. **Klik "Kirim Link Reset"**
5. **Cek console server** untuk mendapatkan reset URL (development mode)
6. **Buka link reset** di browser
7. **Masukkan password baru** (minimal 8 karakter)
8. **Klik "Simpan Password"**
9. **Login** dengan password baru

### B. Admin Reset Password User Lain (Guru/Siswa/Orang Tua)

1. **Login sebagai Admin**
2. **Buka menu "Reset Password User"** di sidebar
3. **Pilih kriteria pencarian**: Email, NIS, NIP, atau No. Telepon
4. **Masukkan data** user yang akan direset passwordnya
5. **Klik "Cari User"**
6. **Sistem akan menampilkan data user** yang ditemukan
7. **Masukkan password baru** untuk user tersebut
8. **Klik "Reset Password"**
9. **User dapat login** dengan password baru yang telah diatur

### C. Guru/Siswa/Orang Tua yang Lupa Password

1. **Hubungi Admin** sekolah
2. **Berikan informasi identitas** (NIS/NIP/Email/No. Telepon)
3. **Admin akan reset password** melalui dashboard
4. **Admin memberikan password baru** kepada user
5. **Login dengan password baru** yang diberikan Admin

## 🔧 API Endpoints

### 1. Forgot Password (Admin Only)
**Endpoint:** `POST /api/auth/forgot-password`

**Authorization:** Public (tetapi hanya menerima email dengan role ADMIN)

**Request Body:**
```json
{
  "identifier": "admin@tahfidz.sch.id"
}
```

**Response Success:**
```json
{
  "message": "Link reset password telah dikirim",
  "resetUrl": "http://localhost:3001/reset-password?token=abc123..." // hanya di development
}
```

**Notes:** Endpoint ini hanya menerima email dengan role ADMIN. Jika email bukan Admin, akan tetap return success message (untuk security).

### 2. Reset Password (dengan Token)
**Endpoint:** `POST /api/auth/reset-password`

**Authorization:** Public (dengan valid token)

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "passwordbaru123"
}
```

**Response Success:**
```json
{
  "message": "Password berhasil direset"
}
```

### 3. Change Password (Ganti Password)
**Endpoint:** `POST /api/auth/change-password`

**Authorization:** Authenticated user

**Request Body:**
```json
{
  "oldPassword": "passwordlama123",
  "newPassword": "passwordbaru123"
}
```

**Response Success:**
```json
{
  "message": "Password berhasil diubah"
}
```

### 4. Search User (Admin Only)
**Endpoint:** `GET /api/admin/search-user?type={type}&query={query}`

**Authorization:** Admin only

**Parameters:**
- `type`: email | nis | nip | noTelepon
- `query`: nilai pencarian

**Response Success:**
```json
{
  "user": {
    "id": "clxxx",
    "name": "Nama User",
    "email": "user@example.com",
    "role": "GURU",
    "guru": { "nip": "123456", ... },
    ...
  }
}
```

### 5. Reset User Password (Admin Only)
**Endpoint:** `POST /api/admin/reset-user-password`

**Authorization:** Admin only

**Request Body:**
```json
{
  "userId": "clxxx",
  "newPassword": "passwordbaru123"
}
```

**Response Success:**
```json
{
  "message": "Password berhasil direset"
}
```

**Notes:** Tidak bisa reset password Admin lain (hanya Guru/Siswa/Orang Tua).

## 🗂️ File Structure

```
src/
├── app/
│   ├── lupa-password/
│   │   └── page.js                           # Halaman lupa password (Admin only)
│   ├── reset-password/
│   │   └── page.js                           # Halaman form reset password (dengan token)
│   ├── ganti-password/
│   │   └── page.js                           # Halaman form ganti password (authenticated)
│   ├── admin/
│   │   └── reset-password-user/
│   │       └── page.js                       # Halaman Admin reset password user
│   └── api/
│       ├── auth/
│       │   ├── forgot-password/
│       │   │   └── route.js                  # API forgot password (Admin only)
│       │   ├── reset-password/
│       │   │   └── route.js                  # API reset password (dengan token)
│       │   └── change-password/
│       │       └── route.js                  # API change password (authenticated)
│       └── admin/
│           ├── search-user/
│           │   └── route.js                  # API search user (Admin only)
│           └── reset-user-password/
│               └── route.js                  # API reset user password (Admin only)
└── prisma/
    └── schema.prisma                         # Added resetToken & resetTokenExpiry
```

## 📊 Database Schema

Model `User` telah ditambahkan 2 field baru:
```prisma
model User {
  // ... field lainnya
  resetToken       String?
  resetTokenExpiry DateTime?
}
```

## 🔒 Keamanan

1. **Token Expiry**: Token reset password berlaku selama 1 jam
2. **One-time Use**: Token akan dihapus setelah digunakan
3. **Hashed Password**: Password di-hash dengan bcrypt sebelum disimpan
4. **No User Disclosure**: Tidak memberi tahu user jika email tidak terdaftar (untuk keamanan)
5. **Admin Only Reset**: Hanya Admin yang bisa reset password sendiri via link
6. **Centralized Control**: Admin mengontrol semua reset password untuk user lain
7. **Role Protection**: Tidak bisa reset password Admin lain (hanya Guru/Siswa/Orang Tua)
8. **Activity Logging**: Setiap reset password dicatat di log activity

## ✅ Testing Checklist

### Lupa Password (Admin)
- [x] Halaman lupa password dapat diakses
- [x] Hanya menerima email Admin
- [x] Form lupa password dapat submit
- [x] API forgot-password berhasil generate token
- [x] Token disimpan ke database
- [x] Link reset ditampilkan di console (development)
- [x] Halaman reset password dapat diakses dengan token
- [x] Form reset password dapat submit
- [x] Password berhasil diubah di database
- [x] Login dengan password baru berhasil
- [x] Token expired setelah 1 jam
- [x] Token tidak dapat digunakan 2x

### Reset Password User (Admin)
- [x] Halaman reset password user dapat diakses Admin
- [x] Search user by email berfungsi
- [x] Search user by NIS berfungsi
- [x] Search user by NIP berfungsi
- [x] Search user by No. Telepon berfungsi
- [x] Data user ditampilkan dengan benar
- [x] Form reset password berfungsi
- [x] Password user berhasil diubah
- [x] User dapat login dengan password baru
- [x] Tidak bisa reset password Admin lain
- [x] Activity logging tercatat

## 🔄 Next Steps (TODO)

1. **Integrasi Email Service**
   - Setup SMTP (Gmail/SendGrid/Mailtrap)
   - Buat template email reset password
   - Kirim email ke Admin/Guru

2. **Integrasi WhatsApp Service**
   - Setup WhatsApp Business API / Twilio
   - Buat template pesan WhatsApp
   - Kirim pesan ke Siswa/Orang Tua

3. **Rate Limiting**
   - Batasi request forgot password (max 3x per jam)
   - Prevent brute force attack

4. **Email Template**
   - Buat template HTML yang menarik
   - Tambahkan logo SIMTAQ
   - Tambahkan instruksi lengkap

## 📱 User Flow

### Flow A: Admin Lupa Password

```
┌─────────────────┐
│  Login Page     │
│  [Lupa Pass?]   │
└────────┬────────┘
         │ (Admin only)
         ▼
┌─────────────────┐
│ Forgot Password │
│ Input: email    │
│ Admin only      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Reset Link │
│ (Email/Console) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reset Password  │
│ Input: new pass │
│ (with token)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Password Reset  │
│ Success! Login  │
└─────────────────┘
```

### Flow B: Admin Reset Password User Lain

```
┌──────────────────┐
│ Admin Dashboard  │
│ Menu: Reset Pass │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Search User      │
│ By: Email/NIS/   │
│ NIP/No.Telepon   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User Found       │
│ Show User Data   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Set New Password │
│ Input: new pass  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Password Reset   │
│ User can login   │
│ with new pass    │
└──────────────────┘
```

### Flow C: Guru/Siswa/Orang Tua Lupa Password

```
┌──────────────────┐
│ User Lupa Pass   │
│ (Guru/Siswa/     │
│  Orang Tua)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Hubungi Admin    │
│ Berikan data     │
│ identitas        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Admin Reset Pass │
│ via Dashboard    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Admin Berikan    │
│ Password Baru    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ User Login       │
│ with New Pass    │
└──────────────────┘
```

## 🎨 UI/UX Features

- Islamic modern design dengan gradient emerald
- Responsive untuk mobile & desktop
- Loading states
- Error handling yang jelas
- Success messages
- Password visibility toggle
- Password strength indicator (coming soon)

## 📝 Notes

- Link di halaman login sudah aktif dan mengarah ke `/lupa-password`
- Semua endpoint sudah ready dan teruji
- Database migration sudah dijalankan
- UI sudah menggunakan design system SIMTAQ

---

**Dibuat dengan ❤️ untuk SIMTAQ (Sistem Informasi Manajemen Tahfidz Qur'an)**
