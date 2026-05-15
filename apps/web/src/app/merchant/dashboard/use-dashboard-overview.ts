"use client";

import { useEffect, useRef, useState } from "react";

import type {
  MerchantCreatedDeliveryItem,
  MerchantDeliveryItem,
  MerchantMapMarker,
  MerchantNotificationItem,
  MerchantStatusChangeItem,
} from "@/components/dashboard/dashboard-overview.model";
import {
  buildCreatedDeliveryItems,
  buildDeliveryNotificationItems,
  buildMerchantDeliveryItems,
  buildMerchantMapMarkers,
  buildRecentStatusChangeItems,
} from "./dashboard-overview.helpers";
import { useOrderStatusSocket } from "@/lib/order-status-socket";
import { listCurrentMerchantApiKeys } from "./api-keys/api-keys.service";
import {
  getCurrentMerchantOrder,
  listCurrentMerchantOrders,
} from "./orders/orders.service";
import { listCurrentMerchantStores } from "./shops/stores.service";

type UseDashboardOverviewResult = {
  activeDeliveries: MerchantDeliveryItem[];
  createdDeliveries: MerchantCreatedDeliveryItem[];
  deliveryNotifications: MerchantNotificationItem[];
  isLoadingOverview: boolean;
  mapMarkers: MerchantMapMarker[];
  overviewError: string | null;
  recentStatusChanges: MerchantStatusChangeItem[];
};

const OVERVIEW_REFRESH_INTERVAL_MS = 30_000;

export function useDashboardOverview(): UseDashboardOverviewResult {
  const [activeDeliveries, setActiveDeliveries] = useState<MerchantDeliveryItem[]>([]);
  const [createdDeliveries, setCreatedDeliveries] = useState<
    MerchantCreatedDeliveryItem[]
  >([]);
  const [recentStatusChanges, setRecentStatusChanges] = useState<
    MerchantStatusChangeItem[]
  >([]);
  const [deliveryNotifications, setDeliveryNotifications] = useState<
    MerchantNotificationItem[]
  >([]);
  const [mapMarkers, setMapMarkers] = useState<MerchantMapMarker[]>([]);
  const [trackedOrderIds, setTrackedOrderIds] = useState<string[]>([]);
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
      const [orders, stores, apiKeys] = await Promise.all([
        listCurrentMerchantOrders(),
        listCurrentMerchantStores(),
        listCurrentMerchantApiKeys(),
      ]);

      if (!isMountedRef.current) {
        return;
      }

      const orderDetailResults = await Promise.allSettled(
        orders.slice(0, 30).map((order) => getCurrentMerchantOrder(order.id)),
      );
      const orderDetails = orderDetailResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);
      const deliveryItems = buildMerchantDeliveryItems(orders, stores);
      const createdDeliveryItems = buildCreatedDeliveryItems(orders, stores);
      const recentStatusChangeItems = buildRecentStatusChangeItems(
        orderDetails,
        stores,
      );
      const deliveryNotificationItems = buildDeliveryNotificationItems(
        orderDetails,
        stores,
        apiKeys,
      );
      const markers = await buildMerchantMapMarkers(orders);

      if (!isMountedRef.current) {
        return;
      }

      setTrackedOrderIds(orders.map((order) => order.id));
      setActiveDeliveries(deliveryItems);
      setCreatedDeliveries(createdDeliveryItems);
      setRecentStatusChanges(recentStatusChangeItems);
      setDeliveryNotifications(deliveryNotificationItems);
      setMapMarkers(markers);
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
      setCreatedDeliveries([]);
      setRecentStatusChanges([]);
      setDeliveryNotifications([]);
      setMapMarkers([]);
      setTrackedOrderIds([]);
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

  useOrderStatusSocket({
    orderIds: trackedOrderIds,
    onStatusChange: () => {
      void loadOverview(false);
    },
  });

  return {
    activeDeliveries,
    createdDeliveries,
    deliveryNotifications,
    isLoadingOverview,
    mapMarkers,
    overviewError,
    recentStatusChanges,
  };
}
