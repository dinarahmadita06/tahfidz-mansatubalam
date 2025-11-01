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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password harus diisi");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            siswa: true,
            guru: true,
            orangTua: true,
          },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Check if user account is active based on role
        if (user.role === 'SISWA' && user.siswa?.status !== 'approved') {
          throw new Error("Akun Anda belum disetujui oleh admin");
        }

        if (user.role === 'ORANG_TUA' && user.orangTua?.status !== 'approved') {
          throw new Error("Akun Anda belum disetujui oleh admin");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Email atau password salah");
        }

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
