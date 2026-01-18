# 📚 Dokumentasi Fitur Sistem Tahfidz Manba'ul Ulum

> **Sistem Informasi Manajemen Tahfidz Al-Qur'an**  
> Platform digital terintegrasi untuk monitoring hafalan, penilaian, dan administrasi santri

---

## 🎭 Role & Akses Pengguna

Sistem ini memiliki 4 role utama dengan hak akses berbeda:

1. **ADMIN** - Superuser dengan akses penuh
2. **GURU** - Pengajar/Pembina tahfidz
3. **SISWA** - Santri/Penghafal
4. **ORANG TUA** - Wali santri

---

## 👨‍💼 ADMIN - Manajemen Sistem

### 1. 📊 Dashboard Admin
**Path**: `/admin/dashboard`

**Fitur**:
- 📈 Overview statistik sistem (total siswa, guru, kelas)
- 📋 Widget summary tahun ajaran aktif
- 📢 Pengumuman terkini
- 🎯 Target hafalan per juz
- 📊 Grafik perkembangan hafalan
- 🔔 Notifikasi validasi siswa pending
- 📅 Quick stats: Siswa aktif, Guru aktif, Kelas aktif

**Aksi**:
- View real-time dashboard metrics
- Quick navigation ke menu manajemen

---

### 2. 👥 Manajemen Siswa
**Path**: `/admin/siswa`

**Fitur**:
- 📋 Daftar semua siswa dengan filter & search
- ✅ Status siswa: Aktif, Lulus, Alumni, Tidak Aktif
- 🔍 Filter by kelas, status, tahun ajaran
- 📊 View detail hafalan & progress per siswa
- 📄 Export data siswa (Excel/PDF)

**Aksi yang Bisa Dilakukan**:
- ✏️ **Edit Data Siswa**: Nama, NIS, tanggal lahir, kelas, status
- ❌ **Hapus Siswa**: Hard delete atau soft delete (nonaktifkan)
- 👁️ **Lihat Detail**: History hafalan, nilai, presensi, sertifikat
- 📧 **Reset Password**: Generate ulang password siswa
- 🔄 **Pindah Kelas**: Assign siswa ke kelas lain
- 📥 **Import Bulk**: Upload Excel untuk tambah siswa masal
- 📤 **Export Data**: Download data siswa dalam format Excel/PDF
- 🎓 **Update Status**: Lulus, alumni, dropout, pindah

**Import Excel Siswa**:
- Template: NIS, Nama, Tanggal Lahir, Jenis Kelamin, Kelas, Alamat
- Auto-generate username & password (NIS + tanggal lahir)
- Validasi data sebelum import
- Error handling untuk duplikat NIS

---

### 3. 🧑‍🏫 Manajemen Guru
**Path**: `/admin/guru`

**Fitur**:
- 📋 Daftar guru dengan kelas binaan
- 🔍 Search & filter guru
- 📊 Statistik aktivitas guru
- 📄 Export data guru

**Aksi yang Bisa Dilakukan**:
- ➕ **Tambah Guru**: Form manual input data guru
- 📥 **Import Excel**: Bulk upload guru dari Excel
- 📥 **Smart Import**: Import dengan validasi & mapping otomatis
- ✏️ **Edit Data**: Nama, NIP, tanggal lahir, jabatan
- 🏫 **Assign Kelas Binaan**: Tentukan kelas yang dibina guru
- 📧 **Reset Password**: Generate password baru (format: YYYY-MM-DD dari tanggal lahir)
- 🗑️ **Hapus Guru**: Remove guru dari sistem
- 📤 **Export Data**: Download daftar guru (Excel/PDF)
- 👁️ **Lihat Detail**: Activity logs, laporan kelas binaan

**Import Excel Guru**:
- Template: Nama, NIP, Tanggal Lahir, Jenis Kelamin, Kelas Binaan
- Auto-generate username (G001, G002, dst) & password (YYYY-MM-DD)
- Support multiple format tanggal (YYYY-MM-DD, DD/MM/YYYY, Excel serial)
- Validasi duplikat NIP

---

### 4. 🏫 Manajemen Kelas
**Path**: `/admin/kelas`

**Fitur**:
- 📋 Daftar kelas dengan jumlah siswa & pembina
- 🎯 Target hafalan per kelas
- 📊 Progress kelas
- 🔍 Filter by tahun ajaran, status

**Aksi yang Bisa Dilakukan**:
- ➕ **Tambah Kelas**: Nama, tingkat, kapasitas, tahun ajaran
- ✏️ **Edit Kelas**: Update info kelas
- 👨‍🏫 **Assign Pembina**: Tentukan guru pembina utama & pendamping
- 👥 **Manage Siswa**: Tambah/pindah siswa antar kelas
- 🎯 **Set Target Hafalan**: Target juz per semester/tahun
- 🗑️ **Hapus/Nonaktifkan Kelas**: Soft delete kelas
- 📊 **View Progress**: Statistik hafalan kelas
- 📤 **Export Daftar Siswa**: Download list siswa per kelas

---

### 5. 📅 Tahun Ajaran
**Path**: `/admin/tahun-ajaran`

**Fitur**:
- 📋 Daftar tahun ajaran
- ✅ Status: Aktif, Selesai, Akan Datang
- 📊 Summary siswa per tahun ajaran
- 🎯 Target hafalan tahun ajaran

