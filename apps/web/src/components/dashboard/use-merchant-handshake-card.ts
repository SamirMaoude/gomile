"use client";

import { useEffect, useState, type FormEvent } from "react";

import { formatOrderShortId } from "@/app/merchant/dashboard/orders/order.model";
import { verifyCurrentMerchantPickupHandshake } from "@/app/merchant/dashboard/orders/orders.service";
import { listCurrentMerchantStores } from "@/app/merchant/dashboard/shops/stores.service";
import type { StoreListItem } from "@/app/merchant/dashboard/shops/store.model";

type MerchantHandshakeFeedback = {
  kind: "error" | "success";
  message: string;
};

function normalizeHandshakeErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Verification impossible pour le moment.";
  }

  if (
    error.message === "Illegal order state" ||
    error.message === "Statut de commande incorrect pour cette operation"
  ) {
    return "Cette verification fonctionne uniquement quand la commande est accepté par un livreur!";
  }

  if (
    error.message === "Handshake not found ?!" ||
    error.message === "Code de handshake non trouve"
  ) {
    return "Aucun code de prise en charge valide n'a ete trouve pour cette boutique. Verifiez que vous utilisez bien le code montre par le livreur.";
  }

  return error.message;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function useMerchantHandshakeCard() {
  const [stores, setStores] = useState<StoreListItem[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [code, setCode] = useState("");
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<MerchantHandshakeFeedback | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    async function loadStores() {
      try {
        const merchantStores = await listCurrentMerchantStores(true);

        if (!isActive) {
          return;
        }

        setStores(merchantStores);
        setSelectedStoreId((currentValue) =>
          currentValue || merchantStores[0]?.id || "",
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        setFeedback({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Impossible de charger les boutiques pour le handshake.",
        });
      } finally {
        if (isActive) {
          setIsLoadingStores(false);
        }
      }
    }

    void loadStores();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const normalizedCode = code.trim();

    if (!selectedStoreId) {
      setFeedback({
        kind: "error",
        message: "Selectionnez une boutique avant de verifier le code.",
      });
      return;
    }

    if (!normalizedCode) {
      setFeedback({
        kind: "error",
        message: "Renseignez le code handshake recu.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await verifyCurrentMerchantPickupHandshake(
        selectedStoreId,
        normalizedCode,
      );

      setFeedback({
        kind: "success",
        message: `${result.message} - ${formatOrderShortId(result.orderId)}`,
      });
      setCode("");

      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "success",
        title: "Handshake validé",
        html: `
          <div style="display:grid;gap:10px;text-align:left;">
            <p style="margin:0;">${escapeHtml(result.message)}</p>
            <div style="display:grid;gap:6px;">
              <span style="font-size:13px;font-weight:700;color:#334155;">Order ID</span>
              <code style="display:block;overflow-wrap:anywhere;border-radius:12px;padding:10px 12px;background:#0f172a;color:#f8fafc;font-size:13px;">${escapeHtml(result.orderId)}</code>
            </div>
            ${
              result.orderReference
                ? `<p style="margin:0;font-size:13px;color:#64748b;">Référence : ${escapeHtml(result.orderReference)}</p>`
                : ""
            }
          </div>
        `,
        confirmButtonText: "Fermer",
        confirmButtonColor: "#7ebb2b",
      });
    } catch (error) {
      setFeedback({
        kind: "error",
        message: normalizeHandshakeErrorMessage(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    code,
    feedback,
    handleSubmit,
    isLoadingStores,
    isSubmitting,
    selectedStoreId,
    setCode,
    setSelectedStoreId,
    stores,
  };
}
