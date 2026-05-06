"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/dashboard/navbar";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Typography from "@/components/ui/design-system/typography";
import { Navigation } from "@/components/ui/navigation/navigation";

import { getDriversList, type Driver } from "../admin";
import { getAdminDashboardMenuItems } from "../admin-dashboard-menu";
import DeliveriesChart from "./deliveriesChart";
import DriversTable from "./DriversTable";
import KycChart from "./kycChart";
import VehiclesChart from "./VehiclesChart";

export default function AdminDashboardDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const adminMenuItems = getAdminDashboardMenuItems("Livreurs");

  useEffect(() => {
    getDriversList()
      .then(setDrivers)
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
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
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-6">
              <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
                Dashboard admin - livreurs
              </Typography>
              <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
                Suivez les livreurs, leurs statuts KYC et les livraisons de la semaine.
              </Typography>
            </div>

            <div className="mb-8 grid gap-5 lg:grid-cols-3">
              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  Répartition par véhicules
                </Typography>
                <VehiclesChart drivers={drivers} />
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  statuts KYC
                </Typography>
                <KycChart drivers={drivers} />
              </section>

              <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <Typography variant="h3" Component="h3" className="mb-4 !text-lg !text-slate-950">
                  Livraisons de la semaine
                </Typography>
                <DeliveriesChart />
              </section>
            </div>

            <DriversTable drivers={drivers} error={error} isLoading={isLoading} />
          </div>
        </div>
      </div>

      <Footerlp />
    </main>
  );
}
