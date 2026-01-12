import webpush from 'web-push';
import { prisma } from '@/lib/db';

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@simtaq.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a specific user
 */
export async function sendPushNotification(userId, payload) {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId,
        isActive: true,
      },
    });

    if (subscriptions.length === 0) {
      console.log(`No active push subscriptions found for user ${userId}`);
      return { success: false, message: 'No subscriptions found' };
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
          return { success: true, endpoint: sub.endpoint };
        } catch (error) {
          console.error(`Error sending push to ${sub.endpoint}:`, error);

          // Cleanup invalid subscriptions (410 Gone or 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`Cleaning up invalid subscription: ${sub.endpoint}`);
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    return { success: true, results };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a push notification to multiple users (e.g. for announcements)
 */
export async function sendPushToUsers(userIds, payload) {
  return Promise.allSettled(
    userIds.map((userId) => sendPushNotification(userId, payload))
  );
}

/**
 * Send a push notification to all active users with specific roles
 */
export async function sendPushToRoles(roles, payload) {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: roles },
        isActive: true,
      },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    return sendPushToUsers(userIds, payload);
  } catch (error) {
    console.error(`Error in sendPushToRoles for roles ${roles}:`, error);
  }
}

/**
 * Broadcast announcement to all relevant roles
 */
export async function broadcastAnnouncement(judul, pengumumanId) {
  try {
    // 1. Send to Parents
    await sendPushToRoles(['ORANG_TUA'], {
      title: "Pengumuman Baru",
      body: judul,
      url: "/orangtua/pengumuman"
    });

    // 2. Send to Teachers
    await sendPushToRoles(['GURU'], {
      title: "Pengumuman Baru",
      body: judul,
      url: "/guru/pengumuman"
    });

    // 3. Send to Students
    await sendPushToRoles(['SISWA'], {
      title: "Pengumuman Baru",
      body: judul,
      url: "/siswa/pengumuman"
    });

    return { success: true };
  } catch (error) {
    console.error('Error in broadcastAnnouncement:', error);
    return { success: false, error: error.message };
  }
}
