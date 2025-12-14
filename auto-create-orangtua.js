import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper untuk generate password random
function generatePassword(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Helper untuk generate username
function generateUsername(nama) {
  const cleanName = nama
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(' ')[0]; // Ambil nama depan

  const timestamp = Date.now().toString().slice(-4);
  return `${cleanName}${timestamp}`;
}

async function autoCreateOrangTua() {
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
        }
      }
    });

    const siswaTanpaOrangTua = siswaList.filter(s => s.orangTuaSiswa.length === 0);

    console.log(`📋 Ditemukan ${siswaTanpaOrangTua.length} siswa yang belum punya orang tua\n`);
    console.log('⚠️  PERHATIAN: Script ini akan membuat akun orang tua dengan data minimal:');
    console.log('   - Nama: [Nama Siswa] - Orang Tua');
    console.log('   - Email: auto-generated');
    console.log('   - Password: random 8 karakter');
    console.log('   - Status: approved\n');

    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      rl.question('Lanjutkan membuat akun orang tua? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('\n❌ Dibatalkan oleh user');
      return;
    }

    console.log('\n🚀 Memulai pembuatan akun orang tua...\n');

    const createdAccounts = [];
    let successCount = 0;
    let failCount = 0;

    for (const siswa of siswaTanpaOrangTua) {
      try {
        // Generate nama orang tua dari nama siswa
        const namaOrangTua = `${siswa.user.name} - Orang Tua`;

        // Generate email
        const username = generateUsername(namaOrangTua);
        const email = `${username}@tahfidz.ortu`;

        // Generate password
        const password = generatePassword(8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });

        if (existingUser) {
          console.log(`⚠️  Email ${email} sudah ada, skip...`);
          failCount++;
          continue;
        }

        // Create orang tua
        const orangTua = await prisma.orangTua.create({
          data: {
            nik: `NIK${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
            jenisKelamin: 'LAKI_LAKI', // Default
            status: 'approved',
            user: {
              create: {
                email,
                password: hashedPassword,
                name: namaOrangTua,
                role: 'ORANG_TUA'
              }
            }
          },
          include: {
            user: true
          }
        });

        // Create relasi OrangTuaSiswa
        await prisma.orangTuaSiswa.create({
          data: {
            orangTuaId: orangTua.id,
            siswaId: siswa.id,
            hubungan: 'Orang Tua'
          }
        });

        createdAccounts.push({
          namaSiswa: siswa.user.name,
          nisSiswa: siswa.nis,
          namaOrangTua,
          email,
          password
        });

        console.log(`✅ Berhasil membuat akun untuk: ${siswa.user.name}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Gagal membuat akun untuk ${siswa.user.name}:`, error.message);
        failCount++;
      }
    }

    console.log('\n📊 HASIL:');
    console.log(`   ✅ Berhasil: ${successCount}`);
    console.log(`   ❌ Gagal: ${failCount}\n`);

    if (createdAccounts.length > 0) {
      // Export to Excel
      const XLSX = (await import('xlsx')).default;

      const exportData = createdAccounts.map(acc => ({
        'Nama Siswa': acc.namaSiswa,
        'NIS Siswa': acc.nisSiswa,
        'Nama Orang Tua': acc.namaOrangTua,
        'Email/Username': acc.email,
        'Password': acc.password,
        'Keterangan': 'Akun dibuat otomatis - Silakan ubah data di menu Orang Tua'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Akun Orang Tua Baru');

      const filename = `Akun_OrangTua_Baru_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, filename);

      console.log(`📁 File akun disimpan: ${filename}\n`);
      console.log('⚠️  PENTING:');
      console.log('   1. Berikan file ini kepada orang tua siswa');
      console.log('   2. Minta mereka untuk login dan update profil');
      console.log('   3. Data orang tua saat ini masih minimal (nama, email, password saja)');
      console.log('   4. Lengkapi data di menu Admin → Orang Tua atau minta ortu update sendiri\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

autoCreateOrangTua();
