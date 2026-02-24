'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export function Header({ onSearch }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-0 left-[180px] right-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent"
          />
        </div>
      </div>

      <div className="ml-4">
        {isAuthenticated ? (
          <Avatar src={user?.image} name={user?.name} size="sm" />
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-[#6366f1] hover:text-[#4f46e5]"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
