import { create } from 'zustand';

// global UI state: toasts, sidebar open, selected month for calendar
let toastId = 0;

export const useUiStore = create((set) => ({
  // sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  // selected month (for calendar page, stored as 'YYYY-MM' string)
  selectedMonth: null,
  setSelectedMonth: (month) => set({ selectedMonth: month }),

  // toast notifications
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = ++toastId;
    set((s) => ({
      toasts: [...s.toasts, { id, message, type }],
    }));
    return id;
  },
  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}));
