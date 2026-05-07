import {
  getDriver,
  getDriverOrdersList,
  getDriversList,
  type AdminDriverListItem as Driver,
  type DriverStatus,
  type KycStatus,
} from "@/lib/api-admin";

export { getDriver, getDriverOrdersList, getDriversList };
export type { Driver, DriverStatus, KycStatus };

export async function getAllDriverOrders() {
  const drivers = await getDriversList();
  const ordersByDriver = await Promise.all(
    drivers.map((driver) => getDriverOrdersList(driver.userId)),
  );

  return ordersByDriver.flat();
}