**Aksi yang Bisa Dilakukan**:
- ➕ **Tambah Tahun Ajaran**: Nama, tanggal mulai/selesai
- ✏️ **Edit Tahun Ajaran**: Update periode
- ✅ **Set Aktif**: Tentukan tahun ajaran aktif
- 🎯 **Set Target Hafalan**: Target juz untuk tahun ini
- 📊 **View Summary**: Total siswa, guru, kelas per tahun ajaran
- 🗑️ **Hapus**: Hapus tahun ajaran (jika tidak ada data terkait)

---

### 6. 🎯 Target Hafalan
**Path**: `/admin/target-hafalan`

**Fitur**:
- 🎯 Set target hafalan per tahun ajaran
- 📊 View progress pencapaian target
- 📈 Grafik capaian vs target

**Aksi yang Bisa Dilakukan**:
- ➕ **Set Target**: Tentukan jumlah juz target per tahun ajaran
- ✏️ **Update Target**: Adjust target mid-year
- 📊 **View Progress**: Monitor capaian siswa vs target
- 📤 **Export Report**: Laporan pencapaian target

---

### 7. ✅ Validasi Siswa
**Path**: `/admin/validasi-siswa`

**Fitur**:
- 📋 Daftar siswa menunggu approval
- 🔍 Filter: Pending, Approved, Rejected
- 📊 Summary validasi pending

**Aksi yang Bisa Dilakukan**:
- ✅ **Approve Siswa**: Aktifkan akun siswa
- ❌ **Reject Siswa**: Tolak pendaftaran dengan alasan
- 👁️ **Review Data**: Cek kelengkapan data siswa
- 📧 **Kirim Notifikasi**: Email/notifikasi approval status
- 🔄 **Bulk Approval**: Approve multiple siswa sekaligus

---

### 8. 👪 Manajemen Orang Tua
**Path**: `/admin/orangtua`

**Fitur**:
- 📋 Daftar orang tua dengan relasi siswa
- 👥 View siswa yang ditangani
- 📊 Activity logs komunikasi
- 📄 Export data orang tua

**Aksi yang Bisa Dilakukan**:
- ➕ **Tambah Orang Tua**: Link ke siswa
- ✏️ **Edit Data**: Nama, kontak, alamat
- 🔗 **Link/Unlink Siswa**: Hubungkan orang tua dengan siswa
- 📧 **Reset Password**: Generate password baru (DDMMYYYY dari tanggal lahir siswa)
- 🗑️ **Hapus Orang Tua**: Remove akun orang tua
- 📤 **Export Data**: Download list orang tua

---

### 9. 📢 Pengumuman
**Path**: `/admin/pengumuman`

**Fitur**:
- 📋 Daftar pengumuman sistem
- 🎯 Target audience: Semua, Siswa, Guru, Orang Tua
- ✅ Status: Draft, Published, Archived
- 📅 Jadwal publish otomatis

**Aksi yang Bisa Dilakukan**:
- ✍️ **Buat Pengumuman**: Judul, konten, target audience
- 📤 **Publish**: Tayangkan pengumuman
- ✏️ **Edit Pengumuman**: Update konten
- 🗑️ **Hapus**: Delete pengumuman
- 📌 **Pin Pengumuman**: Tampilkan di top
- 🔔 **Send Notification**: Push notif ke target audience
- 📊 **View Stats**: Jumlah yang sudah baca

---

### 10. 📊 Laporan
**Path**: `/admin/laporan`

**Fitur**:
- 📈 Laporan Hafalan per Siswa/Kelas
- 📊 Laporan Penilaian Bulanan
- 📅 Laporan Presensi
- 🎓 Laporan Kelulusan
- 📉 Grafik Perkembangan

**Aksi yang Bisa Dilakukan**:
- 🔍 **Filter Laporan**: By periode, kelas, siswa, juz
- 📤 **Export Excel**: Download laporan dalam Excel
- 🖨️ **Print PDF**: Cetak laporan
- 📊 **View Grafik**: Visualisasi data hafalan
- 📧 **Kirim Email**: Email laporan ke orang tua/guru
- 📈 **Custom Report**: Buat laporan sesuai parameter

**Jenis Laporan**:
- Hafalan per Siswa (detail setoran & nilai)
- Hafalan per Kelas (summary progress kelas)
- Penilaian Bulanan (nilai rata-rata, ranking)
- Presensi Siswa (kehadiran, izin, sakit, alpha)
- Capaian Target (progress vs target tahun ajaran)

---

### 11. 📜 Sertifikat
**Path**: `/admin/sertifikat`

**Fitur**:
- 📋 Template sertifikat hafalan
- 🎓 Generate sertifikat otomatis
- 📊 Daftar sertifikat yang sudah diterbitkan
- 🔍 Search & filter by siswa, juz

**Aksi yang Bisa Dilakukan**:
- ✍️ **Buat Template**: Design template sertifikat
- 🎓 **Generate Sertifikat**: Untuk siswa yang lulus juz/khatam
- 📤 **Download PDF**: Download sertifikat
- 📧 **Kirim Email**: Email sertifikat ke siswa/ortu
- ✏️ **Edit Template**: Update design
- 🗑️ **Revoke**: Batalkan sertifikat (jika ada kesalahan)
- 📊 **View History**: Riwayat penerbitan sertifikat

---

### 12. ⚙️ Pengaturan Sistem
**Path**: `/admin/pengaturan`

**Fitur**:
- 🏫 Profil Sekolah
- 🎨 Tema & Branding
- 🔔 Notifikasi
- 🔐 Keamanan
- 📧 Email Config

