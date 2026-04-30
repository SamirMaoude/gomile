import {
  cancelOrder as cancelOrderRequest,
  createOrder as createOrderRequest,
  getMerchantOrder as getMerchantOrderRequest,
  listMerchantOrders as listMerchantOrdersRequest,
  verifyMerchantHandshake as verifyMerchantHandshakeRequest,
} from "@/lib/api-client";
import {
  listCurrentMerchantStores,
  resolveCurrentMerchantId,
} from "../shops/stores.service";
import type {
  CancelOrderResult,
  CreateOrderInput,
  CreateOrderResult,
  Order,
  OrderListItem,
} from "./order.model";

export type VerifyMerchantHandshakeResult = {
  orderId: string;
  orderReference?: string | null;
  message: string;
};

export function listMerchantOrders(merchantId: string): Promise<OrderListItem[]> {
  return listMerchantOrdersRequest(merchantId);
}

export function getMerchantOrder(
  merchantId: string,
  orderId: string,
): Promise<Order> {
  return getMerchantOrderRequest(merchantId, orderId);
}

export function createMerchantOrder(
  merchantId: string,
  storeId: string,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  return createOrderRequest(merchantId, storeId, input);
}

export function cancelMerchantOrder(
  merchantId: string,
  orderId: string,
): Promise<CancelOrderResult> {
  return cancelOrderRequest(merchantId, orderId);
}

export async function listCurrentMerchantOrders(): Promise<OrderListItem[]> {
  const merchantId = await resolveCurrentMerchantId();
  return listMerchantOrders(merchantId);
}

export async function getCurrentMerchantOrder(orderId: string): Promise<Order> {
  const merchantId = await resolveCurrentMerchantId();
  return getMerchantOrder(merchantId, orderId);
}

export async function createCurrentMerchantOrder(
  storeId: string,
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  const merchantId = await resolveCurrentMerchantId();
  return createMerchantOrder(merchantId, storeId, input);
}

export async function cancelCurrentMerchantOrder(
  orderId: string,
): Promise<CancelOrderResult> {
  const merchantId = await resolveCurrentMerchantId();
  return cancelMerchantOrder(merchantId, orderId);
}

export async function verifyCurrentMerchantPickupHandshake(
  storeId: string,
  code: string,
): Promise<VerifyMerchantHandshakeResult> {
  const merchantId = await resolveCurrentMerchantId();
  return verifyMerchantHandshakeRequest(merchantId, storeId, { code });
}

export { listCurrentMerchantStores };
