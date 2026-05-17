// Tests for useRegistrationStore — the Zustand store that accumulates driver
// registration data across four screens. Correctness here is critical: any
// field that gets silently reset or not persisted across steps would break
// the registration flow and create orphaned partial accounts.

import { useRegistrationStore } from '../../../src/store/useRegistrationStore';

// Snapshot of the initial empty state returned by resetForm and present on
// first render. Any change to default values must update this reference.
const INITIAL_STATE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  avatarUrl: null,
  birthDate: '',
  gender: '',
  address: '',
  city: '',
  zipCode: '',
  street: '',
  deliveryCity: '',
  deliveryRadius: '',
  transportType: '',
};

// Restore the store to a clean slate before every test.
beforeEach(() => {
  useRegistrationStore.setState({ ...INITIAL_STATE });
});

describe('useRegistrationStore — initial state', () => {
  test('all string fields are empty by default', () => {
    const state = useRegistrationStore.getState();
    for (const [key, value] of Object.entries(INITIAL_STATE)) {
      expect(state[key]).toBe(value);
    }
  });

  test('avatarUrl is null by default', () => {
    expect(useRegistrationStore.getState().avatarUrl).toBeNull();
  });
});

describe('useRegistrationStore — updateField', () => {
  test('updates a simple string field', () => {
    useRegistrationStore.getState().updateField('firstName', 'Jean');
    expect(useRegistrationStore.getState().firstName).toBe('Jean');
  });

  test('updates a second field without affecting others', () => {
    useRegistrationStore.getState().updateField('email', 'jean@gomile.fr');
    expect(useRegistrationStore.getState().email).toBe('jean@gomile.fr');
    expect(useRegistrationStore.getState().firstName).toBe('');
  });

  test('can set avatarUrl to a URI string', () => {
    useRegistrationStore.getState().updateField('avatarUrl', 'file:///photo.jpg');
    expect(useRegistrationStore.getState().avatarUrl).toBe('file:///photo.jpg');
  });

  test('can overwrite a previously set field', () => {
    useRegistrationStore.getState().updateField('city', 'Lyon');
    useRegistrationStore.getState().updateField('city', 'Paris');
    expect(useRegistrationStore.getState().city).toBe('Paris');
  });

  test('all step-1 fields can be populated independently', () => {
    const step1 = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.fr',
      phone: '0600000000',
      password: 'Secret123!',
      confirmPassword: 'Secret123!',
      gender: 'MALE',
      birthDate: '1990-01-01',
    };
    for (const [key, value] of Object.entries(step1)) {
      useRegistrationStore.getState().updateField(key, value);
    }
    const state = useRegistrationStore.getState();
    for (const [key, value] of Object.entries(step1)) {
      expect(state[key]).toBe(value);
    }
  });

  test('all step-2 fields can be populated independently', () => {
    const step2 = {
      address: '12 rue de la Paix',
      city: 'Grenoble',
      zipCode: '38000',
      street: 'rue de la Paix',
      deliveryCity: 'Grenoble',
      deliveryRadius: '10',
      transportType: 'CAR',
    };
    for (const [key, value] of Object.entries(step2)) {
      useRegistrationStore.getState().updateField(key, value);
    }
    const state = useRegistrationStore.getState();
    for (const [key, value] of Object.entries(step2)) {
      expect(state[key]).toBe(value);
    }
  });
});

describe('useRegistrationStore — resetForm', () => {
  test('clears all fields back to initial values after partial population', () => {
    useRegistrationStore.getState().updateField('firstName', 'Jean');
    useRegistrationStore.getState().updateField('email', 'jean@test.fr');
    useRegistrationStore.getState().updateField('avatarUrl', 'file:///photo.jpg');
    useRegistrationStore.getState().resetForm();

    const state = useRegistrationStore.getState();
    for (const [key, value] of Object.entries(INITIAL_STATE)) {
      expect(state[key]).toBe(value);
    }
  });

  test('calling resetForm on already-empty store does not throw', () => {
    expect(() => useRegistrationStore.getState().resetForm()).not.toThrow();
  });
});
