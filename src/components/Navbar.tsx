'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  MessageSquare,
  User,
  LogOut,
  Settings,
  BookOpen,
  LayoutDashboard,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
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
    { name: 'Explore Skills', href: '/search' },
    { name: 'My Exchanges', href: '/exchanges' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Community', href: '/groups' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-outline-variant/30">
      <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Left Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                SB
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-primary">
                SkillBarter
              </span>
            </Link>

            {/* Main Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-all duration-150 py-1 ${
                      active
                        ? 'text-primary font-bold border-b-2 border-primary'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-xs"
          >
            <Search className="absolute left-3 w-4 h-4 text-outline pointer-events-none" />
            <input
              type="text"
              placeholder="Search skills, people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest/80 border border-outline-variant/40 rounded-xl pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </form>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            {/* Search icon for mobile / tablet */}
            <Link
              href="/search"
              className="lg:hidden p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </Link>

            {session ? (
              <>
                {/* Notification Bell */}
                <NotificationBell />

                {/* Messages shortcut */}
                <Link
                  href="/exchanges"
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-xl transition-colors relative"
                  aria-label="Messages & Exchanges"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* User Profile Dropdown */}
                <div className="relative ml-1" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/20 transition-all focus:outline-none"
                    aria-expanded={showProfileMenu}
                  >
                    <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User avatar'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{session.user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/30 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-outline-variant/20">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {session.user?.name || 'User'}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate mt-0.5">
                          {session.user?.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <User className="w-4 h-4 text-outline" />
                          <span>View Profile</span>
                        </Link>
                        <Link
                          href="/my-skills"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-outline" />
                          <span>My Skills</span>
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-outline" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/exchanges"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-outline" />
                          <span>Exchanges</span>
                        </Link>
                      </div>

                      <div className="border-t border-outline-variant/20 pt-1 mt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: '/' })}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4 text-error" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-on-surface hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary hover:bg-primary-container text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;
