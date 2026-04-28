import type {
  CreateStoreInput as SharedCreateStoreInput,
  CreateStoreResponse as SharedCreateStoreResponse,
  ConfigureWebhookInput as SharedConfigureWebhookInput,
  ConfigureWebhookResponse as SharedConfigureWebhookResponse,
  DeleteStoreResponse as SharedDeleteStoreResponse,
  ListStoresItem as SharedListStoresItem,
  StoreProvider as SharedStoreProvider,
  StoreResponse as SharedStoreResponse,
  UpdateStoreResponse as SharedUpdateStoreResponse,
  UpdateStoreInput as SharedUpdateStoreInput,
} from "../../../../../../../shared/store-contracts";

export type StoreProvider = SharedStoreProvider;
export type Store = SharedStoreResponse;
export type StoreListItem = SharedListStoresItem;
export type CreateStoreInput = SharedCreateStoreInput;
export type UpdateStoreInput = SharedUpdateStoreInput;
export type CreateStoreResult = SharedCreateStoreResponse;
export type ConfigureWebhookInput = SharedConfigureWebhookInput;
export type ConfigureWebhookResult = SharedConfigureWebhookResponse;
export type UpdateStoreResult = SharedUpdateStoreResponse;
export type DeleteStoreResult = SharedDeleteStoreResponse;

export function formatStoreDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatStoreProvider(provider: StoreProvider | null) {
  switch (provider) {
    case "WOOCOMMERCE":
      return "WooCommerce";
    case "SHOPIFY":
      return "Shopify";
    case "OTHER":
      return "Autre";
    default:
      return "Non configure";
  }
}
