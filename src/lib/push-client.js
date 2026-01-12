/**
 * Client-side utility for Web Push Notifications
 */

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String) {
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
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  const registration = await navigator.serviceWorker.register('/sw.js');
  return registration;
}

export async function subscribeToPush() {
  const registration = await registerServiceWorker();
  
  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  const subscribeOptions = {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    ),
  };

  const subscription = await registration.pushManager.subscribe(subscribeOptions);
  
  // Send to backend
  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subscription,
      userAgent: navigator.userAgent
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save subscription on server');
  }

  return subscription;
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
