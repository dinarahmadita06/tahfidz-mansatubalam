import { PrismaClient } from '@prisma/client';
import XLSX from 'xlsx';

const prisma = new PrismaClient();

async function exportSiswaTanpaOrangTua() {
  try {
    console.log('🔍 Mencari siswa yang belum punya orang tua...\n');

    // Get siswa yang belum punya orang tua
    const siswaList = await prisma.siswa.findMany({
      include: {
        orangTuaSiswa: true,
        user: {
          select: {
            name: true,
            email: true
          }
        },
        kelas: {
          select: {
            nama: true
          }
        }
      }
    });

    // Filter siswa yang belum punya orang tua
    const siswaTanpaOrangTua = siswaList.filter(s => s.orangTuaSiswa.length === 0);

    console.log(`📋 Ditemukan ${siswaTanpaOrangTua.length} siswa yang belum punya orang tua\n`);

    // Prepare data for Excel
    const excelData = siswaTanpaOrangTua.map(siswa => ({
      'Nama Siswa': siswa.user.name,
      'NIS': siswa.nis,
      'NISN': siswa.nisn || '',
      'Kelas': siswa.kelas?.nama || '',
      'Jenis Kelamin': siswa.jenisKelamin === 'LAKI_LAKI' ? 'L' : 'P',
      'Tanggal Lahir': siswa.tanggalLahir ?
        siswa.tanggalLahir.toISOString().split('T')[0] : '',
      'Alamat': siswa.alamat || '',
      'Nama Orang Tua': '', // Kosong - untuk diisi
      'Email Orang Tua': '', // Kosong - untuk diisi (opsional)
      'No HP Orang Tua': '' // Kosong - untuk diisi
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create data sheet
    const ws = XLSX.utils.json_to_sheet(excelData);
    ws['!cols'] = [
      { wch: 25 }, // Nama Siswa
      { wch: 12 }, // NIS
      { wch: 15 }, // NISN
      { wch: 10 }, // Kelas
      { wch: 12 }, // Jenis Kelamin
      { wch: 15 }, // Tanggal Lahir
      { wch: 35 }, // Alamat
      { wch: 25 }, // Nama Orang Tua
      { wch: 30 }, // Email Orang Tua
      { wch: 15 }  // No HP Orang Tua
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa Tanpa Ortu');

    // Create instruction sheet
    const instructions = [
      {
        'No': 1,
        'Instruksi': 'Isi kolom "Nama Orang Tua" dengan nama lengkap orang tua/wali',
        'Wajib': 'Ya',
        'Contoh': 'Ahmad Subhan'
      },
      {
        'No': 2,
        'Instruksi': 'Isi kolom "No HP Orang Tua" dengan nomor HP yang aktif',
        'Wajib': 'Tidak',
        'Contoh': '081234567890'
      },
      {
        'No': 3,
        'Instruksi': 'Isi kolom "Email Orang Tua" (opsional, akan di-generate otomatis jika kosong)',
        'Wajib': 'Tidak',
        'Contoh': 'ahmad.subhan@gmail.com'
      },
      {
        'No': 4,
        'Instruksi': 'JANGAN UBAH kolom data siswa (Nama, NIS, NISN, Kelas, dll)',
        'Wajib': 'Ya',
        'Contoh': 'Biarkan apa adanya'
      },
      {
        'No': 5,
        'Instruksi': 'Setelah selesai mengisi, upload file ini di menu Admin → Siswa → Smart Import',
        'Wajib': 'Ya',
        'Contoh': '-'
      },
      {
        'No': 6,
        'Instruksi': 'Sistem akan otomatis membuat akun orang tua dengan email & password random',
        'Wajib': '-',
        'Contoh': '-'
      },
      {
        'No': 7,
        'Instruksi': 'Setelah import, download file "Akun Baru" untuk mendapat username & password',
        'Wajib': '-',
        'Contoh': '-'
      }
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [
      { wch: 5 },
      { wch: 80 },
      { wch: 10 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Panduan');

    // Save file
    const filename = `Siswa_Tanpa_OrangTua_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    console.log('✅ File Excel berhasil dibuat:', filename);
    console.log('📝 File berisi', siswaTanpaOrangTua.length, 'siswa yang perlu dilengkapi data orang tuanya\n');
    console.log('📋 Langkah selanjutnya:');
    console.log('   1. Buka file Excel:', filename);
    console.log('   2. Isi kolom "Nama Orang Tua", "Email Orang Tua", dan "No HP Orang Tua"');
    console.log('   3. Upload di menu Admin → Siswa → Smart Import');
    console.log('   4. Sistem akan otomatis membuat 21 akun orang tua baru');
    console.log('   5. Download file "Akun Baru" untuk mendapat username & password\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportSiswaTanpaOrangTua();
