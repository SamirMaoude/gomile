
import { styles } from "@/app/merchant/dashboard/style";
import NavbarItem, { DashboardMenuItem } from "./navbar-items";

type NavbarProps = {
  items: DashboardMenuItem[];
  isDarkMode: boolean;
  compact?: boolean;
  isCollapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export default function Navbar({
  items,
  isDarkMode,
  compact = false,
  isCollapsed = false,
  onNavigate,
  className,
}: NavbarProps) {
  return (
    <nav
      className={
        className ??
        (isCollapsed
          ? `${styles.sidebarNav} ${styles.sidebarNavCollapsed}`
          : styles.sidebarNav)
      }
    >
      {items.map((item) => (
        <NavbarItem
          key={`${compact ? "compact" : "default"}-${item.label}`}
          href={item.href}
          label={item.label}
          active={item.active}
          icon={item.icon}
          compact={compact}
          isCollapsed={isCollapsed}
          onNavigate={onNavigate}
          isDarkMode={isDarkMode}
        />
      ))}
    </nav>
  );
}
