import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      // OAuth providers (GitHub) are always allowed — auto-verify their email
      if (account?.provider !== "credentials") {
        if (user.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
        return true;
      }

      // Credentials: block unverified users (unless verification is skipped)
      if (process.env.SKIP_EMAIL_VERIFICATION !== "true") {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { emailVerified: true },
        });

        if (!dbUser?.emailVerified) {
          return `/sign-in?error=EmailNotVerified&email=${encodeURIComponent(user.email || "")}`;
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  ...authConfig,
  providers: [
    ...authConfig.providers.filter(
      (p) => (p as { id?: string }).id !== "credentials"
    ),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});
