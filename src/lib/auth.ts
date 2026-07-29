import { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import AppleProvider from 'next-auth/providers/apple';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { checkAndAwardBadges } from './badges';
import connectDB from './mongodb';
import User from '@/models/User';

const client = new MongoClient(process.env.MONGODB_URI!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || process.env.APPLE_ID || '',
      // NextAuth supports object form for clientSecret which will be signed for you
      clientSecret: {
        teamId: process.env.APPLE_TEAM_ID || '',
        privateKey: (process.env.APPLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
        keyId: process.env.APPLE_KEY_ID || '',
      } as any,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: Record<string, string> | undefined) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

        await connectDB();
        
        const user = await User.findOne({ email: credentials.email });
        
        if (!user) {
          return null;
        }

        // Validate password using bcrypt
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password || '');
        
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }): Promise<JWT> {
      if (user) {
        token.id = (user as any).id || (user as any)._id?.toString();
        token.email = (user as any).email;
        token.name = (user as any).name;
        token.role = (user as any).role;
      }

      if (token.email) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });

        if (dbUser) {
          token.role = dbUser.role;
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (dbUser.lastLogin && dbUser.lastLogin.toDateString() === yesterday.toDateString()) {
            dbUser.loginStreak = (dbUser.loginStreak || 0) + 1;
          } else if (!dbUser.lastLogin || dbUser.lastLogin.toDateString() !== today.toDateString()) {
            dbUser.loginStreak = 1;
          }

          dbUser.lastLogin = today;
          await dbUser.save();
          await checkAndAwardBadges(dbUser._id.toString());
        }
      }

      // Refresh token logic
      if (account && account.type === 'credentials') {
        token.accessToken = (account as any).access_token;
        (token as any).refreshToken = (account as any).refresh_token;
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token) {
        session.user.id = token.id as string | undefined;
        session.user.email = token.email as string | undefined;
        session.user.name = token.name as string | undefined;
        session.user.role = token.role as string | undefined;
        session.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    newUser: '/auth/signup',
  },
};
