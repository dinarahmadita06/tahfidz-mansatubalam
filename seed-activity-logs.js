import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedActivities() {
  try {
    console.log('🌱 Seeding test activity logs...\n');

    // Get first guru and siswa users
    const guru = await prisma.user.findFirst({
      where: { role: 'GURU' }
    });

    const siswa = await prisma.user.findFirst({
      where: { role: 'SISWA' }
    });

    if (!guru || !siswa) {
      console.log('❌ No guru or siswa users found. Please create users first.');
      return;
    }

    console.log(`✅ Found guru: ${guru.name}`);
    console.log(`✅ Found siswa: ${siswa.name}\n`);

    // Create sample activities
    const now = new Date();
    const activities = [
      // Guru activities
      {
        actorId: guru.id,
        actorRole: 'GURU',
        actorName: guru.name,
        action: 'GURU_INPUT_PENILAIAN',
        title: 'Menginput penilaian hafalan',
        description: 'Input nilai untuk Surah Al-Fatihah',
        targetUserId: siswa.id,
        targetRole: 'SISWA',
        targetName: siswa.name,
        metadata: { siswaId: siswa.id, surah: 'Al-Fatihah', nilai: 85 },
        createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        actorId: guru.id,
        actorRole: 'GURU',
        actorName: guru.name,
        action: 'GURU_UBAH_PROFIL',
        title: 'Mengubah profil pribadi',
        description: 'Update nomor telepon dan alamat',
        metadata: { fields: ['noTelepon', 'alamat'] },
        createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      },
      {
        actorId: guru.id,
        actorRole: 'GURU',
        actorName: guru.name,
        action: 'GURU_UPLOAD_TTD',
        title: 'Upload tanda tangan digital',
        description: 'Upload file tanda tangan guru',
        metadata: { fileName: 'ttd_guru.png', size: 15000 },
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },

      // Siswa activities
      {
        actorId: siswa.id,
        actorRole: 'SISWA',
        actorName: siswa.name,
        action: 'SISWA_DAFTAR_TASMI',
        title: 'Mendaftar tasmi juz 1',
        description: 'Mendaftar ujian tasmi untuk juz 1',
        metadata: { juz: 1, tanggal: '2026-01-10' },
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
      {
        actorId: siswa.id,
        actorRole: 'SISWA',
        actorName: siswa.name,
        action: 'SISWA_LIHAT_PENILAIAN',
        title: 'Melihat penilaian hafalan',
        description: 'Siswa melihat nilai dari guru',
        targetUserId: guru.id,
        targetRole: 'GURU',
        targetName: guru.name,
        metadata: { surah: 'An-Naba' },
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
    ];

    // Create activities
    const created = await prisma.activityLog.createMany({
      data: activities,
      skipDuplicates: false,
    });

    console.log(`✅ Created ${created.count} activity logs\n`);

    // Show what was created
    const allActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('📝 Created activities:\n');
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. [${activity.actorRole}] ${activity.title}`);
      console.log(`   ${activity.description || ''}`);
      console.log(`   Created: ${activity.createdAt.toISOString()}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedActivities();
