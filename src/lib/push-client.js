/**
 * Client-side utility for Web Push Notifications
 */

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  if (!base64String || typeof base64String !== 'string') {
    throw new Error('VAPID key belum diset atau format tidak valid');
  }
  
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined') return null;

  if (!('serviceWorker' in navigator)) {
    throw new Error('Browser Anda tidak mendukung Service Worker');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw new Error('Gagal mendaftarkan Service Worker');
  }
}

export async function subscribeToPush() {
  // 1. Environmental Guard
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Push Debug - VAPID Key Present:', Boolean(vapidKey));
    if (vapidKey) {
      console.log('Push Debug - VAPID Key Prefix:', vapidKey.substring(0, 6));
    }
  }

  if (!vapidKey || vapidKey.trim().length === 0) {
    throw new Error('VAPID key belum diset');
  }

  // 2. Browser Support Guard
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Browser ini tidak mendukung push notifikasi');
  }

  // 3. Permission Guard
  if (Notification.permission === 'denied') {
    throw new Error('Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.');
  }

  const registration = await registerServiceWorker();
  if (!registration) throw new Error('Service worker tidak tersedia');
  
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  try {
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    
    if (!subscription || !subscription.endpoint) {
      throw new Error('Gagal mendapatkan data subscription dari browser');
    }

    // 4. API Hardening
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Gagal menyimpan subscription di server';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return subscription;
  } catch (error) {
    console.error('Error during push subscription:', error);
    throw error;
  }
}

export async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  // Send to backend first
  await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
    }),
  });

  // Unsubscribe from browser
  await subscription.unsubscribe();
}

export async function getPushSubscriptionState() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return 'unsupported';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return 'unsubscribed';

  const subscription = await registration.pushManager.getSubscription();
  return subscription ? 'subscribed' : 'unsubscribed';
}
