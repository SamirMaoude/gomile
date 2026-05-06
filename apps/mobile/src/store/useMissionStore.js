import { create } from 'zustand';

export const useMissionStore = create((set) => ({
  activeMission: null,
  merchantVerified: false,
  clientVerified: false,
  
  declinedMissionIds: [], // Tableau qui stocke les IDs refusés
  declineMission: (missionId) => 
    set((state) => ({
      declinedMissionIds: [...state.declinedMissionIds, missionId]
    })),

  acceptMission: (mission) =>
    set({
      activeMission: {
        ...mission,
        status: 'active',
      },
      merchantVerified: false,
      clientVerified: false,
    }),

  markMerchantVerified: () => set({ merchantVerified: true }),

  markClientVerified: () => set({ clientVerified: true }),

  clearMission: () =>
    set({
      activeMission: null,
      merchantVerified: false,
      clientVerified: false,
    }),
}));