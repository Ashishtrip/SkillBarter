'use client';

import React, { memo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Users,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useState, useRef, useEffect } from 'react';

function NavbarComponent() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Home', href: session ? '/dashboard' : '/', icon: Home },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Community', href: '/groups', icon: Users },
    { name: 'Exchanges', href: '/exchanges', icon: Briefcase },
    { name: 'Messaging', href: '/exchanges', icon: MessageSquare },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <nav className="bg-white shadow-navbar sticky top-0 z-40 border-b border-secondary-200/60">
      <div className="max-w-[1128px] mx-auto px-4">
        <div className="flex items-center justify-between h-[52px]">
          {/* Left: Logo + Search */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-1.5 flex-shrink-0">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-heading font-bold text-base">S</span>
              </div>
            </Link>

            {/* Search Bar - LinkedIn style */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search skills, people..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[280px] pl-9 pr-4 py-[7px] text-sm bg-secondary-50 border border-secondary-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-600 focus:bg-white focus:w-[320px] transition-all duration-300 placeholder:text-secondary-400"
                />
              </div>
            </form>
          </div>

          {/* Center: Navigation Items - LinkedIn style vertical icons */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={session ? item.href : item.name === 'Search' ? item.href : '/auth/signin'}
                  className={`flex flex-col items-center px-4 py-1 min-w-[80px] border-b-2 transition-colors duration-200 ${
                    active
                      ? 'border-secondary-900 text-secondary-900'
                      : 'border-transparent text-secondary-400 hover:text-secondary-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] mt-0.5 font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right: Auth / Profile */}
          <div className="flex items-center space-x-1">
            {status === 'loading' ? (
              <div className="w-8 h-8 bg-secondary-200 rounded-full animate-pulse" />
            ) : session ? (
              <>
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex flex-col items-center px-3 py-1 text-secondary-400 hover:text-secondary-700 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-700">
                        {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] font-medium">Me</span>
                      <ChevronDown className="w-3 h-3 ml-0.5" />
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-1 w-72 bg-white rounded-lg shadow-dropdown border border-secondary-200/60 py-2 z-50">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-secondary-200/60">
                        <div className="flex items-center space-x-3">
                          <div className="avatar-md flex-shrink-0">
                            {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-secondary-900 truncate">
                              {session.user?.name}
                            </p>
                            <p className="text-xs text-secondary-500 truncate">
                              {session.user?.email}
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="mt-3 block w-full text-center py-1.5 text-sm font-semibold text-primary-600 border border-primary-600 rounded-full hover:bg-primary-50 transition-colors"
                        >
                          View Profile
                        </Link>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings & Privacy</span>
                        </Link>
                      </div>

                      <div className="border-t border-secondary-200/60 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            signOut();
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-secondary-600 hover:bg-secondary-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => signIn()}
                  className="btn-ghost text-sm font-semibold"
                >
                  Sign In
                </button>
                <Link href="/auth/signup" className="btn-outline text-sm py-2 px-4">
                  Join Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
