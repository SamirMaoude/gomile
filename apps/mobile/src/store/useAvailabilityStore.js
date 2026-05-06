import { create } from 'zustand';

export const useAvailabilityStore = create((set) => ({
  isOnline: false,
  setOnlineStatus: (isOnline) => set({ isOnline }),
  toggleOnlineStatus: () => set((state) => ({ isOnline: !state.isOnline })),
}));