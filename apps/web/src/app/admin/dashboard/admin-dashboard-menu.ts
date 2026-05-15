import type { DashboardMenuItem } from "@/components/dashboard/navbar-items";
import HomeIcon from "@/components/ui/icons/HomeIcon";
import SettingIcon from "@/components/ui/icons/SettingIcon";
import KeyIcon from "@/components/ui/icons/KeyIcon";
import TruckIcon from "@/components/ui/icons/TrucIcon";
import UserIcon from "@/components/ui/icons/UserIcon";

export const adminDashboardMenuItems: DashboardMenuItem[] = [
  { label: "Vue d'ensemble", href: "/admin/dashboard", icon: HomeIcon },
  { label: "Livreurs", href: "/admin/dashboard/drivers", icon: UserIcon },
  { label: "Commerçants", href: "/admin/dashboard/merchants", icon: TruckIcon },
  { label: "Retraits", href: "/admin/dashboard/withdrawals", icon: KeyIcon },
  {label: "administrateurs", href: "/admin/dashboard/admins", icon: SettingIcon},
];

export function getAdminDashboardMenuItems(activeLabel: string) {
  return adminDashboardMenuItems.map((item) => ({
    ...item,
    active: item.label === activeLabel,
  }));
}
