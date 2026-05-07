import { cn, styles } from "@/app/merchant/dashboard/style";
import Link from "next/link";
import type { ReactElement } from "react";
import { IconProps } from "../ui/icons/types";


export type DashboardMenuItem = {
  label: string;
  href: string;
  icon: (props: IconProps) => ReactElement;
  active?: boolean;
};

type NavbarItemProps = DashboardMenuItem & {
  compact?: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
  isDarkMode: boolean;
};

export default function NavbarItem({
  href,
  label,
  active,
  icon: Icon,
  compact = false,
  isCollapsed = false,
  onNavigate,
  isDarkMode,
}: NavbarItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-label={isCollapsed ? label : undefined}
      title={isCollapsed ? label : undefined}
      className={cn(
        styles.navbarItemBase,
        isCollapsed
          ? styles.navbarItemCollapsed
          : compact
            ? styles.navbarItemCompact
            : styles.navbarItemDefault,
        active
          ? isDarkMode
            ? styles.navbarItemActiveDark
            : styles.navbarItemActiveLight
          : isDarkMode
            ? styles.navbarItemInactiveDark
            : styles.navbarItemInactiveLight,
      )}
    >
      <span
        className={cn(
          active
            ? isDarkMode
              ? styles.navbarIconActiveDark
              : styles.navbarIconActiveLight
            : isDarkMode
              ? styles.navbarIconInactiveDark
              : styles.navbarIconInactiveLight,
        )}
      >
        <Icon className={styles.iconLarge} />
      </span>

      <span className={isCollapsed ? styles.navbarLabelCollapsed : undefined}>
        {label}
      </span>
    </Link>
  );
}
