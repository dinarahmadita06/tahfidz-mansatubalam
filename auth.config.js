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
        rememberMe: { label: "Remember Me", type: "text" }
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim().toUpperCase();
        const password = credentials?.password;
        const rememberMe = credentials?.rememberMe === 'true';

        if (!identifier || !password) {
          throw new Error("Username atau password salah");
        }

        try {
          // 1. Logic khusus Admin
          if (identifier === 'ADMIN.TAHFIDZ1') {
            const user = await withRetry(() =>
              prisma.user.findUnique({
                where: { username: 'admin.tahfidz1' }
              })
            );

            if (!user || !user.password || user.role !== 'ADMIN') {
              return null;
            }

            const isValid = await bcrypt.compare(String(password), user.password);
            if (!isValid) return null;

            if (!user.isActive) throw new Error("Akun Anda tidak aktif.");

            return { 
              id: user.id, 
              email: user.email, 
              username: user.username, 
              name: user.name, 
              role: user.role, 
              isActive: user.isActive,
              rememberMe 
            };
          }

          // 2. Logic untuk Guru, Siswa, dan Orang Tua
          // Cari semua user yang mungkin cocok (username, email, atau suffix _wali)
          const potentialUsers = await withRetry(() =>
            prisma.user.findMany({
              where: { 
                OR: [
                  { username: identifier },
                  { username: identifier + '_WALI' }, // Support login ortu pake NIS anak
                  { email: identifier.includes('@') ? identifier.toLowerCase() : undefined }
                ].filter(Boolean),
                role: { not: 'ADMIN' }
              },
              include: {
                siswa: true,
                guru: true,
                orangTua: {
                  include: {
                    orangTuaSiswa: {
                      include: { siswa: true }
                    }
                  }
                },
              }
            })
          );

          if (!potentialUsers || potentialUsers.length === 0) {
            console.log('🔍 No potential users found for identifier:', identifier);
            return null;
          }

          console.log('🔍 Found potential users:', potentialUsers.length);
          let authenticatedUser = null;

          for (const user of potentialUsers) {
            console.log('🔍 Checking user:', user.id, user.name, user.role, user.isActive);
            if (!user.password) {
              console.log('⚠️  User has no password');
              continue;
            }

            // SECURITY: Orang Tua login tidak menerima email
            if (user.role === 'ORANG_TUA' && identifier.includes('@')) {
              console.log('⚠️  Parent login with email blocked');
              continue;
            }

            let isValid = await bcrypt.compare(String(password), user.password);
            console.log('🔐 Password validation result:', isValid);

            if (isValid) {
              authenticatedUser = user;
              console.log('✅ Password validated successfully');
              break;
            }
          }

          if (!authenticatedUser) {
            console.log('❌ No authenticated user found after validation');
            return null;
          }

          // Check if user is active, with special handling for parent accounts
          if (!authenticatedUser.isActive) {
            // For parent accounts, check if any of their children are active
            if (authenticatedUser.role === 'ORANG_TUA') {
              let hasActiveChild = false;
              
              if (authenticatedUser.orangTua && authenticatedUser.orangTua.orangTuaSiswa) {
                for (const relation of authenticatedUser.orangTua.orangTuaSiswa) {
                  if (relation.siswa && relation.siswa.statusSiswa === 'AKTIF') {
                    hasActiveChild = true;
                    break;
                  }
                }
              }
              
              // If parent has active children, allow login despite inactive status
              if (hasActiveChild) {
                console.log('✅ Parent account allowed to login (has active children)');
              } else {
                console.log('⚠️  Parent account is not active and has no active children:', authenticatedUser.id);
                throw new Error("Akun Anda tidak aktif.");
              }
            } else {
              // For non-parent accounts, inactive means blocked
              console.log('⚠️  User account is not active:', authenticatedUser.id);
              throw new Error("Akun Anda tidak aktif.");
            }
          }

          return {
            id: authenticatedUser.id,
            email: authenticatedUser.role === 'ORANG_TUA' ? undefined : authenticatedUser.email,
            username: authenticatedUser.username,
            name: authenticatedUser.name,
            role: authenticatedUser.role,
            isActive: authenticatedUser.isActive,
            siswaId: authenticatedUser.siswa?.id,
            guruId: authenticatedUser.guru?.id,
            orangTuaId: authenticatedUser.orangTua?.id,
            rememberMe,
            isRecoveryCodeSetup: authenticatedUser.isRecoveryCodeSetup
          };
        } catch (error) {
          if (error.message.includes("tidak aktif")) {
            throw error;
          }
          console.error('💥 [AUTH] authorize error:', error.message);
          return null; // Return null instead of throwing to avoid CallbackRouteError
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
        token.username = user.username;
        token.email = user.role === 'ORANG_TUA' ? undefined : user.email;
        token.isActive = user.isActive;
        token.siswaId = user.siswaId;
        token.guruId = user.guruId;
        token.orangTuaId = user.orangTuaId;
        token.statusSiswa = user.statusSiswa;
        token.rememberMe = user.rememberMe;
        token.isRecoveryCodeSetup = user.isRecoveryCodeSetup;

        // Dynamic session length based on rememberMe
        // Default is 30 days if rememberMe is true, else 1 day (or session-only if possible)
        const ONE_DAY = 24 * 60 * 60;
        const THIRTY_DAYS = 30 * ONE_DAY;
        
        const now = Math.floor(Date.now() / 1000);
        if (user.rememberMe) {
          token.exp = now + THIRTY_DAYS;
        } else {
          token.exp = now + ONE_DAY; // Faster expiry for privacy
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
// No log for performance

        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.email = token.role === 'ORANG_TUA' ? undefined : token.email;
        session.user.isActive = token.isActive;
        session.user.siswaId = token.siswaId;
        session.user.guruId = token.guruId;
        session.user.orangTuaId = token.orangTuaId;
        session.user.statusSiswa = token.statusSiswa;
        session.user.isRecoveryCodeSetup = token.isRecoveryCodeSetup;
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
