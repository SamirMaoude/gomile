import { cn } from "../style";
import {
  formatStoreDate,
  formatStoreProvider,
  type Store,
} from "../shops/store.model";

export type ApiKeyActionTone = "danger" | "info" | "neutral";

export type StoreDetailItem =
  | {
      key: string;
      label: string;
      type: "link";
      value: string;
    }
  | {
      key: string;
      label: string;
      type: "text";
      value: string;
    };

// This helper keeps all non-visual rules in one file so the .tsx component can
// stay focused on rendering the interface.
export function getApiKeyActionButtonClassName(
  isDarkMode: boolean,
  tone: ApiKeyActionTone,
) {
  const shared = "!h-9 !w-9 !rounded-full !p-0 !border !shadow-none";

  if (tone === "danger") {
    return cn(
      shared,
      isDarkMode
        ? "!border-rose-800 !text-rose-300 hover:!bg-rose-950/50"
        : "!border-rose-200 !text-rose-700 hover:!bg-rose-50",
    );
  }

  if (tone === "neutral") {
    return cn(
      shared,
      isDarkMode
        ? "!border-slate-700 !text-slate-200 hover:!bg-slate-800"
        : "!border-slate-200 !text-slate-700 hover:!bg-slate-50",
    );
  }

  return cn(
    shared,
    isDarkMode
      ? "!border-sky-700 !text-sky-300 hover:!bg-sky-950/60"
      : "!border-sky-200 !text-sky-700 hover:!bg-sky-50",
  );
}

export function getApiKeyDetailsToggleLabel(isExpanded: boolean) {
  return isExpanded
    ? "Masquer les details du magasin"
    : "Afficher les details du magasin";
}

export function buildStoreDetailItems(store: Store): StoreDetailItem[] {
  return [
    {
      key: "name",
      label: "Nom",
      type: "text",
      value: store.name,
    },
    {
      key: "status",
      label: "Statut",
      type: "text",
      value: store.isActive ? "Actif" : "Desactive",
    },
    {
      key: "provider",
      label: "Plateforme",
      type: "text",
      value: formatStoreProvider(store.provider),
    },
    {
      key: "address",
      label: "Adresse",
      type: "text",
      value: store.address,
    },
    {
      key: "description",
      label: "Description",
      type: "text",
      value: store.description || "Pas de description",
    },
    {
      key: "domain",
      label: "Domaine",
      type: "text",
      value: store.domain || "Pas de domaine",
    },
    {
      key: "webhook",
      label: "Webhook",
      type: store.webhookUrl ? "link" : "text",
      value: store.webhookUrl || "Pas de webhook",
    },
    {
      key: "coordinates",
      label: "Coordonnees",
      type: "text",
      value: `${store.latitude}, ${store.longitude}`,
    },
    {
      key: "createdAt",
      label: "Cree le",
      type: "text",
      value: formatStoreDate(store.createdAt),
    },
  ];
}
