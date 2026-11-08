'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Menu,
  X,
  Search,
  Users,
  MessageSquare,
  User,
  LayoutDashboard,
  BookOpen,
  Briefcase,
  LogOut,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

export function MobileNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Explore Skills', href: '/search', icon: Search },
    { name: 'My Exchanges', href: '/exchanges', icon: Briefcase },
    { name: 'Community', href: '/groups', icon: Users },
    { name: 'My Skills', href: '/my-skills', icon: BookOpen },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden glass-nav sticky top-0 z-40 border-b border-outline-variant/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">
              SB
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-primary">
              SkillBarter
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {session && <NotificationBell />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-surface-container-lowest shadow-2xl border-l border-outline-variant/30 flex flex-col p-5 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
              <span className="font-display font-bold text-base text-on-surface">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Summary */}
            {session ? (
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low mb-5 hover:bg-surface-container transition-colors"
              >
                <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface truncate">
                    {session.user?.name}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{session.user?.email}</p>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface hover:text-primary hover:bg-surface-container-low transition-colors"
                  >
                    <Icon className="w-4 h-4 text-outline" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer / Sign Out */}
            {session && (
              <div className="pt-4 border-t border-outline-variant/20 mt-auto">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-error hover:bg-error/5 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 text-error" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default MobileNavbar;
