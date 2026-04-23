import type {
  CreateApiKeyInput as SharedCreateApiKeyInput,
  CreateApiKeyResponse as SharedCreateApiKeyResponse,
  GetApiKeyResponse as SharedGetApiKeyResponse,
  ListApiKeysItem as SharedListApiKeysItem,
  UpdateApiKeyInput as SharedUpdateApiKeyInput,
  UpdateApiKeyResponse as SharedUpdateApiKeyResponse,
} from "../../../../../../../shared/api-key-contracts";

export type ApiKey = SharedGetApiKeyResponse;
export type ApiKeyListItem = SharedListApiKeysItem;
export type ApiKeyRow = SharedListApiKeysItem & {
  storeDomain: string | null;
  storeName: string;
};
export type CreateApiKeyInput = SharedCreateApiKeyInput;
export type UpdateApiKeyInput = SharedUpdateApiKeyInput;
export type CreateApiKeyResult = SharedCreateApiKeyResponse;
export type UpdateApiKeyResult = SharedUpdateApiKeyResponse;

export function formatApiKeyDate(value: string | null) {
  if (!value) {
    return "Non defini";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function getApiKeyStatus(apiKey: Pick<ApiKeyListItem, "expiresAt" | "revokedAt">) {
  if (apiKey.revokedAt) {
    return "REVOKED";
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt).getTime() <= Date.now()) {
    return "EXPIRED";
  }

  return "ACTIVE";
}
