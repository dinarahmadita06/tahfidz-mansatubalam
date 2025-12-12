import NextAuth from "next-auth";
import { authConfig } from "../../auth.config.js";

// Log untuk debug
console.log('🔐 Auth configuration loading...');
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('AUTH_SECRET length:', process.env.AUTH_SECRET?.length);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  // NextAuth will auto-detect baseUrl from X-Forwarded-Proto/X-Forwarded-Host headers
  // or use NEXTAUTH_URL from environment
  // This ensures correct redirect regardless of port (3000, 3001, 3002, etc)
});
