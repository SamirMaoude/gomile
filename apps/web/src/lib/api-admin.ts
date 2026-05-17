import type { ListDriverOrdersItem } from "../../../../shared/order-contracts";
import type {
  RegisterDriverInput,
  RegisterMerchantInput,
} from "../../../../shared/auth-contracts";
import { requestWithAutoRefresh } from "./protected-request";

export type DriverStatus = "AVAILABLE" | "BUSY" | "OFFLINE";
export type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type WithdrawalStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type AdminDriverListItem = {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  status: DriverStatus;
  kycStatus: KycStatus;
  totalTrips: number;
  gomileCode: string | null;
  user: {
    email: string;
    phone: string | null;
  };
  kycSubmissions: Array<{
    id: string;
    status: KycStatus;
    createdAt: string;
  }>;
};

export type AdminDriverDetail = {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string | null;
  zipCode: string | null;
  street: string | null;
  deliveryCity: string;
  deliveryRadius: number;
  transportType: string;
  activeVehicle: string | null;
  status: DriverStatus;
  kycStatus: KycStatus;
  rating: number | null;
  totalTrips: number;
  gomileCode: string | null;
  siret: string | null;
  createdAt: string;
  user: {
    email: string;
    phone: string | null;
  };
  driverDocuments: Array<{
    id: string;
    type: string;
    url: string;
    verified: boolean;
    rejectionReason: string | null;
    createdAt: string;
  }>;
  kycSubmissions: Array<{
    id: string;
    status: KycStatus;
    rejectionReason: string | null;
    createdAt: string;
  }>;
  wallet: {
    balance: number;
  } | null;
};

export type AdminWithdrawalItem = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  createdAt: string;
  wallet: {
    driver: {
      userId: string;
      firstName: string;
      lastName: string;
      user: {
        email: string;
      };
    } | null;
  } | null;
};

export type UpdateWithdrawalInput = {
  status: Extract<WithdrawalStatus, "COMPLETED" | "CANCELLED">;
};

export type AdminMessageResponse = {
  message: string;
};

export type RejectKycInput = {
  rejectionReason: string;
};

export type CreateAdminAccountInput = {
  email: string;
  password: string;
};

export type SubscriptionTier = "FREE" | "STARTER" | "PRO";
export type SubscriptionStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED";

export type AdminMerchantListItem = {
  userId: string;
  name: string;
  createdAt: string;
  subscription: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  user: {
    email: string;
    phone: string | null;
  };
};

export type AdminMerchantDetail = {
  userId: string;
  name: string;
  createdAt: string;
  subscription: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  user: {
    email: string;
    phone: string | null;
  };
  store: Array<{
    id: string;
    name: string;
    address: string;
    isActive: boolean;
    isLocked: boolean;
    createdAt: string;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
    revokedAt: string | null;
    expiresAt: string | null;
  }>;
};

export function getMerchantsList() {
  return requestWithAutoRefresh<AdminMerchantListItem[]>("/api/admin/merchants");
}

export function getMerchant(merchantId: string) {
  return requestWithAutoRefresh<AdminMerchantDetail>(`/api/admin/merchants/${merchantId}`);
}

export function resetHandshake(orderId: string) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    `/api/admin/orders/${orderId}/reset`,
    { method: "POST" },
  );
}

export function createAdminAccount(input: CreateAdminAccountInput) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    "/api/admin/accounts/admin",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createMerchantAccount(input: RegisterMerchantInput) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    "/api/admin/accounts/merchant",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createDriverAccount(input: RegisterDriverInput) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    "/api/admin/accounts/driver",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function getDriversList(status?: DriverStatus, kycStatus?: KycStatus) {
  const query = new URLSearchParams({ ...(status && { status }), ...(kycStatus && { kycStatus }) }).toString();
  return requestWithAutoRefresh<AdminDriverListItem[]>(`/api/admin/drivers${query ? `?${query}` : ""}`);
}

export function getDriver(driverId: string) {
  return requestWithAutoRefresh<AdminDriverDetail>(`/api/admin/drivers/${driverId}`);
}

export function getDriverOrdersList(
  driverId: string,
  filter?: "active" | "finished" | "cancelled",
) {
  const query = filter ? `?filter=${filter}` : "";
  return requestWithAutoRefresh<ListDriverOrdersItem[]>(
    `/api/admin/drivers/${driverId}/orders${query}`,
  );
}

export function approveDriverKyc(driverId: string) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    `/api/admin/drivers/${driverId}/kyc/approve`,
    {
      method: "PUT",
    },
  );
}

export function rejectDriverKyc(driverId: string, input: RejectKycInput) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    `/api/admin/drivers/${driverId}/kyc/reject`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  );
}

export function getWithdrawals(status?: WithdrawalStatus) {
  const query = status ? `?status=${status}` : "";
  return requestWithAutoRefresh<AdminWithdrawalItem[]>(
    `/api/admin/withdrawals${query}`,
  );
}

export function updateWithdrawal(
  withdrawalId: string,
  input: UpdateWithdrawalInput,
) {
  return requestWithAutoRefresh<AdminMessageResponse>(
    `/api/admin/withdrawals/${withdrawalId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}
