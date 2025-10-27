# Template Smart Import Excel

## Format Excel yang Benar

Buat file Excel (.xlsx) dengan kolom-kolom berikut (PENTING: Gunakan nama kolom persis seperti di bawah):

### Contoh Header Row (Baris 1):

| Nama Siswa | NIS | NISN | Kelas | Jenis Kelamin | Tempat Lahir | Tanggal Lahir | Alamat | Email Siswa | Nama Orang Tua | No HP Orang Tua | Email Orang Tua | Hubungan |
|------------|-----|------|-------|---------------|--------------|---------------|--------|-------------|----------------|-----------------|-----------------|----------|

### Contoh Data (Baris 2 dst):

| Nama Siswa | NIS | NISN | Kelas | Jenis Kelamin | Tempat Lahir | Tanggal Lahir | Alamat | Email Siswa | Nama Orang Tua | No HP Orang Tua | Email Orang Tua | Hubungan |
|------------|-----|------|-------|---------------|--------------|---------------|--------|-------------|----------------|-----------------|-----------------|----------|
| Ahmad Rizki Hidayat | 2024001 | 0051234567 | 7 A | L | Jakarta | 01/01/2010 | Jl. Merdeka No. 1 | ahmad@email.com | Abdullah Rahman | 08123456789 | abdullah@email.com | Ayah |
| Fatimah Az-Zahra | 2024002 | 0051234568 | 7 A | P | Bandung | 15/03/2010 | Jl. Sudirman No. 5 | fatimah@email.com | Aminah Siti | 08198765432 | aminah@email.com | Ibu |
| Muhammad Yusuf | 2024003 | 0051234569 | 8 B | L | Surabaya | 20/05/2009 | Jl. Pahlawan No. 10 | yusuf@email.com | Umar bin Khattab | 08567891234 | umar@email.com | Ayah |

## Kolom Yang WAJIB Ada:

1. **Nama Siswa** - Tidak boleh kosong
2. **NIS** - Tidak boleh kosong dan harus unique (tidak boleh duplikat)

## Kolom Optional:

- NISN
- Kelas (jika kosong, siswa akan di-assign ke kelas aktif pertama)
- Jenis Kelamin (L/P atau Laki-laki/Perempuan)
- Tempat Lahir
- Tanggal Lahir (format: DD/MM/YYYY atau YYYY-MM-DD)
- Alamat
- Email Siswa (jika kosong, akan di-generate otomatis)
- Nama Orang Tua (jika kosong, orang tua tidak akan dibuat)
- No HP Orang Tua
- Email Orang Tua (jika kosong, akan di-generate otomatis)
- Hubungan (Ayah/Ibu/Wali)

## Tips:

1. **Copy-paste template** ini ke Excel
2. **Isi data** mulai dari baris 2
3. **Jangan ubah nama kolom** di baris 1
4. **Pastikan NIS unique** (tidak ada yang sama)
5. **Format tanggal** menggunakan DD/MM/YYYY (contoh: 01/01/2010)
6. **Jenis Kelamin** pakai L atau P (atau Laki-laki/Perempuan)

## Troubleshooting:

Jika import gagal semua:
1. Cek apakah ada kolom "Nama Siswa" dan "NIS"
2. Cek apakah NIS ada isinya di setiap baris
3. Cek apakah ada NIS yang duplikat dengan data di database
4. Cek format tanggal (harus DD/MM/YYYY bukan MM/DD/YYYY)
5. Hapus baris kosong di tengah-tengah data
