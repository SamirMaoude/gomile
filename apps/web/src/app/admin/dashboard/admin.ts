import { requestWithAutoRefresh } from "@/lib/protected-request";

export type DriverStatus = "approved" | "pending" | "denied";
export type KycStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export type Driver = {
  userId: string;
  firstName: string;
  lastName: string;
  status: DriverStatus;
  kycStatus: KycStatus;
  totalTrips: number;
};

export async function getDriversList(): Promise<Driver[]> {
  return requestWithAutoRefresh<Driver[]>("/api/admin/drivers");
}
