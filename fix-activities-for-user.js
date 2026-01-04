import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixActivitiesForCurrentUser() {
  try {
    console.log('🔍 Checking current logged-in user...\n');

    // Get all gurus
    const allGurus = await prisma.user.findMany({
      where: { role: 'GURU' },
      include: { guru: true }
    });

    console.log('📋 All Guru Users in Database:\n');
    allGurus.forEach((guru, index) => {
      console.log(`${index + 1}. ${guru.name}`);
      console.log(`   ID: ${guru.id}`);
      console.log(`   Email: ${guru.email}`);
      console.log('');
    });

    if (allGurus.length === 0) {
      console.log('❌ No guru users found!');
      return;
    }

    // Get first guru
    const targetGuru = allGurus[0];
    console.log(`\n✅ Using guru: ${targetGuru.name} (${targetGuru.id})\n`);

    // Get a siswa for targetUserId
    const siswa = await prisma.user.findFirst({
      where: { role: 'SISWA' }
    });

    // Delete existing activities for this guru
    const deleted = await prisma.activityLog.deleteMany({
      where: { actorId: targetGuru.id }
    });
    console.log(`🗑️  Deleted ${deleted.count} old activities\n`);

    // Create fresh activities for this guru
    const now = new Date();
    const activities = [
      {
        actorId: targetGuru.id,
        actorRole: 'GURU',
        actorName: targetGuru.name,
        action: 'GURU_INPUT_PENILAIAN',
        title: 'Menginput penilaian hafalan',
        description: 'Input nilai untuk Surah Al-Fatihah',
        targetUserId: siswa?.id,
        targetRole: siswa ? 'SISWA' : null,
        targetName: siswa?.name,
        metadata: { siswaId: siswa?.id, surah: 'Al-Fatihah', nilai: 85 },
        createdAt: new Date(now.getTime() - 5 * 60 * 1000),
      },
      {
        actorId: targetGuru.id,
        actorRole: 'GURU',
        actorName: targetGuru.name,
        action: 'GURU_UBAH_PROFIL',
        title: 'Mengubah profil pribadi',
        description: 'Update nomor telepon dan alamat',
        metadata: { fields: ['noTelepon', 'alamat'] },
        createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
      {
        actorId: targetGuru.id,
        actorRole: 'GURU',
        actorName: targetGuru.name,
        action: 'GURU_UPLOAD_TTD',
        title: 'Upload tanda tangan digital',
        description: 'Upload file tanda tangan guru',
        metadata: { fileName: 'ttd_guru.png', size: 15000 },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        actorId: targetGuru.id,
        actorRole: 'GURU',
        actorName: targetGuru.name,
        action: 'GURU_LIHAT_SISWA',
        title: 'Melihat data siswa',
        description: 'Membuka halaman kelola siswa',
        metadata: { jumlahSiswa: 25 },
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
    ];

    const created = await prisma.activityLog.createMany({
      data: activities,
      skipDuplicates: false,
    });

    console.log(`✅ Created ${created.count} activity logs for ${targetGuru.name}\n`);

    // Verify
    const verification = await prisma.activityLog.findMany({
      where: { actorId: targetGuru.id },
      orderBy: { createdAt: 'desc' },
    });

    console.log('📝 Activities for this guru:\n');
    verification.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title}`);
      console.log(`   Description: ${activity.description}`);
      console.log(`   Created: ${activity.createdAt.toISOString()}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixActivitiesForCurrentUser();
