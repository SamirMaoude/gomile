import type { KycStatus, DriverDocument } from './kyc-contracts';
import type { VehicleType } from './auth-contracts';

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export interface DriverProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  rating: number | null;
  totalTrips: number;
  activeVehicle: VehicleType | null;
  gomileCode: string;
  status: DriverStatus;
  kycStatus: KycStatus;
  documents: DriverDocument[];
}

export interface ToggleAvailabilityResponse {
  status: DriverStatus;
}

export interface UpdateDriverProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  deliveryCity?: string;
  deliveryRadius?: number;
}

export interface UpdateDriverProfileResponse {
  message: string;
}
