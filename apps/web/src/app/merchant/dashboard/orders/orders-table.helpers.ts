import { cn } from "../style";
import type { StoreListItem } from "../shops/store.model";
import type { CreateOrderInput, OrderType, PackageSize } from "./order.model";

export type OrderActionTone = "danger";

export type OrderFormSeed = {
  customerName: string;
  customerPhone: string;
  dropOffAddress: string;
  orderReference: string;
  storeId: string;
  type: OrderType;
  packageSize: PackageSize;
  weight: string;
};

export const ORDER_FIELD_IDS = {
  customerName: "swal-order-customer-name",
  customerPhone: "swal-order-customer-phone",
  dropOffAddress: "swal-order-dropoff-address",
  orderReference: "swal-order-reference",
  storeId: "swal-order-store-id",
  type: "swal-order-type",
  packageSize: "swal-order-package-size",
  weight: "swal-order-weight",
};

const ORDER_TYPE_OPTIONS: Array<{ label: string; value: OrderType }> = [
  { label: "Alimentaire", value: "FOOD" },
  { label: "Pharmacie", value: "PHARMACY" },
  { label: "Courses", value: "GROCERY" },
  { label: "Vetements", value: "CLOTHING" },
  { label: "Electronique", value: "ELECTRONICS" },
  { label: "Mobilier", value: "FURNITURE" },
  { label: "Documents", value: "DOCUMENTS" },
  { label: "Autre", value: "OTHER" },
];

const PACKAGE_SIZE_OPTIONS: Array<{ label: string; value: PackageSize }> = [
  { label: "Petit", value: "SMALL" },
  { label: "Moyen", value: "MEDIUM" },
  { label: "Grand", value: "LARGE" },
  { label: "Tres grand", value: "EXTRA_LARGE" },
];

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getOrderActionButtonClassName(
  isDarkMode: boolean,
  tone: OrderActionTone,
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

  return shared;
}

export function buildOrderFormSeed(
  stores: StoreListItem[],
  storeId?: string,
): OrderFormSeed {
  return {
    customerName: "",
    customerPhone: "",
    dropOffAddress: "",
    orderReference: "",
    storeId: storeId ?? stores[0]?.id ?? "",
    type: "FOOD",
    packageSize: "MEDIUM",
    weight: "",
  };
}

function buildStoreOptionsHtml(stores: StoreListItem[], selectedStoreId: string) {
  return stores.map((store) => `
    <option value="${escapeHtml(store.id)}" ${store.id === selectedStoreId ? "selected" : ""}>
      ${escapeHtml(store.name)}
    </option>
  `).join("");
}

function buildSelectOptionsHtml<T extends string>(
  options: Array<{ label: string; value: T }>,
  selectedValue: T,
) {
  return options.map((option) => `
    <option value="${escapeHtml(option.value)}" ${option.value === selectedValue ? "selected" : ""}>
      ${escapeHtml(option.label)}
    </option>
  `).join("");
}

