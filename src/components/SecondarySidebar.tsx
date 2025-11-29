'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export interface SidebarSection {
  id: string;
  label: string;
  icon?: string;
  children?: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
}

export interface SecondarySidebarProps {
  activeModule?: string;
  activeSectionId?: string;
  onSelect?: (sectionId: string) => void;
  onNavigate?: (href: string) => void;
  sections?: SidebarSection[];
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultSections: SidebarSection[] = [
  {
    id: 'transactions',
    label: 'Transactions',
    icon: '📝',
    children: [
      { id: 'invoices', label: 'Invoices', href: '/ap/invoices', icon: '📄' },
      { id: 'bills', label: 'Bills', href: '/ap/bills', icon: '💰' },
      { id: 'payments', label: 'Payments', href: '/ap/payments', icon: '✓' },
    ],
  },
  {
    id: 'reports',
    label: 'Reporting',
    icon: '📊',
    children: [
      { id: 'aging', label: 'Aging Report', href: '/ap/reports/aging', icon: '⏰' },
      { id: 'analytics', label: 'Analytics', href: '/ap/reports/analytics', icon: '📈' },
    ],
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: '⚙️',
    children: [
      { id: 'vendors', label: 'Vendors', href: '/ap/vendors', icon: '🏢' },
      { id: 'policies', label: 'Policies', href: '/ap/policies', icon: '📋' },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: '⚡',
    children: [
      { id: 'approval', label: 'Approval Rules', href: '/ap/workflows/approval', icon: '✋' },
      { id: 'automation', label: 'Automation', href: '/ap/workflows/automation', icon: '🤖' },
    ],
  },
];

export function SecondarySidebar({
  activeModule,
  activeSectionId,
  onSelect,
  onNavigate,
  sections = defaultSections,
  isOpen = true,
  onClose,
}: SecondarySidebarProps) {
  const { secondarySidebarOpen } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['transactions']));
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.href && onNavigate) {
      onNavigate(item.href);
    }
    if (onSelect) {
      onSelect(item.id);
    }
  };

  const shouldShow = isMobile ? isOpen : secondarySidebarOpen;

  // Mobile overlay
  if (isMobile && shouldShow) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
          aria-hidden="true"
          role="presentation"
        />

        {/* Drawer */}
        <aside
          className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-40 shadow-lg overflow-y-auto transition-transform duration-300 ease-in-out"
          data-testid="secondary-sidebar-mobile"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold">{activeModule || 'Menu'}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-2">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleGroup(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                  data-testid={`section-${section.id}`}
                  aria-expanded={expandedGroups.has(section.id)}
                  aria-label={`${section.label}, ${expandedGroups.has(section.id) ? 'expanded' : 'collapsed'}`}
                >
                  <span className="flex items-center gap-2">
                    {section.icon && <span aria-hidden="true">{section.icon}</span>}
                    {section.label}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      expandedGroups.has(section.id) ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {expandedGroups.has(section.id) && section.children && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700">
                    {section.children.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors pl-4 ${
                          activeSectionId === item.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        data-testid={`item-${item.id}`}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <span>{item.icon}</span>}
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={`hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 overflow-y-auto transition-all duration-300 ${
        !secondarySidebarOpen ? 'w-0 border-0' : ''
      }`}
      data-testid="secondary-sidebar"
    >
      {secondarySidebarOpen && (
        <>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {activeModule || 'Menu'}
            </h2>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleGroup(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
                  data-testid={`section-${section.id}`}
                  aria-expanded={expandedGroups.has(section.id)}
                  aria-label={`${section.label}, ${expandedGroups.has(section.id) ? 'expanded' : 'collapsed'}`}
                >
                  <span className="flex items-center gap-2">
                    {section.icon && <span aria-hidden="true">{section.icon}</span>}
                    {section.label}
                  </span>
                  <ChevronDownIcon
                    className={`w-4 h-4 transition-transform ${
                      expandedGroups.has(section.id) ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {expandedGroups.has(section.id) && section.children && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-slate-200 dark:border-slate-700">
                    {section.children.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors pl-4 ${
                          activeSectionId === item.id
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        data-testid={`item-${item.id}`}
                      >
                        <span className="flex items-center gap-2">
                          {item.icon && <span>{item.icon}</span>}
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </>
      )}
    </aside>
  );
}
