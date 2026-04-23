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
