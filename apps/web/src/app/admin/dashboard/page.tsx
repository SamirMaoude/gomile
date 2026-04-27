"use client";

import React, { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation/navigation";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import DynamicTable, { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import { getDriversList, type Driver } from "./admin";

const columns: DynamicTableColumn<Driver>[] = [
  {
    key: "driver",
    header: "Livreur",
    render: (driver) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-white">
          {driver.firstName[0]}{driver.lastName[0]}
        </div>
        <span className="font-medium text-slate-900">{driver.firstName} {driver.lastName}</span>
      </div>
    ),
  },
  {
    key: "status",
    header: "Statut",
    render: (driver) => (
      <span className="text-slate-600 capitalize">{driver.status}</span>
    ),
  },
  {
    key: "kycStatus",
    header: "Statut KYC",
    render: (driver) => {
      const map: Record<string, { label: string; bg: string; dot: string }> = {
        APPROVED: { label: "Approuvé",   bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
        PENDING:  { label: "En attente", bg: "bg-yellow-100 text-yellow-700",   dot: "bg-yellow-500"  },
        REJECTED: { label: "Refusé",     bg: "bg-red-100 text-red-700",         dot: "bg-red-500"     },
        NONE:     { label: "Aucun",      bg: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"   },
      };
      const s = map[driver.kycStatus] ?? map.NONE;
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.bg}`}>
          <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      );
    },
  },
  {
    key: "totalTrips",
    header: "Courses",
    render: (driver) => (
      <span className="text-slate-600">{driver.totalTrips}</span>
    ),
  },
];

export default function AdminDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDriversList()
      .then(setDrivers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Erreur"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col">
      <Navigation theme="landingpage" />
      <div className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Dashboard Admin — Livreurs</h1>
        {error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <DynamicTable
            columns={columns}
            rows={drivers}
            rowKey={(d) => d.userId}
            gridTemplateColumns="2fr 1.2fr 1.4fr 0.6fr"
            headerRowClassName="grid border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-950"
            bodyClassName="divide-y divide-slate-200"
            rowClassName="grid items-center px-6 py-4"
          />
        )}
      </div>
      <Footerlp />
    </main>
  );
}
