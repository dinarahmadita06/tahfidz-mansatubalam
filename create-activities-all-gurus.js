import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createActivitiesForAllGurus() {
  try {
    console.log('📝 Creating activities for ALL gurus...\n');

    // Get all gurus
    const allGurus = await prisma.user.findMany({
      where: { role: 'GURU' }
    });

    // Get a siswa
    const siswa = await prisma.user.findFirst({
      where: { role: 'SISWA' }
    });

    const now = new Date();

    for (const guru of allGurus) {
      // Delete old activities
      await prisma.activityLog.deleteMany({
        where: { actorId: guru.id }
      });

      // Create 4 activities for this guru
      const activities = [
        {
          actorId: guru.id,
          actorRole: 'GURU',
          actorName: guru.name,
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
          actorId: guru.id,
          actorRole: 'GURU',
          actorName: guru.name,
          action: 'GURU_UBAH_PROFIL',
          title: 'Mengubah profil pribadi',
          description: 'Update nomor telepon dan alamat',
          metadata: { fields: ['noTelepon', 'alamat'] },
          createdAt: new Date(now.getTime() - 30 * 60 * 1000),
        },
        {
          actorId: guru.id,
          actorRole: 'GURU',
          actorName: guru.name,
          action: 'GURU_UPLOAD_TTD',
          title: 'Upload tanda tangan digital',
          description: 'Upload file tanda tangan guru',
          metadata: { fileName: 'ttd_guru.png', size: 15000 },
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
        {
          actorId: guru.id,
          actorRole: 'GURU',
          actorName: guru.name,
          action: 'GURU_LIHAT_SISWA',
          title: 'Melihat data siswa',
          description: 'Membuka halaman kelola siswa',
          metadata: { jumlahSiswa: 25 },
          createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        },
      ];

      await prisma.activityLog.createMany({
        data: activities,
        skipDuplicates: false,
      });

      console.log(`✅ ${guru.name} - 4 activities created`);
    }

    console.log(`\n✅ Done! All ${allGurus.length} gurus now have activities`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createActivitiesForAllGurus();
