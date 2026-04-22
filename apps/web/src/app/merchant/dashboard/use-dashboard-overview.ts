"use client";

import { useEffect, useRef, useState } from "react";

import type {
  MerchantDeliveryItem,
  MerchantMapMarker,
} from "@/components/dashboard/dashboard-overview.model";
import {
  buildMerchantDeliveryItems,
  buildMerchantMapMarkers,
} from "./dashboard-overview.helpers";
import { listCurrentMerchantOrders } from "./orders/orders.service";
import { listCurrentMerchantStores } from "./shops/stores.service";

type UseDashboardOverviewResult = {
  activeDeliveries: MerchantDeliveryItem[];
  isLoadingOverview: boolean;
  mapMarkers: MerchantMapMarker[];
  overviewError: string | null;
};

const OVERVIEW_REFRESH_INTERVAL_MS = 30_000;

export function useDashboardOverview(): UseDashboardOverviewResult {
  const [activeDeliveries, setActiveDeliveries] = useState<MerchantDeliveryItem[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MerchantMapMarker[]>([]);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const isMountedRef = useRef(true);

  async function loadOverview(showLoader = true) {
    if (!isMountedRef.current) {
      return;
    }

    if (showLoader) {
      setIsLoadingOverview(true);
    }

    setOverviewError(null);

    try {
      const [orders, stores] = await Promise.all([
        listCurrentMerchantOrders(),
        listCurrentMerchantStores(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      setActiveDeliveries(buildMerchantDeliveryItems(orders, stores));
      setMapMarkers(buildMerchantMapMarkers(orders, stores));
    } catch (loadError) {
      if (!isMountedRef.current) {
        return;
      }

      setOverviewError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de synchroniser le dashboard pour le moment.",
      );
      setActiveDeliveries([]);
      setMapMarkers([]);
    } finally {
      if (isMountedRef.current && showLoader) {
        setIsLoadingOverview(false);
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    void loadOverview();

    // The dashboard is a live overview screen.
    // We poll periodically so status changes done elsewhere are reflected
    // without forcing the merchant to reload the page manually.
    const intervalId = window.setInterval(() => {
      void loadOverview(false);
    }, OVERVIEW_REFRESH_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return {
    activeDeliveries,
    isLoadingOverview,
    mapMarkers,
    overviewError,
  };
}