**Aksi yang Bisa Dilakukan**:
- ✏️ **Edit Profil Sekolah**: Nama, alamat, logo, kontak
- 🎨 **Ubah Tema**: Warna, font, layout
- 🔔 **Config Notifikasi**: Enable/disable notif, jadwal push
- 🔐 **Keamanan**: Password policy, session timeout
- 📧 **Email Setup**: SMTP config untuk email notifikasi
- 💾 **Backup**: Manual backup database
- 📊 **System Logs**: View activity logs sistem

---

### 13. 📝 Activity Logs
**Path**: `/admin/activity-logs`

**Fitur**:
- 📋 Riwayat aktivitas semua user
- 🔍 Filter by user, action, date range
- 📊 Audit trail lengkap
- 📤 Export logs

**Aksi yang Bisa Dilakukan**:
- 🔍 **Search Logs**: Cari aktivitas spesifik
- 🔎 **Filter**: By user, role, action type, date
- 👁️ **View Detail**: Detail lengkap setiap aktivitas
- 📤 **Export**: Download logs (CSV/Excel)
- 🗑️ **Clear Old Logs**: Hapus logs lama (auto retention policy)

---

### 14. 🔄 Reset Password User
**Path**: `/admin/reset-password-user`

**Fitur**:
- 🔍 Cari user by username/email
- 🔐 Generate password baru
- 📧 Kirim password via email/notif

**Aksi yang Bisa Dilakukan**:
- 🔍 **Cari User**: Search by username, email, nama
- 🔐 **Generate Password Baru**: 
  - Guru: YYYY-MM-DD (tanggal lahir)
  - Siswa: YYYY-MM-DD (tanggal lahir)
  - Orang Tua: DDMMYYYY (tanggal lahir siswa)
- 📧 **Kirim Notifikasi**: Email/SMS password baru
- 📋 **Copy Password**: Clipboard copy untuk info manual

---

### 15. 👤 Profil Admin
**Path**: `/admin/profil`

**Fitur**:
- 👁️ View profil admin
- ✏️ Edit data pribadi
- 🔐 Ganti password

**Aksi yang Bisa Dilakukan**:
- ✏️ **Edit Profil**: Nama, email, foto
- 🔐 **Ganti Password**: Update password
- 📊 **View Activity**: History aktivitas admin

---

## 👨‍🏫 GURU - Pembinaan & Penilaian

### 1. 📊 Dashboard Guru
**Path**: `/guru`

**Fitur**:
- 📈 Overview kelas binaan
- 👥 Total siswa binaan
- 📊 Statistik hafalan kelas
- 📋 Activity feed terkini
- 📢 Pengumuman
- 🎯 Target vs capaian kelas

**Aksi**:
- View summary kelas binaan
- Quick access ke verifikasi hafalan pending

---

### 2. 👥 Kelola Siswa
**Path**: `/guru/kelola-siswa`

**Fitur**:
- 📋 Daftar siswa kelas binaan
- 🔍 Search & filter siswa
- 📊 View progress hafalan siswa
- 📈 Ranking siswa by nilai/juz

**Aksi yang Bisa Dilakukan**:
- 👁️ **Lihat Detail Siswa**: Profile, progress hafalan, nilai
- 📊 **View History Hafalan**: Riwayat setoran & penilaian
- 📝 **Tambah Catatan**: Tulis catatan perkembangan siswa
- 📧 **Kirim Pesan**: Komunikasi dengan siswa/orang tua
- 📤 **Export Daftar**: Download list siswa kelas

---

### 3. ✅ Verifikasi Hafalan
**Path**: `/guru/verifikasi-hafalan`

**Fitur**:
- 📋 Daftar setoran hafalan menunggu verifikasi
- 🎧 Audio/video setoran (jika ada)
- 📊 Filter by siswa, juz, tanggal
- ⏱️ Queue setoran pending

**Aksi yang Bisa Dilakukan**:
- ✅ **Verifikasi Setoran**: Approve/reject setoran
- 📝 **Beri Penilaian**: Input nilai makhroj, tajwid, kelancaran
- 💬 **Tambah Catatan**: Feedback untuk siswa
- ❌ **Tolak Setoran**: Reject dengan alasan (perlu mengulang)
- 🔄 **Minta Setoran Ulang**: Request repeat untuk bagian tertentu
- 🎧 **Play Audio/Video**: Review rekaman setoran (jika ada)

**Kriteria Penilaian**:
- 🗣️ Makhroj (makhraj huruf)
- 📖 Tajwid (hukum tajwid)
- ⚡ Kelancaran (fluency)
- 💭 Adab (etika menghafal)

---

### 4. 📝 Penilaian Hafalan
**Path**: `/guru/penilaian-hafalan`

**Fitur**:
- 📋 Form penilaian hafalan
- 📊 Riwayat penilaian siswa
- 📈 Grafik perkembangan nilai
- 🎯 View target vs actual

**Aksi yang Bisa Dilakukan**:
- ✍️ **Input Nilai Baru**: Penilaian setoran baru
- ✏️ **Edit Nilai**: Update penilaian sebelumnya
- 📊 **Bulk Input**: Input nilai untuk multiple siswa (per kelas)
- 💬 **Tambah Feedback**: Catatan konstruktif
- 📈 **View Progress Chart**: Grafik nilai siswa
- 📤 **Export Nilai**: Download nilai kelas (Excel)

---

### 5. 📝 Penilaian Kelas
**Path**: `/guru/penilaian-kelas`

