import type {
  MerchantCreatedDeliveryItem,
  MerchantDeliveryItem,
  MerchantMapMarker,
  MerchantNotificationItem,
  MerchantStatusChangeItem,
} from "@/components/dashboard/dashboard-overview.model";
import { geocodeAddress } from "@/lib/geocoding";
import type { ApiKeyListItem } from "./api-keys/api-key.model";
import type { StoreListItem } from "./shops/store.model";
import {
  formatOrderDate,
  formatOrderShortId,
  formatOrderStatus,
  getOrderStatusTone,
  isOrderActive,
  type Order,
  type OrderListItem,
} from "./orders/order.model";

type OrderEvent = {
  destination: string;
  eventLabel: string;
  id: string;
  kind: MerchantNotificationItem["kind"];
  message: string;
  statusLabel: string;
  storeName?: string;
  timestamp: string;
};

function buildCustomerInitials(customerName: string) {
  return (
    customerName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CL"
  );
}

function buildAvatarClass(statusTone: "success" | "warning" | "neutral") {
  if (statusTone === "success") {
    return "bg-emerald-100 text-emerald-900";
  }

  if (statusTone === "warning") {
    return "bg-amber-100 text-amber-900";
  }

  return "bg-slate-100 text-slate-900";
}

function sortOrdersByNewest(orders: OrderListItem[]) {
  return [...orders].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

function sortEventsByNewest<T extends { timestamp: string }>(events: T[]) {
  return [...events].sort(
    (left, right) =>
      new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
  );
}

function isDifferentDate(left: string | null | undefined, right: string) {
  if (!left) {
    return false;
  }

  return Math.abs(new Date(left).getTime() - new Date(right).getTime()) > 1_000;
}

function formatOrderPreciseDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "medium",
  }).format(new Date(value));
}

function buildStoresById(stores: StoreListItem[]) {
  return new Map(stores.map((store) => [store.id, store]));
}

function buildMapTone(statusTone: "success" | "warning" | "neutral") {
  if (statusTone === "success") {
    return "green";
  }

  if (statusTone === "warning") {
    return "amber";
  }

  return "red";
}

export function buildMerchantDeliveryItems(
  orders: OrderListItem[],
  stores: StoreListItem[],
): MerchantDeliveryItem[] {
  const storesById = buildStoresById(stores);

  return sortOrdersByNewest(orders)
    .filter((order) => isOrderActive(order.status))
    .slice(0, 5)
    .map((order) => {
      const store = storesById.get(order.storeId);
      const statusTone = getOrderStatusTone(order.status);

      return {
        id: formatOrderShortId(order.id),
        destination: order.dropOffAddress,
        statusLabel: formatOrderStatus(order.status),
        statusTone,
        time: formatOrderDate(order.createdAt),
        note: store?.name,
        initials: buildCustomerInitials(order.customerName),
        avatarClass: buildAvatarClass(statusTone),
      };
    });
}

export function buildCreatedDeliveryItems(
  orders: OrderListItem[],
  stores: StoreListItem[],
): MerchantCreatedDeliveryItem[] {
  const storesById = buildStoresById(stores);

  return sortOrdersByNewest(orders)
    .slice(0, 5)
    .map((order) => {
      const store = storesById.get(order.storeId);

      return {
        customerName: order.customerName,
        destination: order.dropOffAddress,
        id: formatOrderShortId(order.id),
        statusLabel: formatOrderStatus(order.status),
        storeName: store?.name,
        time: formatOrderPreciseDate(order.createdAt),
      };
    });
}

function buildOrderEvents(
  orders: Order[],
  stores: StoreListItem[],
): OrderEvent[] {
  const storesById = buildStoresById(stores);

  return orders.flatMap((order) => {
    const store = storesById.get(order.storeId);
    const shared: Pick<
      OrderEvent,
      "destination" | "id" | "statusLabel" | "storeName"
    > = {
      destination: order.dropOffAddress,
      id: formatOrderShortId(order.orderId),
      statusLabel: formatOrderStatus(order.status),
      storeName: store?.name,
    };

    const events: Array<OrderEvent | null> = [
      {
        ...shared,
        eventLabel: "Commande créée",
        kind: "delivery-created",
        message: "Commande créée",
        timestamp: order.createdAt,
      },
      order.acceptedAt
        ? {
            ...shared,
            eventLabel: "Acceptée par un livreur",
            kind: "delivery-accepted",
            message: "Commande acceptée par un livreur",
            timestamp: order.acceptedAt,
          }
        : null,
      order.pickedUpAt
        ? {
            ...shared,
            eventLabel: "Récupérée",
            kind: "delivery-picked-up",
            message: "Commande récupérée",
            timestamp: order.pickedUpAt,
          }
        : null,
      order.deliveredAt
        ? {
            ...shared,
            eventLabel: "Livrée",
            kind: "delivery-delivered",
            message: "Commande livrée",
            timestamp: order.deliveredAt,
          }
        : null,
    ];

    return events.filter((event): event is OrderEvent => event !== null);
  });
}

