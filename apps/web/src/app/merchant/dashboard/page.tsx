"use client";

import { type ReactNode } from "react";

import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import SidebarToggle from "@/components/dashboard/sidebar-toggle";
import ActiveDeliveries from "@/components/dashboard/active-delivery";
import MerchantHandshakeCard from "@/components/dashboard/merchant-handshake-card";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import { Navigation } from "@/components/ui/navigation/navigation";
import GrenobleDeliveryMap from "@/components/dashboard/grenoble-delivery-map";
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
    activeDeliveries,
    isLoadingOverview,
    mapMarkers,
    overviewError,
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
                    <GrenobleDeliveryMap markers={mapMarkers} />
                  )}
                </section>

                <MerchantHandshakeCard isDarkMode={isDarkMode} />
              </div>
            </SurfaceCard>

            <SurfaceCard
              className={styles.deliveriesCard}
              isDarkMode={isDarkMode}
            >
              <ActiveDeliveries
                deliveries={activeDeliveries}
                error={overviewError}
                isDarkMode={isDarkMode}
                isLoading={isLoadingOverview}
              />
            </SurfaceCard>
          </main>
        </div>
      </div>

      <Footerlp />
    </div>
  );
}
