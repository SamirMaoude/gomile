import {
  getDrivers as fetchDrivers,
  type AdminDriverListItem,
} from "@/lib/api-client";

export type AdminDashboardDriver = AdminDriverListItem;

export function getDrivers() {
  return fetchDrivers();
}
