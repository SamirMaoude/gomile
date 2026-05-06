"use client";

import Link from "next/link";

import { Logo } from "@/components/Logo/Logo";
import Navbar from "@/components/dashboard/navbar";
import Footer from "@/components/ui/design-system/header_footer/footer";
import Navigation from "@/components/ui/header/navigation";
import { getDashboardMenuItems } from "../dashboard-menu";
import HeaderActions from "../header-actions";
import { cn, styles } from "../style";
import { useDashboard } from "../use-dashboard";
import StoresTable from "./stores-table";

export default function MerchantShopsPage() {
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

  const shopsMenuItems = getDashboardMenuItems("Mes Magasins");

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

          <Navbar items={shopsMenuItems} isDarkMode={isDarkMode} />
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
                menuItems={shopsMenuItems}
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
            <StoresTable isDarkMode={isDarkMode} />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
