import type {
  MerchantDeliveryItem,
  MerchantMapMarker,
} from "@/components/dashboard/dashboard-overview.model";
import type { StoreListItem } from "./shops/store.model";
import {
  formatOrderDate,
  formatOrderShortId,
  formatOrderStatus,
  getOrderStatusTone,
  isOrderActive,
  type OrderListItem,
} from "./orders/order.model";

const GRENOBLE_CENTER = {
  lat: 45.1885,
  lng: 5.7245,
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

function buildOrderSeed(orderId: string) {
  return orderId.split("").reduce((total, character) => (
    total + character.charCodeAt(0)
  ), 0);
}

// Orders do not expose delivery GPS coordinates.
// To still display something meaningful on the map, we anchor each marker near
// the store coordinates and apply a small deterministic offset based on the
// order id. This makes markers stable between renders.
function buildMarkerCoordinates(order: OrderListItem, store?: StoreListItem) {
  const baseLat = store?.latitude ?? GRENOBLE_CENTER.lat;
  const baseLng = store?.longitude ?? GRENOBLE_CENTER.lng;
  const seed = buildOrderSeed(order.id);
  const angle = (seed % 360) * (Math.PI / 180);
  const radius = 0.0025 + ((seed % 9) * 0.00035);

  return {
    lat: baseLat + Math.sin(angle) * radius,
    lng: baseLng + Math.cos(angle) * radius,
  };
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
  const storesById = new Map(stores.map((store) => [store.id, store]));

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

export function buildMerchantMapMarkers(
  orders: OrderListItem[],
  stores: StoreListItem[],
): MerchantMapMarker[] {
  const storesById = new Map(stores.map((store) => [store.id, store]));

  return sortOrdersByNewest(orders)
    .filter((order) => isOrderActive(order.status))
    .map((order) => {
      const store = storesById.get(order.storeId);
      const coordinates = buildMarkerCoordinates(order, store);
      const statusTone = getOrderStatusTone(order.status);

      return {
        id: formatOrderShortId(order.id),
        lat: coordinates.lat,
        lng: coordinates.lng,
        tone: buildMapTone(statusTone),
        destination: order.dropOffAddress,
        status: formatOrderStatus(order.status),
        metaLabel: "Creee le",
        metaValue: formatOrderDate(order.createdAt),
      };
    });
}
