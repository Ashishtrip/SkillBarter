'use client';

import React, { useState, memo } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Menu,
  X,
  Home,
  Search,
  Users,
  MessageSquare,
  User,
  LayoutDashboard,
  BookOpen,
  Plus,
  LogOut,
  Settings,
  Briefcase,
} from 'lucide-react';
import { NotificationBell } from './NotificationBell';

function MobileNavbarComponent() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiresAuth: true },
    { name: 'Search', href: '/search', icon: Search, requiresAuth: false },
    { name: 'Skills', href: '/skills', icon: Plus, requiresAuth: false },
    { name: 'Community', href: '/groups', icon: Users, requiresAuth: true },
    { name: 'Content', href: '/content', icon: BookOpen, requiresAuth: false },
    { name: 'Exchanges', href: '/exchanges', icon: Briefcase, requiresAuth: true },
    { name: 'Profile', href: '/profile', icon: User, requiresAuth: true },
  ];

  const filteredItems = navigationItems;

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-navbar border-b border-secondary-200/60 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-2.5">
          <Link href="/" className="flex items-center space-x-1.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-base">S</span>
            </div>
            <span className="text-lg font-heading font-bold text-secondary-900">SkillBarter</span>
          </Link>

          <div className="flex items-center space-x-1">
            {session && <NotificationBell />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-icon"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-elevated overflow-y-auto">
            <div className="p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-heading font-bold text-secondary-900">Menu</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn-icon"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Card */}
              {session && (
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-card bg-secondary-50 mb-5 hover:bg-secondary-100 transition-colors"
                >
                  <div className="avatar-md flex-shrink-0">
                    {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-secondary-900 truncate">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">{session.user?.email}</p>
                  </div>
                </Link>
              )}

              {/* Navigation */}
              <nav className="space-y-0.5 mb-6">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const href =
                    item.requiresAuth && !session ? '/auth/signin' : item.href;
                  return (
                    <Link
                      key={item.name}
                      href={href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Auth Section */}
              {session ? (
                <div className="border-t border-secondary-200/60 pt-4 space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg text-error-500 hover:bg-error-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-secondary-200/60 pt-4 space-y-3">
                  <button
                    onClick={() => {
                      signIn();
                      setIsOpen(false);
                    }}
                    className="w-full btn-outline"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full btn-primary block text-center"
                  >
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const MobileNavbar = memo(MobileNavbarComponent);
