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
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="sidebar-item block text-sm font-medium"
            data-testid={`nav-${item.label.toLowerCase()}`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
