import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./src/lib/prisma.js";
import bcrypt from "bcryptjs";

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

          if (!credentials?.email || !credentials?.password) {
            console.error('❌ [AUTH] Missing credentials');
            throw new Error("Email dan password harus diisi");
          }

          console.log('🔍 [AUTH] Looking up user in database...');
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email.toLowerCase().trim(),
            },
            include: {
              siswa: true,
              guru: true,
              orangTua: true,
            },
          });

          if (!user) {
            console.error('❌ [AUTH] User not found:', credentials.email);
            throw new Error("Email atau password salah");
          }

          console.log('✅ [AUTH] User found:', { id: user.id, email: user.email, role: user.role });

          // Check if user account is active based on role
          if (user.role === 'SISWA' && user.siswa?.status !== 'approved') {
            console.error('❌ [AUTH] Siswa account not approved');
            throw new Error("Akun Anda belum disetujui oleh admin");
          }

          if (user.role === 'ORANG_TUA' && user.orangTua?.status !== 'approved') {
            console.error('❌ [AUTH] Orang tua account not approved');
            throw new Error("Akun Anda belum disetujui oleh admin");
          }

          console.log('🔑 [AUTH] Comparing password...');
          console.log('🔑 [AUTH] Password hash exists:', !!user.password);
          console.log('🔑 [AUTH] Password hash length:', user.password?.length);

          // Ensure we're using bcryptjs compare properly
          const isPasswordValid = await bcrypt.compare(
            String(credentials.password),
            String(user.password)
          );

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
            siswaId: user.siswa?.id,
            guruId: user.guru?.id,
            orangTuaId: user.orangTua?.id,
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
        console.log('🔑 [JWT] Creating token for user:', { id: user.id, role: user.role });
        token.id = user.id;
        token.role = user.role;
        token.siswaId = user.siswaId;
        token.guruId = user.guruId;
        token.orangTuaId = user.orangTuaId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('📦 [SESSION] Creating session for token:', { id: token.id, role: token.role });
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.siswaId = token.siswaId;
        session.user.guruId = token.guruId;
        session.user.orangTuaId = token.orangTuaId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔄 [REDIRECT CALLBACK] url:', url, 'baseUrl:', baseUrl);

      // If url is a relative path, prepend baseUrl
      if (url.startsWith('/')) {
        const fullUrl = `${baseUrl}${url}`;
        console.log('🔄 [REDIRECT CALLBACK] Returning relative URL:', fullUrl);
        return fullUrl;
      }

      // If url already contains the baseUrl, return it
      if (url.startsWith(baseUrl)) {
        console.log('🔄 [REDIRECT CALLBACK] Returning full URL:', url);
        return url;
      }

      // Default: return baseUrl (will be handled by client-side redirect)
      console.log('🔄 [REDIRECT CALLBACK] Returning baseUrl:', baseUrl);
      return baseUrl;
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
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};
