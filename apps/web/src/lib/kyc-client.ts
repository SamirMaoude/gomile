import type {
  DriverKycStatus,
  KycActionResponse,
  RejectKycInput,
} from "../../../../shared/kyc-contracts";
import { requestWithAutoRefresh } from "./protected-request";

export type {
  DriverKycStatus,
  KycActionResponse,
  RejectKycInput,
};

async function requestKyc<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  return requestWithAutoRefresh<T>(path, init);
}

export function getMyKycStatus() {
  return requestKyc<DriverKycStatus>("/api/driver/me/kyc", {
    method: "GET",
  });
}

export function approveDriverKyc(id: string) {
  return requestKyc<KycActionResponse>(`/api/livreurs/${id}/kyc-approve`, {
    method: "PUT",
  });
}

export function rejectDriverKyc(id: string, rejectionReason: string) {
  return requestKyc<KycActionResponse>(`/api/livreurs/${id}/kyc-reject`, {
    method: "PUT",
    body: JSON.stringify({ rejectionReason } satisfies RejectKycInput),
  });
}
