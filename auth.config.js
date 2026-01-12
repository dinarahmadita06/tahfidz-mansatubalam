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

        if (!identifier || !password) {
          throw new Error("Username atau password salah");
        }

        try {
          // 1. Logic khusus Admin
          if (identifier === 'admin.tahfidz1') {
            const user = await withRetry(() =>
              prisma.user.findUnique({
                where: { username: 'admin.tahfidz1' }
              })
            );

            if (!user || !user.password || user.role !== 'ADMIN') {
              throw new Error("Username atau password salah");
            }

            const isValid = await bcrypt.compare(String(password), user.password);
            if (!isValid) throw new Error("Username atau password salah");

            if (!user.isActive) throw new Error("Akun Anda tidak aktif.");

            return { id: user.id, email: user.email, username: user.username, name: user.name, role: user.role, isActive: user.isActive };
          }

          // 2. Logic untuk Guru, Siswa, dan Orang Tua
          // Cari semua user yang mungkin cocok (username, email, atau suffix _wali)
          const potentialUsers = await withRetry(() =>
            prisma.user.findMany({
              where: { 
                OR: [
                  { username: identifier },
                  { username: identifier + '_wali' }, // Support login ortu pake NIS anak
                  { email: identifier.includes('@') ? identifier : undefined }
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
            throw new Error("Username atau password salah");
          }

          let authenticatedUser = null;

          for (const user of potentialUsers) {
            if (!user.password) continue;

            // SECURITY: Orang Tua login tidak menerima email
            if (user.role === 'ORANG_TUA' && identifier.includes('@')) {
              continue;
            }

            let isValid = await bcrypt.compare(String(password), user.password);

            // Fallback untuk Siswa/Orang Tua jika password format tanggal (YYYY-MM-DD vs DDMMYYYY)
            if (!isValid && (user.role === 'ORANG_TUA' || user.role === 'SISWA')) {
              let birthDate;
              if (user.role === 'SISWA' && user.siswa?.tanggalLahir) {
                birthDate = new Date(user.siswa.tanggalLahir);
              } else if (user.role === 'ORANG_TUA' && user.orangTua?.orangTuaSiswa?.[0]?.siswa?.tanggalLahir) {
                birthDate = new Date(user.orangTua.orangTuaSiswa[0].siswa.tanggalLahir);
              }

              if (birthDate) {
                const ddmmyyyy = String(birthDate.getDate()).padStart(2, '0') + 
                                 String(birthDate.getMonth() + 1).padStart(2, '0') + 
                                 birthDate.getFullYear();
                
                const yyyymmdd = birthDate.getFullYear() + '-' + 
                                 String(birthDate.getMonth() + 1).padStart(2, '0') + 
                                 String(birthDate.getDate()).padStart(2, '0');

                if (String(password) === ddmmyyyy || String(password) === yyyymmdd) {
                  // Verifikasi ulang terhadap hash di database menggunakan format yyyy-mm-dd (default password di seed)
                  isValid = await bcrypt.compare(yyyymmdd, user.password);
                }
              }
            }

            if (isValid) {
              authenticatedUser = user;
              break;
            }
          }

          if (!authenticatedUser) {
            throw new Error("Username atau password salah");
          }

          if (!authenticatedUser.isActive) {
            throw new Error("Akun Anda tidak aktif.");
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
        token.username = user.username;
        token.email = user.role === 'ORANG_TUA' ? undefined : user.email;
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
        session.user.username = token.username;
        session.user.email = token.role === 'ORANG_TUA' ? undefined : token.email;
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
