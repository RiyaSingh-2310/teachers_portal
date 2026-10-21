"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setMobileNavOpen: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavOpen: (value) => set({ mobileNavOpen: value }),
    }),
    {
      name: "spdf.teacher.ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
