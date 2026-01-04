import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkActivities() {
  try {
    console.log('🔍 Checking ActivityLog records...\n');

    // Count total activities
    const totalCount = await prisma.activityLog.count();
    console.log(`📊 Total ActivityLog records: ${totalCount}`);

    // Get latest 10 activities
    const activities = await prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        actorId: true,
        actorRole: true,
        action: true,
        title: true,
        createdAt: true,
      }
    });

    if (activities.length === 0) {
      console.log('\n⚠️  No activities found! Database is empty.');
    } else {
      console.log(`\n📝 Latest 10 activities:\n`);
      activities.forEach((activity, index) => {
        console.log(`${index + 1}. [${activity.actorRole}] ${activity.title}`);
        console.log(`   Action: ${activity.action}`);
        console.log(`   Created: ${activity.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Count by actor role
    const byRole = await prisma.activityLog.groupBy({
      by: ['actorRole'],
      _count: true,
    });

    console.log('\n📈 Activities by role:');
    byRole.forEach(row => {
      console.log(`   ${row.actorRole}: ${row._count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkActivities();
