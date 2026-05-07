"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { attachAddressAutocomplete } from "@/lib/address-autocomplete";
import type {
  CreateStoreInput,
  ConfigureWebhookInput,
  ConfigureWebhookResult,
  Store,
  StoreListItem,
  StoreProvider,
  UpdateStoreInput,
} from "./store.model";
import {
  configureCurrentMerchantStoreWebhook,
  createCurrentMerchantStore,
  deleteCurrentMerchantStore,
  disableCurrentMerchantStore,
  enableCurrentMerchantStore,
  getCurrentMerchantStore,
  listCurrentMerchantStores,
  updateCurrentMerchantStore,
} from "./stores.service";

type UseStoresTableResult = {
  handleConfigureWebhook: (store: StoreListItem) => Promise<void>;
  error: string | null;
  handleCreateStore: () => Promise<void>;
  handleDeleteStore: (store: StoreListItem) => Promise<void>;
  handleEditStore: (store: StoreListItem) => Promise<void>;
  handleStatusFilterChange: (statusFilter: StoreStatusFilter) => void;
  handleToggleStoreStatus: (store: StoreListItem) => Promise<void>;
  isCreating: boolean;
  isLoading: boolean;
  processingStoreId: string | null;
  rows: StoreListItem[];
  statusFilter: StoreStatusFilter;
};

export type StoreStatusFilter = boolean | null;

// IDs and names used to read the SweetAlert form fields safely.
const CREATE_STORE_FIELD_IDS = {
  address: "swal-store-address",
  description: "swal-store-description",
  domain: "swal-store-domain",
  name: "swal-store-name",
};
const CREATE_STORE_PROVIDER_NAME = "swal-store-provider";

type StoreFormSeed = {
  address: string;
  description: string;
  domain: string;
  name: string;
  provider: StoreProvider;
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
    provider: store?.provider ?? "OTHER",
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

function isValidWebhookUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
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

  if (!name || !address) {
    return {
      error: "Le nom et l'adresse du magasin sont obligatoires.",
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
    ...(description ? { description } : {}),
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

  return {
    value: {
      ...basePayload,
      ...(providerChanged ? { provider } : {}),
      ...(domainChanged && domain ? { domain } : {}),
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
  let cleanupAddressAutocomplete: (() => void) | null = null;

  const result = await Swal.fire<TPayload>({
    title: options.title,
    html: buildStorePanelHtml(seed),
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText,
    cancelButtonText: "Annuler",
    showLoaderOnConfirm: true,
    allowOutsideClick: () => !Swal.isLoading(),
    didOpen: (popup) => {
      cleanupAddressAutocomplete = attachAddressAutocomplete(
        popup.querySelector<HTMLInputElement>(
          `#${CREATE_STORE_FIELD_IDS.address}`,
        ),
      );
    },
    willClose: () => {
      cleanupAddressAutocomplete?.();
    },
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
  const [statusFilter, setStatusFilter] = useState<StoreStatusFilter>(null);
  const isMountedRef = useRef(true);
  const requestSequenceRef = useRef(0);

  // Loads the current merchant stores and keeps the table state in sync.
  const loadStores = useCallback(async (showLoader = true) => {
    if (!isMountedRef.current) {
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;

    try {
      const stores = await listCurrentMerchantStores(statusFilter);

      if (!isMountedRef.current || requestSequenceRef.current !== requestId) {
        return;
      }

      setRows(stores);
    } catch (loadError) {
      if (!isMountedRef.current || requestSequenceRef.current !== requestId) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les magasins pour le moment.",
      );
    } finally {
      if (
        isMountedRef.current &&
        requestSequenceRef.current === requestId &&
        showLoader
      ) {
        setIsLoading(false);
      }
    }
  }, [statusFilter]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadStores();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadStores]);

  function handleStatusFilterChange(nextStatusFilter: StoreStatusFilter) {
    setStatusFilter(nextStatusFilter);
  }

  async function handleConfigureWebhook(store: StoreListItem) {
    setProcessingStoreId(store.id);

    try {
      const Swal = (await import("sweetalert2")).default;

      const result = await Swal.fire<ConfigureWebhookResult>({
        title: store.webhookUrl
          ? "Modifier le webhook"
          : "Ajouter un webhook",
        input: "url",
        inputLabel: "URL du webhook",
        inputPlaceholder: "https://myshop.com/webhooks/gomile",
        inputValue: store.webhookUrl ?? "",
        showCancelButton: true,
        confirmButtonText: store.webhookUrl ? "Mettre à jour" : "Enregistrer",
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        inputValidator: (value) => {
          const trimmedValue = value.trim();

          if (!trimmedValue) {
            return "L'URL du webhook est obligatoire.";
          }

          if (!isValidWebhookUrl(trimmedValue)) {
            return "Entrez une URL webhook valide en http ou https.";
          }

          return undefined;
        },
        preConfirm: async (value) => {
          const trimmedValue = value.trim();

          try {
            return await configureCurrentMerchantStoreWebhook(store.id, {
              webhookUrl: trimmedValue,
            } satisfies ConfigureWebhookInput);
          } catch (error) {
            Swal.showValidationMessage(
              error instanceof Error
                ? error.message
                : "Impossible de configurer le webhook pour le moment.",
            );
            return;
          }
        },
      });

      if (!result.isConfirmed || !result.value) {
        return;
      }

      await loadStores(false);

      await Swal.fire({
        icon: "success",
        title: "Webhook configuré",
        html: `
          <div style="display:grid;gap:10px;text-align:left;">
            <p>L'URL du webhook a été enregistrée.</p>
            <p style="margin:0;">Secret de signature :</p>
            <code style="display:block;overflow-wrap:anywhere;padding:10px 12px;border-radius:12px;background:#0f172a;color:#f8fafc;">${result.value.webhookSecret}</code>
            <p style="margin:0;font-size:13px;color:#64748b;">Ce secret n'est affiché qu'une seule fois. Conservez-le côté boutique.</p>
          </div>
        `,
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (configureError) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Configuration impossible",
        text:
          configureError instanceof Error
            ? configureError.message
            : "Impossible de configurer le webhook pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingStoreId(null);
      }
    }
  }

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
    handleConfigureWebhook,
    handleCreateStore,
    handleDeleteStore,
    handleEditStore,
    handleStatusFilterChange,
    handleToggleStoreStatus,
    isCreating,
    isLoading,
    processingStoreId,
    rows,
    statusFilter,
  };
}
