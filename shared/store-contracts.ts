export type StoreProvider = 'WOOCOMMERCE' | 'SHOPIFY' | 'OTHER';

export interface CreateStoreInput {
  name: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  domain?: string;
  provider?: StoreProvider;
  webhookUrl?: string;
}

export interface UpdateStoreInput {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  domain?: string;
  provider?: StoreProvider;
  webhookUrl?: string;
}

export interface StoreResponse {
  id: string;
  merchantId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  isLocked: boolean;
  address: string;
  latitude: number;
  longitude: number;
  domain: string | null;
  provider: StoreProvider | null;
  webhookUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoreOrderCount {
  orders: number;
}

export interface ListStoresItem extends StoreResponse {
  _count: StoreOrderCount;
}

export interface CreateStoreResponse {
  id: string;
  name: string;
}

export interface UpdateStoreResponse {
  id: string;
  name: string;
  message: string;
}

export interface DeleteStoreResponse {
  message: string;
}
