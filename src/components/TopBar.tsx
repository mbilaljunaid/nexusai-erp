'use client';

import { useUIStore } from '@/store/uiStore';
import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export function TopBar() {
  const { togglePrimarySidebar, darkMode, toggleDarkMode } = useUIStore();

  return (
    <header className="topbar-height bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePrimarySidebar}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          data-testid="toggle-sidebar-btn"
          aria-label="Toggle sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">ERP Shell</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          aria-label="Toggle dark mode"
        >
          {darkMode ? (
            <SunIcon className="w-6 h-6" />
          ) : (
            <MoonIcon className="w-6 h-6" />
          )}
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
          JD
        </div>
      </div>
    </header>
  );
}
