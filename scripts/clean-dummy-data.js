/**
 * Script untuk membersihkan data dummy dari database
 *
 * PERINGATAN: Script ini akan MENGHAPUS data dummy!
 * Pastikan sudah backup database sebelum menjalankan script ini.
 *
 * Cara menjalankan:
 * node scripts/clean-dummy-data.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDummyData() {
  console.log('🧹 Memulai pembersihan data dummy...\n');

  try {
    // Statistics
    const stats = {
      users: 0,
      siswa: 0,
      guru: 0,
      orangTua: 0,
      hafalan: 0,
      penilaian: 0,
      presensi: 0,
      tasmi: 0,
      tahsin: 0,
    };

    // 1. Hapus Hafalan dummy (yang terkait dengan siswa dummy)
    console.log('🗑️  Menghapus Hafalan dummy...');
    const hafalanDeleted = await prisma.hafalan.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { siswa: { user: { email: { contains: '@example.com' } } } },
        ]
      }
    });
    stats.hafalan = hafalanDeleted.count;
    console.log(`   ✅ ${hafalanDeleted.count} hafalan dihapus\n`);

    // 2. Hapus Penilaian dummy
    console.log('🗑️  Menghapus Penilaian dummy...');
    const penilaianDeleted = await prisma.penilaian.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { siswa: { user: { email: { contains: '@example.com' } } } },
        ]
      }
    });
    stats.penilaian = penilaianDeleted.count;
    console.log(`   ✅ ${penilaianDeleted.count} penilaian dihapus\n`);

    // 3. Hapus Presensi dummy
    console.log('🗑️  Menghapus Presensi dummy...');
    const presensiDeleted = await prisma.presensi.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { siswa: { user: { email: { contains: '@example.com' } } } },
        ]
      }
    });
    stats.presensi = presensiDeleted.count;
    console.log(`   ✅ ${presensiDeleted.count} presensi dihapus\n`);

    // 4. Hapus Tasmi dummy
    console.log('🗑️  Menghapus Tasmi dummy...');
    const tasmiDeleted = await prisma.tasmi.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { siswa: { user: { email: { contains: '@example.com' } } } },
        ]
      }
    });
    stats.tasmi = tasmiDeleted.count;
    console.log(`   ✅ ${tasmiDeleted.count} tasmi dihapus\n`);

    // 5. Hapus Tahsin dummy
    console.log('🗑️  Menghapus Tahsin dummy...');
    const tahsinDeleted = await prisma.tahsin.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { siswa: { user: { email: { contains: '@example.com' } } } },
        ]
      }
    });
    stats.tahsin = tahsinDeleted.count;
    console.log(`   ✅ ${tahsinDeleted.count} tahsin dihapus\n`);

    // 6. Hapus OrangTuaSiswa relation untuk data dummy
    console.log('🗑️  Menghapus OrangTuaSiswa relation dummy...');
    await prisma.orangTuaSiswa.deleteMany({
      where: {
        OR: [
          { siswa: { nis: { startsWith: 'DEMO' } } },
          { orangTua: { nik: { startsWith: 'DEMO' } } },
        ]
      }
    });
    console.log(`   ✅ OrangTuaSiswa relation dihapus\n`);

    // 7. Hapus Siswa dummy
    console.log('🗑️  Menghapus Siswa dummy...');
    const siswaDeleted = await prisma.siswa.deleteMany({
      where: {
        OR: [
          { nis: { startsWith: 'DEMO' } },
          { user: { email: { contains: '@example.com' } } },
          { user: { email: { contains: '@siswa.tahfidz.sch.id' } } }, // Demo siswa
        ]
      }
    });
    stats.siswa = siswaDeleted.count;
    console.log(`   ✅ ${siswaDeleted.count} siswa dihapus\n`);

    // 8. Hapus OrangTua dummy
    console.log('🗑️  Menghapus Orang Tua dummy...');
    const orangTuaDeleted = await prisma.orangTua.deleteMany({
      where: {
        OR: [
          { nik: { startsWith: 'DEMO' } },
          { user: { email: { contains: '@example.com' } } },
          { user: { email: { contains: '@parent.tahfidz.sch.id' } } }, // Demo orang tua
        ]
      }
    });
    stats.orangTua = orangTuaDeleted.count;
    console.log(`   ✅ ${orangTuaDeleted.count} orang tua dihapus\n`);

    // 9. Hapus Guru dummy (kecuali yang real)
    console.log('🗑️  Menghapus Guru dummy...');
    const guruDeleted = await prisma.guru.deleteMany({
      where: {
        user: {
          email: { contains: '@example.com' }
        }
      }
    });
    stats.guru = guruDeleted.count;
    console.log(`   ✅ ${guruDeleted.count} guru dihapus\n`);

    // 10. Hapus User dummy (kecuali admin utama)
    console.log('🗑️  Menghapus User dummy...');
    const userDeleted = await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { contains: '@example.com' } },
          { email: 'abdullah.rahman@siswa.tahfidz.sch.id' },
          { email: 'ortu.24001@parent.tahfidz.sch.id' },
        ],
        // Jangan hapus admin utama
        NOT: {
          email: 'admin@tahfidz.sch.id'
        }
      }
    });
    stats.users = userDeleted.count;
    console.log(`   ✅ ${userDeleted.count} user dihapus\n`);

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 SUMMARY PEMBERSIHAN DATA DUMMY');
    console.log('═══════════════════════════════════════');
    console.log(`Users dihapus:      ${stats.users}`);
    console.log(`Siswa dihapus:      ${stats.siswa}`);
    console.log(`Guru dihapus:       ${stats.guru}`);
    console.log(`Orang Tua dihapus:  ${stats.orangTua}`);
    console.log(`Hafalan dihapus:    ${stats.hafalan}`);
    console.log(`Penilaian dihapus:  ${stats.penilaian}`);
    console.log(`Presensi dihapus:   ${stats.presensi}`);
    console.log(`Tasmi dihapus:      ${stats.tasmi}`);
    console.log(`Tahsin dihapus:     ${stats.tahsin}`);
    console.log('═══════════════════════════════════════');
    console.log('\n✅ Pembersihan data dummy selesai!\n');

    // Verify remaining data
    console.log('🔍 Verifikasi data yang tersisa...\n');
    const remainingUsers = await prisma.user.count();
    const remainingSiswa = await prisma.siswa.count();
    const remainingGuru = await prisma.guru.count();
    const remainingOrangTua = await prisma.orangTua.count();

    console.log('📈 DATA YANG TERSISA:');
    console.log(`Users:      ${remainingUsers}`);
    console.log(`Siswa:      ${remainingSiswa}`);
    console.log(`Guru:       ${remainingGuru}`);
    console.log(`Orang Tua:  ${remainingOrangTua}\n`);

    if (remainingUsers === 0 || (remainingUsers === 1 && remainingSiswa === 0)) {
      console.log('⚠️  WARNING: Hanya tersisa admin. Database siap untuk import data baru!\n');
    }

  } catch (error) {
    console.error('❌ Error saat membersihkan data dummy:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Konfirmasi sebelum execute
console.log('⚠️  ═══════════════════════════════════════════════════════════');
console.log('⚠️  PERINGATAN: Script ini akan MENGHAPUS data dummy!');
console.log('⚠️  Pastikan Anda sudah BACKUP database sebelum melanjutkan.');
console.log('⚠️  ═══════════════════════════════════════════════════════════\n');

// Run the cleanup
cleanDummyData()
  .then(() => {
    console.log('✅ Script selesai dijalankan.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script gagal:', error);
    process.exit(1);
  });
