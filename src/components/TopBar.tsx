'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ChevronDownIcon,
  CheckIcon,
  TrashIcon,
  BuildingIcon,
  PlusIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export interface TopBarProps {
  currentOrg?: string;
  onOrgChange?: (org: string) => void;
}

export function TopBar({ currentOrg = 'Acme Corp', onOrgChange }: TopBarProps) {
  const {
    togglePrimarySidebar,
    darkMode,
    toggleDarkMode,
    openCommandPalette,
    notifications,
    markNotificationAsRead,
    clearNotification,
  } = useUIStore();

  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);

  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false);
      }
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) {
        setOrgOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setQuickActionsOpen(!quickActionsOpen)}
            className="hidden sm:flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
            data-testid="quick-actions-btn"
            aria-label="Quick actions menu"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create</span>
            <ChevronDownIcon className="w-3 h-3" />
          </button>

          {quickActionsOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-40 py-1"
              data-testid="quick-actions-menu"
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                onClick={() => {
                  console.log('Create Invoice');
                  setQuickActionsOpen(false);
                }}
              >
                <PlusIcon className="w-4 h-4" />
                Create Invoice
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                onClick={() => {
                  console.log('Create Lead');
                  setQuickActionsOpen(false);
                }}
              >
                <PlusIcon className="w-4 h-4" />
                Create Lead
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                onClick={() => {
                  console.log('View Approvals');
                  setQuickActionsOpen(false);
                }}
              >
                <CheckCircleIcon className="w-4 h-4" />
                View Approvals
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                onClick={() => {
                  console.log('AI Assistant');
                  setQuickActionsOpen(false);
                }}
              >
                <SparklesIcon className="w-4 h-4" />
                AI Assistant
              </button>
            </div>
          )}
        </div>

        {/* Organization Selector */}
        <div className="relative" ref={orgRef}>
          <button
            onClick={() => setOrgOpen(!orgOpen)}
            className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors text-sm"
            data-testid="org-selector-btn"
            aria-label="Organization selector"
          >
            <BuildingIcon className="w-4 h-4" />
            <span>{currentOrg}</span>
            <ChevronDownIcon className="w-3 h-3" />
          </button>

          {orgOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-40 py-1"
              data-testid="org-selector-menu"
            >
              {['Acme Corp', 'Tech Industries', 'Global Solutions'].map((org) => (
                <button
                  key={org}
                  onClick={() => {
                    onOrgChange?.(org);
                    setOrgOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 transition-colors flex items-center gap-2 ${
                    currentOrg === org
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                  data-testid={`org-option-${org.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {currentOrg === org && <CheckIcon className="w-4 h-4" />}
                  <span className={currentOrg === org ? '' : 'ml-6'}>{org}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            data-testid="notifications-btn"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                data-testid="notification-badge"
              />
            )}
          </button>

          {notificationOpen && (
            <div
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-40 overflow-hidden"
              data-testid="notifications-dropdown"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors last:border-b-0 ${
                        !notif.read
                          ? 'bg-blue-50 dark:bg-blue-900/10'
                          : ''
                      }`}
                      data-testid={`notification-item-${notif.id}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {notif.message}
                          </p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                            aria-label="Mark as read"
                            data-testid={`mark-read-${notif.id}`}
                          >
                            <CheckIcon className="w-4 h-4 text-blue-600" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {Math.round((Date.now() - notif.timestamp.getTime()) / 60000)}m ago
                        </span>
                        {notif.action && (
                          <button
                            onClick={() => {
                              window.location.href = notif.action!.href;
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                            data-testid={`notification-action-${notif.id}`}
                          >
                            {notif.action.label}
                          </button>
                        )}
                        <button
                          onClick={() => clearNotification(notif.id)}
                          className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                          aria-label="Delete"
                          data-testid={`delete-notif-${notif.id}`}
                        >
                          <TrashIcon className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          aria-label="Toggle dark mode"
          data-testid="dark-mode-toggle"
        >
          {darkMode ? (
            <SunIcon className="w-6 h-6" />
          ) : (
            <MoonIcon className="w-6 h-6" />
          )}
        </button>

        {/* User Avatar Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-500 transition-all"
            data-testid="user-avatar-btn"
            aria-label="User menu"
          >
            JD
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-40 py-1"
              data-testid="user-menu-dropdown"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-900 dark:text-white">John Doe</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">john@acmecorp.com</p>
              </div>

              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                onClick={() => {
                  console.log('Profile');
                  setUserMenuOpen(false);
                }}
              >
                My Profile
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
                onClick={() => {
                  console.log('Settings');
                  setUserMenuOpen(false);
                }}
              >
                Account Settings
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
              <button
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm text-red-600 dark:text-red-400"
                onClick={() => {
                  console.log('Logout');
                  setUserMenuOpen(false);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
