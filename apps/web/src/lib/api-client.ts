import type {
  CreateStoreInput,
  CreateStoreResponse,
  DeleteStoreResponse,
  ListStoresItem,
  UpdateStoreResponse,
  UpdateStoreInput,
  StoreResponse,
} from "../../../../shared/store-contracts";
import type {
  CreateOrderInput,
  CreateOrderResponse,
  ListMerchantOrdersItem,
  GetOrderResponse,
  CancelOrderResponse,
} from "../../../../shared/order-contracts";
import type {
  CreateApiKeyInput,
  UpdateApiKeyInput,
  CreateApiKeyResponse,
  ListApiKeysItem,
  GetApiKeyResponse,
  UpdateApiKeyResponse,
} from "../../../../shared/api-key-contracts";

export interface MerchantProfileResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
}

export interface UpdateMerchantProfileInput {
  name?: string;
  phone?: string;
}

export interface VerifyMerchantHandshakeInput {
  code: string;
}

export interface VerifyMerchantHandshakeResponse {
  orderId: string;
  message: string;
}

export type {
  CreateStoreInput,
  CreateStoreResponse,
  DeleteStoreResponse,
  ListStoresItem,
  UpdateStoreResponse,
  UpdateStoreInput,
  StoreResponse,
  CreateOrderInput,
  CreateOrderResponse,
  ListMerchantOrdersItem,
  GetOrderResponse,
  CancelOrderResponse,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  CreateApiKeyResponse,
  ListApiKeysItem,
  GetApiKeyResponse,
  UpdateApiKeyResponse,
};
import { requestWithAutoRefresh } from "./protected-request";

// Shared wrapper for protected requests.
// If a request fails because the access token is gone or expired, it asks the
// BFF to refresh cookies and retries the request once automatically.
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  return requestWithAutoRefresh<T>(path, init);
}

export function createStore(merchantId: string, input: CreateStoreInput) {
  return request<CreateStoreResponse>(`/api/merchants/${merchantId}/stores`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listStores(merchantId: string, isActive?: boolean | null) {
  const query = typeof isActive === "boolean" ? `?isActive=${isActive}` : "";
  return request<ListStoresItem[]>(`/api/merchants/${merchantId}/stores${query}`);
}

export function getStore(merchantId: string, storeId: string) {
  return request<StoreResponse>(`/api/merchants/${merchantId}/stores/${storeId}`);
}

export function updateStore(merchantId: string, storeId: string, input: UpdateStoreInput) {
  return request<UpdateStoreResponse>(`/api/merchants/${merchantId}/stores/${storeId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function disableStore(merchantId: string, storeId: string) {
  return request<UpdateStoreResponse>(`/api/merchants/${merchantId}/stores/${storeId}/disable`, {
    method: "POST",
  });
}

export function enableStore(merchantId: string, storeId: string) {
  return request<UpdateStoreResponse>(`/api/merchants/${merchantId}/stores/${storeId}/enable`, {
    method: "POST",
  });
}

export function deleteStore(merchantId: string, storeId: string) {
  return request<DeleteStoreResponse>(`/api/merchants/${merchantId}/stores/${storeId}`, {
    method: "DELETE",
  });
}

export function createOrder(merchantId: string, storeId: string, input: CreateOrderInput) {
  return request<CreateOrderResponse>(
    `/api/merchants/${merchantId}/stores/${storeId}/orders`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function listMerchantOrders(merchantId: string) {
  return request<ListMerchantOrdersItem[]>(`/api/merchants/${merchantId}/orders`);
}

export function getMerchantOrder(merchantId: string, orderId: string) {
  return request<GetOrderResponse>(`/api/merchants/${merchantId}/orders/${orderId}`);
}

export function cancelOrder(merchantId: string, orderId: string) {
  return request<CancelOrderResponse>(
    `/api/merchants/${merchantId}/orders/${orderId}/cancel`,
    { method: "POST" },
  );
}

export function verifyMerchantHandshake(
  merchantId: string,
  storeId: string,
  input: VerifyMerchantHandshakeInput,
) {
  return request<VerifyMerchantHandshakeResponse>(
    `/api/merchants/${merchantId}/stores/${storeId}/orders/handshake/verify`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export function createApiKey(merchantId: string, input: CreateApiKeyInput) {
  return request<CreateApiKeyResponse>(`/api/merchants/${merchantId}/api-keys`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listApiKeys(merchantId: string) {
  return request<ListApiKeysItem[]>(`/api/merchants/${merchantId}/api-keys`);
}

export function getApiKey(merchantId: string, apiKeyId: string) {
  return request<GetApiKeyResponse>(`/api/merchants/${merchantId}/api-keys/${apiKeyId}`);
}

export function updateApiKey(merchantId: string, apiKeyId: string, input: UpdateApiKeyInput) {
  return request<UpdateApiKeyResponse>(
    `/api/merchants/${merchantId}/api-keys/${apiKeyId}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export function revokeApiKey(merchantId: string, apiKeyId: string) {
  return request<void>(`/api/merchants/${merchantId}/api-keys/${apiKeyId}/revoke`, {
    method: "POST",
  });
}

export function getMerchantProfile(merchantId: string) {
  return request<MerchantProfileResponse>(`/api/merchants/${merchantId}`);
}

export function updateMerchantProfile(
  merchantId: string,
  input: UpdateMerchantProfileInput,
) {
  return request<{ name?: string; phone?: string }>(`/api/merchants/${merchantId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
