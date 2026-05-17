"use client";

import { useEffect, useState } from "react";

import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";

import { getDriversList, getMerchant, getMerchantsList, type Driver } from "./admin";
import DriversTable from "./drivers/DriversTable";
import MerchantsTable from "./merchants/MerchantsTable";
import type { MerchantWithOptionalListFields } from "./merchants/AdminFunctions";

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [merchants, setMerchants] = useState<MerchantWithOptionalListFields[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    getDriversList()
      .then(setDrivers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setIsLoading(false));
    
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
    <AdminDashboardShell
      activeMenuLabel="Vue d'ensemble"
      contentClassName="mx-auto grid w-full max-w-7xl gap-8"
    >
      <DriversTable drivers={drivers} error={error} isLoading={isLoading} />
      <MerchantsTable merchants={merchants} />
    </AdminDashboardShell>
  );
}