// This helper builds the HTML injected into SweetAlert.
// Keeping it here lets the React table component stay focused on JSX only.
export function buildCreateOrderPanelHtml(
  seed: OrderFormSeed,
  stores: StoreListItem[],
) {
  return `
    <div style="display:grid;gap:12px;text-align:left;margin-top:12px;">
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.storeId}" style="font-size:13px;font-weight:600;color:#334155;">Magasin</label>
        <select id="${ORDER_FIELD_IDS.storeId}" class="swal2-select" style="width:100%;margin:0;">
          <option value="">Selectionnez un magasin</option>
          ${buildStoreOptionsHtml(stores, seed.storeId)}
        </select>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.customerName}" style="font-size:13px;font-weight:600;color:#334155;">Nom du client</label>
        <input id="${ORDER_FIELD_IDS.customerName}" class="swal2-input" placeholder="Ex: Jean Dupont" value="${escapeHtml(seed.customerName)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.customerPhone}" style="font-size:13px;font-weight:600;color:#334155;">Telephone du client</label>
        <input id="${ORDER_FIELD_IDS.customerPhone}" class="swal2-input" placeholder="Ex: +33 6 12 34 56 78" value="${escapeHtml(seed.customerPhone)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.orderReference}" style="font-size:13px;font-weight:600;color:#334155;">Reference de commande</label>
        <input id="${ORDER_FIELD_IDS.orderReference}" class="swal2-input" placeholder="Ex: CMD-21042" value="${escapeHtml(seed.orderReference)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.type}" style="font-size:13px;font-weight:600;color:#334155;">Type de commande</label>
        <select id="${ORDER_FIELD_IDS.type}" class="swal2-select" style="width:100%;margin:0;">
          ${buildSelectOptionsHtml(ORDER_TYPE_OPTIONS, seed.type)}
        </select>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.packageSize}" style="font-size:13px;font-weight:600;color:#334155;">Taille du colis</label>
        <select id="${ORDER_FIELD_IDS.packageSize}" class="swal2-select" style="width:100%;margin:0;">
          ${buildSelectOptionsHtml(PACKAGE_SIZE_OPTIONS, seed.packageSize)}
        </select>
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.weight}" style="font-size:13px;font-weight:600;color:#334155;">Poids (kg)</label>
        <input id="${ORDER_FIELD_IDS.weight}" type="number" min="0" step="0.1" class="swal2-input" placeholder="Ex: 3.5" value="${escapeHtml(seed.weight)}" style="width:100%;margin:0;" />
      </div>
      <div style="display:grid;gap:6px;">
        <label for="${ORDER_FIELD_IDS.dropOffAddress}" style="font-size:13px;font-weight:600;color:#334155;">Adresse de livraison</label>
        <textarea id="${ORDER_FIELD_IDS.dropOffAddress}" class="swal2-textarea" placeholder="Ex: 12 rue Lesdiguieres, Grenoble" style="width:100%;height:110px;margin:0;">${escapeHtml(seed.dropOffAddress)}</textarea>
      </div>
    </div>
  `;
}

function readOrderPanelValue(
  popup: HTMLElement | null,
  selector: string,
): string {
  const element = popup?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `#${selector}`,
  );

  return element?.value.trim() ?? "";
}

// This function converts the raw SweetAlert DOM values into the payload expected
// by the API and returns the chosen store id separately.
export function parseCreateOrderInput(
  popup: HTMLElement | null,
): { error: string } | { storeId: string; value: CreateOrderInput } {
  const storeId = readOrderPanelValue(popup, ORDER_FIELD_IDS.storeId);
  const customerName = readOrderPanelValue(popup, ORDER_FIELD_IDS.customerName);
  const customerPhone = readOrderPanelValue(popup, ORDER_FIELD_IDS.customerPhone);
  const dropOffAddress = readOrderPanelValue(popup, ORDER_FIELD_IDS.dropOffAddress);
  const orderReference = readOrderPanelValue(popup, ORDER_FIELD_IDS.orderReference);
  const type = readOrderPanelValue(popup, ORDER_FIELD_IDS.type) as OrderType;
  const packageSize = readOrderPanelValue(
    popup,
    ORDER_FIELD_IDS.packageSize,
  ) as PackageSize;
  const rawWeight = readOrderPanelValue(popup, ORDER_FIELD_IDS.weight);
  const weight = rawWeight ? Number.parseFloat(rawWeight) : undefined;

  if (!storeId) {
    return { error: "Choisissez le magasin qui emet cette commande." };
  }

  if (!customerName || !customerPhone || !dropOffAddress) {
    return {
      error: "Le nom, le telephone et l'adresse de livraison sont obligatoires.",
    };
  }

  if (!type) {
    return { error: "Choisissez le type de commande." };
  }

  if (!packageSize) {
    return { error: "Choisissez la taille du colis." };
  }

  if (rawWeight && (weight === undefined || !Number.isFinite(weight) || weight < 0)) {
    return { error: "Le poids doit etre un nombre positif ou nul." };
  }

  return {
    storeId,
    value: {
      customerName,
      customerPhone,
      dropOffAddress,
      type,
      packageSize,
      ...(weight !== undefined ? { weight } : {}),
      ...(orderReference ? { orderReference } : {}),
    },
  };
}
