"use client";

import { type ReactNode } from "react";

import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import SidebarToggle from "@/components/dashboard/sidebar-toggle";
import DeliveryActivityPanel from "@/components/dashboard/delivery-activity-panel";
import DeliveryTopList from "@/components/dashboard/delivery-top-list";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import { Navigation } from "@/components/ui/navigation/navigation";
import DeliveryMap from "@/components/dashboard/delivery-map";
import Typography from "@/components/ui/design-system/typography";
import { getDashboardMenuItems } from "./dashboard-menu";
import HeaderActions from "./header-actions";
import { cn, styles } from "./style";
import { useDashboard } from "./use-dashboard";
import { useDashboardOverview } from "./use-dashboard-overview";

function SurfaceCard({
  children,
  className,
  isDarkMode,
}: {
  children: ReactNode;
  className?: string;
  isDarkMode: boolean;
}) {
  return (
    <div
      className={cn(
        styles.surfaceCard,
        isDarkMode ? styles.surfaceCardDark : styles.surfaceCardLight,
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function MerchantDashboardPage() {
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
  const {
    createdDeliveries,
    deliveryNotifications,
    isLoadingOverview,
    mapMarkers,
    overviewError,
    recentStatusChanges,
  } = useDashboardOverview();
  const overviewMenuItems = getDashboardMenuItems("Vue d'ensemble");

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
            menuItems={overviewMenuItems}
            menuRef={menuRef}
            onClose={closeProfileMenu}
            onLogout={handleLogout}
            onToggle={toggleProfileMenu}
            profileMenuOpen={profileMenuOpen}
            username={username}
          />
        }
      />

      <div className={styles.layout}>
        <DashboardSidebar
          items={overviewMenuItems}
          isCollapsed={isSidebarCollapsed}
          isDarkMode={isDarkMode}
          onClose={closeSidebar}
          onOpen={openSidebar}
        />

        <div className={styles.mainPanel}>
          <main className={styles.main}>
            <SurfaceCard isDarkMode={isDarkMode}>
              <div className={styles.mapGrid}>
                <section
                  className={cn(
                    styles.mapSection,
                    isDarkMode ? styles.mapSectionDark : styles.mapSectionLight,
                  )}
                >
                  {overviewError ? (
                    <div className="flex h-full items-center justify-center px-6 text-center">
                      <Typography
                        variant="p"
                        Component="p"
                        className={cn(
                          isDarkMode ? "!text-rose-300" : "!text-rose-600",
                        )}
                      >
                        {overviewError}
                      </Typography>
                    </div>
                  ) : (
                    <DeliveryMap markers={mapMarkers} />
                  )}
                </section>

                <DeliveryActivityPanel
                  error={overviewError}
                  isDarkMode={isDarkMode}
                  isLoading={isLoadingOverview}
                  notifications={deliveryNotifications}
                />
              </div>
            </SurfaceCard>

            <div className={styles.overviewListsGrid}>
              <SurfaceCard
                className={styles.topListCard}
                isDarkMode={isDarkMode}
              >
                <DeliveryTopList
                  emptyLabel="Aucune commande créée récemment."
                  error={overviewError}
                  isDarkMode={isDarkMode}
                  isLoading={isLoadingOverview}
                  items={createdDeliveries}
                  title="Suivi des commandes"
                  type="created"
                />
              </SurfaceCard>

              <SurfaceCard
                className={styles.topListCard}
                isDarkMode={isDarkMode}
              >
                <DeliveryTopList
                  emptyLabel="Aucun changement de statut récent."
                  error={overviewError}
                  isDarkMode={isDarkMode}
                  isLoading={isLoadingOverview}
                  items={recentStatusChanges}
                  title="Suivi des livraisons"
                  type="status"
                />
              </SurfaceCard>
            </div>
          </main>
        </div>
      </div>

      <Footerlp />
    </div>
  );
}
