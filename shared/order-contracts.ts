export const ORDER_STATUSES = [
  'SEARCHING_DRIVER',
  'DRIVER_ASSIGNED',
  'DRIVER_ACCEPTED',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_TYPES = [
  'FOOD',
  'PHARMACY',
  'GROCERY',
  'CLOTHING',
  'ELECTRONICS',
  'FURNITURE',
  'DOCUMENTS',
  'OTHER',
] as const;

export type OrderType = (typeof ORDER_TYPES)[number];

export const PACKAGE_SIZES = [
  'SMALL',
  'MEDIUM',
  'LARGE',
  'EXTRA_LARGE',
] as const;

export type PackageSize = (typeof PACKAGE_SIZES)[number];

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  dropOffAddress: string;
  type: OrderType;
  packageSize?: PackageSize;
  weight?: number;
  orderReference?: string;
}

export interface HandshakeInput {
  code: string;
}


export interface CreateOrderResponse {
  orderId: string;
  deliveryCode: string;
  deliveryFee: number;
  distanceKm: number;
  message: string;
}

export interface ListMerchantOrdersItem {
  id: string;
  storeId: string;
  driverId: string | null;
  customerName: string;
  dropOffAddress: string;
  status: OrderStatus;
  createdAt: string;
}

export interface GetOrderResponse {
  orderId: string;
  storeId: string;
  driverId: string | null;
  customerName: string;
  customerPhone: string;
  dropOffAddress: string;
  status: OrderStatus;
  createdAt: string;
  acceptedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

export interface CancelOrderResponse {
  message: string;
}


export interface ListDriverOrdersItem {
  id: string;
  storeId: string;
  merchantId: string;
  customerName: string;
  dropOffAddress: string;
  status: OrderStatus;
  createdAt: string;
  acceptedAt: string | null;
}
