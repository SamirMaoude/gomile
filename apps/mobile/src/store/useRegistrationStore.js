import { create } from 'zustand';

export const useRegistrationStore = create((set) => ({
  // Étape 1
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',

  // Étape 2
  address: '',
  transportType: '',

  // Étape 3 - Documents
  cniFile: null,
  justificatifFile: null,
  permisFile: null,
  carteGriseFile: null,

  // Étape 4 - Infos Pro & Banque
  siret: '',
  kbisFile: null,
  ribFile: null,

  // Fonction pour tout réinitialiser (utile après l'inscription)
  resetForm: () => set({
    firstName: '', lastName: '', email: '', phone: '', birthDate: '', gender: '',
    address: '', transportType: '',
    cniFile: null, justificatifFile: null, permisFile: null, carteGriseFile: null,
    siret: '', kbisFile: null, ribFile: null
  }),


  // Actions
  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
}));