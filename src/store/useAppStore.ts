import { create } from "zustand";

interface AppState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  activeFilters: {
    risk: string[];
    platform: string[];
    status: string[];
  };
  setFilter: (key: string, values: string[]) => void;
  clearFilters: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  activeFilters: { risk: [], platform: [], status: [] },
  setFilter: (key, values) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, [key]: values } })),
  clearFilters: () =>
    set({ activeFilters: { risk: [], platform: [], status: [] } }),
}));
