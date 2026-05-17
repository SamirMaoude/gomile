import type { DashboardMenuItem } from "@/components/dashboard/navbar-items";
import AlertIcon from "@/components/ui/icons/AlertIcon";
import HomeIcon from "@/components/ui/icons/HomeIcon";
import LogOutIcon from "@/components/ui/icons/LogOutIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TruckIcon from "@/components/ui/icons/TrucIcon";
import UserIcon from "@/components/ui/icons/UserIcon";

export const adminDashboardMenuItems: DashboardMenuItem[] = [
  { label: "Vue d'ensemble", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Livreurs", href: "/admin/dashboard/drivers", icon: UserIcon },
  { label: "Commerçants", href: "/admin/dashboard/merchants", icon: TruckIcon },
  { label: "Demandes de démission", href: "/admin/dashboard/withdrawals", icon: LogOutIcon },
  { label: "Conflits", href: "/admin/dashboard/conflicts", icon: AlertIcon },
  { label: "Ajouter un membre", href: "/admin/dashboard/admins", icon: PlusIcon },
];

export function getAdminDashboardMenuItems(activeLabel: string) {
  return adminDashboardMenuItems.map((item) => ({
    ...item,
    active: item.label === activeLabel,
  }));
}
