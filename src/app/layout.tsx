import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'SkillBarter - Exchange Skills, Grow Together',
  description: 'A platform where people can barter skills with each other. Teach what you know, learn what you need.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;
  try {
    session = await getServerSession(authOptions as any);
  } catch (e) {
    session = null;
  }
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <ErrorBoundary>
          <Providers session={session}>
            <div className="min-h-screen bg-secondary-50">
              {/* Header - visible on all devices */}
              <Header />

              {/* Sidebar - visible on desktop only */}
              <Sidebar />

              {/* Main content area */}
              <main className="lg:ml-64 min-h-screen transition-all duration-300">
                <div className="max-w-[1128px] mx-auto px-4 py-6 pb-24 lg:pb-6">
                  {children}
                </div>
              </main>

              {/* Mobile bottom nav - visible on mobile only */}
              <MobileBottomNav />
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
