import type { ReactNode } from "react";

import Navbar from "@/components/dashboard/navbar";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import { Navigation } from "@/components/ui/navigation/navigation";

import { getAdminDashboardMenuItems } from "@/app/admin/dashboard/admin-dashboard-menu";

type AdminDashboardShellProps = {
  activeMenuLabel: string;
  children: ReactNode;
  contentClassName?: string;
};

export default function AdminDashboardShell({
  activeMenuLabel,
  children,
  contentClassName = "mx-auto w-full max-w-7xl",
}: AdminDashboardShellProps) {
  const adminMenuItems = getAdminDashboardMenuItems(activeMenuLabel);

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
          <div className={contentClassName}>{children}</div>
        </div>
      </div>

      <Footerlp />
    </main>
  );
}
