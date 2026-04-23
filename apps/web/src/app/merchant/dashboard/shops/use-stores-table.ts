"use client";

import { useEffect, useRef, useState } from "react";

import type {
  CreateStoreInput,
  Store,
  StoreListItem,
  StoreProvider,
  UpdateStoreInput,
} from "./store.model";
import {
  createCurrentMerchantStore,
  deleteCurrentMerchantStore,
  disableCurrentMerchantStore,
  enableCurrentMerchantStore,
  getCurrentMerchantStore,
  listCurrentMerchantStores,
  updateCurrentMerchantStore,
} from "./stores.service";

type UseStoresTableResult = {
  error: string | null;
  handleCreateStore: () => Promise<void>;
  handleDeleteStore: (store: StoreListItem) => Promise<void>;
  handleEditStore: (store: StoreListItem) => Promise<void>;
  handleToggleStoreStatus: (store: StoreListItem) => Promise<void>;
  isCreating: boolean;
  isLoading: boolean;
  processingStoreId: string | null;
  rows: StoreListItem[];
};

// IDs and names used to read the SweetAlert form fields safely.
const CREATE_STORE_FIELD_IDS = {
  address: "swal-store-address",
  description: "swal-store-description",
  domain: "swal-store-domain",
  latitude: "swal-store-latitude",
  longitude: "swal-store-longitude",
  name: "swal-store-name",
  webhookUrl: "swal-store-webhook-url",
};
const CREATE_STORE_PROVIDER_NAME = "swal-store-provider";

type StoreFormSeed = {
  address: string;
  description: string;
  domain: string;
  latitude: string;
  longitude: string;
  name: string;
  provider: StoreProvider;
  webhookUrl: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildProviderRadio(
  value: StoreProvider,
  label: string,
  selectedProvider: StoreProvider,
) {
  return `
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;color:#334155;">
      <input type="radio" name="${CREATE_STORE_PROVIDER_NAME}" value="${value}" ${selectedProvider === value ? "checked" : ""} />
      <span>${label}</span>
    </label>
  `;
}

// This object is the "initial state" of the SweetAlert form.
// It lets us prefill inputs when we edit a store.
function buildStoreFormSeed(store?: Store | StoreListItem): StoreFormSeed {
  return {
    name: store?.name ?? "",
    address: store?.address ?? "",
    description: store?.description ?? "",
    domain: store?.domain ?? "",
    latitude: store ? String(store.latitude) : "",
    longitude: store ? String(store.longitude) : "",
    provider: store?.provider ?? "OTHER",
    webhookUrl: store?.webhookUrl ?? "",
  };
}

// Builds the SweetAlert panel shown when the user creates or edits a store.
function buildStorePanelHtml(seed: StoreFormSeed) {
  return `
    <div style="display:grid;gap:12px;text-align:left;margin-top:12px;">
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.name}" style="font-size:13px;font-weight:600;color:#334155;">Nom du magasin</label>
        <input id="${CREATE_STORE_FIELD_IDS.name}" class="swal2-input" placeholder="Ex: GoMile Grenoble" value="${escapeHtml(seed.name)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.address}" style="font-size:13px;font-weight:600;color:#334155;">Adresse</label>
        <input id="${CREATE_STORE_FIELD_IDS.address}" class="swal2-input" placeholder="Ex: 25 boulevard Clemenceau, Grenoble" value="${escapeHtml(seed.address)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <span style="font-size:13px;font-weight:600;color:#334155;">Plateforme</span>
        <div style="display:grid;gap:8px;padding:6px 0 2px 0;">
          ${buildProviderRadio("SHOPIFY", "Shopify", seed.provider)}
          ${buildProviderRadio("WOOCOMMERCE", "WooCommerce", seed.provider)}
          ${buildProviderRadio("OTHER", "Autre", seed.provider)}
        </div>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.domain}" style="font-size:13px;font-weight:600;color:#334155;">Domaine</label>
        <input id="${CREATE_STORE_FIELD_IDS.domain}" class="swal2-input" placeholder="Ex: myshop.com" value="${escapeHtml(seed.domain)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.webhookUrl}" style="font-size:13px;font-weight:600;color:#334155;">Webhook URL</label>
        <input id="${CREATE_STORE_FIELD_IDS.webhookUrl}" class="swal2-input" placeholder="Ex: https://example.com/webhooks/orders" value="${escapeHtml(seed.webhookUrl)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.latitude}" style="font-size:13px;font-weight:600;color:#334155;">Latitude</label>
        <input id="${CREATE_STORE_FIELD_IDS.latitude}" class="swal2-input" placeholder="Ex: 45.188529" inputmode="decimal" value="${escapeHtml(seed.latitude)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.longitude}" style="font-size:13px;font-weight:600;color:#334155;">Longitude</label>
        <input id="${CREATE_STORE_FIELD_IDS.longitude}" class="swal2-input" placeholder="Ex: 5.724524" inputmode="decimal" value="${escapeHtml(seed.longitude)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${CREATE_STORE_FIELD_IDS.description}" style="font-size:13px;font-weight:600;color:#334155;">Description</label>
        <textarea id="${CREATE_STORE_FIELD_IDS.description}" class="swal2-textarea" placeholder="Description optionnelle de la boutique" style="width:100%;height:110px;margin:0;">${escapeHtml(seed.description)}</textarea>
      </div>
    </div>
  `;
}

function readPanelValue(
  popup: HTMLElement | null,
  selector: string,
): string {
  const element = popup?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `#${selector}`,
  );

  return element?.value.trim() ?? "";
}

