'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, Home, FolderOpen, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'All Ideas', icon: Home },
  { href: '/categories', label: 'Categories', icon: FolderOpen },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
  { href: '/my-ideas', label: 'My Ideas', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-[180px] bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#6366f1]">
          <Rocket className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-sm">Launchpad</span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#6366f1] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
