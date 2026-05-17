"use client";

import { useEffect, useState } from "react";

import {
  AdminDashboardChartCard,
} from "@/components/admin/dashboard/ChartContainer";
import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Typography from "@/components/ui/design-system/typography";

import { getMerchant, getMerchantsList } from "../admin";
import type { MerchantWithOptionalListFields } from "./AdminFunctions";
import MerchantStoresMap from "./MerchantStoresMap";
import MerchantsTable from "./MerchantsTable";
import StoresAddedChart from "./StoresAddedChart";
import StoresCountChart from "./StoresCountChart";
import SubscriptionChart from "./SubscriptionChart";

export default function AdminDashboardMerchants() {
  const [merchants, setMerchants] = useState<MerchantWithOptionalListFields[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMerchantsList()
      .then(async (merchantsList) => {
        const merchantsWithDetails = await Promise.all(
          merchantsList.map((merchant) =>
            getMerchant(merchant.userId).catch(() => merchant),
          ),
        );

        setMerchants(merchantsWithDetails);
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminDashboardShell activeMenuLabel="Commerçants">
      <div className="mb-6">
        <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
          Dashboard admin - commerçants
        </Typography>
        <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
          Suivez les commerçants, leurs boutiques et leur activité de commandes.
        </Typography>
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <AdminDashboardChartCard title="Répartition par abonnements">
          <SubscriptionChart merchants={merchants} />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Répartition par commerces">
          <StoresCountChart merchants={merchants} />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Commerces ajoutés par jour">
          <StoresAddedChart merchants={merchants} />
        </AdminDashboardChartCard>
      </div>

      <MerchantStoresMap merchants={merchants} />

      <MerchantsTable merchants={merchants} error={error} isLoading={isLoading} />
    </AdminDashboardShell>
  );
}
