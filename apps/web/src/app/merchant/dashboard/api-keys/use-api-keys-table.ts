"use client";

import { useEffect, useRef, useState } from "react";

import type { Store, StoreListItem } from "../shops/store.model";
import type {
  ApiKey,
  ApiKeyListItem,
  ApiKeyRow,
  CreateApiKeyInput,
  CreateApiKeyResult,
  UpdateApiKeyInput,
} from "./api-key.model";
import {
  createCurrentMerchantApiKey,
  getCurrentMerchantStore,
  getCurrentMerchantApiKey,
  listCurrentMerchantApiKeys,
  listCurrentMerchantStores,
  revokeCurrentMerchantApiKey,
  updateCurrentMerchantApiKey,
} from "./api-keys.service";

type UseApiKeysTableResult = {
  expandedApiKeyId: string | null;
  error: string | null;
  getStoreDetailsState: (storeId: string) => StoreDetailsState;
  handleCreateApiKey: () => Promise<void>;
  handleEditApiKey: (apiKey: ApiKeyRow) => Promise<void>;
  handleRevokeApiKey: (apiKey: ApiKeyRow) => Promise<void>;
  handleToggleStoreDetails: (apiKey: ApiKeyRow) => Promise<void>;
  isCreating: boolean;
  isLoading: boolean;
  processingApiKeyId: string | null;
  rows: ApiKeyRow[];
};

const API_KEY_FIELD_IDS = {
  expiresAt: "swal-api-key-expires-at",
  name: "swal-api-key-name",
  storeId: "swal-api-key-store-id",
};

type ApiKeyFormSeed = {
  expiresAt: string;
  name: string;
  storeId: string;
  storeName: string;
};

type StoreDetailsState = {
  error: string | null;
  isLoading: boolean;
  store: Store | null;
};

