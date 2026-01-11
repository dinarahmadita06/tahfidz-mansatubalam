import NextAuth from "next-auth";
import { authConfig } from "../../auth.config.js";

// Log untuk debug (Aman untuk production, tidak membocorkan nilai sensitif)
console.log('🔐 [AUTH] Initializing NextAuth...');
const isProd = process.env.NODE_ENV === 'production';
console.log('🌍 [AUTH] Environment:', process.env.NODE_ENV);

// Configuration Audit
const nextAuthSecret = process.env.NEXTAUTH_SECRET;
const authSecret = process.env.AUTH_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log('🔑 [AUTH] NEXTAUTH_SECRET status:', nextAuthSecret ? 'Present' : 'MISSING');
console.log('🔑 [AUTH] AUTH_SECRET status:', authSecret ? 'Present' : 'MISSING');
console.log('🌐 [AUTH] NEXTAUTH_URL:', nextAuthUrl || 'NOT SET (NextAuth will use auto-detection)');

if (isProd) {
  if (!nextAuthSecret) {
    console.error('🛑 [AUTH CONFIG ERROR] NEXTAUTH_SECRET is missing in production environment! This is mandatory.');
  }
  if (!authSecret) {
    console.warn('⚠️ [AUTH CONFIG WARNING] AUTH_SECRET is missing. While NEXTAUTH_SECRET is present, providing both is recommended for compatibility.');
  }
  if (nextAuthUrl && nextAuthUrl.includes('localhost')) {
    console.error('🛑 [AUTH CONFIG ERROR] NEXTAUTH_URL contains "localhost" in production environment! Change this to your production domain in Vercel dashboard.');
  }
  if (!nextAuthUrl) {
    console.warn('⚠️ [AUTH CONFIG WARNING] NEXTAUTH_URL is not set in production. NextAuth will attempt auto-detection.');
  }
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
