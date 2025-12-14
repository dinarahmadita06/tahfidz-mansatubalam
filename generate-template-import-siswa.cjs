const XLSX = require('xlsx');

// Template data with proper column names
const templateData = [
  {
    'Nama Siswa': 'Abdullah Rahman',
    'NIS': '24001',
    'NISN': '0012345678',
    'Kelas': '1A',
    'Jenis Kelamin': 'L',
    'Tanggal Lahir': '2010-05-15',
    'Alamat': 'Jl. Masjid No. 123, Jakarta',
    'Nama Orang Tua': 'Ahmad Rahman',
    'Email Orang Tua': 'ahmad.rahman@gmail.com',
    'No HP Orang Tua': '081234567890'
  },
  {
    'Nama Siswa': 'Fatimah Azzahra',
    'NIS': '24002',
    'NISN': '0012345679',
    'Kelas': '1A',
    'Jenis Kelamin': 'P',
    'Tanggal Lahir': '2010-08-22',
    'Alamat': 'Jl. Pesantren No. 45, Bogor',
    'Nama Orang Tua': 'Usman Ali',
    'Email Orang Tua': 'usman.ali@gmail.com',
    'No HP Orang Tua': '082345678901'
  },
  {
    'Nama Siswa': 'Muhammad Rizki',
    'NIS': '24003',
    'NISN': '0012345680',
    'Kelas': '2B',
    'Jenis Kelamin': 'L',
    'Tanggal Lahir': '2009-12-10',
    'Alamat': 'Jl. Pondok No. 78, Depok',
    'Nama Orang Tua': 'Harun Rasyid',
    'Email Orang Tua': '', // Email kosong akan di-generate otomatis
    'No HP Orang Tua': '083456789012'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create worksheet from template data
const ws = XLSX.utils.json_to_sheet(templateData);

// Set column widths for better readability
ws['!cols'] = [
  { wch: 20 }, // Nama Siswa
  { wch: 10 }, // NIS
  { wch: 12 }, // NISN
  { wch: 8 },  // Kelas
  { wch: 12 }, // Jenis Kelamin
  { wch: 15 }, // Tanggal Lahir
  { wch: 30 }, // Alamat
  { wch: 20 }, // Nama Orang Tua
  { wch: 25 }, // Email Orang Tua
  { wch: 15 }  // No HP Orang Tua
];

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');

// Create instruction sheet
const instructions = [
  { 'Kolom': 'Nama Siswa', 'Wajib': 'Ya', 'Format': 'Text', 'Contoh': 'Abdullah Rahman', 'Keterangan': 'Nama lengkap siswa' },
  { 'Kolom': 'NIS', 'Wajib': 'Ya', 'Format': 'Number/Text', 'Contoh': '24001', 'Keterangan': 'Nomor Induk Siswa' },
  { 'Kolom': 'NISN', 'Wajib': 'Tidak', 'Format': 'Number/Text', 'Contoh': '0012345678', 'Keterangan': 'Nomor Induk Siswa Nasional' },
  { 'Kolom': 'Kelas', 'Wajib': 'Ya', 'Format': 'Text', 'Contoh': '1A', 'Keterangan': 'Nama kelas yang sudah ada di sistem' },
  { 'Kolom': 'Jenis Kelamin', 'Wajib': 'Ya', 'Format': 'L/P', 'Contoh': 'L atau P', 'Keterangan': 'L = Laki-laki, P = Perempuan' },
  { 'Kolom': 'Tanggal Lahir', 'Wajib': 'Ya', 'Format': 'Date (YYYY-MM-DD)', 'Contoh': '2010-05-15', 'Keterangan': 'Format: Tahun-Bulan-Tanggal' },
  { 'Kolom': 'Alamat', 'Wajib': 'Tidak', 'Format': 'Text', 'Contoh': 'Jl. Masjid No. 123', 'Keterangan': 'Alamat lengkap siswa' },
  { 'Kolom': 'Nama Orang Tua', 'Wajib': 'Tidak', 'Format': 'Text', 'Contoh': 'Ahmad Rahman', 'Keterangan': 'Nama lengkap orang tua/wali. Jika diisi, akun orang tua akan dibuat otomatis' },
  { 'Kolom': 'Email Orang Tua', 'Wajib': 'Tidak', 'Format': 'Email', 'Contoh': 'ahmad@gmail.com', 'Keterangan': 'Email orang tua. Jika kosong, akan di-generate otomatis' },
  { 'Kolom': 'No HP Orang Tua', 'Wajib': 'Tidak', 'Format': 'Number/Text', 'Contoh': '081234567890', 'Keterangan': 'Nomor HP/WhatsApp orang tua' }
];

const wsInstructions = XLSX.utils.json_to_sheet(instructions);
wsInstructions['!cols'] = [
  { wch: 20 },
  { wch: 10 },
  { wch: 20 },
  { wch: 20 },
  { wch: 50 }
];
XLSX.utils.book_append_sheet(wb, wsInstructions, 'Panduan');

// Save file
const filename = 'Template_Import_Siswa_dan_Orang_Tua.xlsx';
XLSX.writeFile(wb, filename);

console.log('✅ Template Excel berhasil dibuat:', filename);
console.log('📋 Cara menggunakan:');
console.log('   1. Isi data siswa di sheet "Data Siswa"');
console.log('   2. Jika ada data orang tua, isi kolom "Nama Orang Tua" dan "No HP Orang Tua"');
console.log('   3. Email orang tua bisa dikosongkan, sistem akan generate otomatis');
console.log('   4. Upload file di menu Admin → Siswa → Import');
console.log('   5. Sistem akan otomatis membuat akun siswa DAN orang tua');
console.log('');
console.log('📝 Catatan penting:');
console.log('   - Kolom "Nama Orang Tua" adalah trigger untuk membuat akun orang tua');
console.log('   - Jika orang tua dengan nama yang sama sudah ada, tidak akan dibuat duplikat');
console.log('   - Password orang tua akan di-generate random dan bisa di-export setelah import');
