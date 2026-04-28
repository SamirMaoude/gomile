import {
  configureWebhook as configureWebhookRequest,
  createStore as createStoreRequest,
  deleteStore as deleteStoreRequest,
  disableStore as disableStoreRequest,
  enableStore as enableStoreRequest,
  getStore as getStoreRequest,
  listStores as listStoresRequest,
  updateStore as updateStoreRequest,
} from "@/lib/api-client";
import { getCurrentMerchantSession } from "@/lib/merchant-session";
import type {
  CreateStoreInput,
  CreateStoreResult,
  ConfigureWebhookInput,
  ConfigureWebhookResult,
  DeleteStoreResult,
  Store,
  StoreListItem,
  UpdateStoreInput,
  UpdateStoreResult,
} from "./store.model";

export async function resolveCurrentMerchantId(): Promise<string> {
  const session = await getCurrentMerchantSession();
  return session.user.id;
}

export function listMerchantStores(
  merchantId: string,
  isActive?: boolean | null,
): Promise<StoreListItem[]> {
  // The shared api client still types store endpoints with the generic
  // StoreResponse contract, while the real backend list route returns the
  // list DTO with `_count.orders`.
  return listStoresRequest(merchantId, isActive) as Promise<StoreListItem[]>;
}

export function getMerchantStore(
  merchantId: string,
  storeId: string,
): Promise<Store> {
  return getStoreRequest(merchantId, storeId);
}

export function createMerchantStore(
  merchantId: string,
  input: CreateStoreInput,
): Promise<CreateStoreResult> {
  // Create/update/enable/disable use dedicated response DTOs on the backend.
  // We narrow the generic client return type here to match the actual route.
  return createStoreRequest(merchantId, input) as Promise<CreateStoreResult>;
}

export function configureMerchantStoreWebhook(
  merchantId: string,
  storeId: string,
  input: ConfigureWebhookInput,
): Promise<ConfigureWebhookResult> {
  return configureWebhookRequest(
    merchantId,
    storeId,
    input,
  ) as Promise<ConfigureWebhookResult>;
}

export function updateMerchantStore(
  merchantId: string,
  storeId: string,
  input: UpdateStoreInput,
): Promise<UpdateStoreResult> {
  return updateStoreRequest(merchantId, storeId, input) as Promise<UpdateStoreResult>;
}

export function disableMerchantStore(
  merchantId: string,
  storeId: string,
): Promise<UpdateStoreResult> {
  return disableStoreRequest(merchantId, storeId) as Promise<UpdateStoreResult>;
}

export function enableMerchantStore(
  merchantId: string,
  storeId: string,
): Promise<UpdateStoreResult> {
  return enableStoreRequest(merchantId, storeId) as Promise<UpdateStoreResult>;
}

export function deleteMerchantStore(
  merchantId: string,
  storeId: string,
): Promise<DeleteStoreResult> {
  return deleteStoreRequest(merchantId, storeId) as Promise<DeleteStoreResult>;
}

export async function listCurrentMerchantStores(
  isActive?: boolean | null,
): Promise<StoreListItem[]> {
  const merchantId = await resolveCurrentMerchantId();
  return listMerchantStores(merchantId, isActive);
}

export async function getCurrentMerchantStore(storeId: string): Promise<Store> {
  const merchantId = await resolveCurrentMerchantId();
  return getMerchantStore(merchantId, storeId);
}

export async function createCurrentMerchantStore(
  input: CreateStoreInput,
): Promise<CreateStoreResult> {
  const merchantId = await resolveCurrentMerchantId();
  return createMerchantStore(merchantId, input);
}

export async function configureCurrentMerchantStoreWebhook(
  storeId: string,
  input: ConfigureWebhookInput,
): Promise<ConfigureWebhookResult> {
  const merchantId = await resolveCurrentMerchantId();
  return configureMerchantStoreWebhook(merchantId, storeId, input);
}

export async function updateCurrentMerchantStore(
  storeId: string,
  input: UpdateStoreInput,
): Promise<UpdateStoreResult> {
  const merchantId = await resolveCurrentMerchantId();
  return updateMerchantStore(merchantId, storeId, input);
}

export async function disableCurrentMerchantStore(
  storeId: string,
): Promise<UpdateStoreResult> {
  const merchantId = await resolveCurrentMerchantId();
  return disableMerchantStore(merchantId, storeId);
}

export async function enableCurrentMerchantStore(
  storeId: string,
): Promise<UpdateStoreResult> {
  const merchantId = await resolveCurrentMerchantId();
  return enableMerchantStore(merchantId, storeId);
}

export async function deleteCurrentMerchantStore(
  storeId: string,
): Promise<DeleteStoreResult> {
  const merchantId = await resolveCurrentMerchantId();
  return deleteMerchantStore(merchantId, storeId);
}
