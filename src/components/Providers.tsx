'use client';

import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from './NotificationProvider';

export function Providers({ children, session }: { children: React.ReactNode; session?: any }) {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