**Fitur**:
- 📊 Summary nilai seluruh kelas
- 📈 Ranking kelas
- 🎯 Analisis capaian target
- 📊 Statistik per juz

**Aksi yang Bisa Dilakukan**:
- 📊 **View Summary**: Nilai rata-rata, tertinggi, terendah
- 📈 **Lihat Ranking**: Urutan siswa by nilai/progress
- 📤 **Export Laporan Kelas**: Download rekap nilai kelas
- 📊 **Analisis Per Juz**: Breakdown nilai per juz
- 📧 **Kirim ke Orang Tua**: Email summary ke wali siswa

---

### 6. ✍️ Input Hafalan
**Path**: `/guru/input-hafalan`

**Fitur**:
- 📝 Form input setoran manual (jika siswa tidak submit online)
- 📊 Pilih siswa & surah/ayat
- 💯 Input nilai langsung

**Aksi yang Bisa Dilakukan**:
- ✍️ **Input Setoran**: Catat setoran siswa secara manual
- 📝 **Pilih Surah & Ayat**: Select dari dropdown Al-Qur'an 30 juz
- 💯 **Beri Nilai**: Input nilai makhroj, tajwid, kelancaran
- 💬 **Tambah Catatan**: Feedback untuk siswa
- 💾 **Simpan**: Save ke database
- 📧 **Notifikasi Siswa**: Beritahu siswa setoran sudah dicatat

---

### 7. 📊 Laporan Guru
**Path**: `/guru/laporan-guru`

**Fitur**:
- 📈 Laporan kelas binaan
- 📊 Progress hafalan kelas
- 📅 Laporan bulanan
- 🎓 Laporan per siswa

**Aksi yang Bisa Dilakukan**:
- 📊 **Generate Laporan Kelas**: Summary hafalan kelas
- 📈 **Laporan Individu**: Detail per siswa
- 📅 **Filter Periode**: By bulan, semester, tahun ajaran
- 📤 **Export Excel/PDF**: Download laporan
- 📧 **Kirim ke Admin**: Submit laporan ke admin
- 🖨️ **Print**: Cetak laporan

---

### 8. 📚 Tahsin
**Path**: `/guru/tahsin/[id]`

**Fitur**:
- 📖 Materi tahsin (perbaikan bacaan)
- 📝 Input penilaian tahsin
- 📊 Progress tahsin siswa
- 🎯 Target perbaikan

**Aksi yang Bisa Dilakukan**:
- ✍️ **Input Penilaian Tahsin**: Nilai bacaan, tajwid, makhroj
- 📝 **Tambah Materi**: Upload materi tahsin
- 💬 **Beri Feedback**: Catatan perbaikan
- 📊 **View Progress**: Perkembangan tahsin siswa
- 📤 **Export**: Download laporan tahsin

---

### 9. 🎓 Tasmi (Ujian Khataman)
**Path**: `/guru/tasmi`

**Fitur**:
- 📋 Daftar pengajuan tasmi
- ✅ Approve/reject pengajuan
- 📝 Jadwal ujian tasmi
- 📊 Hasil tasmi

**Aksi yang Bisa Dilakukan**:
- 👁️ **Review Pengajuan**: Cek kelayakan siswa ikut tasmi
- ✅ **Approve Tasmi**: Setujui pengajuan
- ❌ **Reject Tasmi**: Tolak dengan alasan
- 📅 **Jadwal Ujian**: Tentukan tanggal & waktu tasmi
- 👥 **Assign Penguji**: Tentukan tim penguji
- 💯 **Input Nilai Tasmi**: Input hasil ujian
- 🎓 **Generate Sertifikat**: Terbitkan sertifikat khatam (jika lulus)

---

### 10. 📊 Aktivitas Siswa
**Path**: `/guru/aktivitas-siswa`

**Fitur**:
- 📋 Log aktivitas siswa
- 📊 Statistik aktivitas
- 📈 Engagement metrics
- 🔔 Activity feed

**Aksi yang Bisa Dilakukan**:
- 👁️ **View Activity Log**: Riwayat login, setoran, latihan
- 📊 **Analisis Engagement**: Siswa aktif vs pasif
- 🔔 **Monitor Real-time**: Activity feed live
- 📤 **Export Log**: Download activity log

---

### 11. 📅 Presensi
**Path**: `/guru/presensi`

**Fitur**:
- 📋 Absensi harian siswa
- ✅ Hadir, Izin, Sakit, Alpha
- 📊 Rekap presensi bulanan
- 📈 Statistik kehadiran

**Aksi yang Bisa Dilakukan**:
- ✅ **Input Presensi Harian**: Absen siswa per sesi
- ✏️ **Edit Presensi**: Update absensi sebelumnya
- 📊 **View Rekap**: Summary kehadiran per bulan
- 📤 **Export Presensi**: Download rekap absensi
- 📧 **Kirim ke Orang Tua**: Notifikasi alpha/sakit

---

### 12. 📖 Buku Digital
**Path**: `/guru/buku-digital`

**Fitur**:
- 📚 Library buku tahsin
- 📄 PDF/ebook materi
- 🔍 Search buku
- 📂 Kategori materi

**Aksi yang Bisa Dilakukan**:
- ➕ **Upload Buku**: Tambah materi baru
- ✏️ **Edit Info Buku**: Update deskripsi, kategori
- 🗑️ **Hapus Buku**: Remove materi
- 📁 **Organize Kategori**: Buat folder kategori
- 📤 **Share ke Siswa**: Assign buku ke kelas/siswa tertentu

