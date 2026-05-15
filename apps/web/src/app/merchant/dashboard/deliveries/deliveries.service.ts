import type { StoreListItem } from "../shops/store.model";
import {
  getCurrentMerchantOrder,
  listCurrentMerchantOrders,
  listCurrentMerchantStores,
} from "../orders/orders.service";
import {
  isDeliveryTrackingStatus,
  resolveDeliveryStatusDate,
  type DeliveryRow,
} from "./delivery.model";

export async function listCurrentMerchantDeliveries(): Promise<DeliveryRow[]> {
  const snapshot = await listCurrentMerchantDeliverySnapshot();
  return snapshot.deliveries;
}

export async function listCurrentMerchantDeliverySnapshot(): Promise<{
  deliveries: DeliveryRow[];
  orderIds: string[];
}> {
  const [orders, stores] = await Promise.all([
    listCurrentMerchantOrders(),
    listCurrentMerchantStores(),
  ]);
  const storesById = new Map<string, StoreListItem>(
    stores.map((store) => [store.id, store]),
  );
  const deliveryOrders = orders.filter((order) =>
    isDeliveryTrackingStatus(order.status),
  );

  const details = await Promise.all(
    deliveryOrders.map((order) => getCurrentMerchantOrder(order.id)),
  );
  const detailsById = new Map(details.map((order) => [order.orderId, order]));

  const deliveries = deliveryOrders
    .map((order) => {
      const detail = detailsById.get(order.id);
      const statusDate = detail
        ? resolveDeliveryStatusDate(detail)
        : { date: order.createdAt, label: "Créée le" };

      return {
        ...order,
        statusDate: statusDate.date,
        statusDateLabel: statusDate.label,
        storeName: storesById.get(order.storeId)?.name ?? "Magasin inconnu",
      };
    })
    .sort((left, right) =>
      new Date(right.statusDate).getTime() - new Date(left.statusDate).getTime(),
    );

  return {
    deliveries,
    orderIds: orders.map((order) => order.id),
  };
}
