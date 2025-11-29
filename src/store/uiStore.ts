import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
  action?: { label: string; href: string };
}

interface UIStore {
  primarySidebarOpen: boolean;
  secondarySidebarOpen: boolean;
  darkMode: boolean;
  commandPaletteOpen: boolean;
  notifications: Notification[];
  togglePrimarySidebar: () => void;
  toggleSecondarySidebar: () => void;
  toggleDarkMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Invoice Approved',
    message: 'INV-5234 has been approved by finance team',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 5 * 60000),
    action: { label: 'View', href: '/invoices/5234' },
  },
  {
    id: 'notif-2',
    title: 'Payment Due',
    message: 'Vendor Acme Corp - Payment due in 3 days',
    type: 'warning',
    read: false,
    timestamp: new Date(Date.now() - 15 * 60000),
    action: { label: 'Pay Now', href: '/payments' },
  },
  {
    id: 'notif-3',
    title: 'Lead Assigned',
    message: 'Tech Company lead reassigned to your queue',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 60 * 60000),
  },
];

export const useUIStore = create<UIStore>((set) => ({
  primarySidebarOpen: true,
  secondarySidebarOpen: true,
  darkMode: false,
  commandPaletteOpen: false,
  notifications: mockNotifications,
  togglePrimarySidebar: () => set((state) => ({ primarySidebarOpen: !state.primarySidebarOpen })),
  toggleSecondarySidebar: () => set((state) => ({ secondarySidebarOpen: !state.secondarySidebarOpen })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  markNotificationAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  clearNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}`,
          read: false,
          timestamp: new Date(),
        },
        ...state.notifications,
      ],
    })),
}));
