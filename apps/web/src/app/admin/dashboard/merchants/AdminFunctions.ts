export {
  formatDate,
  getDeliveriesCountByDay,
  getDeliveriesCountByMonth,
  type ChartDataItem,
  type Order,
} from "../drivers/AdminFunctions";

import { formatDate, type ChartDataItem } from "../drivers/AdminFunctions";

export type MerchantStatus = "active" | "inactive" | "locked";
export type MerchantStatusOption = "all" | MerchantStatus;
export type MerchantProviderOption =
  | "all"
  | "WOOCOMMERCE"
  | "SHOPIFY"
  | "OTHER"
  | "unknown";

export type MerchantStore = {
  id?: string;
  name?: string;
  isActive?: boolean;
  isLocked?: boolean;
  provider?: string | null;
  _count?: {
    orders?: number;
  };
};

export type MerchantWithOptionalListFields = {
  id?: string;
  userId?: string;
  merchantId?: string;
  name?: string | null;
  createdAt?: string;
  isActive?: boolean;
  isLocked?: boolean;
  status?: MerchantStatus;
  totalOrders?: number;
  storesCount?: number;
  stores?: MerchantStore[];
  _count?: {
    stores?: number;
    orders?: number;
  };
  user?: {
    email?: string | null;
    phone?: string | null;
  };
  email?: string | null;
  phone?: string | null;
};

type MerchantFilters = {
  searchQuery: string;
  statusFilter: MerchantStatusOption;
  providerFilter: MerchantProviderOption;
};

export const merchantStatusLabels: Record<MerchantStatus, string> = {
  active: "Actif",
  inactive: "Inactif",
  locked: "Bloque",
};

const providerLabels: Record<string, string> = {
  WOOCOMMERCE: "WooCommerce",
  SHOPIFY: "Shopify",
  OTHER: "Autre",
};

export function getMerchantId(merchant: MerchantWithOptionalListFields) {
  return merchant.id ?? merchant.merchantId ?? merchant.userId ?? "";
}

export function getMerchantName(merchant: MerchantWithOptionalListFields) {
  return merchant.name?.trim() || "Merchant sans nom";
}

export function getMerchantEmail(merchant: MerchantWithOptionalListFields) {
  return merchant.user?.email ?? merchant.email ?? "Non renseigne";
}

export function getMerchantPhone(merchant: MerchantWithOptionalListFields) {
  return merchant.user?.phone ?? merchant.phone ?? "Non renseigne";
}

export function getMerchantRegistrationDate(merchant: MerchantWithOptionalListFields) {
  return formatDate(merchant.createdAt);
}

export function getMerchantStoresCount(merchant: MerchantWithOptionalListFields) {
  return merchant.storesCount ?? merchant._count?.stores ?? merchant.stores?.length ?? 0;
}

export function getMerchantOrdersCount(merchant: MerchantWithOptionalListFields) {
  if (typeof merchant.totalOrders === "number") {
    return merchant.totalOrders;
  }

  if (typeof merchant._count?.orders === "number") {
    return merchant._count.orders;
  }

  return merchant.stores?.reduce((total, store) => {
    return total + (store._count?.orders ?? 0);
  }, 0) ?? 0;
}

export function getMerchantStatus(merchant: MerchantWithOptionalListFields): MerchantStatus {
  if (merchant.status) {
    return merchant.status;
  }

  if (merchant.isLocked || merchant.stores?.some((store) => store.isLocked)) {
    return "locked";
  }

  if (merchant.isActive === false) {
    return "inactive";
  }

  if (merchant.stores?.length) {
    return merchant.stores.some((store) => store.isActive !== false)
      ? "active"
      : "inactive";
  }

  return "active";
}

export function getMerchantStatusLabel(merchant: MerchantWithOptionalListFields) {
  return merchantStatusLabels[getMerchantStatus(merchant)];
}

export function getMerchantProvider(merchant: MerchantWithOptionalListFields) {
  const provider = merchant.stores?.find((store) => store.provider)?.provider;

  return provider ? providerLabels[provider] ?? provider : "Non renseigne";
}

export function getMerchantProviderOption(
  merchant: MerchantWithOptionalListFields,
): MerchantProviderOption {
  const provider = merchant.stores?.find((store) => store.provider)?.provider;

  if (provider === "WOOCOMMERCE" || provider === "SHOPIFY" || provider === "OTHER") {
    return provider;
  }

  return "unknown";
}

export function getFilteredMerchants<T extends MerchantWithOptionalListFields>(
  merchants: T[],
  { searchQuery, statusFilter, providerFilter }: MerchantFilters,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return merchants.filter((merchant) => {
    const searchableText = [
      getMerchantName(merchant),
      getMerchantEmail(merchant),
      getMerchantPhone(merchant),
      getMerchantProvider(merchant),
      getMerchantStatusLabel(merchant),
    ].join(" ").toLowerCase();

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      (statusFilter === "all" || getMerchantStatus(merchant) === statusFilter) &&
      (providerFilter === "all" || getMerchantProviderOption(merchant) === providerFilter)
    );
  });
}

export function getMerchantProviderChartData(
  merchants: MerchantWithOptionalListFields[],
): ChartDataItem[] {
  const counts = merchants.reduce<Record<string, number>>((countDict, merchant) => {
    const provider = getMerchantProvider(merchant);
    countDict[provider] = (countDict[provider] ?? 0) + 1;
    return countDict;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export function getMerchantStatusChartData(
  merchants: MerchantWithOptionalListFields[],
): ChartDataItem[] {
  const counts = merchants.reduce<Record<string, number>>((countDict, merchant) => {
    const status = getMerchantStatusLabel(merchant);
    countDict[status] = (countDict[status] ?? 0) + 1;
    return countDict;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}
