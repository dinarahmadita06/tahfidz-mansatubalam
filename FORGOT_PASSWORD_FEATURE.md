# Fitur Lupa Password (Self-Service)

## Deskripsi
Fitur self-service untuk mereset password tanpa menggunakan WhatsApp atau email. User cukup verifikasi identitas dengan data yang mereka pasti tahu: NIS/Kode Guru + Tanggal Lahir.

## Ketentuan Login
- **GURU**:
  - Username: Kode Guru auto "G001", dst
  - Password default: DOB format YYYY-MM-DD
- **SISWA**:
  - Username: NIS
  - Password default: DOB format YYYY-MM-DD
- **ORANG TUA**:
  - Username: NIS anak
  - Password default: DOB anak format DDMMYYYY
- **ADMIN**: Tidak menggunakan fitur ini

## Cara Penggunaan
1. Akses halaman "Lupa Password" melalui link di halaman login
2. Masukkan:
   - Username (NIS / Kode Guru contoh: 202512 atau G001)
   - Tanggal Lahir (menggunakan date picker)
   - Pilih Role (Guru, Siswa, atau Orang Tua)
3. Sistem akan memverifikasi data dan mereset password ke format default sesuai role
4. Setelah sukses, user dapat login dengan password default

## Endpoint API
- **Endpoint**: `POST /api/auth/forgot-password`
- **Body**: `{ username: string, dobInput: string, role: string }`
- **Rate Limit**: Maksimal 5 percobaan per IP per 15 menit

## Teknologi
- Frontend: Next.js App Router
- Backend: Next.js API Routes
- Database: Prisma ORM
- Security: bcrypt password hashing, rate limiting

## Keamanan
- Tidak ada integrasi WhatsApp/Email
- Verifikasi identitas berbasis data yang diketahui user
- Rate limiting untuk mencegah brute force
- Pesan error generik untuk mencegah info leak