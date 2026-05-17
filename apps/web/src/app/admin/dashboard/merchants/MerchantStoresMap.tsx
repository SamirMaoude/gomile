"use client";

import { useEffect, useState } from "react";

import { AdminDashboardChartCard } from "@/components/admin/dashboard/ChartContainer";
import DeliveryMap from "@/components/dashboard/delivery-map";
import type { MerchantMapMarker } from "@/components/dashboard/dashboard-overview.model";
import Typography from "@/components/ui/design-system/typography";
import { geocodeAddress } from "@/lib/geocoding";

import {
  getMerchantStores,
  getMerchantName,
  type MerchantStore,
  type MerchantWithOptionalListFields,
} from "./AdminFunctions";

type MerchantStoresMapProps = {
  merchants: MerchantWithOptionalListFields[];
};

type StoreMapSource = {
  merchantName: string;
  store: MerchantStore;
};

function getStoreTone(store: MerchantStore): MerchantMapMarker["tone"] {
  if (store.isLocked) {
    return "amber";
  }

  return store.isActive === false ? "red" : "green";
}

function getStoreStatus(store: MerchantStore) {
  if (store.isLocked) {
    return "Verrouille";
  }

  return store.isActive === false ? "Inactif" : "Actif";
}

function getStoreSources(merchants: MerchantWithOptionalListFields[]) {
  return merchants.flatMap((merchant) => {
    const merchantName = getMerchantName(merchant);

    return getMerchantStores(merchant)
      .filter((store) => store.address?.trim())
      .map((store) => ({ merchantName, store }));
  });
}

export default function MerchantStoresMap({ merchants }: MerchantStoresMapProps) {
  const [markers, setMarkers] = useState<MerchantMapMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const stores = getStoreSources(merchants);
    const abortController = new AbortController();

    if (stores.length === 0) {
      queueMicrotask(() => {
        if (!abortController.signal.aborted) {
          setMarkers([]);
          setIsLoading(false);
        }
      });
      return () => abortController.abort();
    }

    queueMicrotask(() => {
      if (!abortController.signal.aborted) {
        setIsLoading(true);
      }
    });

    async function buildMarkers() {
      const nextMarkers = await Promise.all(
        stores.map(async ({
          merchantName,
          store,
        }: StoreMapSource): Promise<MerchantMapMarker | null> => {
          const address = store.address?.trim();

          if (!address) {
            return null;
          }

          const coordinates = await geocodeAddress(address, abortController.signal);

          if (!coordinates) {
            return null;
          }

          return {
            id: store.name || merchantName,
            lat: coordinates.lat,
            lng: coordinates.lng,
            tone: getStoreTone(store),
            destination: address,
            status: getStoreStatus(store),
            metaLabel: "Commerçant",
            metaValue: merchantName,
          } satisfies MerchantMapMarker;
        }),
      );

      if (!abortController.signal.aborted) {
        setMarkers(
          nextMarkers.filter((marker): marker is MerchantMapMarker => marker !== null),
        );
        setIsLoading(false);
      }
    }

    buildMarkers().catch(() => {
      if (!abortController.signal.aborted) {
        setMarkers([]);
        setIsLoading(false);
      }
    });

    return () => abortController.abort();
  }, [merchants]);

  return (
    <AdminDashboardChartCard
      title="Emplacements des commerces"
      description="Visualisez les boutiques rattachées aux commerçants."
      className="mb-8 overflow-hidden !p-0"
      headerClassName="px-5 py-4"
      contentClassName="border-t border-slate-200"
    >
      <div className="relative h-[24rem] bg-slate-50 lg:h-[34rem]">
        {isLoading ? (
          <div className="absolute inset-0 z-[1] grid place-items-center bg-white/70 px-6 text-center">
            <Typography variant="p" Component="p" className="!text-sm !font-semibold !text-slate-600">
              Chargement des emplacements...
            </Typography>
          </div>
        ) : null}

        {!isLoading && markers.length === 0 ? (
          <div className="grid h-full place-items-center px-6 text-center">
            <Typography variant="p" Component="p" className="!text-sm !font-semibold !text-slate-500">
              Aucun commerce avec une adresse géolocalisable pour le moment.
            </Typography>
          </div>
        ) : (
          <DeliveryMap markers={markers} showUserLocation={false} />
        )}
      </div>
    </AdminDashboardChartCard>
  );
}
