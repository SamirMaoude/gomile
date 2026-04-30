"use client";

import { useEffect, useRef, useState } from "react";

import type { DeliveryRow } from "./delivery.model";
import { listCurrentMerchantDeliveries } from "./deliveries.service";

type UseDeliveriesTableResult = {
  error: string | null;
  isLoading: boolean;
  rows: DeliveryRow[];
};

export function useDeliveriesTable(): UseDeliveriesTableResult {
  const [rows, setRows] = useState<DeliveryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function loadDeliveries() {
      setIsLoading(true);
      setError(null);

      try {
        const deliveries = await listCurrentMerchantDeliveries();

        if (!isMountedRef.current) {
          return;
        }

        setRows(deliveries);
      } catch (loadError) {
        if (!isMountedRef.current) {
          return;
        }

        setRows([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Impossible de charger les livraisons pour le moment.",
        );
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    void loadDeliveries();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    error,
    isLoading,
    rows,
  };
}
