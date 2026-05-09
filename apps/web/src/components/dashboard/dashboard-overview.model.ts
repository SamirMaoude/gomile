export type DeliveryStatusTone = "success" | "warning" | "neutral";

export type MerchantDeliveryItem = {
  id: string;
  destination: string;
  statusLabel: string;
  statusTone: DeliveryStatusTone;
  time: string;
  note?: string;
  initials: string;
  avatarClass: string;
};

export type MerchantCreatedDeliveryItem = {
  customerName: string;
  destination: string;
  id: string;
  statusLabel: string;
  storeName?: string;
  time: string;
};

export type MerchantStatusChangeItem = {
  destination: string;
  eventLabel: string;
  id: string;
  statusLabel: string;
  storeName?: string;
  time: string;
};

export type MerchantNotificationItem = {
  destination: string;
  id: string;
  kind:
    | "api-key-created"
    | "api-key-updated"
    | "delivery-accepted"
    | "delivery-created"
    | "delivery-delivered"
    | "delivery-picked-up"
    | "store-created"
    | "store-updated";
  message: string;
  storeName?: string;
  timestamp: string;
  time: string;
};

export type MerchantMapMarkerTone = "green" | "amber" | "red";

export type MerchantMapMarker = {
  id: string;
  lat: number;
  lng: number;
  tone: MerchantMapMarkerTone;
  destination?: string;
  status?: string;
  metaLabel?: string;
  metaValue?: string;
};
