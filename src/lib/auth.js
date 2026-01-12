import NextAuth from "next-auth";
import { authConfig } from "../../auth.config.js";

// Log untuk debug (Aman untuk production, tidak membocorkan nilai sensitif)
console.log('🔐 [AUTH] Initializing NextAuth...');
const isProd = process.env.NODE_ENV === 'production';
console.log('🌍 [AUTH] Environment:', process.env.NODE_ENV);

// Configuration Audit for Admin Login Fix
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const authSecret = process.env.AUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log('🔐 [AUTH] AUTH_SECRET status:', (authSecret || nextAuthSecret) ? 'SET (true)' : 'MISSING (false)');
if (nextAuthUrl) {
  try {
    const domain = new URL(nextAuthUrl).hostname;
    console.log('🌐 [AUTH] NEXTAUTH_URL domain:', domain);
  } catch (e) {
    console.log('🌐 [AUTH] NEXTAUTH_URL domain: invalid URL');
  }
} else {
  console.log('🌐 [AUTH] NEXTAUTH_URL: NOT SET');
}

let auth, handlers, signIn, signOut;

try {
  // Use NEXTAUTH_SECRET as primary fallback to match user instructions
  const finalSecret = nextAuthSecret || authSecret;
  
  const result = NextAuth({
    ...authConfig,
    secret: finalSecret,
    trustHost: true,
    // NextAuth will auto-detect baseUrl from X-Forwarded-Proto/X-Forwarded-Host headers
    // or use NEXTAUTH_URL from environment
    // This ensures correct redirect regardless of port (3000, 3001, 3002, etc)
  });
  
  auth = result.auth;
  handlers = result.handlers;
  signIn = result.signIn;
  signOut = result.signOut;
  
  console.log('✅ NextAuth initialized successfully!');
} catch (error) {
  console.error('💥 [AUTH] Failed to initialize NextAuth:', error.message);
  console.error('💥 [AUTH] Error stack:', error.stack);
  throw error;
}

export { handlers, auth, signIn, signOut };
