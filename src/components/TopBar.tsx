'use client';

import { useUIStore } from '@/store/uiStore';
import { Bars3Icon, MoonIcon, SunIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function TopBar() {
  const { togglePrimarySidebar, darkMode, toggleDarkMode, openCommandPalette } = useUIStore();

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
        {/* Command Palette Search */}
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-400 text-sm"
          data-testid="command-palette-trigger"
          aria-label="Open command palette (Cmd+K)"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-2 px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-xs font-mono">
            ⌘K
          </kbd>
        </button>

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
