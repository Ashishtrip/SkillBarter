'use client';

import { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import { Settings } from 'lucide-react';

interface SidebarUserProfileProps {
  isCollapsed: boolean;
  user: Session['user'];
}

export function SidebarUserProfile({ isCollapsed, user }: SidebarUserProfileProps) {
  return (
    <Link href="/profile">
      <div className="flex items-center gap-3 p-4 hover:bg-secondary-50 transition-colors duration-200 cursor-pointer group">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user?.name || 'User'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primary-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-secondary-900 truncate">{user?.name}</p>
            <p className="text-xs text-secondary-500 truncate">Skill Master</p>
          </div>
        )}

        {/* Settings Icon (appears on hover) */}
        {!isCollapsed && (
          <button className="p-2 rounded-lg hover:bg-secondary-200 transition-colors opacity-0 group-hover:opacity-100">
            <Settings size={16} className="text-secondary-500" />
          </button>
        )}
      </div>
    </Link>
  );
}
