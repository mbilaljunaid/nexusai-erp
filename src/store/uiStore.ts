import { create } from 'zustand';

interface UIStore {
  primarySidebarOpen: boolean;
  secondarySidebarOpen: boolean;
  darkMode: boolean;
  commandPaletteOpen: boolean;
  togglePrimarySidebar: () => void;
  toggleSecondarySidebar: () => void;
  toggleDarkMode: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  primarySidebarOpen: true,
  secondarySidebarOpen: true,
  darkMode: false,
  commandPaletteOpen: false,
  togglePrimarySidebar: () => set((state) => ({ primarySidebarOpen: !state.primarySidebarOpen })),
  toggleSecondarySidebar: () => set((state) => ({ secondarySidebarOpen: !state.secondarySidebarOpen })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
}));
