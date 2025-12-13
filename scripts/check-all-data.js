import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function safeCount(model, name) {
  try {
    return await model.count();
  } catch (error) {
    console.log(`⚠️  Model "${name}" not found or error: ${error.message}`);
    return 0;
  }
}

async function checkAllData() {
  try {
    console.log('📊 Checking all data in database...\n');

    const counts = {
      users: await safeCount(prisma.user, 'User'),
      siswa: await safeCount(prisma.siswa, 'Siswa'),
      guru: await safeCount(prisma.guru, 'Guru'),
      orangTua: await safeCount(prisma.orangTua, 'OrangTua'),
      kelas: await safeCount(prisma.kelas, 'Kelas'),
      tahunAjaran: await safeCount(prisma.tahunAjaran, 'TahunAjaran'),
      hafalan: await safeCount(prisma.hafalan, 'Hafalan'),
      targetHafalan: await safeCount(prisma.targetHafalan, 'TargetHafalan'),
      tasmi: await safeCount(prisma.tasmi, 'Tasmi'),
      penilaian: await safeCount(prisma.penilaian, 'Penilaian'),
      tahsin: await safeCount(prisma.tahsin, 'Tahsin'),
      presensi: await safeCount(prisma.presensi, 'Presensi'),
      surah: await safeCount(prisma.surah, 'Surah'),
      pengumuman: await safeCount(prisma.pengumuman, 'Pengumuman'),
      bukuDigital: await safeCount(prisma.bukuDigital, 'BukuDigital'),
      logActivity: await safeCount(prisma.logActivity, 'LogActivity'),
    };

    console.log('═══════════════════════════════════════');
    console.log('📊 DATA COUNTS IN DATABASE');
    console.log('═══════════════════════════════════════');

    console.log('\n👥 USERS & PROFILES:');
    console.log(`Users:              ${counts.users}`);
    console.log(`Siswa:              ${counts.siswa}`);
    console.log(`Guru:               ${counts.guru}`);
    console.log(`Orang Tua:          ${counts.orangTua}`);

    console.log('\n🎓 ACADEMIC:');
    console.log(`Kelas:              ${counts.kelas}`);
    console.log(`Tahun Ajaran:       ${counts.tahunAjaran}`);

    console.log('\n📖 HAFALAN:');
    console.log(`Hafalan:            ${counts.hafalan}`);
    console.log(`Target Hafalan:     ${counts.targetHafalan}`);
    console.log(`Tasmi:              ${counts.tasmi}`);

    console.log('\n📝 ASSESSMENT:');
    console.log(`Penilaian:          ${counts.penilaian}`);
    console.log(`Tahsin:             ${counts.tahsin}`);
    console.log(`Presensi:           ${counts.presensi}`);

    console.log('\n📚 MASTER DATA:');
    console.log(`Surah:              ${counts.surah}`);

    console.log('\n📢 OTHERS:');
    console.log(`Pengumuman:         ${counts.pengumuman}`);
    console.log(`Buku Digital:       ${counts.bukuDigital}`);
    console.log(`Log Activity:       ${counts.logActivity}`);

    console.log('\n═══════════════════════════════════════');
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    console.log(`TOTAL RECORDS:      ${total}`);
    console.log('═══════════════════════════════════════\n');

    // Show which tables have data
    console.log('⚠️  TABLES WITH DATA (not empty):');
    Object.entries(counts).forEach(([table, count]) => {
      if (count > 0) {
        console.log(`   - ${table}: ${count}`);
      }
    });

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();
