import type { MerchantNotificationItem } from "@/components/dashboard/dashboard-overview.model";
import type { LucideIcon } from "lucide-react";
import {
  CircleCheck,
  KeyRound,
  Package,
  Pencil,
  Store,
  Truck,
} from "lucide-react";

type NotificationDisplay = {
  icon: LucideIcon;
  iconClassName: string;
  itemClassName: string;
};

export function getNotificationDisplay(
  kind: MerchantNotificationItem["kind"],
  isDarkMode: boolean,
): NotificationDisplay {
  if (kind === "store-created") {
    return {
      icon: Store,
      iconClassName: isDarkMode
        ? "bg-cyan-500/15 text-cyan-300"
        : "bg-cyan-100 text-cyan-700",
      itemClassName: isDarkMode
        ? "border-cyan-900 bg-cyan-950/25 text-slate-100"
        : "border-cyan-200 bg-cyan-50/80 text-slate-900",
    };
  }

  if (kind === "store-updated") {
    return {
      icon: Pencil,
      iconClassName: isDarkMode
        ? "bg-sky-500/15 text-sky-300"
        : "bg-sky-100 text-sky-700",
      itemClassName: isDarkMode
        ? "border-sky-900 bg-sky-950/25 text-slate-100"
        : "border-sky-200 bg-sky-50/80 text-slate-900",
    };
  }

  if (kind === "api-key-created") {
    return {
      icon: KeyRound,
      iconClassName: isDarkMode
        ? "bg-violet-500/15 text-violet-300"
        : "bg-violet-100 text-violet-700",
      itemClassName: isDarkMode
        ? "border-violet-900 bg-violet-950/25 text-slate-100"
        : "border-violet-200 bg-violet-50/80 text-slate-900",
    };
  }

  if (kind === "api-key-updated") {
    return {
      icon: Pencil,
      iconClassName: isDarkMode
        ? "bg-fuchsia-500/15 text-fuchsia-300"
        : "bg-fuchsia-100 text-fuchsia-700",
      itemClassName: isDarkMode
        ? "border-fuchsia-900 bg-fuchsia-950/25 text-slate-100"
        : "border-fuchsia-200 bg-fuchsia-50/80 text-slate-900",
    };
  }

  if (kind === "delivery-accepted") {
    return {
      icon: Truck,
      iconClassName: isDarkMode
        ? "bg-amber-500/15 text-amber-300"
        : "bg-amber-100 text-amber-700",
      itemClassName: isDarkMode
        ? "border-amber-900 bg-amber-950/25 text-slate-100"
        : "border-amber-200 bg-amber-50/80 text-slate-900",
    };
  }

  if (kind === "delivery-delivered") {
    return {
      icon: CircleCheck,
      iconClassName: isDarkMode
        ? "bg-emerald-500/15 text-emerald-300"
        : "bg-emerald-100 text-emerald-700",
      itemClassName: isDarkMode
        ? "border-emerald-900 bg-emerald-950/30 text-slate-100"
        : "border-emerald-200 bg-emerald-50/80 text-slate-900",
    };
  }

  return {
    icon: Package,
    iconClassName: isDarkMode
      ? "bg-lime-500/15 text-lime-300"
      : "bg-lime-100 text-lime-700",
    itemClassName: isDarkMode
      ? "border-lime-900 bg-lime-950/25 text-slate-100"
      : "border-lime-200 bg-lime-50/80 text-slate-900",
  };
}
