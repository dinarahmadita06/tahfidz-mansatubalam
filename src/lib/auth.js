import NextAuth from "next-auth";
import { authConfig } from "../../auth.config.js";

// Log untuk debug
console.log('🔐 Auth configuration loading...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('AUTH_SECRET length:', process.env.AUTH_SECRET?.length);
console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

let auth, handlers, signIn, signOut;

try {
  const result = NextAuth({
    ...authConfig,
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
