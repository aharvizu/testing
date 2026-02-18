import { NextAuthOptions, getServerSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { compare } from 'bcryptjs';
import { prisma } from './db';
import type { Role } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      locationIds: string[];
    };
  }
  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
    locationIds: string[];
  }
}

const providers: NextAuthOptions['providers'] = [];

console.log('[AUTH CONFIG] ENABLE_CREDENTIALS_PROVIDER:', process.env.ENABLE_CREDENTIALS_PROVIDER);
console.log('[AUTH CONFIG] RESEND_API_KEY set:', !!process.env.RESEND_API_KEY);
console.log('[AUTH CONFIG] NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('[AUTH CONFIG] NEXTAUTH_SECRET set:', !!process.env.NEXTAUTH_SECRET);

// Email magic link via Resend
if (process.env.RESEND_API_KEY) {
  providers.push(
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 465,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || 'noreply@dealer.com',
    }),
  );
}

// Credentials provider (local dev)
if (process.env.ENABLE_CREDENTIALS_PROVIDER === 'true') {
  providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] authorize called with email:', credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing email or password');
          return null;
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        console.log('[AUTH] User found:', !!user, user ? { id: user.id, isActive: user.isActive, hasPassword: !!user.hashedPassword, deletedAt: user.deletedAt } : null);
        if (!user || !user.hashedPassword || !user.isActive || user.deletedAt) {
          console.log('[AUTH] User validation failed');
          return null;
        }
        const valid = await compare(credentials.password, user.hashedPassword);
        console.log('[AUTH] Password valid:', valid);
        if (!valid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  );
}

console.log('[AUTH CONFIG] Registered providers:', providers.map((p) => p.name));

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
  providers,
  session: { strategy: 'jwt' },
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        const userLocations = await prisma.userLocation.findMany({
          where: { userId: user.id },
          select: { locationId: true },
        });
        token.locationIds = userLocations.map((ul) => ul.locationId);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.locationIds = token.locationIds;
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN',
          entity: 'User',
          entityId: user.id,
        },
      });
    },
  },
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}
