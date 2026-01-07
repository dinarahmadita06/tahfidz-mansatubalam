'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

export default function SessionProvider({ children }) {
  return (
    <NextAuthSessionProvider 
      refetchOnWindowFocus={false}
      refetchInterval={5 * 60} // 5 minutes
    >
      {children}
    </NextAuthSessionProvider>
  );
}
