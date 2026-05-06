import { getDriversList, type Driver } from "./admin";

export type AdminDashboardDriver = Driver;

export function getDrivers() {
  return getDriversList();
}