---

### 13. 🎯 Target Hafalan Kelas
**Path**: `/guru/target-hafalan`

**Fitur**:
- 🎯 Set target per kelas
- 📊 Monitor pencapaian
- 📈 Progress tracking
- 🔔 Alert jika di bawah target

**Aksi yang Bisa Dilakukan**:
- 🎯 **Set Target**: Tentukan target juz per semester
- ✏️ **Update Target**: Adjust mid-semester
- 📊 **View Progress**: Monitor capaian vs target
- 🔔 **Send Reminder**: Kirim reminder ke siswa yang tertinggal

---

### 14. 📢 Pengumuman
**Path**: `/guru/pengumuman`

**Fitur**:
- 📋 Lihat pengumuman dari admin
- ✍️ Buat pengumuman untuk kelas
- 📌 Pin pengumuman penting

**Aksi**:
- 👁️ **Lihat Pengumuman**: Baca pengumuman dari admin
- ✍️ **Buat Pengumuman Kelas**: Info khusus kelas binaan
- 📌 **Pin**: Tampilkan di top dashboard kelas

---

### 15. 👤 Profil Guru
**Path**: `/guru/profil`

**Fitur**:
- 👁️ View profil pribadi
- ✏️ Edit data
- 🔐 Ganti password
- 📊 Activity summary

**Aksi**:
- ✏️ **Edit Profil**: Update nama, kontak, foto
- 🔐 **Ganti Password**: Change password
- 📊 **View Stats**: Total siswa binaan, penilaian, dll

---

## 👨‍🎓 SISWA - Setoran & Monitoring

### 1. 📊 Dashboard Siswa
**Path**: `/siswa`

**Fitur**:
- 📈 Progress hafalan pribadi (per juz)
- 🎯 Target vs capaian
- 📊 Statistik nilai rata-rata
- 📋 Activity feed (setoran terkini)
- 📢 Pengumuman
- 💡 Motivasi harian
- 📅 Tanggal & greeting

**Aksi**:
- View summary progress hafalan
- Quick access ke setor hafalan

---

### 2. 📖 Setor Hafalan
**Path**: `/siswa/setor-hafalan`

