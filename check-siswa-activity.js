import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async () => {
  console.log('🔍 Checking ADMIN_TAMBAH_SISWA activities...\n');
  
  const activities = await prisma.activityLog.findMany({
    where: { action: 'ADMIN_TAMBAH_SISWA' },
    select: {
      id: true,
      action: true,
      title: true,
      description: true,
      actorId: true,
      actorRole: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(`Total ADMIN_TAMBAH_SISWA activities: ${activities.length}\n`);
  console.log(JSON.stringify(activities, null, 2));

  // Also check latest activities overall
  console.log('\n\n📊 Latest 5 activities (all types):\n');
  const allActivities = await prisma.activityLog.findMany({
    select: {
      id: true,
      action: true,
      title: true,
      actorRole: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  console.log(JSON.stringify(allActivities, null, 2));

  await prisma.$disconnect();
})();
