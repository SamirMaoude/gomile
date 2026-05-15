"use client";

import { useState } from "react";

import {
  AdminDashboardChartCard,
  AdminDashboardChartPlaceholder,
} from "@/components/admin/dashboard/admin-dashboard-chart-card";
import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Typography from "@/components/ui/design-system/typography";

import type { MerchantWithOptionalListFields } from "./AdminFunctions";
import MerchantsTable from "./MerchantsTable";

export default function AdminDashboardMerchants() {
  const [merchants] = useState<MerchantWithOptionalListFields[]>([]);

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
        <AdminDashboardChartCard title="Répartition par providers">
          <AdminDashboardChartPlaceholder />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Statuts commerçants">
          <AdminDashboardChartPlaceholder />
        </AdminDashboardChartCard>

        <AdminDashboardChartCard title="Commandes de la semaine">
          <AdminDashboardChartPlaceholder />
        </AdminDashboardChartCard>
      </div>

      <MerchantsTable merchants={merchants} />
    </AdminDashboardShell>
  );
}
