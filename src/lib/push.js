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
          // Cleanup invalid subscriptions (410 Gone or 404 Not Found)
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[PUSH] Cleaning up invalid subscription for user ${userId}: ${sub.endpoint}`);
            await prisma.pushSubscription.update({
              where: { id: sub.id },
              data: { isActive: false },
            });
          } else {
            console.error(`[PUSH] Error sending to ${sub.endpoint}:`, error.message);
          }
          return { success: false, endpoint: sub.endpoint, error: error.message };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;
    console.log(`[PUSH] Sent to user ${userId}: ${successCount} success, ${failCount} fail`);

    return { success: true, results, successCount, failCount };
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
 * Broadcast announcement to all relevant roles (GURU & SISWA only)
 */
export async function broadcastAnnouncement(judul, pengumumanId) {
  try {
    console.log(`[PUSH] Broadcasting announcement: ${judul}`);
    
    const payload = {
      title: "Pengumuman Baru",
      body: judul,
      url: "/pengumuman", // Target URL for both roles
      icon: "/logo-man1.png",
      badge: "/logo-man1.png",
      data: {
        id: pengumumanId,
        url: "/pengumuman"
      }
    };

    // Only send to GURU and SISWA as per requirement
    const roles = ['GURU', 'SISWA'];
    const results = await sendPushToRoles(roles, payload);
    
    if (results && results.length > 0) {
      const totalSuccess = results.reduce((acc, r) => acc + (r.status === 'fulfilled' ? r.value.successCount || 0 : 0), 0);
      const totalFail = results.reduce((acc, r) => acc + (r.status === 'fulfilled' ? r.value.failCount || 0 : 0), 0);
      console.log(`[PUSH] Broadcast complete. Total targets: ${results.length} users. Total success: ${totalSuccess} devices, Total fail: ${totalFail} devices.`);
    }

    return { success: true };
  } catch (error) {
    console.error('[PUSH] Error in broadcastAnnouncement:', error);
    return { success: false, error: error.message };
  }
}
