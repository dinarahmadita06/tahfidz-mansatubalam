'use client';

import useIdleSession from '@/hooks/useIdleSession';

export default function IdleMount({ role }) {
  useIdleSession(role);
  return null;
}

