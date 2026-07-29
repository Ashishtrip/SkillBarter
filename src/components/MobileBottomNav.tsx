'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Users, Briefcase, User, Plus } from 'lucide-react';

export function MobileBottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: Home, requiresAuth: false },
    { name: 'Search', href: '/search', icon: Search, requiresAuth: false },
    { name: 'Post', href: '/exchanges', icon: Plus, requiresAuth: true, isAction: true },
    { name: 'Community', href: '/groups', icon: Users, requiresAuth: true },
    { name: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.requiresAuth || session
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200/60 z-40 shadow-navbar">
      <div className="flex items-center justify-around py-1 px-1 max-w-md mx-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.isAction) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center py-1 px-3"
              >
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center shadow-sm -mt-3">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                active
                  ? 'text-primary-600'
                  : 'text-secondary-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
