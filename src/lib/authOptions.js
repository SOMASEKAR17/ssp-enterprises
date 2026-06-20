import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      const email = (user.email || '').toLowerCase().trim();
      if (!email) return false;

      // Determine intended role at sign-in time
      let role = 'CUSTOMER';
      if (email === ADMIN_EMAIL) {
        role = 'ADMIN';
      } else {
        const invite = await prisma.operatorInvite.findUnique({ where: { email } });
        if (invite) role = 'OPERATOR';
      }

      // For OAuth (Google), find or create the user record ourselves to
      // ensure the role is set correctly, since PrismaAdapter creates users
      // without our custom role logic on first sign in.
      if (account?.provider === 'google') {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          // Promote role if it should be elevated (e.g. admin email, or newly invited operator)
          if (
            (role === 'ADMIN' && existing.role !== 'ADMIN') ||
            (role === 'OPERATOR' && existing.role === 'CUSTOMER')
          ) {
            await prisma.user.update({ where: { email }, data: { role } });
          }
          if (!existing.isActive) return false;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      // On sign in, attach role from DB (source of truth)
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Refresh role from DB periodically / on update, in case admin changed it
      if (!user || trigger === 'update') {
        const email = (token.email || '').toLowerCase().trim();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isActive = dbUser.isActive;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'CUSTOMER';
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
