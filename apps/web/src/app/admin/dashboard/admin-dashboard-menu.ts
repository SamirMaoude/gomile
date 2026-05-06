import type { DashboardMenuItem } from "@/components/dashboard/navbar-items";
import CommandeIcon from "@/components/ui/icons/CommandeIcon";
import HomeIcon from "@/components/ui/icons/HomeIcon";
import SettingIcon from "@/components/ui/icons/SettingIcon";
import TruckIcon from "@/components/ui/icons/TrucIcon";
import UserIcon from "@/components/ui/icons/UserIcon";

export const adminDashboardMenuItems: DashboardMenuItem[] = [
  { label: "Vue d'ensemble", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Livreurs", href: "/admin/dashboard/drivers", icon: UserIcon },
  { label: "Marchands", href: "/admin/dashboard/merchants", icon: TruckIcon }
];

export function getAdminDashboardMenuItems(activeLabel: string) {
  return adminDashboardMenuItems.map((item) => ({
    ...item,
    active: item.label === activeLabel,
  }));
}
