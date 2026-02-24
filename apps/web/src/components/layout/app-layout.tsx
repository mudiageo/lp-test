import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-[180px] pt-14 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