export function buildRecentStatusChangeItems(
  orderDetails: Order[],
  stores: StoreListItem[],
): MerchantStatusChangeItem[] {
  return sortEventsByNewest(buildOrderEvents(orderDetails, stores))
    .filter((event) => event.eventLabel !== "Commande créée")
    .slice(0, 5)
    .map((event) => ({
      destination: event.destination,
      eventLabel: event.eventLabel,
      id: event.id,
      statusLabel: event.statusLabel,
      storeName: event.storeName,
      time: formatOrderPreciseDate(event.timestamp),
    }));
}

export function buildDeliveryNotificationItems(
  orderDetails: Order[],
  stores: StoreListItem[],
  apiKeys: ApiKeyListItem[] = [],
): MerchantNotificationItem[] {
  const storesById = buildStoresById(stores);
  const storeEvents = stores.flatMap((store): MerchantNotificationItem[] => {
    const createdEvent: MerchantNotificationItem = {
      destination: store.address,
      id: store.name,
      kind: "store-created",
      message: "Boutique créée",
      storeName: store.name,
      timestamp: store.createdAt,
      time: formatOrderPreciseDate(store.createdAt),
    };

    if (!isDifferentDate(store.updatedAt, store.createdAt)) {
      return [createdEvent];
    }

    return [
      {
        destination: store.address,
        id: store.name,
        kind: "store-updated",
        message: "Boutique modifiée",
        storeName: store.name,
        timestamp: store.updatedAt,
        time: formatOrderPreciseDate(store.updatedAt),
      },
      createdEvent,
    ];
  });
  const apiKeyEvents = apiKeys.flatMap((apiKey): MerchantNotificationItem[] => {
    const apiKeyWithOptionalUpdate = apiKey as ApiKeyListItem & {
      updatedAt?: string | null;
    };
    const store = storesById.get(apiKey.storeId);
    const createdEvent: MerchantNotificationItem = {
      destination: store?.name
        ? `Boutique : ${store.name}`
        : "Boutique liée à la clé API",
      id: apiKey.name,
      kind: "api-key-created",
      message: "Clé API ajoutée",
      storeName: store?.name,
      timestamp: apiKey.createdAt,
      time: formatOrderPreciseDate(apiKey.createdAt),
    };
    const updatedAt = apiKeyWithOptionalUpdate.updatedAt ?? apiKey.revokedAt;

    if (!updatedAt || !isDifferentDate(updatedAt, apiKey.createdAt)) {
      return [createdEvent];
    }

    return [
      {
        destination: store?.name
          ? `Boutique : ${store.name}`
          : "Boutique liée à la clé API",
        id: apiKey.name,
        kind: "api-key-updated",
        message: "Clé API modifiée",
        storeName: store?.name,
        timestamp: updatedAt,
        time: formatOrderPreciseDate(updatedAt),
      },
      createdEvent,
    ];
  });
  const orderEvents = buildOrderEvents(orderDetails, stores).map((event) => ({
    destination: event.destination,
    id: event.id,
    kind: event.kind,
    message: event.message,
    storeName: event.storeName,
    timestamp: event.timestamp,
    time: formatOrderPreciseDate(event.timestamp),
  }));

  return sortEventsByNewest([
    ...orderEvents,
    ...storeEvents,
    ...apiKeyEvents,
  ])
    .slice(0, 12);
}

export async function buildMerchantMapMarkers(
  orders: OrderListItem[],
): Promise<MerchantMapMarker[]> {
  const markers = await Promise.all(
    sortOrdersByNewest(orders)
      .filter((order) => isOrderActive(order.status))
      .map(async (order): Promise<MerchantMapMarker | null> => {
        const coordinates = await geocodeAddress(order.dropOffAddress);

        if (!coordinates) {
          return null;
        }

        const statusTone = getOrderStatusTone(order.status);

        return {
          id: formatOrderShortId(order.id),
          lat: coordinates.lat,
          lng: coordinates.lng,
          tone: buildMapTone(statusTone),
          destination: order.dropOffAddress,
          status: formatOrderStatus(order.status),
          metaLabel: "Créée le",
          metaValue: formatOrderDate(order.createdAt),
        };
      }),
  );

  return markers.filter((marker): marker is MerchantMapMarker => marker !== null);
}
