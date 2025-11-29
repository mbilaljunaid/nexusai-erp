'use client';

import { useUIStore } from '@/store/uiStore';
import Link from 'next/link';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: '📊' },
  { label: 'CRM', href: '/crm', icon: '👥' },
  { label: 'ERP', href: '/erp', icon: '💼' },
  { label: 'HR', href: '/hr', icon: '👨‍💼' },
  { label: 'Reports', href: '/reports', icon: '📈' },
  { label: 'Settings', href: '/settings', icon: '⚙️' },
];

export function PrimarySidebar() {
  const { primarySidebarOpen } = useUIStore();

  return (
    <aside
      className={`sidebar-width bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ${
        !primarySidebarOpen ? '-translate-x-full absolute' : ''
      }`}
      data-testid="primary-sidebar"
      aria-label="Main navigation"
    >
      <nav className="p-4 space-y-2" role="navigation">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar-item block text-sm font-medium px-3 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
            data-testid={`nav-${item.label.toLowerCase()}`}
            aria-label={item.label}
            title={item.label}
          >
            <span className="mr-2 text-lg" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
