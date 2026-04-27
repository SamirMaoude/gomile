import {Navigation} from "@/components/ui/navigation/navigation";
import DynamicTable, { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import React from "react";


type Driver = {
  id: string;
  name: string;
  initials: string;
  vehicle: string;
  status: "approved" | "denied" | "pending";
};

const columns: DynamicTableColumn<Driver>[] = [
  {
    key: "driver",
    header: "Livreur",
    render: (driver) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-sm font-bold text-white">
          {driver.initials}
        </div>
        <span className="font-medium text-slate-900">{driver.name}</span>
      </div>
    ),
  },
  {
    key: "vehicle",
    header: "Date d'inscription",
    render: (driver) => (
      <span className="text-slate-600">{driver.vehicle}</span>
    ),
  },
  {
    key: "status",
    header: "Statut KYC",
    render: (driver) => (
      <span
  className={[
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
    driver.status === "approved"
      ? "bg-emerald-100 text-emerald-700"
      : driver.status === "pending"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700",
  ].join(" ")}
>
  <span
    className={[
      "h-2 w-2 rounded-full",
      driver.status === "approved"
        ? "bg-emerald-500"
        : driver.status === "pending"
          ? "bg-yellow-500"
          : "bg-red-500",
    ].join(" ")}
  />

  {driver.status === "approved"
    ? "Approuvé"
    : driver.status === "pending"
      ? "En attente"
      : "Refusé"}
</span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    headerClassName: "text-right",
    cellClassName: "flex justify-end",
    render: () => (
      <button
        type="button"
        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        ⋮
      </button>
    ),
  },
];

 export default function AdminDashboard() {
   return (
    <>
    <Navigation/>
     <DynamicTable columns={[columns]} rows={[]} rowKey={(driver) => driver.id}
          gridTemplateColumns="2fr 1.8fr 1.2fr 0.5fr"
          headerRowClassName="grid border-b border-slate-200 px-6 py-4 text-sm font-semibold text-slate-950"
          bodyClassName="divide-y divide-slate-200"
          rowClassName="grid items-center px-6 py-4"></DynamicTable>
    </>
   );
 }