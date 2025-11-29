'use client';

import { TopBar } from './TopBar';
import { PrimarySidebar } from './PrimarySidebar';
import { SecondarySidebar } from './SecondarySidebar';
import { Footer } from './Footer';
import { CommandPalette } from './CommandPalette';
import { useUIStore } from '@/store/uiStore';
import { useEffect } from 'react';

interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  const darkMode = useUIStore((state) => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <TopBar />
      <div className="flex flex-1">
        <PrimarySidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
        <SecondarySidebar />
      </div>
      <Footer />
      
      {/* Global Command Palette */}
      <CommandPalette
        onNavigate={(href) => {
          // Navigate using window.location or router in real app
          window.location.href = href;
        }}
      />
    </div>
  );
}
