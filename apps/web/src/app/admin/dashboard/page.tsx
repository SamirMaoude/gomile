"use client";

import React, { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation/navigation";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Navbar from "@/components/dashboard/navbar";
import { getDriversList, type Driver } from "./admin";
import { getAdminDashboardMenuItems } from "./admin-dashboard-menu";
import DriversTable from "./drivers/DriversTable";
import MerchantsTable from "./merchants/MerchantsTable";
import type { MerchantWithOptionalListFields } from "./merchants/AdminFunctions";

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const adminMenuItems = getAdminDashboardMenuItems("Vue d'ensemble");
  const merchants: MerchantWithOptionalListFields[] = [];

  useEffect(() => {
    getDriversList()
      .then(setDrivers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation theme="landingpage" />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[19rem] shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:flex lg:flex-col">
          <Navbar
            items={adminMenuItems}
            isDarkMode={false}
            className="grid gap-3"
          />
        </aside>

        <div className="min-w-0 flex-1 px-6 py-10">
          <div className="mx-auto grid w-full max-w-7xl gap-8">
            <DriversTable drivers={drivers} error={error} isLoading={isLoading} />
            <MerchantsTable merchants={merchants} />
          </div>
        </div>
      </div>
      <Footerlp />
    </main>
  );
}
