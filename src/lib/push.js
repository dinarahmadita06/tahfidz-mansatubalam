import webpush from 'web-push';
import { prisma } from '@/lib/db';

// Configure web-push with VAPID keys
// Backend uses VAPID_PUBLIC_KEY, if missing we fallback to NEXT_PUBLIC version
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  console.warn('⚠️ [PUSH] VAPID keys are missing. Push notifications will not be sent.');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@simtaq.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  console.log('✅ [PUSH] web-push configured successfully');
}

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
      include: {
        user: {
          select: { username: true, role: true }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log(`[PUSH] No active push subscriptions found for user ${userId}`);
      return { success: false, message: 'No subscriptions found' };
    }

    console.log(`[PUSH] Target: ${subscriptions.length} devices for user ${userId}`);

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

          const response = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
          console.log(`[PUSH] SUCCESS | Code: ${response.statusCode} | User: ${sub.user?.username} (${sub.user?.role})`);
          return { success: true, endpoint: sub.endpoint, statusCode: response.statusCode };
        } catch (error) {
          const statusCode = error.statusCode || 500;
          
          if (statusCode === 410 || statusCode === 404) {
            console.warn(`[PUSH] DEACTIVATE | Code: ${statusCode} | Removing expired subscription for ${sub.user?.username}`);
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          } else {
            console.error(`[PUSH] ERROR | Code: ${statusCode} | Msg: ${error.message} | User: ${sub.user?.username}`);
          }
          return { success: false, endpoint: sub.endpoint, statusCode };
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
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        isActive: true,
        user: {
          role: { in: roles },
          isActive: true
        }
      },
      include: {
        user: {
          select: { username: true, role: true }
        }
      }
    });

    if (subscriptions.length === 0) {
      console.log(`[PUSH] No active subscriptions found for roles: ${roles.join(', ')}`);
      return { success: true, count: 0 };
    }

    console.log(`[PUSH] Target: ${subscriptions.length} devices for roles: ${roles.join(', ')}`);

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

          const response = await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
          console.log(`[PUSH] SUCCESS | Code: ${response.statusCode} | User: ${sub.user?.username} (${sub.user?.role})`);
          return { success: true, endpoint: sub.endpoint, statusCode: response.statusCode };
        } catch (error) {
          const statusCode = error.statusCode || 500;
          
          if (statusCode === 410 || statusCode === 404) {
            console.warn(`[PUSH] DEACTIVATE | Code: ${statusCode} | Removing expired subscription for ${sub.user?.username}`);
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
          } else if (statusCode === 401 || statusCode === 403) {
            console.error(`[PUSH] CONFIG ERROR | Code: ${statusCode} | VAPID keys invalid or unauthorized`);
          } else {
            console.error(`[PUSH] ERROR | Code: ${statusCode} | Msg: ${error.message} | User: ${sub.user?.username}`);
          }
          
          return { success: false, endpoint: sub.endpoint, statusCode };
        }
      })
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`[PUSH] Summary: ${successCount}/${subscriptions.length} successfully sent.`);
    
    return { success: true, total: subscriptions.length, successCount };
  } catch (error) {
    console.error('[PUSH] Fatal error in sendPushToRoles:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Broadcast announcement to all relevant roles (GURU, SISWA, ORANG_TUA)
 */
export async function broadcastAnnouncement(judul, pengumumanId) {
  try {
    console.log(`[PUSH] Broadcasting announcement: ${judul}`);
    
    const payload = {
      id: pengumumanId, // Pass ID for SW tag
      title: "SIMTAQ",
      body: judul || "Pengumuman baru",
      url: `/pengumuman?id=${pengumumanId}`,
      icon: "/logo-man1.png",
      badge: "/logo-man1.png",
      data: {
        id: pengumumanId,
        url: `/pengumuman?id=${pengumumanId}`
      }
    };

    // Target all primary users
    const roles = ['GURU', 'SISWA', 'ORANG_TUA'];
    return await sendPushToRoles(roles, payload);
  } catch (error) {
    console.error('[PUSH] Error in broadcastAnnouncement:', error);
    return { success: false, error: error.message };
  }
}
