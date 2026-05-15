"use client";

import AdminDashboardShell from "@/components/admin/dashboard/admin-dashboard-shell";
import Typography from "@/components/ui/design-system/typography";

import WithdrawalsTable from "./WithdrawalsTable";

export default function AdminDashboardWithdrawals() {
  return (
    <AdminDashboardShell activeMenuLabel="Retraits">
      <div className="mb-6">
        <Typography variant="h1" Component="h1" className="!text-2xl !text-slate-950">
          Dashboard admin - retraits
        </Typography>
        <Typography variant="p" Component="p" className="mt-2 !text-slate-600">
          Traitez les demandes de retrait des livreurs et suivez leur statut.
        </Typography>
      </div>

      <WithdrawalsTable />
    </AdminDashboardShell>
  );
}
