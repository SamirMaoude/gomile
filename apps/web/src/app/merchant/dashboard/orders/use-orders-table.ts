"use client";

import { useEffect, useRef, useState } from "react";

import { attachAddressAutocomplete } from "@/lib/address-autocomplete";
import type { StoreListItem } from "../shops/store.model";
import type {
  CreateOrderResult,
  Order,
  OrderListItem,
  OrderRow,
} from "./order.model";
import {
  formatOrderShortId,
  isOrderCancellable,
} from "./order.model";
import {
  ORDER_FIELD_IDS,
  buildCreateOrderPanelHtml,
  buildOrderFormSeed,
  parseCreateOrderInput,
} from "./orders-table.helpers";
import {
  cancelCurrentMerchantOrder,
  createCurrentMerchantOrder,
  getCurrentMerchantOrder,
  listCurrentMerchantOrders,
  listCurrentMerchantStores,
} from "./orders.service";

type UseOrdersTableResult = {
  expandedOrderId: string | null;
  error: string | null;
  getOrderDetailsState: (orderId: string) => OrderDetailsState;
  handleCancelOrder: (order: OrderRow) => Promise<void>;
  handleCreateOrder: () => Promise<void>;
  handleToggleOrderDetails: (order: OrderRow) => Promise<void>;
  isCreating: boolean;
  isLoading: boolean;
  processingOrderId: string | null;
  rows: OrderRow[];
};

type OrderDetailsState = {
  error: string | null;
  isLoading: boolean;
  order: Order | null;
};

const EMPTY_ORDER_DETAILS_STATE: OrderDetailsState = {
  error: null,
  isLoading: false,
  order: null,
};

function mapOrdersToRows(
  orders: OrderListItem[],
  stores: StoreListItem[],
): OrderRow[] {
  const storesById = new Map(stores.map((store) => [store.id, store]));

  return orders.map((order) => {
    const store = storesById.get(order.storeId);

    return {
      ...order,
      storeDomain: store?.domain ?? null,
      storeName: store?.name ?? "Magasin inconnu",
    };
  });
}

function buildCreateOrderSuccessHtml(result: CreateOrderResult) {
  const escapeHtml = (value: string) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

  return `
    <div style="display:grid;gap:12px;text-align:left;margin-top:8px;">
      <div style="display:grid;gap:4px;">
        <strong>Commande créée</strong>
        <span>${escapeHtml(result.message)}</span>
      </div>
      <div style="display:grid;gap:4px;">
        <strong>Frais de livraison</strong>
        <span>${result.deliveryFee.toFixed(2)} EUR</span>
      </div>
      <div style="display:grid;gap:4px;">
        <strong>Distance estimée</strong>
        <span>${result.distanceKm.toFixed(2)} km</span>
      </div>
    </div>
  `;
}

