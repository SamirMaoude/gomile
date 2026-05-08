import type { OrderStatus, OrderType } from './order-contracts';

// Events emitted by the server to clients
export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
}

export interface NewOrderEvent {
  orderId: string;
  reward: number;
  distanceKm: number;
  type: OrderType;
  pickup: string;
}

export interface DriverStatusEvent {
  driverId: string;
  status: 'AVAILABLE' | 'OFFLINE' | 'BUSY';
}

// Events emitted by clients to the server
export interface JoinOrderPayload {
  orderId: string;
}

export interface JoinMerchantPayload {
  merchantId: string;
}

export interface JoinDriverPayload {
  driverId: string;
}

// Event names
export const WS_EVENTS = {
  // Client → Server
  JOIN_ORDER: 'join-order',
  JOIN_MERCHANT: 'join-merchant',
  JOIN_DRIVER: 'join-driver',

  // Server → Client
  ORDER_STATUS: 'order:status',
  ORDER_NEW: 'order:new',
  DRIVER_STATUS: 'driver:status',
} as const;
