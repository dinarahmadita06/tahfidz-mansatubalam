import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const rina = await prisma.siswa.findFirst({
    where: {
      user: {
        name: {
          contains: 'Rina',
          mode: 'insensitive'
        }
      }
    },
    include: {
      user: { select: { id: true, name: true, createdAt: true } }
    }
  });

  if (rina) {
    console.log('✅ Found Rina siswa:');
    console.log(`  ID: ${rina.id}`);
    console.log(`  Name: ${rina.user.name}`);
    console.log(`  Created: ${rina.user.createdAt}`);
    console.log(`\n📊 Check if activity was logged for this siswa creation:`);
    
    // Check activity logs for this siswa
    const activities = await prisma.activityLog.findMany({
      where: {
        metadata: {
          contains: rina.id // Search in metadata
        }
      },
      select: {
        action: true,
        title: true,
        description: true,
        createdAt: true
      }
    });

    if (activities.length > 0) {
      console.log(`✅ Found ${activities.length} activities`);
      console.log(JSON.stringify(activities, null, 2));
    } else {
      console.log('❌ No activities found for Rina siswa creation');
    }
  } else {
    console.log('❌ No siswa named Rina found');
  }

  await prisma.$disconnect();
})();
