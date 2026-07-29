'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search,
  BookOpen,
  MessageSquare,
  Users,
  User,
  Menu,
  ChevronRight,
  LogOut,
  Settings,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { SidebarUserProfile } from './SidebarUserProfile';

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Search, label: 'Search', href: '/search' },
  { icon: BookOpen, label: 'My Skills', href: '/my-skills' },
  { icon: MessageSquare, label: 'Exchanges', href: '/exchanges' },
  { icon: Users, label: 'Community', href: '/groups' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-secondary-200/60 transition-all duration-300 ease-in-out shadow-navbar z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header with Logo & Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-secondary-200/60">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                S
              </div>
              <span className="text-secondary-900">SkillBarter</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronRight
              size={20}
              className={`transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
            />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="border-b border-secondary-200/60">
          {session?.user && <SidebarUserProfile isCollapsed={isCollapsed} user={session.user} />}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-secondary-600 hover:bg-secondary-100'
                  }`}
                  onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Icon size={20} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>

                {/* Tooltip on collapsed state */}
                {isCollapsed && showTooltip === item.label && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-secondary-900 text-white text-xs font-medium py-1 px-2 rounded whitespace-nowrap pointer-events-none">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-secondary-200/60 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-all duration-200">
            <Settings size={20} />
            {!isCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error-500 hover:bg-error-50 transition-all duration-200"
          >
            <LogOut size={20} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (if needed for swipeable sheet) */}
      {/* This will be handled by MobileBottomNav */}
    </>
  );
}
