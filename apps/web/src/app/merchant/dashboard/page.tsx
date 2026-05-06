"use client";

import Link from "next/link";
import { type ReactNode } from "react";

import Navbar from "@/components/dashboard/navbar";
import ActiveDeliveries from "@/components/dashboard/active-delivery";
import MerchantHandshakeCard from "@/components/dashboard/merchant-handshake-card";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Navigation from "@/components/ui/header/navigation";
import GrenobleDeliveryMap from "@/components/dashboard/grenoble-delivery-map";
import { Logo } from "@/components/Logo/Logo";
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
    menuRef,
    profileMenuOpen,
    setTheme,
    theme,
    toggleProfileMenu,
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
      <div className={styles.layout}>
        <aside
          className={cn(
            styles.sidebar,
            isDarkMode ? styles.sidebarDark : styles.sidebarLight,
          )}
        >
          <div
            className={cn(
              styles.sidebarHeader,
              isDarkMode ? styles.sidebarHeaderDark : styles.sidebarHeaderLight,
            )}
          >
            <Link href="/" className={styles.sidebarLogoLink}>
              <Logo size="lg" />
            </Link>
          </div>

          <Navbar items={overviewMenuItems} isDarkMode={isDarkMode} />
        </aside>

        <div className={styles.mainPanel}>
          <Navigation
            theme={theme}
            onChange={setTheme}
            isDarkMode={isDarkMode}
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

      <Footer />
    </div>
  );
}
