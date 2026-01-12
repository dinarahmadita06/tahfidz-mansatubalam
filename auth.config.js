import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./src/lib/prisma.js";
import bcrypt from "bcryptjs";

/**
 * Lightweight retry wrapper for database queries
 * Helps mitigate random connection timeouts in serverless environments
 */
async function withRetry(fn, retries = 2, delay = 800) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`⚠️ [AUTH] Database attempt ${i + 1} failed, retrying...`);
      if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Username/NIS", type: "text" }, // Standardized field name
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        // 1. Batasi input login: hanya username admin.tahfidz1
        if (!identifier || identifier.includes('@') || identifier !== 'admin.tahfidz1') {
          throw new Error("Username atau password salah");
        }

        if (!password) {
          throw new Error("Username atau password salah");
        }

        try {
          // 2. Lookup user hanya berdasarkan username admin.tahfidz1
          const user = await withRetry(() =>
            prisma.user.findUnique({
              where: { username: 'admin.tahfidz1' }
            })
          );

          // 3. Pastikan bcrypt compare dan struktur data benar
          if (!user || !user.password || typeof user.password !== 'string') {
            throw new Error("Username atau password salah");
          }

          // Validasi hash bcrypt (prefix $2 dan length 60)
          if (!user.password.startsWith('$2') || user.password.length !== 60) {
            console.error('🛑 [AUTH] Invalid password hash format in database');
            throw new Error("Username atau password salah");
          }

          const isValid = await bcrypt.compare(String(password), user.password);

          if (!isValid) {
            throw new Error("Username atau password salah");
          }

          if (!user.isActive) {
            throw new Error("Akun Anda tidak aktif. Silakan hubungi admin sekolah.");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          };
        } catch (error) {
          if (error.message === "Username atau password salah" || error.message.includes("tidak aktif")) {
            throw error;
          }
          console.error('💥 [AUTH] authorize error:', error.message);
          throw new Error("Username atau password salah");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
// No log for performance

        token.id = user.id;
        token.role = user.role;
        token.isActive = user.isActive;
        token.siswaId = user.siswaId;
        token.guruId = user.guruId;
        token.orangTuaId = user.orangTuaId;
        token.statusSiswa = user.statusSiswa;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
// No log for performance

        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isActive = token.isActive;
        session.user.siswaId = token.siswaId;
        session.user.guruId = token.guruId;
        session.user.orangTuaId = token.orangTuaId;
        session.user.statusSiswa = token.statusSiswa;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
// No log for performance


      // If url starts with / (relative path), it's safe to prepend baseUrl
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('🔄 [REDIRECT CALLBACK] Returning relative URL:', fullUrl);
        return fullUrl;
      }

      // If url already contains the baseUrl, return it as-is
      if (url.startsWith(baseUrl)) {
        console.log('🔄 [REDIRECT CALLBACK] Returning full URL:', url);
        return url;
      }

      // Fallback to login page using baseUrl (which is auto-detected from X-Forwarded-Proto/X-Forwarded-Host)
      const loginUrl = `${baseUrl}/login`;
      console.log('🔄 [REDIRECT CALLBACK] Redirecting to login:', loginUrl);
      return loginUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
