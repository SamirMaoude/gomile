"use client";

import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import SidebarToggle from "@/components/dashboard/sidebar-toggle";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import { Navigation } from "@/components/ui/navigation/navigation";
import { getDashboardMenuItems } from "../dashboard-menu";
import HeaderActions from "../header-actions";
import { cn, styles } from "../style";
import { useDashboard } from "../use-dashboard";
import OrdersTable from "./orders-table";

export default function MerchantOrdersPage() {
  const {
    avatarLabel,
    closeProfileMenu,
    handleLogout,
    isDarkMode,
    isLoggingOut,
    isSidebarCollapsed,
    menuRef,
    openSidebar,
    closeSidebar,
    profileMenuOpen,
    setTheme,
    theme,
    toggleProfileMenu,
    toggleSidebar,
    username,
  } = useDashboard();

  const ordersMenuItems = getDashboardMenuItems("Mes commandes");

  return (
    <div
      className={cn(
        styles.page,
        isDarkMode ? styles.pageDark : styles.pageLight,
      )}
    >
      <Navigation
        theme="landingpage"
        mode={theme}
        onModeChange={setTheme}
        isDarkMode={isDarkMode}
        isAuthenticated
        username={username}
        contentClassName="max-w-none"
        showLogo={false}
        showPublicLinks={false}
        leftSlot={
          <SidebarToggle
            isCollapsed={isSidebarCollapsed}
            isDarkMode={isDarkMode}
            onToggle={toggleSidebar}
          />
        }
        rightSlot={
          <HeaderActions
            avatarLabel={avatarLabel}
            isDarkMode={isDarkMode}
            isLoggingOut={isLoggingOut}
            menuItems={ordersMenuItems}
            menuRef={menuRef}
            onClose={closeProfileMenu}
            onLogout={handleLogout}
            onToggle={toggleProfileMenu}
            profileMenuOpen={profileMenuOpen}
            username={username}
          />
        }
      />

      <div className={styles.layoutFooterBelowViewport}>
        <DashboardSidebar
          items={ordersMenuItems}
          isCollapsed={isSidebarCollapsed}
          isDarkMode={isDarkMode}
          onClose={closeSidebar}
          onOpen={openSidebar}
        />

        <div className={styles.mainPanel}>
          <main className={styles.main}>
            <OrdersTable isDarkMode={isDarkMode} />
          </main>
        </div>
      </div>

      <Footerlp />
    </div>
  );
}