function readSelectedProvider(popup: HTMLElement | null): StoreProvider {
  const value = popup
    ?.querySelector<HTMLInputElement>(
      `input[name="${CREATE_STORE_PROVIDER_NAME}"]:checked`,
    )
    ?.value;

  switch (value) {
    case "SHOPIFY":
      return "SHOPIFY";
    case "WOOCOMMERCE":
      return "WOOCOMMERCE";
    default:
      return "OTHER";
  }
}

function readDomainValue(popup: HTMLElement | null): string {
  const element = popup?.querySelector<HTMLInputElement>(
    `#${CREATE_STORE_FIELD_IDS.domain}`,
  );

  return element?.value.trim() ?? "";
}

// This function reads the panel inputs and builds the object sent to the API.
// In "create" mode we send a full store payload.
// In "update" mode we can omit provider/domain when they do not need to change.
function parseStorePanelInput(
  popup: HTMLElement | null,
  options: {
    initialValue: StoreFormSeed;
    mode: "create" | "update";
  },
): { error: string } | { value: CreateStoreInput | UpdateStoreInput } {
  const name = readPanelValue(popup, CREATE_STORE_FIELD_IDS.name);
  const address = readPanelValue(popup, CREATE_STORE_FIELD_IDS.address);
  const description = readPanelValue(popup, CREATE_STORE_FIELD_IDS.description);
  const domain = readDomainValue(popup);
  const provider = readSelectedProvider(popup);
  const webhookUrl = readPanelValue(popup, CREATE_STORE_FIELD_IDS.webhookUrl);
  const latitude = Number.parseFloat(
    readPanelValue(popup, CREATE_STORE_FIELD_IDS.latitude),
  );
  const longitude = Number.parseFloat(
    readPanelValue(popup, CREATE_STORE_FIELD_IDS.longitude),
  );

  if (!name || !address) {
    return {
      error: "Le nom et l'adresse du magasin sont obligatoires.",
    };
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      error: "La latitude et la longitude doivent etre valides.",
    };
  }

  if (provider !== "OTHER" && !domain) {
    return {
      error: "Un domaine est requis pour Shopify ou WooCommerce.",
    };
  }

  const basePayload = {
    name,
    address,
    latitude,
    longitude,
    ...(description ? { description } : {}),
    ...(webhookUrl ? { webhookUrl } : {}),
  };

  if (options.mode === "create") {
    return {
      value: {
        ...basePayload,
        ...(domain ? { domain } : {}),
        ...(provider !== "OTHER" ? { provider } : {}),
      },
    };
  }

  const providerChanged = provider !== options.initialValue.provider;
  const domainChanged = domain !== options.initialValue.domain;
  const webhookUrlChanged = webhookUrl !== options.initialValue.webhookUrl;

  return {
    value: {
      ...basePayload,
      ...(providerChanged ? { provider } : {}),
      ...(domainChanged && domain ? { domain } : {}),
      ...(webhookUrlChanged ? { webhookUrl } : {}),
    },
  };
}

async function openStorePanel<TPayload extends CreateStoreInput | UpdateStoreInput>(
  options: {
    confirmButtonText: string;
    initialValue?: StoreFormSeed;
    mode: "create" | "update";
    submit: (input: TPayload) => Promise<void>;
    title: string;
  },
) {
  const Swal = (await import("sweetalert2")).default;
  const seed = options.initialValue ?? buildStoreFormSeed();

  const result = await Swal.fire<TPayload>({
    title: options.title,
    html: buildStorePanelHtml(seed),
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: "Annuler",
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async () => {
      const parsed = parseStorePanelInput(Swal.getPopup(), {
        initialValue: seed,
        mode: options.mode,
      });

      if ("error" in parsed) {
        Swal.showValidationMessage(parsed.error);
        return;
      }

      try {
        await options.submit(parsed.value as TPayload);
        return parsed.value as TPayload;
      } catch (error) {
        Swal.showValidationMessage(
          error instanceof Error
            ? error.message
            : "Impossible de creer la boutique pour le moment.",
        );
        return;
      }
    },
  });

  return result.isConfirmed;
}

