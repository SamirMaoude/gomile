"use client";

import { useEffect, useRef, useState } from "react";

import { useOrderStatusSocket } from "@/lib/order-status-socket";
import type { DeliveryRow } from "./delivery.model";
import { listCurrentMerchantDeliverySnapshot } from "./deliveries.service";

type UseDeliveriesTableResult = {
  error: string | null;
  isLoading: boolean;
  rows: DeliveryRow[];
};

export function useDeliveriesTable(): UseDeliveriesTableResult {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [trackedOrderIds, setTrackedOrderIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  async function loadDeliveries(showLoader = true) {
    if (showLoader) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const snapshot = await listCurrentMerchantDeliverySnapshot();

      if (!isMountedRef.current) {
        return;
      }

      setRows(snapshot.deliveries);
      setTrackedOrderIds(snapshot.orderIds);
    } catch (loadError) {
      if (!isMountedRef.current) {
        return;
      }

      setRows([]);
      setTrackedOrderIds([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger les livraisons pour le moment.",
      );
    } finally {
      if (isMountedRef.current && showLoader) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;

    void loadDeliveries();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useOrderStatusSocket({
    orderIds: trackedOrderIds,
    onStatusChange: () => {
      void loadDeliveries(false);
    },
  });

  return {
    error,
    isLoading,
    rows,
  };
}