**Fitur**:
- 📝 Form setoran hafalan
- 📚 Pilih surah & ayat (dropdown Al-Qur'an)
- 🎙️ Upload audio/video (opsional)
- 💬 Catatan tambahan
- 📊 View history setoran

**Aksi yang Bisa Dilakukan**:
- ✍️ **Setor Hafalan Baru**: Submit setoran untuk diverifikasi
- 📚 **Pilih Surah/Ayat**: Dropdown dari Juz 1-30
- 🎙️ **Upload Rekaman**: Attach audio/video setoran
- 💬 **Tambah Catatan**: Deskripsi tambahan
- 📊 **Lihat History**: Riwayat setoran & status
- 🔔 **Notifikasi**: Dapat notif saat diverifikasi

**Status Setoran**:
- ⏳ Pending (menunggu verifikasi)
- ✅ Approved (diterima)
- ❌ Rejected (perlu mengulang)
- 🔄 Revision (perbaikan)

---

### 3. 📊 Laporan Hafalan
**Path**: `/siswa/laporan`

**Fitur**:
- 📈 Progress per juz (1-30)
- 📊 Grafik perkembangan
- 💯 Nilai per setoran
- 📅 Timeline hafalan
- 🎯 Target vs actual

**Aksi yang Bisa Dilakukan**:
- 📊 **View Progress Chart**: Grafik perkembangan per juz
- 📋 **Lihat Detail**: Breakdown per surah & ayat
- 📅 **Filter Periode**: By bulan, semester, tahun
- 📤 **Download Laporan**: Export PDF/Excel
- 📊 **Lihat Ranking**: Posisi di kelas

---

### 4. 📝 Penilaian Hafalan
**Path**: `/siswa/penilaian-hafalan`

**Fitur**:
- 📋 Riwayat penilaian dari guru
- 💯 Detail nilai (makhroj, tajwid, kelancaran)
- 💬 Feedback guru
- 📊 Grafik nilai
- 🎯 Area yang perlu diperbaiki

**Aksi**:
- 👁️ **Lihat Penilaian**: View semua nilai dari guru
- 📊 **Analisis Nilai**: Breakdown per aspek (makhroj, tajwid, dll)
- 💬 **Baca Feedback**: Catatan & saran dari guru
- 📈 **View Trend**: Grafik perkembangan nilai

---

### 5. 📚 Buku Digital
**Path**: `/siswa/buku-digital`

**Fitur**:
- 📖 Library materi tahsin
- 📄 Ebook, PDF, video tutorial
- 🔍 Search & filter
- 📂 Kategori: Tajwid, Makhroj, Adab, dll

**Aksi**:
- 📖 **Baca Buku**: View PDF/ebook online
- 📥 **Download**: Download materi untuk offline
- 🔍 **Search**: Cari materi spesifik
- ⭐ **Favorite**: Tandai buku favorit
- 📝 **Notes**: Tulis catatan pribadi

---

### 6. 🎯 Latihan
**Path**: `/siswa/latihan`

**Fitur**:
- 🧠 Quiz & latihan soal tahsin
- 🎮 Game edukasi tajwid
- ⏱️ Timer latihan
- 📊 Skor & progress

**Aksi**:
- 🎮 **Mulai Latihan**: Pilih jenis latihan (tajwid, makhroj, dll)
- ⏱️ **Mode Timer**: Latihan dengan waktu
- 📊 **Lihat Skor**: View hasil latihan
- 🔄 **Ulangi**: Retry latihan untuk improve skor
- 📈 **Track Progress**: Monitor peningkatan kemampuan

---

### 7. 🎓 Tasmi (Ajukan Ujian)
**Path**: `/siswa/tasmi`

**Fitur**:
- 📝 Form pengajuan tasmi
- 📋 Syarat & ketentuan tasmi
- ✅ Status pengajuan
- 📅 Jadwal ujian (jika approved)
- 💯 Hasil tasmi

**Aksi**:
- 📝 **Ajukan Tasmi**: Submit permohonan ikut ujian khataman
- 📋 **Cek Syarat**: View persyaratan (minimal juz, nilai, dll)
- 👁️ **Lihat Status**: Pending, approved, rejected
- 📅 **Cek Jadwal**: Lihat jadwal ujian jika approved
- 💯 **Lihat Hasil**: View nilai tasmi & feedback

---

### 8. 📢 Pengumuman
**Path**: `/siswa/pengumuman`

**Fitur**:
- 📋 Daftar pengumuman dari admin & guru
- 🔍 Filter by kategori, tanggal
- 🔔 Notifikasi pengumuman baru

**Aksi**:
- 👁️ **Baca Pengumuman**: View semua announcement
- 🔍 **Filter**: By kategori (akademik, event, dll)
- 🔔 **Mark as Read**: Tandai sudah dibaca

---

### 9. 🎯 Referensi Al-Qur'an
**Path**: `/siswa/referensi`

**Fitur**:
- 📖 Al-Qur'an digital 30 juz
- 🔍 Search surah/ayat
- 🎧 Audio murotal
- 📝 Terjemah & tafsir

**Aksi**:
- 📖 **Baca Al-Qur'an**: View digital mushaf
- 🔍 **Cari Ayat**: Search by keyword, surah, juz
- 🎧 **Dengarkan Audio**: Play murotal per ayat/surah
- 📝 **Lihat Terjemah**: Baca terjemah Indonesia
- 📚 **Baca Tafsir**: Akses tafsir per ayat

---

### 10. 📊 Aktivitas
**Path**: `/siswa/aktivitas`

**Fitur**:
- 📋 Log aktivitas pribadi
- 📊 Statistik engagement
- ⏱️ Waktu belajar
- 🏆 Achievement badges

**Aksi**:
- 👁️ **Lihat Activity Log**: Riwayat login, setoran, latihan
- 📊 **View Stats**: Total waktu belajar, latihan, dll
- 🏆 **Unlock Badges**: Achievement milestones

---

### 11. 👤 Profil Siswa
**Path**: `/siswa/profil`

**Fitur**:
- 👁️ View profil pribadi
- ✏️ Edit data (terbatas)
- 🔐 Ganti password
- 📸 Upload foto profil

**Aksi**:
- ✏️ **Edit Profil**: Update foto, kontak (terbatas)
- 🔐 **Ganti Password**: Change password
- 📊 **View Summary**: Total hafalan, nilai, ranking

---

## 👨‍👩‍👧 ORANG TUA - Monitoring Anak

### 1. 📊 Dashboard Orang Tua
**Path**: `/orangtua/dashboard`

**Fitur**:
- 👥 List anak (jika punya multiple)
- 📈 Summary hafalan anak
- 📊 Nilai rata-rata
- 📅 Kehadiran
- 📢 Pengumuman
- 🔔 Notifikasi penting

**Aksi**:
- View summary semua anak
- Quick access per anak

---

### 2. 📖 Hafalan Anak
**Path**: `/orangtua/hafalan-anak`

**Fitur**:
- 📊 Progress hafalan anak per juz
- 📋 History setoran
- 💯 Nilai dari guru
- 📈 Grafik perkembangan
- 🎯 Target vs capaian

**Aksi**:
- 👁️ **Lihat Progress**: View hafalan anak per juz
- 📋 **Lihat History**: Riwayat setoran & status
- 💯 **Lihat Nilai**: View penilaian dari guru
- 📈 **Grafik**: Monitor trend hafalan
- 📤 **Download Laporan**: Export PDF/Excel

---

### 3. 📝 Penilaian Hafalan
**Path**: `/orangtua/penilaian-hafalan`

**Fitur**:
- 📋 Daftar penilaian anak
- 💯 Detail nilai (makhroj, tajwid, kelancaran)
- 💬 Feedback guru
- 📊 Grafik nilai

**Aksi**:
- 👁️ **Lihat Penilaian**: View semua nilai anak
- 💬 **Baca Feedback**: Catatan dari guru
- 📊 **Analisis**: Breakdown per aspek
- 📈 **View Trend**: Perkembangan nilai

---

### 4. 📊 Perkembangan Anak
**Path**: `/orangtua/perkembangan-anak`

**Fitur**:
- 📈 Grafik perkembangan hafalan
- 📊 Analisis per periode
- 🎯 Capaian vs target
- 📋 Catatan guru
- 🏆 Achievement milestones

**Aksi**:
- 📊 **View Chart**: Grafik progress
- 📅 **Filter Periode**: By bulan, semester
- 💬 **Lihat Catatan**: Feedback guru
- 🏆 **Lihat Achievement**: Badges & milestones

---

### 5. 📅 Presensi
**Path**: `/orangtua/presensi`

**Fitur**:
- 📋 Rekap kehadiran anak
- ✅ Detail hadir, izin, sakit, alpha
- 📊 Statistik kehadiran bulanan
- 📈 Grafik presensi

**Aksi**:
- 👁️ **Lihat Absensi**: View rekap kehadiran
- 📅 **Filter Bulan**: By periode
- 📊 **View Stats**: Persentase kehadiran
- 🔔 **Notifikasi Alpha**: Dapat alert jika anak alpha

---

### 6. 🎓 Tasmi Anak
**Path**: `/orangtua/tasmi`

**Fitur**:
- 📋 Info pengajuan tasmi anak
- ✅ Status pengajuan
- 📅 Jadwal ujian
- 💯 Hasil tasmi
- 🎓 Sertifikat (jika lulus)

**Aksi**:
- 👁️ **Lihat Status**: Pengajuan pending/approved/rejected
- 📅 **Cek Jadwal**: Tanggal & waktu ujian
- 💯 **Lihat Hasil**: Nilai tasmi
- 📥 **Download Sertifikat**: Jika anak lulus

---

### 7. 🎯 Target Hafalan
**Path**: `/orangtua/target-hafalan`

**Fitur**:
- 🎯 Target hafalan anak (set oleh sekolah)
- 📊 Progress vs target
- 📈 Prediksi pencapaian
- 🔔 Alert jika tertinggal

**Aksi**:
- 👁️ **Lihat Target**: View target juz
- 📊 **Monitor Progress**: Capaian vs target
- 📈 **Prediksi**: Estimasi waktu selesai target
- 🔔 **Notifikasi**: Alert jika di bawah target

---

### 8. 📊 Laporan Hafalan
**Path**: `/orangtua/laporan-hafalan`

**Fitur**:
- 📈 Laporan lengkap hafalan anak
- 📊 Summary bulanan/semester
- 💯 Rekap nilai
- 📅 Timeline progress
- 📤 Download laporan

**Aksi**:
- 📊 **Generate Laporan**: Summary hafalan
- 📅 **Filter Periode**: Bulanan, semester, tahunan
- 📤 **Download PDF/Excel**: Export laporan
- 📧 **Email Laporan**: Kirim ke email pribadi

---

### 9. 💬 Komunikasi dengan Guru
**Path**: `/orangtua/komunikasi`

**Fitur**:
- 💬 Chat dengan guru pembina
- 📧 Kirim pesan
- 📋 Riwayat komunikasi
- 🔔 Notifikasi balasan

**Aksi**:
- ✍️ **Kirim Pesan**: Chat dengan guru
- 👁️ **Lihat History**: Riwayat komunikasi
- 🔔 **Notifikasi**: Alert saat ada balasan
- 📎 **Attach File**: Lampirkan file (jika diperlukan)

---

### 10. 📢 Pengumuman
**Path**: `/orangtua/pengumuman`

**Fitur**:
- 📋 Pengumuman dari sekolah
- 🔍 Filter by kategori
- 🔔 Notifikasi pengumuman baru

**Aksi**:
- 👁️ **Baca Pengumuman**: View announcement
- 🔍 **Filter**: By kategori, tanggal
- 🔔 **Mark as Read**: Tandai sudah dibaca

---

### 11. 👤 Profil Orang Tua
**Path**: `/orangtua/profil`

**Fitur**:
- 👁️ View profil pribadi
- ✏️ Edit data kontak
- 🔐 Ganti password
- 👥 Daftar anak

**Aksi**:
- ✏️ **Edit Profil**: Update nama, kontak, alamat
- 🔐 **Ganti Password**: Change password
- 👥 **Lihat Anak**: List semua anak

---

## 🔐 Fitur Autentikasi & Keamanan

### 1. 🔑 Login
**Path**: `/login`

**Fitur**:
- 🔐 Login dengan username & password
- 👁️ Show/hide password
- 💾 Remember me
- 🔄 Multi-role detection (auto redirect by role)

**Credentials Format**:
- **Admin**: Username (admin.tahfidz1) + password custom
- **Guru**: Username (G001, G002, dst) + password YYYY-MM-DD (tanggal lahir)
- **Siswa**: Username (NIS) + password YYYY-MM-DD (tanggal lahir)
- **Orang Tua**: Username (NIS siswa) + password DDMMYYYY (tanggal lahir siswa)

---

### 2. 🔒 Lupa Password
**Path**: `/lupa-password`

**Fitur**:
- 📧 Request reset via email
- 🔗 Link reset password
- ⏱️ Token expiry (24 jam)

**Flow**:
1. Input email/username
2. Sistem kirim email reset link
3. Klik link → redirect ke form reset password
4. Input password baru → confirm
5. Password berhasil direset

---

### 3. 🔄 Reset Password
**Path**: `/reset-password/[token]`

**Fitur**:
- 🔐 Form reset password
- ✅ Password strength indicator
- 🔒 Confirm password validation

---

### 4. 🔐 Ganti Password
**Path**: `/ganti-password`

**Fitur**:
- 🔐 Change password (authenticated user)
- ✅ Old password verification
- 🔒 New password strength check

---

### 5. 📝 Register (Disabled by default)
**Path**: `/register`

**Note**: Self-registration biasanya dimatikan. Siswa/guru didaftarkan oleh admin via import/manual.

---

### 6. 👨‍👩‍👧 Registrasi Orang Tua
**Path**: `/registrasi-orang-tua`

**Fitur**:
- 📝 Form pendaftaran orang tua
- 🔗 Link ke NIS siswa
- ✅ Verifikasi data siswa
- ⏳ Pending approval admin

**Flow**:
1. Orang tua isi form (nama, kontak, NIS anak)
2. Sistem validasi NIS anak
3. Submit → pending approval
4. Admin approve → akun aktif

---

## 📊 Fitur Umum (Semua Role)

### 1. 🔔 Notifikasi
- Push notification
- Email notification
- In-app notification bell
- Notification preferences

### 2. 📱 Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop enhanced
- PWA ready (installable)

### 3. 🌙 Dark Mode (Coming soon)
- Toggle light/dark theme
- Auto based on system preference
- User preference saved

### 4. 🔍 Search Global
- Search siswa, guru, kelas
- Quick navigation
- Keyboard shortcuts

### 5. 📤 Export Features
- Excel export
- PDF export
- CSV export
- Custom report builder

### 6. 📧 Email Integration
- Email notifications
- Email reports
- Email communication

### 7. 📊 Analytics & Insights
- Dashboard analytics
- Progress tracking
- Engagement metrics
- Custom reports

---

## 🎯 Workflow Utama

### 📖 Workflow Setoran Hafalan

```
1. SISWA setor hafalan (pilih surah/ayat, upload audio optional)
   └─> Status: PENDING

2. GURU menerima notifikasi setoran baru
   └─> Buka Verifikasi Hafalan
   └─> Review setoran (dengar audio jika ada)
   └─> Beri penilaian (makhroj, tajwid, kelancaran)
   └─> Tambah feedback/catatan
   └─> APPROVE atau REJECT

3. SISWA menerima notifikasi hasil verifikasi
   └─> Jika APPROVE: Hafalan tercatat, nilai masuk ke laporan
   └─> Jika REJECT: Siswa perlu mengulang setoran

4. ORANG TUA melihat perkembangan hafalan anak
   └─> Dashboard Orang Tua
   └─> View nilai, feedback guru, progress juz
```

### 🎓 Workflow Tasmi (Ujian Khataman)

```
1. SISWA mengajukan tasmi
   └─> Form pengajuan (minimal juz yang sudah dikhatam)
   └─> Submit → Status: PENDING

2. GURU menerima pengajuan tasmi
   └─> Review kelayakan (cek history hafalan, nilai)
   └─> APPROVE (set jadwal ujian) atau REJECT

3. SISWA melihat status & jadwal ujian
   └─> Persiapan ujian tasmi

4. GURU melakukan ujian tasmi
   └─> Input nilai ujian
   └─> LULUS atau TIDAK LULUS

5. Jika LULUS:
   └─> ADMIN generate sertifikat
   └─> Siswa & Orang Tua bisa download sertifikat

6. ORANG TUA menerima notifikasi hasil tasmi
```

### 👥 Workflow Import Siswa/Guru

```
1. ADMIN download template Excel
   └─> Template sudah ada kolom: Nama, NIS/NIP, Tanggal Lahir, dll

2. ADMIN isi data di Excel
   └─> Sesuaikan format tanggal, jenis kelamin, dll

3. ADMIN upload Excel ke sistem
   └─> Import Siswa/Guru

4. Sistem validasi data
   └─> Cek duplikat, format tanggal, required fields
   └─> Tampilkan preview & error (jika ada)

5. ADMIN confirm import
   └─> Sistem auto-generate:
      - Username (NIS untuk siswa, G### untuk guru)
      - Password (YYYY-MM-DD dari tanggal lahir)
      - Email internal (jika tidak ada)

6. Import selesai
   └─> Tampilkan summary: berhasil, gagal, duplikat
   └─> Download list username & password baru
   └─> Bagikan ke siswa/guru
```

---

## 📱 Teknologi & Stack

### Frontend
- ⚛️ **Next.js 14** (App Router)
- 🎨 **Tailwind CSS**
- 🧩 **React** (Client components)
- 📊 **Chart.js / Recharts** (untuk grafik)
- 🔔 **Push Notifications**
- 📱 **PWA** (Progressive Web App)

### Backend
- 🔥 **Next.js API Routes**
- 🗄️ **Prisma ORM**
- 🐘 **PostgreSQL** (database)
- 🔐 **NextAuth.js** (authentication)
- 📧 **Nodemailer** (email)
- 🔒 **bcrypt** (password hashing)

### Deployment
- ☁️ **Vercel** (hosting)
- 🌍 **Timezone**: Asia/Jakarta (WIB)
- 🔄 **CI/CD**: Auto deploy from GitHub

---

## 🎓 Kesimpulan

Sistem Tahfidz Manba'ul Ulum adalah platform komprehensif untuk manajemen hafalan Al-Qur'an yang mencakup:

✅ **Manajemen Akademik**: Siswa, guru, kelas, tahun ajaran  
✅ **Setoran & Penilaian**: Input hafalan, verifikasi, nilai  
✅ **Monitoring Real-time**: Dashboard untuk semua role  
✅ **Laporan Lengkap**: Export Excel/PDF, custom reports  
✅ **Komunikasi**: Notifikasi, email, chat guru-orang tua  
✅ **Tasmi & Sertifikat**: Ujian khataman & sertifikat digital  
✅ **Materi Digital**: Buku tahsin, referensi Al-Qur'an, audio murotal  
✅ **Keamanan**: Role-based access, password hashing, audit logs  

**Total Fitur**: 60+ halaman dengan ratusan aksi yang bisa dilakukan.

---

**Last Updated**: 18 Januari 2026  
**Version**: 1.0.0  
**Maintainer**: Admin Sistem Tahfidz
