import { create } from 'zustand';

export const useRegistrationStore = create((set) => ({
  // Étape 1
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatarUrl: null,
  birthDate: '',
  gender: '',

  // Étape 2
  address: '',
  city: '',
  zipCode: '',
  street: '',
  deliveryCity: '',
  deliveryRadius: '',
  transportType: '',

  resetForm: () => set({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    avatarUrl: null, birthDate: '', gender: '',
    address: '', city: '', zipCode: '', street: '', deliveryCity: '', deliveryRadius: '', transportType: '',
  }),

  updateField: (field, value) => set((state) => ({ ...state, [field]: value })),
  nextStep: () => set((state) => ({ step: state.step + 1 })),
  prevStep: () => set((state) => ({ step: state.step - 1 })),
}));
