import { create } from 'zustand';

export const useMissionStore = create((set) => ({
  activeMission: null,
  merchantVerified: false,
  clientVerified: false,

  acceptMission: (mission) =>
    set({
      activeMission: {
        ...mission,
        status: 'active',
        merchantAuthCode: mission.merchantAuthCode || '4831',
        clientValidationCode: mission.clientValidationCode || '9021',
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