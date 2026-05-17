export {
  formatDate,
  getDeliveriesCountByDay,
  getDeliveriesCountByMonth,
  type ChartDataItem,
  type Order,
} from "../drivers/AdminFunctions";

import { formatDate, type ChartDataItem } from "../drivers/AdminFunctions";
import type { SubscriptionStatus, SubscriptionTier } from "../admin";

export type MerchantStatus = "active" | "inactive" | "locked";
export type MerchantStatusOption = "all" | MerchantStatus;
export type MerchantSubscriptionOption = "all" | SubscriptionTier;
export type MerchantSubscriptionStatusOption = "all" | SubscriptionStatus;

export type MerchantStore = {
  id?: string;
  name?: string;
  address?: string;
  createdAt?: string;
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
  subscription?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  totalOrders?: number;
  storesCount?: number;
  store?: MerchantStore[];
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
  subscriptionFilter: MerchantSubscriptionOption;
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

const subscriptionLabels: Record<SubscriptionTier, string> = {
  FREE: "Gratuit",
  STARTER: "Starter",
  PRO: "Pro",
};

const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  TRIAL: "Essai",
  ACTIVE: "Actif",
  PAST_DUE: "Paiement en retard",
  CANCELLED: "Annule",
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

export function getMerchantStores(merchant: MerchantWithOptionalListFields) {
  return merchant.stores ?? merchant.store ?? [];
}

export function getMerchantStoresCount(merchant: MerchantWithOptionalListFields) {
  return merchant.storesCount ?? merchant._count?.stores ?? getMerchantStores(merchant).length;
}

export function getMerchantOrdersCount(merchant: MerchantWithOptionalListFields) {
  if (typeof merchant.totalOrders === "number") {
    return merchant.totalOrders;
  }

  if (typeof merchant._count?.orders === "number") {
    return merchant._count.orders;
  }

  return getMerchantStores(merchant).reduce((total, store) => {
    return total + (store._count?.orders ?? 0);
  }, 0);
}

export function getMerchantStatus(merchant: MerchantWithOptionalListFields): MerchantStatus {
  if (merchant.status) {
    return merchant.status;
  }

  if (
    merchant.subscriptionStatus === "CANCELLED" ||
    merchant.isLocked ||
    getMerchantStores(merchant).some((store) => store.isLocked)
  ) {
    return "locked";
  }

  if (merchant.subscriptionStatus === "PAST_DUE" || merchant.isActive === false) {
    return "inactive";
  }

  const stores = getMerchantStores(merchant);

  if (stores.length) {
    return stores.some((store) => store.isActive !== false)
      ? "active"
      : "inactive";
  }

  return "active";
}

export function getMerchantStatusLabel(merchant: MerchantWithOptionalListFields) {
  return merchantStatusLabels[getMerchantStatus(merchant)];
}

export function getMerchantProvider(merchant: MerchantWithOptionalListFields) {
  const provider = getMerchantStores(merchant).find((store) => store.provider)?.provider;

  return provider ? providerLabels[provider] ?? provider : "Non renseigne";
}

export function getMerchantSubscriptionLabel(merchant: MerchantWithOptionalListFields) {
  return merchant.subscription ? subscriptionLabels[merchant.subscription] : "Non renseigne";
}

export function getMerchantSubscriptionStatusLabel(
  merchant: MerchantWithOptionalListFields,
) {
  return merchant.subscriptionStatus
    ? subscriptionStatusLabels[merchant.subscriptionStatus]
    : "Non renseigne";
}

export function getFilteredMerchants<T extends MerchantWithOptionalListFields>(
  merchants: T[],
  { searchQuery, statusFilter, subscriptionFilter }: MerchantFilters,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return merchants.filter((merchant) => {
    const searchableText = [
      getMerchantName(merchant),
      getMerchantEmail(merchant),
      getMerchantPhone(merchant),
      getMerchantSubscriptionLabel(merchant),
      getMerchantSubscriptionStatusLabel(merchant),
      getMerchantStatusLabel(merchant),
    ].join(" ").toLowerCase();

    return (
      (!normalizedSearch || searchableText.includes(normalizedSearch)) &&
      (statusFilter === "all" || getMerchantStatus(merchant) === statusFilter) &&
      (subscriptionFilter === "all" || merchant.subscription === subscriptionFilter)
    );
  });
}

export function getMerchantSubscriptionChartData(
  merchants: MerchantWithOptionalListFields[],
): ChartDataItem[] {
  const counts = merchants.reduce<Record<string, number>>((countDict, merchant) => {
    const subscription = getMerchantSubscriptionLabel(merchant);
    countDict[subscription] = (countDict[subscription] ?? 0) + 1;
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

export function getMerchantStoresCountChartData(
  merchants: MerchantWithOptionalListFields[],
): ChartDataItem[] {
  const counts = merchants.reduce<Record<string, number>>((countDict, merchant) => {
    const storesCount = getMerchantStoresCount(merchant);
    const label = storesCount === 0
      ? "0 commerce"
      : storesCount === 1
        ? "1 commerce"
        : storesCount <= 3
          ? "2-3 commerces"
          : "4+ commerces";

    countDict[label] = (countDict[label] ?? 0) + 1;
    return countDict;
  }, {});

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

function parseValidDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function getStoresAddedCountByDay(
  merchants: MerchantWithOptionalListFields[],
  day: string | Date,
) {
  const targetDate = typeof day === "string" ? parseValidDate(day) : day;

  if (!targetDate || Number.isNaN(targetDate.getTime())) {
    return 0;
  }

  return merchants.reduce((total, merchant) => {
    return total + getMerchantStores(merchant).filter((store) => {
      const storeDate = parseValidDate(store.createdAt);

      return storeDate ? isSameDay(storeDate, targetDate) : false;
    }).length;
  }, 0);
}
