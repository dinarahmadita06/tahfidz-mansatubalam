import NextAuth from "next-auth";
import { authConfig } from "../../auth.config.js";

// Log untuk debug
console.log('🔐 Auth configuration loading...');
console.log('AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
console.log('AUTH_SECRET length:', process.env.AUTH_SECRET?.length);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
});
