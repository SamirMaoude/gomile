import type { Metadata } from "next";

import ClientDashboardShell from "@/components/dashboard/client-dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard client | GoMile",
  description: "Dashboard client GoMile avec suivi des livraisons.",
};

export default function ClientDashboardPage() {
  return <ClientDashboardShell />;
}
