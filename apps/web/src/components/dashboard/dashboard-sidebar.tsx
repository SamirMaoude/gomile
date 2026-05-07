import { cn, styles } from "@/app/merchant/dashboard/style";
import Navbar from "./navbar";
import type { DashboardMenuItem } from "./navbar-items";

type DashboardSidebarProps = {
  items: DashboardMenuItem[];
  isCollapsed: boolean;
  isDarkMode: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export default function DashboardSidebar({
  items,
  isCollapsed,
  isDarkMode,
  onClose,
  onOpen,
}: DashboardSidebarProps) {
  function handleNavigate() {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      onClose();
    }
  }

  return (
    <aside
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onFocus={onOpen}
      className={cn(
        styles.sidebar,
        isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded,
        isDarkMode ? styles.sidebarDark : styles.sidebarLight,
      )}
    >
      <div
        className={cn(
          styles.sidebarNav,
          isCollapsed && styles.sidebarNavCollapsed,
        )}
      >
        <Navbar
          className={styles.sidebarNavItems}
          items={items}
          isCollapsed={isCollapsed}
          isDarkMode={isDarkMode}
          onNavigate={handleNavigate}
        />
      </div>
    </aside>
  );
}
