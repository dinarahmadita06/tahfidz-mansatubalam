const XLSX = require('xlsx');

/**
 * TEMPLATE IMPORT SISWA SIMTAQ - SIMPLIFIED VERSION
 * 
 * Ketentuan:
 * - Hanya 6 kolom wajib (urutan harus sama)
 * - Semua siswa otomatis terdaftar di tahun ajaran aktif
 * - Akun siswa & wali dibuat otomatis
 * - Password Siswa: NISN
 * - Password Wali: DDMMYYYY (dari tanggal lahir siswa)
 */
const templateData = [
  {
    'Nama Lengkap Siswa': 'Abdullah Rahman',
    'NISN': '0012345678',
    'NIS': '24001',
    'Tanggal Lahir': '2010-05-15',
    'Jenis Kelamin': 'L',
    'Nama Wali': 'Ahmad Rahman',
    'Jenis Kelamin Wali': 'L'
  },
  {
    'Nama Lengkap Siswa': 'Fatimah Azzahra',
    'NISN': '0012345679',
    'NIS': '24002',
    'Tanggal Lahir': '2010-08-22',
    'Jenis Kelamin': 'P',
    'Nama Wali': 'Siti Aminah',
    'Jenis Kelamin Wali': 'P'
  }
];

// Create workbook
const wb = XLSX.utils.book_new();

// Create worksheet from template data
const ws = XLSX.utils.json_to_sheet(templateData);

// Set column widths for better readability
ws['!cols'] = [
  { wch: 25 }, // Nama Lengkap Siswa
  { wch: 15 }, // NISN
  { wch: 12 }, // NIS
  { wch: 15 }, // Tanggal Lahir
  { wch: 15 }, // Jenis Kelamin
  { wch: 25 }, // Nama Wali
  { wch: 18 }  // Jenis Kelamin Wali
];

XLSX.utils.book_append_sheet(wb, ws, 'Template Import Siswa');

// Generate file
const filename = 'Template_Import_Siswa_SIMTAQ.xlsx';
XLSX.writeFile(wb, filename);

console.log('✅ Template Import Siswa SIMTAQ berhasil dibuat!');
console.log('📋 File: ' + filename);
console.log('');
console.log('📌 Ketentuan:');
console.log('   ✓ 7 kolom wajib (jangan tambah/kurang kolom)');
console.log('   ✓ Baris 1: Header (jangan diubah)');
console.log('   ✓ Data mulai baris 2');
console.log('   ✓ Format Tanggal Lahir: YYYY-MM-DD (contoh: 2010-05-15)');
console.log('   ✓ Jenis Kelamin Siswa & Wali: L atau P');
console.log('   ✓ NISN & NIS harus unik (tidak boleh duplikat)');
console.log('');
console.log('🔐 Password otomatis:');
console.log('   • Siswa: NISN');
console.log('   • Wali: DDMMYYYY (dari tanggal lahir siswa)');
console.log('   • Contoh: Lahir 15/05/2010 → Password Wali: 15052010');
console.log('');
console.log('📚 Semua siswa otomatis masuk ke Tahun Ajaran Aktif');
console.log('');
