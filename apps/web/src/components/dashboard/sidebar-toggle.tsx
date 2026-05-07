import { Menu } from "lucide-react";

import { cn, styles } from "@/app/merchant/dashboard/style";

type SidebarToggleProps = {
  isCollapsed: boolean;
  isDarkMode: boolean;
  onToggle: () => void;
};

export default function SidebarToggle({
  isCollapsed,
  isDarkMode,
  onToggle,
}: SidebarToggleProps) {
  return (
    <button
      type="button"
      className={cn(
        styles.sidebarToggle,
        isDarkMode ? styles.sidebarToggleDark : styles.sidebarToggleLight,
      )}
      aria-label={
        isCollapsed
          ? "Ouvrir la navigation du dashboard"
          : "Fermer la navigation du dashboard"
      }
      title={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
      onClick={onToggle}
    >
      <Menu className={styles.iconMedium} aria-hidden />
    </button>
  );
}