export function useStoresTable(): UseStoresTableResult {
  const [rows, setRows] = useState<StoreListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [processingStoreId, setProcessingStoreId] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Loads the current merchant stores and keeps the table state in sync.
  async function loadStores(showLoader = true) {
    if (!isMountedRef.current) {
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const stores = await listCurrentMerchantStores();

      if (!isMountedRef.current) {
        return;
      }

      setRows(stores);
    } catch (loadError) {
      if (!isMountedRef.current) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les magasins pour le moment.",
      );
    } finally {
      if (isMountedRef.current && showLoader) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void loadStores();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Opens the SweetAlert panel, creates the store, then reloads the table.
  async function handleCreateStore() {
    setIsCreating(true);

    try {
      const isConfirmed = await openStorePanel<CreateStoreInput>({
        title: "Creer une boutique",
        confirmButtonText: "Creer",
        mode: "create",
        submit: async (input) => {
          await createCurrentMerchantStore(input);
        },
      });

      if (!isConfirmed) {
        return;
      }

      await loadStores(false);

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: "Boutique creee",
        text: "La boutique a ete creee avec succes.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (creationError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Creation impossible",
        text:
          creationError instanceof Error
            ? creationError.message
            : "Impossible de creer la boutique pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setIsCreating(false);
      }
    }
  }

  // Opens the SweetAlert panel with the current store data and updates it.
  async function handleEditStore(store: StoreListItem) {
    setProcessingStoreId(store.id);

    try {
      // We fetch the full store here because the list view does not contain every field.
      const currentStore = await getCurrentMerchantStore(store.id);

      const isConfirmed = await openStorePanel<UpdateStoreInput>({
        title: "Modifier la boutique",
        confirmButtonText: "Enregistrer",
        mode: "update",
        initialValue: buildStoreFormSeed(currentStore),
        submit: async (input) => {
          await updateCurrentMerchantStore(store.id, input);
        },
      });

      if (!isConfirmed) {
        return;
      }

      await loadStores(false);

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: "Boutique modifiee",
        text: "La boutique a ete mise a jour avec succes.",
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
            : "Impossible de modifier la boutique pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingStoreId(null);
      }
    }
  }

  // Enables or disables the store depending on its current status.
  async function handleToggleStoreStatus(store: StoreListItem) {
    setProcessingStoreId(store.id);

    try {
      if (store.isActive) {
        await disableCurrentMerchantStore(store.id);
      } else {
        await enableCurrentMerchantStore(store.id);
      }

      await loadStores(false);

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: store.isActive ? "Boutique desactivee" : "Boutique reactivee",
        text: store.isActive
          ? "La boutique a ete desactivee avec succes."
          : "La boutique a ete reactivee avec succes.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (toggleError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: store.isActive ? "Desactivation impossible" : "Reactivation impossible",
        text:
          toggleError instanceof Error
            ? toggleError.message
            : "Impossible de changer le statut de la boutique pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingStoreId(null);
      }
    }
  }

  // Confirms and deletes the selected store.
  async function handleDeleteStore(store: StoreListItem) {
    setProcessingStoreId(store.id);

    try {
      const Swal = (await import("sweetalert2")).default;

      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Supprimer la boutique ?",
        text: `Cette action supprimera "${store.name}".`,
        showCancelButton: true,
        confirmButtonText: "Supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d95757",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await deleteCurrentMerchantStore(store.id);
          } catch (error) {
            Swal.showValidationMessage(
              error instanceof Error
                ? error.message
                : "Impossible de supprimer la boutique pour le moment.",
            );
          }
        },
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      await loadStores(false);

      await Swal.fire({
        icon: "success",
        title: "Boutique supprimee",
        text: "La boutique a ete supprimee avec succes.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (deleteError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Suppression impossible",
        text:
          deleteError instanceof Error
            ? deleteError.message
            : "Impossible de supprimer la boutique pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingStoreId(null);
      }
    }
  }

  return {
    error,
    handleCreateStore,
    handleDeleteStore,
    handleEditStore,
    handleToggleStoreStatus,
    isCreating,
    isLoading,
    processingStoreId,
    rows,
  };
}
