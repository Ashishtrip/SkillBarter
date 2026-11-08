'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Briefcase, User, LayoutDashboard } from 'lucide-react';

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Explore', href: '/search', icon: Search },
    { name: 'Exchanges', href: session ? '/exchanges' : '/auth/signin', icon: Briefcase },
    { name: 'Dashboard', href: session ? '/dashboard' : '/auth/signin', icon: LayoutDashboard },
    { name: 'Profile', href: session ? '/profile' : '/auth/signin', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/30 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90 ${
                active
                  ? 'text-primary font-bold bg-primary/10'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
export default MobileBottomNav;
