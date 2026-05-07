import type { Order, OrderListItem, OrderStatus } from "../orders/order.model";
import { formatOrderDate, formatOrderShortId, formatOrderStatus } from "../orders/order.model";

export type DeliveryRow = OrderListItem & {
  statusDate: string;
  statusDateLabel: string;
  storeName: string;
};

export type { OrderStatus };

export function formatDeliveryShortId(deliveryId: string) {
  return formatOrderShortId(deliveryId);
}

export function formatDeliveryStatus(status: OrderStatus) {
  return formatOrderStatus(status);
}

export function formatDeliveryDate(value: string) {
  return formatOrderDate(value);
}

export function resolveDeliveryStatusDate(order: Order) {
  switch (order.status) {
    case "DRIVER_ACCEPTED":
      return {
        date: order.acceptedAt ?? order.createdAt,
        label: order.acceptedAt ? "Acceptee le" : "Creee le",
      };
    case "PICKED_UP":
      return {
        date: order.pickedUpAt ?? order.acceptedAt ?? order.createdAt,
        label: order.pickedUpAt ? "Recuperee le" : "Creee le",
      };
    case "DELIVERED":
      return {
        date: order.deliveredAt ?? order.pickedUpAt ?? order.createdAt,
        label: order.deliveredAt ? "Livree le" : "Creee le",
      };
    case "CANCELLED":
      return {
        date: order.cancelledAt ?? order.createdAt,
        label: order.cancelledAt ? "Annulee le" : "Creee le",
      };
    case "DRIVER_ASSIGNED":
      return {
        date: order.acceptedAt ?? order.createdAt,
        label: order.acceptedAt ? "Assignee le" : "Creee le",
      };
    case "SEARCHING_DRIVER":
    default:
      return {
        date: order.createdAt,
        label: "Creee le",
      };
  }
}

export function getDeliveryStatusTone(status: OrderStatus) {
  if (status === "SEARCHING_DRIVER") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  if (status === "DELIVERED") {
    return "neutral";
  }

  return "success";
}
