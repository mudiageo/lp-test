'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/app-layout';
import { useAuth } from '@/hooks/use-auth';

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <AppLayout>
      {children}
      {isAuthenticated && (
        <Link
          href="/ideas/new"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#6366f1] text-white flex items-center justify-center shadow-lg hover:bg-[#4f46e5] transition-colors z-30"
          title="Submit new idea"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </AppLayout>
  );
}
