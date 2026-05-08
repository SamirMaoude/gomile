import type {
  CancelOrderResponse as SharedCancelOrderResponse,
  CreateOrderInput as SharedCreateOrderInput,
  CreateOrderResponse as SharedCreateOrderResponse,
  GetOrderResponse as SharedGetOrderResponse,
  ListMerchantOrdersItem as SharedListMerchantOrdersItem,
  OrderType as SharedOrderType,
  PackageSize as SharedPackageSize,
  OrderStatus as SharedOrderStatus,
} from "../../../../../../../shared/order-contracts";

export type OrderStatus = SharedOrderStatus;
export type OrderType = SharedOrderType;
export type PackageSize = SharedPackageSize;
export type Order = SharedGetOrderResponse;
export type OrderListItem = SharedListMerchantOrdersItem;
export type OrderRow = SharedListMerchantOrdersItem & {
  storeDomain: string | null;
  storeName: string;
};
export type CreateOrderInput = SharedCreateOrderInput;
export type CreateOrderResult = SharedCreateOrderResponse;
export type CancelOrderResult = SharedCancelOrderResponse;

export function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatOrderShortId(orderId: string) {
  return `#${orderId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function formatOrderStatus(status: OrderStatus) {
  switch (status) {
    case "SEARCHING_DRIVER":
      return "Recherche livreur";
    case "DRIVER_ASSIGNED":
      return "Livreur assigné";
    case "DRIVER_ACCEPTED":
      return "Livreur accepté";
    case "PICKED_UP":
      return "Récupérée";
    case "DELIVERED":
      return "Livrée";
    case "CANCELLED":
      return "Annulée";
    default:
      return status;
  }
}

export function isOrderActive(status: OrderStatus) {
  return (
    status === "SEARCHING_DRIVER"
    || status === "DRIVER_ACCEPTED"
    || status === "PICKED_UP"
  );
}

export function isOrderCancellable(status: OrderStatus) {
  return status === "SEARCHING_DRIVER" || status === "DRIVER_ACCEPTED";
}

export function getOrderStatusTone(status: OrderStatus) {
  if (status === "SEARCHING_DRIVER") {
    return "warning";
  }

  if (
    status === "DRIVER_ASSIGNED"
    || status === "DRIVER_ACCEPTED"
    || status === "PICKED_UP"
  ) {
    return "success";
  }

  return "neutral";
}
