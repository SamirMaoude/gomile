"use client";

import { useEffect, useState } from "react";

import {
  AdminDashboardChartCard,
} from "@/components/admin/dashboard/admin-dashboard-chart-card";
import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Typography from "@/components/ui/design-system/typography";

import { getDriver, getDriversList, type Driver } from "../admin";
import DeliveriesChart from "./deliveriesChart";
import DriversTable from "./DriversTable";
import KycChart from "./kycChart";
import VehiclesChart from "./VehiclesChart";

export default function AdminDashboardDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDriversList()
      .then(async (driversList) => {
        const driversWithDetails = await Promise.all(
          driversList.map((driver) =>
            getDriver(driver.userId).catch(() => driver),
          ),
        );

        setDrivers(driversWithDetails);
      })
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AdminDashboardShell activeMenuLabel="Livreurs">
      <div className="mb-6">
        <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
          Dashboard admin - livreurs
        </Typography>
        <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
          Suivez les livreurs, leurs statuts KYC et les livraisons de la semaine.
        </Typography>
      </div>

      <div className="mb-8 grid gap-5 lg:grid-cols-3">
        <AdminDashboardChartCard title="Répartition par véhicules">
          <VehiclesChart drivers={drivers} />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Statuts KYC">
          <KycChart drivers={drivers} />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Livraisons de la semaine">
          <DeliveriesChart />
        </AdminDashboardChartCard>
      </div>

      <DriversTable drivers={drivers} error={error} isLoading={isLoading} />
    </AdminDashboardShell>
  );
}
