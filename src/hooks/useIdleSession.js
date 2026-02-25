'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * useIdleSession
 * - Tracks user activity and enforces idle timeout on the client
 * - Sends debounced "ping" to server to refresh last-activity httpOnly cookie
 * - Role-based idle timeout (ms):
 *   ADMIN/GURU -> 30 minutes
 *   SISWA/ORANG_TUA -> 120 minutes
 *   default -> 60 minutes
 */
export default function useIdleSession(role) {
  const router = useRouter();
  const pathname = usePathname();
  const lastActivityRef = useRef(Date.now());
  const timerRef = useRef(null);
  const pingCooldownRef = useRef(0);

  const getIdleMs = () => {
    const r = (role || '').toUpperCase();
    if (r === 'ADMIN' || r === 'GURU') return 30 * 60 * 1000;
    if (r === 'SISWA' || r === 'ORANG_TUA') return 2 * 60 * 60 * 1000;
    return 60 * 60 * 1000;
  };

  const scheduleCheck = () => {
    clearTimeout(timerRef.current);
    const remaining = getIdleMs() - (Date.now() - lastActivityRef.current);
    timerRef.current = setTimeout(() => {
      // Client-side redirect on idle timeout
      window.location.href = '/login?reason=idle';
    }, Math.max(remaining, 0));
  };

  const pingServer = async () => {
    const now = Date.now();
    if (now - pingCooldownRef.current < 30_000) return; // throttle to 30s
    pingCooldownRef.current = now;
    try {
      await fetch('/api/auth/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        keepalive: true,
        body: JSON.stringify({ t: now })
      });
    } catch {}
  };

  const markActivity = () => {
    lastActivityRef.current = Date.now();
    scheduleCheck();
    // Debounced server ping
    pingServer();
  };

  useEffect(() => {
    // Initial schedule
    scheduleCheck();

    const listenerOpts = { passive: true };
    const events = ['click', 'keydown', 'scroll', 'input'];
    events.forEach(evt => window.addEventListener(evt, markActivity, listenerOpts));

    // Ping on route change for navigation activity
    markActivity();

    return () => {
      events.forEach(evt => window.removeEventListener(evt, markActivity, listenerOpts));
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, role]);

  // No UI returned
  return null;
}

