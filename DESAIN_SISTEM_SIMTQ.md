# DESAIN SISTEM SIMTQ (Sistem Informasi Manajemen Tahfidz Al-Qur'an)

## 1. ARSITEKTUR SISTEM

### 1.1 Arsitektur Umum
SIMTQ menggunakan arsitektur **3-tier berbasis web** dengan pola **Client-Server**:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
│  ┌────────────┬────────────┬────────────┬─────────────────┐ │
│  │  Admin UI  │   Guru UI  │  Siswa UI  │  Orang Tua UI  │ │
│  └────────────┴────────────┴────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTPS
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Next.js 14)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server-Side Rendering (SSR) & API Routes           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Authentication (NextAuth.js)                      │   │
│  │  • Authorization & Role-Based Access Control         │   │
│  │  • Business Logic Layer                             │   │
│  │  • API Endpoints (/api/*)                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           DATA LAYER (PostgreSQL + Prisma ORM)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Database Management System (PostgreSQL)             │   │
│  │  • 25 Tables                                         │   │
│  │  • Relational Data Model                            │   │
│  │  • Indexes for Performance                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Teknologi Stack

| Layer | Teknologi | Fungsi |
|-------|-----------|--------|
| **Frontend** | React 18, Next.js 14 | UI Framework & SSR |
| | TailwindCSS 4 | Styling & Design System |
| | Radix UI | Component Library |
| | React Hook Form + Zod | Form Management & Validation |
| | Recharts | Data Visualization |
| **Backend** | Next.js API Routes | RESTful API |
| | NextAuth.js v5 | Authentication & Session |
| | Prisma 6 | ORM & Database Access |
| | bcryptjs | Password Hashing |
| **Database** | PostgreSQL | Relational Database |
| **Libraries** | jsPDF, xlsx | Export & Report Generation |
| | SWR | Data Fetching & Caching |
| | date-fns | Date Manipulation |

## 2. MODEL DATA (DATABASE SCHEMA)

### 2.1 Entitas Utama dan Relasi

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│   USER   │────────▶│   GURU   │────────▶│  KELAS   │
└──────────┘         └──────────┘         └──────────┘
     │                    │                     │
     │                    │                     │
     ├────────────┐       │                     │
     │            │       ▼                     ▼
     ▼            ▼   ┌──────────┐         ┌──────────┐
┌──────────┐ ┌──────────┐│ HAFALAN  │◀───────│  SISWA   │
│  ADMIN   │ │ ORANG_TUA││          │        │          │
└──────────┘ └──────────┘└──────────┘        └──────────┘
                  │           │                   │
                  │           ▼                   │
                  │      ┌──────────┐            │
                  │      │PENILAIAN │            │
                  │      └──────────┘            │
                  │                               │
                  └──────────┬────────────────────┘
                             ▼
                    ┌─────────────────┐
                    │ ORANGTUA_SISWA  │
                    │   (Junction)    │
                    └─────────────────┘
```

### 2.2 Tabel Database (25 Tables)

#### A. Manajemen Pengguna & Akses
1. **User** - Data akun pengguna (4 role: Admin, Guru, Siswa, Orang Tua)
2. **Guru** - Profil guru & pengampu kelas
3. **Siswa** - Profil siswa & data akademik
4. **OrangTua** - Profil orang tua/wali
5. **OrangTuaSiswa** - Relasi many-to-many orang tua & siswa

#### B. Manajemen Akademik
6. **TahunAjaran** - Periode tahun ajaran
7. **Kelas** - Data kelas per tahun ajaran
8. **GuruKelas** - Penugasan guru ke kelas

#### C. Manajemen Hafalan
9. **Hafalan** - Record setoran hafalan siswa
10. **Penilaian** - Penilaian hafalan (tajwid, kelancaran, makhraj, adab)
11. **TargetHafalan** - Target hafalan per siswa/kelas
12. **Tasmi** - Ujian akhir tasmi' (munaqasyah)

#### D. Manajemen Tahsin
13. **Tahsin** - Record pembelajaran tahsin
14. **MateriTahsin** - Materi pembelajaran tahsin

#### E. Manajemen Kehadiran
15. **Presensi** - Absensi siswa (hadir, izin, sakit, alfa)

#### F. Perpustakaan Digital
16. **BukuDigital** - Koleksi buku digital (PDF)

#### G. Komunikasi & Informasi
17. **Pengumuman** - Pengumuman sekolah
18. **Motivasi** - Quotes motivasi harian

#### H. Audit & Log
19. **LogActivity** - Log aktivitas pengguna (audit trail)

### 2.3 Relasi Kunci

```
User (1) ──── (1) Guru/Siswa/OrangTua
Siswa (N) ──── (1) Kelas
Guru (N) ──── (M) Kelas (via GuruKelas)
OrangTua (N) ──── (M) Siswa (via OrangTuaSiswa)
Siswa (1) ──── (N) Hafalan
Hafalan (1) ──── (N) Penilaian
Guru (1) ──── (N) Hafalan/Penilaian/Presensi
```

## 3. ALUR SISTEM (SYSTEM FLOW)

### 3.1 Alur Autentikasi & Otorisasi

```
┌─────────┐
│  Login  │
└────┬────┘
     │
     ▼
┌─────────────────┐
│ NextAuth.js     │
│ - Validate User │
│ - Check Status  │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│ Create Session  │
│ with Role       │
└────┬────────────┘
     │
     ├───────┬────────┬──────────┐
     ▼       ▼        ▼          ▼
┌────────┐┌──────┐┌───────┐┌───────────┐
│ Admin  ││ Guru ││ Siswa ││ Orang Tua │
│  Page  ││ Page ││ Page  ││   Page    │
└────────┘└──────┘└───────┘└───────────┘
```

### 3.2 Alur Input Hafalan (Core Flow)

```
   GURU                    SISTEM                   SISWA
     │                        │                        │
     │  1. Pilih Siswa       │                        │
     ├───────────────────────▶│                        │
     │                        │                        │
     │  2. Input Data        │                        │
     │     Hafalan           │                        │
     ├───────────────────────▶│                        │
     │                        │  3. Simpan Hafalan    │
     │                        │     (tabel Hafalan)   │
     │                        │                        │
     │  4. Input Penilaian   │                        │
     │     (Tajwid,          │                        │
     │      Kelancaran,      │                        │
     │      Makhraj, Adab)   │                        │
     ├───────────────────────▶│                        │
     │                        │  5. Hitung Nilai      │
     │                        │     Akhir             │
     │                        │                        │
     │                        │  6. Simpan Penilaian  │
     │                        │     (tabel Penilaian) │
     │                        │                        │
     │                        │  7. Notifikasi        │
     │                        ├───────────────────────▶│
     │                        │     Hafalan Dinilai   │
```

### 3.3 Alur Pendaftaran Tasmi'

```
SISWA              SISTEM           GURU PENGAMPU      GURU PENGUJI
  │                   │                    │                 │
  │ 1. Daftar Tasmi'  │                    │                 │
  ├──────────────────▶│                    │                 │
  │                   │ 2. Notifikasi      │                 │
  │                   ├───────────────────▶│                 │
  │                   │                    │                 │
  │                   │ 3. Verifikasi      │                 │
  │                   │    & Jadwalkan     │                 │
  │                   ◀────────────────────┤                 │
  │                   │                    │                 │
  │ 4. Notifikasi     │                    │                 │
  │    Jadwal         │                    │                 │
  ◀───────────────────┤                    │                 │
  │                   │                    │                 │
  │                   │ 5. Ujian Tasmi'    │                 │
  │                   ├────────────────────┼────────────────▶│
  │                   │                    │                 │
  │                   │ 6. Input Nilai     │                 │
  │                   ◀─────────────────────────────────────┤
  │                   │                    │                 │
  │ 7. Lihat Hasil    │                    │                 │
  │    (setelah       │                    │                 │
  │     dipublish)    │                    │                 │
  ◀───────────────────┤                    │                 │
```

## 4. FITUR UTAMA PER ROLE

### 4.1 Admin
- Manajemen data guru, siswa, orang tua
- Validasi & approval akun baru
- Manajemen kelas & tahun ajaran
- Manajemen target hafalan
- Laporan komprehensif (hafalan, kehadiran)
- Monitoring tasmi'
- Log aktivitas sistem
- Pengumuman & pengaturan

### 4.2 Guru
- Input & penilaian hafalan siswa
- Input & penilaian tahsin
- Presensi siswa
- Upload materi tahsin (PDF/Video/YouTube)
- Upload buku digital
- Verifikasi & penjadwalan tasmi'
- Penilaian ujian tasmi'
- Laporan kelas & individu siswa
- Target hafalan kelas

### 4.3 Siswa
- Setor hafalan (record)
- Lihat penilaian hafalan
- Daftar & lihat jadwal tasmi'
- Lihat hasil tasmi'
- Akses materi tahsin
- Download buku digital
- Lihat presensi & target hafalan
- Latihan & referensi Al-Qur'an

### 4.4 Orang Tua
- Monitor hafalan anak
- Lihat penilaian anak
- Lihat presensi anak
- Lihat hasil tasmi' anak
- Terima pengumuman
- Komunikasi dengan sekolah

## 5. KEAMANAN SISTEM

### 5.1 Autentikasi & Otorisasi
- **Password Hashing**: bcryptjs dengan salt
- **Session Management**: NextAuth.js dengan JWT
- **Role-Based Access Control (RBAC)**: 4 level role
- **Protected Routes**: Middleware Next.js untuk route protection
- **Status Verification**: Approval sistem untuk siswa & orang tua baru

### 5.2 Data Security
- **SQL Injection Prevention**: Prisma ORM (parameterized queries)
- **XSS Protection**: React auto-escaping
- **CSRF Protection**: NextAuth built-in protection
- **Secure Password Reset**: Token-based dengan expiry

### 5.3 Audit Trail
- **Log Activity**: Tracking semua aktivitas CRUD
- Record: User ID, Role, Activity Type, Module, IP Address, Device
- Index pada timestamp untuk query performa

## 6. PERFORMA & OPTIMASI

### 6.1 Database Optimization
- **Indexing**: 35+ indexes pada kolom yang sering di-query
  - Primary keys (id)
  - Foreign keys
  - Status fields
  - Date fields (sorted DESC untuk latest data)
  - Composite indexes

### 6.2 Application Optimization
- **Server-Side Rendering (SSR)**: Faster initial page load
- **SWR Caching**: Client-side data caching & revalidation
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js Image component

## 7. DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────┐
│              VERCEL PLATFORM                     │
│  ┌───────────────────────────────────────────┐  │
│  │     Next.js Application (Serverless)      │  │
│  │  • Auto-scaling                           │  │
│  │  • CDN Edge Caching                       │  │
│  │  • SSL/TLS Encryption                     │  │
│  └──────────────┬────────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
                  ▼
     ┌────────────────────────────┐
     │   PostgreSQL Database      │
     │   (Cloud Provider)         │
     │  • Managed Service         │
     │  • Automatic Backup        │
     │  • Connection Pooling      │
     └────────────────────────────┘
```

## 8. BACKUP & RECOVERY

- **Database Backup**: Automatic daily backup (managed by cloud provider)
- **Application Code**: Git version control (GitHub/GitLab)
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 24 hours

## 9. SCALABILITY

### 9.1 Horizontal Scaling
- Serverless architecture (Vercel) - auto-scaling berdasarkan traffic
- Stateless API design
- Database connection pooling

### 9.2 Vertical Scaling
- Database upgrade sesuai kebutuhan data
- Caching strategy untuk mengurangi database load

## 10. MONITORING & MAINTENANCE

- **Error Tracking**: Next.js built-in error handling
- **Performance Monitoring**: Web Vitals tracking
- **User Activity**: Log Activity table untuk audit
- **Database Monitoring**: Query performance tracking via Prisma

---

**Catatan**: Sistem ini dirancang dengan prinsip **modular**, **scalable**, dan **maintainable** untuk mendukung operasional Tahfidz Al-Qur'an dalam jangka panjang.
