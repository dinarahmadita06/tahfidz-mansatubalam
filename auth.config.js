import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./src/lib/prisma.js";
import bcrypt from "bcryptjs";

// Test Prisma connection on startup
let prismaReady = false;
let prismaError = null;

(async () => {
  try {
    console.log('🔗 [AUTH] Testing Prisma connection...');
    await prisma.$queryRaw`SELECT 1`;
    prismaReady = true;
    console.log('✅ [AUTH] Prisma connection successful!');
  } catch (error) {
    prismaError = error;
    console.error('❌ [AUTH] Prisma connection failed:', error.message);
  }
})();

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log('🔐 [AUTH] Authorize attempt for:', credentials?.email);

          // Check if Prisma is ready
          if (!prismaReady && prismaError) {
            console.error('❌ [AUTH] Prisma not ready:', prismaError.message);
            throw new Error("Database connection error. Please try again later.");
          }

          if (!credentials?.email || !credentials?.password) {
            console.error('❌ [AUTH] Missing credentials');
            throw new Error("Email dan password harus diisi");
          }

          console.log('🔍 [AUTH] Looking up user in database...');
          
          let user;
          try {
            user = await prisma.user.findUnique({
              where: {
                email: credentials.email.toLowerCase().trim(),
              },
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
            });
          } catch (dbError) {
            console.error('💥 [AUTH] Database error:', dbError.message);
            throw new Error("Terjadi kesalahan koneksi database. Silakan coba lagi.");
          }

          if (!user) {
            console.error('❌ [AUTH] User not found:', credentials.email);
            throw new Error("Email atau password salah");
          }

          console.log('✅ [AUTH] User found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });

          // Check if user account is active (applies to all roles)
          if (!user.isActive) {
            console.warn('⚠️  [AUTH] User account is not active:', user.email);
            throw new Error("Akun Anda tidak aktif. Silakan hubungi admin sekolah.");
          }

          // Check if user account is active based on role
          if (user.role === 'SISWA') {
            if (!user.siswa) {
              console.error('❌ [AUTH] Siswa profile not found for user');
              throw new Error("Profil siswa tidak ditemukan. Hubungi admin.");
            }
            if (user.siswa.status !== 'approved') {
              console.warn('⚠️  [AUTH] Siswa account status:', user.siswa.status);
              throw new Error(`Akun Anda sedang dalam status ${user.siswa.status}. Hubungi admin untuk persetujuan.`);
            }
            // Check student lifecycle status
            if (user.siswa.statusSiswa !== 'AKTIF') {
              const statusMessages = {
                LULUS: 'Akun Anda tidak aktif karena telah lulus. Silakan hubungi admin sekolah.',
                PINDAH: 'Akun Anda tidak aktif karena telah pindah sekolah. Silakan hubungi admin sekolah.',
                KELUAR: 'Akun Anda sudah tidak aktif. Silakan hubungi admin sekolah.'
              };
              const message = statusMessages[user.siswa.statusSiswa] || 'Akun Anda sudah tidak aktif. Silakan hubungi admin sekolah.';
              console.warn('⚠️  [AUTH] Siswa status:', user.siswa.statusSiswa);
              throw new Error(message);
            }
          }

          if (user.role === 'ORANG_TUA') {
            if (!user.orangTua) {
              console.error('❌ [AUTH] OrangTua profile not found for user');
              throw new Error("Profil orang tua tidak ditemukan. Hubungi admin.");
            }
            
            // Check connected students' status (RULE: parent status depends on children)
            if (!user.orangTua.orangTuaSiswa || user.orangTua.orangTuaSiswa.length === 0) {
              console.warn('⚠️  [AUTH] OrangTua has no connected students');
              throw new Error("Akun Anda belum terhubung dengan siswa. Silakan hubungi admin sekolah.");
            }
            
            // Check if ANY connected student has pending status
            const hasPendingSiswa = user.orangTua.orangTuaSiswa.some(
              (relation) => relation.siswa.status !== 'approved'
            );
            
            if (hasPendingSiswa) {
              console.warn('⚠️  [AUTH] Connected student(s) still pending validation');
              throw new Error("Akun anak masih dalam proses validasi. Silakan tunggu persetujuan admin.");
            }
          }

          console.log('🔑 [AUTH] Comparing password...');
          console.log('🔑 [AUTH] Password hash exists:', !!user.password);
          console.log('🔑 [AUTH] Password hash length:', user.password?.length);

          // Ensure we're using bcryptjs compare properly
          let isPasswordValid = false;
          try {
            isPasswordValid = await bcrypt.compare(
              String(credentials.password),
              String(user.password)
            );
          } catch (bcryptError) {
            console.error('❌ [AUTH] Bcrypt error:', bcryptError.message);
            throw new Error("Terjadi kesalahan saat verifikasi password.");
          }

          console.log('🔑 [AUTH] Password valid:', isPasswordValid);

          if (!isPasswordValid) {
            console.error('❌ [AUTH] Invalid password for:', credentials.email);
            throw new Error("Email atau password salah");
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
          console.error('💥 [AUTH] Error stack:', error.stack);
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
