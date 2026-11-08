import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import Header from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'SkillBarter - Professional Reciprocity & Skill Exchange',
  description:
    'Exchange high-value professional skills directly. Build your portfolio, collaborate with experts, and grow your career without spending money.',
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
      <body className="bg-surface text-on-surface antialiased min-h-screen flex flex-col font-sans">
        <ErrorBoundary>
          <Providers session={session}>
            <div className="min-h-screen flex flex-col bg-surface text-on-surface">
              {/* Top Navigation */}
              <Header />

              {/* Main Page Content */}
              <main className="flex-grow w-full pb-20 lg:pb-0">{children}</main>

              {/* Mobile Bottom Navigation */}
              <MobileBottomNav />
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