const EMPTY_STORE_DETAILS_STATE: StoreDetailsState = {
  error: null,
  isLoading: false,
  store: null,
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function buildApiKeyFormSeed(apiKey?: ApiKey | ApiKeyRow): ApiKeyFormSeed {
  return {
    name: apiKey?.name ?? "",
    storeId: apiKey?.storeId ?? "",
    storeName: "store" in (apiKey ?? {})
      ? apiKey.store.name
      : "storeName" in (apiKey ?? {})
        ? apiKey.storeName
        : "",
    expiresAt: toDateTimeLocalValue(apiKey?.expiresAt),
  };
}

function buildStoreOptionsHtml(stores: StoreListItem[], selectedStoreId: string) {
  return stores.map((store) => `
    <option value="${escapeHtml(store.id)}" ${store.id === selectedStoreId ? "selected" : ""}>
      ${escapeHtml(store.name)}
    </option>
  `).join("");
}

function buildCreateApiKeyPanelHtml(seed: ApiKeyFormSeed, stores: StoreListItem[]) {
  return `
    <div style="display:grid;gap:12px;text-align:left;margin-top:12px;">
      <div style="display:grid;gap:6px;">
        <label for="${API_KEY_FIELD_IDS.name}" style="font-size:13px;font-weight:600;color:#334155;">Nom de la cle</label>
        <input id="${API_KEY_FIELD_IDS.name}" class="swal2-input" placeholder="Ex: WooCommerce production" value="${escapeHtml(seed.name)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${API_KEY_FIELD_IDS.storeId}" style="font-size:13px;font-weight:600;color:#334155;">Magasin</label>
        <select id="${API_KEY_FIELD_IDS.storeId}" class="swal2-select" style="width:100%;margin:0;">
          <option value="">Selectionnez un magasin</option>
          ${buildStoreOptionsHtml(stores, seed.storeId)}
        </select>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${API_KEY_FIELD_IDS.expiresAt}" style="font-size:13px;font-weight:600;color:#334155;">Expiration</label>
        <input id="${API_KEY_FIELD_IDS.expiresAt}" type="datetime-local" class="swal2-input" value="${escapeHtml(seed.expiresAt)}" style="width:100%;margin:0;" />
      </div>
    </div>
  `;
}

function buildUpdateApiKeyPanelHtml(seed: ApiKeyFormSeed) {
  return `
    <div style="display:grid;gap:12px;text-align:left;margin-top:12px;">
      <div style="display:grid;gap:6px;">
        <label for="${API_KEY_FIELD_IDS.name}" style="font-size:13px;font-weight:600;color:#334155;">Nom de la cle</label>
        <input id="${API_KEY_FIELD_IDS.name}" class="swal2-input" placeholder="Ex: WooCommerce production" value="${escapeHtml(seed.name)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label style="font-size:13px;font-weight:600;color:#334155;">Magasin associe</label>
        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:12px 14px;color:#334155;background:#f8fafc;">
          ${escapeHtml(seed.storeName || "Magasin inconnu")}
        </div>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${API_KEY_FIELD_IDS.expiresAt}" style="font-size:13px;font-weight:600;color:#334155;">Expiration</label>
        <input id="${API_KEY_FIELD_IDS.expiresAt}" type="datetime-local" class="swal2-input" value="${escapeHtml(seed.expiresAt)}" style="width:100%;margin:0;" />
      </div>
    </div>
  `;
}

function readApiKeyPanelValue(popup: HTMLElement | null, selector: string) {
  const element = popup?.querySelector<HTMLInputElement | HTMLSelectElement>(
    `#${selector}`,
  );

  return element?.value.trim() ?? "";
}

function parseExpiresAtInput(value: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toISOString();
}

function parseCreateApiKeyInput(
  popup: HTMLElement | null,
): { error: string } | { value: CreateApiKeyInput } {
  const name = readApiKeyPanelValue(popup, API_KEY_FIELD_IDS.name);
  const storeId = readApiKeyPanelValue(popup, API_KEY_FIELD_IDS.storeId);
  const expiresAt = parseExpiresAtInput(
    readApiKeyPanelValue(popup, API_KEY_FIELD_IDS.expiresAt),
  );

  if (!name) {
    return { error: "Le nom de la cle est obligatoire." };
  }

  if (!storeId) {
    return { error: "Choisissez le magasin associe a cette cle." };
  }

  return {
    value: {
      name,
      storeId,
      ...(expiresAt ? { expiresAt } : {}),
    },
  };
}

function parseUpdateApiKeyInput(
  popup: HTMLElement | null,
): { error: string } | { value: UpdateApiKeyInput } {
  const name = readApiKeyPanelValue(popup, API_KEY_FIELD_IDS.name);
  const expiresAt = parseExpiresAtInput(
    readApiKeyPanelValue(popup, API_KEY_FIELD_IDS.expiresAt),
  );

  if (!name) {
    return { error: "Le nom de la cle est obligatoire." };
  }

  return {
    value: {
      name,
      ...(expiresAt ? { expiresAt } : {}),
    },
  };
}

export function useApiKeysTable(): UseApiKeysTableResult {
  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedApiKeyId, setExpandedApiKeyId] = useState<string | null>(null);
  const [processingApiKeyId, setProcessingApiKeyId] = useState<string | null>(null);
  const [storeDetailsByStoreId, setStoreDetailsByStoreId] = useState<
    Record<string, StoreDetailsState>
  >({});
  const isMountedRef = useRef(true);

  function mapApiKeysToRows(
    apiKeys: ApiKeyListItem[],
    availableStores: StoreListItem[],
  ): ApiKeyRow[] {
    const storesById = new Map(availableStores.map((store) => [store.id, store]));

    return apiKeys.map((apiKey) => {
      const store = storesById.get(apiKey.storeId);

      return {
        ...apiKey,
        storeName: store?.name ?? "Magasin inconnu",
        storeDomain: store?.domain ?? null,
      };
    });
  }

  // We load API keys and stores together because the create panel needs the
  // list of stores, and the table needs store names instead of only store ids.
  async function loadApiKeys(showLoader = true) {
    if (!isMountedRef.current) {
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [apiKeys, availableStores] = await Promise.all([
        listCurrentMerchantApiKeys(),
        listCurrentMerchantStores(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setStores(availableStores);
      setRows(mapApiKeysToRows(apiKeys, availableStores));
    } catch (loadError) {
      if (!isMountedRef.current) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les API keys pour le moment.",
      );
    } finally {
      if (isMountedRef.current && showLoader) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void loadApiKeys();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function getStoreDetailsState(storeId: string): StoreDetailsState {
    return storeDetailsByStoreId[storeId] ?? EMPTY_STORE_DETAILS_STATE;
  }

  async function handleToggleStoreDetails(apiKey: ApiKeyRow) {
    if (expandedApiKeyId === apiKey.id) {
      setExpandedApiKeyId(null);
      return;
    }

    // Only one expanded row stays open at a time. It keeps the table easier
    // to read on desktop and avoids a very tall mobile layout.
    setExpandedApiKeyId(apiKey.id);

    const currentState = storeDetailsByStoreId[apiKey.storeId];

    // If the store has already been loaded once, we reuse it instead of
    // hitting the API again every time the row is opened.
    if (currentState?.store || currentState?.isLoading) {
      return;
    }

    setStoreDetailsByStoreId((previous) => ({
      ...previous,
      [apiKey.storeId]: {
        error: null,
        isLoading: true,
        store: null,
      },
    }));

    try {
      const store = await getCurrentMerchantStore(apiKey.storeId);

      if (!isMountedRef.current) {
        return;
      }

      setStoreDetailsByStoreId((previous) => ({
        ...previous,
        [apiKey.storeId]: {
          error: null,
          isLoading: false,
          store,
        },
      }));
    } catch (storeError) {
      if (!isMountedRef.current) {
        return;
      }

      setStoreDetailsByStoreId((previous) => ({
        ...previous,
        [apiKey.storeId]: {
          error:
            storeError instanceof Error
              ? storeError.message
              : "Impossible de charger les details du magasin pour le moment.",
          isLoading: false,
          store: null,
        },
      }));
    }
  }

  async function handleCreateApiKey() {
    const Swal = (await import("sweetalert2")).default;

    if (stores.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "Aucun magasin",
        text: "Creez d'abord un magasin avant de generer une API key.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
      return;
    }

    setIsCreating(true);

    try {
      // The seed object lets the same SweetAlert form start with known values.
      // Here we use empty defaults because this is a creation flow.
      const seed = buildApiKeyFormSeed();
      const result = await Swal.fire<CreateApiKeyResult>({
        title: "Creer une API key",
        html: buildCreateApiKeyPanelHtml(seed, stores),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Creer",
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          const parsed = parseCreateApiKeyInput(Swal.getPopup());

          if ("error" in parsed) {
            Swal.showValidationMessage(parsed.error);
            return;
          }

          try {
            return await createCurrentMerchantApiKey(parsed.value);
          } catch (error) {
            Swal.showValidationMessage(
              error instanceof Error
                ? error.message
                : "Impossible de creer l'API key pour le moment.",
            );
            return;
          }
        },
      });

      if (!result.isConfirmed || !result.value) {
        return;
      }

      await loadApiKeys(false);

      const payload = result.value;

      await Swal.fire({
        icon: "success",
        title: "API key creee",
        html: `
          <div style="display:grid;gap:10px;text-align:left;">
            <p style="margin:0;">Copiez cette cle maintenant. Elle ne sera plus affichee ensuite.</p>
            <code style="display:block;overflow:auto;border-radius:12px;padding:12px;background:#0f172a;color:#f8fafc;font-size:13px;">${escapeHtml(payload.apiKey)}</code>
          </div>
        `,
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (creationError) {
      await Swal.fire({
        icon: "error",
        title: "Creation impossible",
        text:
          creationError instanceof Error
            ? creationError.message
            : "Impossible de creer l'API key pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setIsCreating(false);
      }
    }
  }

  async function handleEditApiKey(apiKey: ApiKeyRow) {
    if (apiKey.revokedAt) {
      return;
    }

    setProcessingApiKeyId(apiKey.id);

    try {
      // We reload the full API key before editing so the form can use the most
      // recent server value, not only the compact row shown in the table.
      const currentApiKey = await getCurrentMerchantApiKey(apiKey.id);
      const Swal = (await import("sweetalert2")).default;
      const seed = buildApiKeyFormSeed(currentApiKey);

      const result = await Swal.fire<UpdateApiKeyInput>({
        title: "Modifier l'API key",
        html: buildUpdateApiKeyPanelHtml(seed),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Enregistrer",
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          const parsed = parseUpdateApiKeyInput(Swal.getPopup());

          if ("error" in parsed) {
            Swal.showValidationMessage(parsed.error);
            return;
          }

          try {
            await updateCurrentMerchantApiKey(apiKey.id, parsed.value);
            return parsed.value;
          } catch (error) {
            Swal.showValidationMessage(
              error instanceof Error
                ? error.message
                : "Impossible de modifier l'API key pour le moment.",
            );
            return;
          }
        },
      });

      if (!result.isConfirmed) {
        return;
      }

      await loadApiKeys(false);

      await Swal.fire({
        icon: "success",
        title: "API key modifiee",
        text: "L'API key a ete mise a jour avec succes.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (updateError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Modification impossible",
        text:
          updateError instanceof Error
            ? updateError.message
            : "Impossible de modifier l'API key pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingApiKeyId(null);
      }
    }
  }

  async function handleRevokeApiKey(apiKey: ApiKeyRow) {
    if (apiKey.revokedAt) {
      return;
    }

    setProcessingApiKeyId(apiKey.id);

    try {
      const Swal = (await import("sweetalert2")).default;
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Revoquer l'API key ?",
        text: `La cle "${apiKey.name}" sera desactivee definitivement.`,
        showCancelButton: true,
        confirmButtonText: "Revoquer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d95757",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await revokeCurrentMerchantApiKey(apiKey.id);
          } catch (error) {
            Swal.showValidationMessage(
              error instanceof Error
                ? error.message
                : "Impossible de revoquer l'API key pour le moment.",
            );
          }
        },
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await loadApiKeys(false);

      await Swal.fire({
        icon: "success",
        title: "API key revoquee",
        text: "L'API key a ete revoquee avec succes.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (revokeError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Revocation impossible",
        text:
          revokeError instanceof Error
            ? revokeError.message
            : "Impossible de revoquer l'API key pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingApiKeyId(null);
      }
    }
  }

  return {
    expandedApiKeyId,
    error,
    getStoreDetailsState,
    handleCreateApiKey,
    handleEditApiKey,
    handleRevokeApiKey,
    handleToggleStoreDetails,
    isCreating,
    isLoading,
    processingApiKeyId,
    rows,
  };
}
