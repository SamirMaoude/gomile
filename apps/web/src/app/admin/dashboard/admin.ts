import {
  createAdminAccount,
  createDriverAccount,
  createMerchantAccount,
  getDriver,
  getDriverOrdersList,
  getDriversList,
  getMerchant,
  getMerchantsList,
  resetHandshake,
  type AdminDriverListItem as Driver,
  type CreateAdminAccountInput,
  type AdminMerchantDetail as MerchantDetail,
  type AdminMerchantListItem as Merchant,
  type DriverStatus,
  type KycStatus,
  type SubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/api-admin";

export {
  createAdminAccount,
  createDriverAccount,
  createMerchantAccount,
  getDriver,
  getDriverOrdersList,
  getDriversList,
  getMerchant,
  getMerchantsList,
  resetHandshake,
};
export const resendApiKey = resetHandshake;
export type {
  CreateAdminAccountInput,
  Driver,
  DriverStatus,
  KycStatus,
  Merchant,
  MerchantDetail,
  SubscriptionStatus,
  SubscriptionTier,
};

export async function getAllDriverOrders() {
  const drivers = await getDriversList();
  const ordersByDriver = await Promise.all(
    drivers.map((driver) => getDriverOrdersList(driver.userId)),
  );

  return ordersByDriver.flat();
}
