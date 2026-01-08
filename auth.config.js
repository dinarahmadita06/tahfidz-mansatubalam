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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password;

        if (!email || !password) {
          throw new Error("Email dan password harus diisi");
        }

        try {
          console.log('🔐 [AUTH] Authorize attempt for:', email);

          // Wrapped user lookup with retry logic
          const user = await withRetry(() =>
            prisma.user.findUnique({
              where: { email },
              include: {
                siswa: true,
                guru: true,
                orangTua: {
                  include: {
                    orangTuaSiswa: {
                      include: {
                        siswa: {
                          select: {
                            status: true,
                            statusSiswa: true
                          }
                        }
                      }
                    }
                  }
                },
              },
            })
          );

          if (!user) {
            console.error('❌ [AUTH] User not found:', email);
            throw new Error("INVALID_CREDENTIALS");
          }

          console.log('✅ [AUTH] User found, comparing password...');

          // Password check
          const isPasswordValid = await bcrypt.compare(String(password), user.password);
          
          if (!isPasswordValid) {
            console.error('❌ [AUTH] Invalid password for:', email);
            throw new Error("INVALID_CREDENTIALS");
          }

          // Check if user account is active (applies to all roles)
          if (!user.isActive) {
            throw new Error("Akun Anda tidak aktif. Silakan hubungi admin sekolah.");
          }

          // Role-specific validation
          if (user.role === 'SISWA') {
            if (!user.siswa) throw new Error("Profil siswa tidak ditemukan.");
            if (user.siswa.status !== 'approved') {
              throw new Error(`Akun Anda sedang dalam status ${user.siswa.status}. Hubungi admin.`);
            }
            if (user.siswa.statusSiswa !== 'AKTIF') {
              throw new Error("Akun Anda sudah nonaktif karena status LULUS.");
            }
          }

          if (user.role === 'ORANG_TUA') {
            if (!user.orangTua) throw new Error("Profil orang tua tidak ditemukan.");
            if (!user.orangTua.orangTuaSiswa || user.orangTua.orangTuaSiswa.length === 0) {
              throw new Error("Akun Anda belum terhubung dengan siswa.");
            }
            const hasPendingSiswa = user.orangTua.orangTuaSiswa.some(r => r.siswa.status !== 'approved');
            if (hasPendingSiswa) {
              throw new Error("Akun anak masih dalam proses validasi.");
            }
          }

          console.log('✅ [AUTH] Authentication successful for:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
            isActive: user.isActive,
            siswaId: user.siswa?.id,
            guruId: user.guru?.id,
            orangTuaId: user.orangTua?.id,
            statusSiswa: user.siswa?.statusSiswa,
          };
        } catch (error) {
          console.error('💥 [AUTH] Error in authorize:', error.message);
          
          if (error.message === "INVALID_CREDENTIALS") {
            throw new Error("Email atau password salah");
          }

          // Generic error for database timeouts/connection issues
          if (error.message.includes('Prisma') || error.message.includes('Can\'t reach database') || error.message.includes('Connection')) {
             throw new Error("Server sedang sibuk. Coba lagi beberapa saat.");
          }

          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🔑 [JWT] Creating token for user:', { id: user.id, role: user.role, isActive: user.isActive });
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
        console.log('📦 [SESSION] Creating session for token:', { id: token.id, role: token.role, isActive: token.isActive });
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
      console.log('🔄 [REDIRECT CALLBACK] url:', url, 'baseUrl:', baseUrl);

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
