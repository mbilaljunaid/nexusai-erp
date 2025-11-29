'use client';

import { useUIStore } from '@/store/uiStore';

const contextualItems = [
  { title: 'Recent', items: ['Invoice #1234', 'Lead - Acme Corp', 'Quote #5678'] },
  { title: 'Quick Actions', items: ['New Deal', 'New Lead', 'New Invoice'] },
];

export function SecondarySidebar() {
  const { secondarySidebarOpen } = useUIStore();

  return (
    <aside
      className={`w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 overflow-y-auto hidden lg:block transition-all ${
        !secondarySidebarOpen ? 'hidden' : ''
      }`}
      data-testid="secondary-sidebar"
    >
      <div className="p-6 space-y-6">
        {contextualItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item, idx) => (
                <li
                  key={idx}
                  className="text-sm px-3 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
