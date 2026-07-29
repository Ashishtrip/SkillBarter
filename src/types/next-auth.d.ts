import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    // Add `id` to the user object returned in NextAuth sessions
    user: DefaultSession['user'] & { id?: string; role?: string };
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    accessToken?: string;
  }
}
