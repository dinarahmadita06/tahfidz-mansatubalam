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
        let identifier = credentials?.identifier?.trim(); // Standardized field name with proper trimming
        const password = credentials?.password;

        // Normalize identifier: uppercase for teacher pattern
        if (identifier && /^g\d+$/i.test(identifier)) {
          identifier = identifier.toUpperCase();
        }

        if (!identifier || !password) {
          throw new Error("Username/NIS dan password harus diisi");
        }

        try {
          // Wrapped user lookup with retry logic
          // 1. Try to find user directly (email or username)
          let potentialUsers = await withRetry(() =>
            prisma.user.findMany({
              where: {
                OR: [
                  { email: identifier },
                  { username: identifier }
                ]
              },
              include: {
                siswa: true,
                guru: true,
                orangTua: {
                  include: {
                    orangTuaSiswa: {
                      include: {
                        siswa: true
                      }
                    }
                  }
                },
              },
            })
          );

          // 2. If identifier is numeric (NIS), also find via Siswa table
          if (/^\d+$/.test(identifier)) {
            const usersByNIS = await withRetry(() =>
              prisma.user.findMany({
                where: {
                  OR: [
                    {
                      siswa: {
                        nis: identifier
                      }
                    },
                    {
                      orangTua: {
                        orangTuaSiswa: {
                          some: {
                            siswa: {
                              nis: identifier
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                include: {
                  siswa: true,
                  guru: true,
                  orangTua: {
                    include: {
                      orangTuaSiswa: {
                        include: {
                          siswa: true
                        }
                      }
                    }
                  },
                },
              })
            );
            
            // Merge unique users
            const existingIds = new Set(potentialUsers.map(u => u.id));
            for (const u of usersByNIS) {
              if (!existingIds.has(u.id)) {
                potentialUsers.push(u);
              }
            }
          }

          if (potentialUsers.length === 0) {
            console.error('❌ [AUTH] User not found:', identifier);
            throw new Error("INVALID_CREDENTIALS");
          }

          let user = null;
          let isLegacyMatch = false;

          // 3. Try password against each potential user
          for (const u of potentialUsers) {
            // Secure debug logging (non-sensitive)
            const passPrefix = u.password?.substring(0, 7) || 'none';
            console.log(`🔍 [AUTH] Attempting login for: ${u.username || u.email} (${u.role}) | Hash prefix: ${passPrefix}... | Hash length: ${u.password?.length || 0}`);

            let isValid = await bcrypt.compare(String(password), u.password);
            
            // Fallback for Parent data inconsistency (Legacy YYYY-MM-DD passwords)
            if (!isValid && u.role === 'ORANG_TUA' && u.orangTua?.orangTuaSiswa?.[0]?.siswa?.tanggalLahir) {
              const birthDate = new Date(u.orangTua.orangTuaSiswa[0].siswa.tanggalLahir);
              const ddmmyyyy = String(birthDate.getDate()).padStart(2, '0') + 
                               String(birthDate.getMonth() + 1).padStart(2, '0') + 
                               birthDate.getFullYear();
              
              const yyyymmdd = birthDate.getFullYear() + '-' + 
                               String(birthDate.getMonth() + 1).padStart(2, '0') + 
                               String(birthDate.getDate()).padStart(2, '0');

              // If input password matches DDMMYYYY and DB hash matches YYYY-MM-DD
              if (String(password) === ddmmyyyy) {
                if (await bcrypt.compare(yyyymmdd, u.password)) {
                  console.warn(`⚠️ [AUTH] Legacy password format (YYYY-MM-DD) detected for Parent: ${u.email}. Auto-migrating to DDMMYYYY.`);
                  
                  // Auto-migrate the password
                  const newHashedPassword = await bcrypt.hash(ddmmyyyy, 10);
                  await prisma.user.update({
                    where: { id: u.id },
                    data: { password: newHashedPassword }
                  });
                  
                  isValid = true;
                  isLegacyMatch = true;
                }
              }
            }

            if (isValid) {
              user = u;
              break;
            }
          }

          if (!user) {
            console.error('❌ [AUTH] Invalid password for:', identifier);
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

// No log for performance


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
            throw new Error("Username atau password salah");
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
