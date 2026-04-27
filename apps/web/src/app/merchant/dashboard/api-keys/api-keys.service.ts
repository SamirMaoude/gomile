import {
  createApiKey as createApiKeyRequest,
  getApiKey as getApiKeyRequest,
  listApiKeys as listApiKeysRequest,
  revokeApiKey as revokeApiKeyRequest,
  updateApiKey as updateApiKeyRequest,
} from "@/lib/api-client";
import {
  getCurrentMerchantStore,
  listCurrentMerchantStores,
  resolveCurrentMerchantId,
} from "../shops/stores.service";
import type {
  ApiKey,
  ApiKeyListItem,
  CreateApiKeyInput,
  CreateApiKeyResult,
  UpdateApiKeyInput,
  UpdateApiKeyResult,
} from "./api-key.model";

export function listMerchantApiKeys(merchantId: string): Promise<ApiKeyListItem[]> {
  return listApiKeysRequest(merchantId);
}

export function getMerchantApiKey(
  merchantId: string,
  apiKeyId: string,
): Promise<ApiKey> {
  return getApiKeyRequest(merchantId, apiKeyId);
}

export function createMerchantApiKey(
  merchantId: string,
  input: CreateApiKeyInput,
): Promise<CreateApiKeyResult> {
  return createApiKeyRequest(merchantId, input);
}

export function updateMerchantApiKey(
  merchantId: string,
  apiKeyId: string,
  input: UpdateApiKeyInput,
): Promise<UpdateApiKeyResult> {
  return updateApiKeyRequest(merchantId, apiKeyId, input);
}

export function revokeMerchantApiKey(merchantId: string, apiKeyId: string) {
  return revokeApiKeyRequest(merchantId, apiKeyId);
}

export async function listCurrentMerchantApiKeys(): Promise<ApiKeyListItem[]> {
  const merchantId = await resolveCurrentMerchantId();
  return listMerchantApiKeys(merchantId);
}

export async function getCurrentMerchantApiKey(apiKeyId: string): Promise<ApiKey> {
  const merchantId = await resolveCurrentMerchantId();
  return getMerchantApiKey(merchantId, apiKeyId);
}

export async function createCurrentMerchantApiKey(
  input: CreateApiKeyInput,
): Promise<CreateApiKeyResult> {
  const merchantId = await resolveCurrentMerchantId();
  return createMerchantApiKey(merchantId, input);
}

export async function updateCurrentMerchantApiKey(
  apiKeyId: string,
  input: UpdateApiKeyInput,
): Promise<UpdateApiKeyResult> {
  const merchantId = await resolveCurrentMerchantId();
  return updateMerchantApiKey(merchantId, apiKeyId, input);
}

export async function revokeCurrentMerchantApiKey(apiKeyId: string) {
  const merchantId = await resolveCurrentMerchantId();
  return revokeMerchantApiKey(merchantId, apiKeyId);
}

export { getCurrentMerchantStore, listCurrentMerchantStores };