export function useOrdersTable(): UseOrdersTableResult {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [orderDetailsById, setOrderDetailsById] = useState<
    Record<string, OrderDetailsState>
  >({});
  const isMountedRef = useRef(true);

  // The orders table needs both orders and stores:
  // orders give us the operational data,
  // stores give us the readable store name used in the UI and the creation form.
  async function loadOrders(showLoader = true) {
    if (!isMountedRef.current) {
      return;
    }

    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [orders, availableStores] = await Promise.all([
        listCurrentMerchantOrders(),
        listCurrentMerchantStores(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setStores(availableStores);
      setRows(mapOrdersToRows(orders, availableStores));
    } catch (loadError) {
      if (!isMountedRef.current) {
        return;
      }

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les commandes pour le moment.",
      );
    } finally {
      if (isMountedRef.current && showLoader) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void loadOrders();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  function getOrderDetailsState(orderId: string): OrderDetailsState {
    return orderDetailsById[orderId] ?? EMPTY_ORDER_DETAILS_STATE;
  }

  async function handleToggleOrderDetails(order: OrderRow) {
    if (expandedOrderId === order.id) {
      setExpandedOrderId(null);
      return;
    }

    setExpandedOrderId(order.id);

    const currentState = orderDetailsById[order.id];

    if (currentState?.order || currentState?.isLoading) {
      return;
    }

    setOrderDetailsById((previous) => ({
      ...previous,
      [order.id]: {
        error: null,
        isLoading: true,
        order: null,
      },
    }));

    try {
      const orderDetails = await getCurrentMerchantOrder(order.id);

      if (!isMountedRef.current) {
        return;
      }

      setOrderDetailsById((previous) => ({
        ...previous,
        [order.id]: {
          error: null,
          isLoading: false,
          order: orderDetails,
        },
      }));
    } catch (detailsError) {
      if (!isMountedRef.current) {
        return;
      }

      setOrderDetailsById((previous) => ({
        ...previous,
        [order.id]: {
          error:
            detailsError instanceof Error
              ? detailsError.message
              : "Impossible de charger les détails de la commande pour le moment.",
          isLoading: false,
          order: null,
        },
      }));
    }
  }

  async function handleCreateOrder() {
    const Swal = (await import("sweetalert2")).default;

    if (stores.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Aucun magasin disponible",
        text: "Ajoutez d'abord un magasin avant de créer une commande.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d4a017",
      });
      return;
    }

    setIsCreating(true);

    try {
      let createdOrder: CreateOrderResult | null = null;
      let cleanupAddressAutocomplete: (() => void) | null = null;

      const result = await Swal.fire({
        title: "Créer une commande",
        html: buildCreateOrderPanelHtml(buildOrderFormSeed(stores), stores),
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Créer",
        cancelButtonText: "Annuler",
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        didOpen: (popup) => {
          cleanupAddressAutocomplete = attachAddressAutocomplete(
            popup.querySelector<HTMLInputElement>(
              `#${ORDER_FIELD_IDS.dropOffAddress}`,
            ),
          );
        },
        willClose: () => {
          cleanupAddressAutocomplete?.();
        },
        preConfirm: async () => {
          const parsed = parseCreateOrderInput(Swal.getPopup());

          if ("error" in parsed) {
            Swal.showValidationMessage(parsed.error);
            return;
          }

          try {
            createdOrder = await createCurrentMerchantOrder(
              parsed.storeId,
              parsed.value,
            );
            return createdOrder;
          } catch (creationError) {
            Swal.showValidationMessage(
              creationError instanceof Error
                ? creationError.message
                : "Impossible de créer la commande pour le moment.",
            );
            return;
          }
        },
      });

      if (!result.isConfirmed || !createdOrder) {
        return;
      }

      await loadOrders(false);

      await Swal.fire({
        icon: "success",
        title: "Commande créée",
        html: buildCreateOrderSuccessHtml(createdOrder),
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (creationError) {
      await Swal.fire({
        icon: "error",
        title: "Création impossible",
        text:
          creationError instanceof Error
            ? creationError.message
            : "Impossible de créer la commande pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setIsCreating(false);
      }
    }
  }

  async function handleCancelOrder(order: OrderRow) {
    if (!isOrderCancellable(order.status)) {
      return;
    }

    const Swal = (await import("sweetalert2")).default;

    setProcessingOrderId(order.id);

    try {
      const confirmation = await Swal.fire({
        icon: "warning",
        title: "Annuler la commande",
        text: `Voulez-vous vraiment annuler la commande ${formatOrderShortId(order.id)} ?`,
        showCancelButton: true,
        confirmButtonText: "Oui, annuler",
        cancelButtonText: "Non",
        confirmButtonColor: "#d95757",
      });

      if (!confirmation.isConfirmed) {
        return;
      }

      const result = await cancelCurrentMerchantOrder(order.id);
      await loadOrders(false);

      await Swal.fire({
        icon: "success",
        title: "Commande annulée",
        text: result.message,
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (cancelError) {
      await Swal.fire({
        icon: "error",
        title: "Annulation impossible",
        text:
          cancelError instanceof Error
            ? cancelError.message
            : "Impossible d'annuler la commande pour le moment.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      if (isMountedRef.current) {
        setProcessingOrderId(null);
      }
    }
  }

  return {
    expandedOrderId,
    error,
    getOrderDetailsState,
    handleCancelOrder,
    handleCreateOrder,
    handleToggleOrderDetails,
    isCreating,
    isLoading,
    processingOrderId,
    rows,
  };
}
