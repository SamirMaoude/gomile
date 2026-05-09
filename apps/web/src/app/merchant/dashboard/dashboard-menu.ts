import type { DashboardMenuItem } from "@/components/dashboard/navbar-items";
import CommandeIcon from "@/components/ui/icons/CommandeIcon";
import HomeIcon from "@/components/ui/icons/HomeIcon";
import KeyIcon from "@/components/ui/icons/KeyIcon";
import SettingIcon from "@/components/ui/icons/SettingIcon";
import ShopIcon from "@/components/ui/icons/ShopIcon";
import TruckIcon from "@/components/ui/icons/TrucIcon";

export const dashboardMenuItems: DashboardMenuItem[] = [
  { label: "Vue d'ensemble", href: "/merchant/dashboard", icon: HomeIcon, active: true, },
  { label: "Mes Magasins", href: "/merchant/dashboard/shops", icon: ShopIcon },
  { label: "Abonnement Keys", href: "/merchant/dashboard/api-keys", icon: KeyIcon },
  { label: "Mes commandes", href: "/merchant/dashboard/orders", icon: CommandeIcon },
  {
    label: "Suivi livraisons",
    href: "/merchant/dashboard/deliveries",
    icon: TruckIcon,
  },
  { label: "Paramètres", href: "/merchant/dashboard/settings", icon: SettingIcon },
];

export function getDashboardMenuItems(activeLabel: string) {
  return dashboardMenuItems.map((item) => ({
    ...item,
    active: item.label === activeLabel,
  }));
}
