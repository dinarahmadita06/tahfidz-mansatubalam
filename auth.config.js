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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.siswaId = token.siswaId;
        session.user.guruId = token.guruId;
        session.user.orangTuaId = token.orangTuaId;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Get the token to check user role
      // This will be called after successful sign in
      return baseUrl; // Let middleware handle the role-based redirect
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};
