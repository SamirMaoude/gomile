"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { logout } from "@/lib/auth-client";
import {
  buildDashboardAvatarLabel,
  buildDashboardUsername,
} from "@/lib/dashboard-session";
import {
  clearMerchantSession,
  getMerchantProfileUpdatedEventName,
  getCurrentMerchantProfile,
} from "@/lib/merchant-session";

export type ThemeMode = "light" | "dark";

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("dashboardTheme");
  return storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : "light";
}

function getStoredSidebarCollapsed() {
  if (typeof window === "undefined") {
    return true;
  }

  if (window.matchMedia("(max-width: 1023px)").matches) {
    return true;
  }

  return window.localStorage.getItem("dashboardSidebarCollapsed") === "true";
}

function resolveDashboardUsername(profile: { name: string; email: string }) {
  if (profile.name.trim().length > 0) {
    return profile.name.trim();
  }

  return buildDashboardUsername(profile.email);
}

export function useDashboard() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    getStoredSidebarCollapsed,
  );
  const [username, setUsername] = useState("Client");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const isDarkMode = theme === "dark";
  const avatarLabel = buildDashboardAvatarLabel(username);

  useEffect(() => {
    window.localStorage.setItem("dashboardTheme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(
      "dashboardSidebarCollapsed",
      String(isSidebarCollapsed),
    );
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const mobileLayoutQuery = window.matchMedia("(max-width: 1023px)");

    function closeSidebarOnResponsiveLayout() {
      if (mobileLayoutQuery.matches) {
        setIsSidebarCollapsed(true);
      }
    }

    closeSidebarOnResponsiveLayout();
    mobileLayoutQuery.addEventListener("change", closeSidebarOnResponsiveLayout);

    return () => {
      mobileLayoutQuery.removeEventListener(
        "change",
        closeSidebarOnResponsiveLayout,
      );
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadMerchantName() {
      try {
        const profile = await getCurrentMerchantProfile();

        if (!isActive) {
          return;
        }

        setUsername(resolveDashboardUsername(profile));
      } catch {
        if (isActive) {
          setUsername("Client");
        }
      }
    }

    void loadMerchantName();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleMerchantProfileUpdated(event: Event) {
      const detail = (
        event as CustomEvent<{ name: string; email: string } | null>
      ).detail;

      if (!detail) {
        setUsername("Client");
        return;
      }

      setUsername(resolveDashboardUsername(detail));
    }

    window.addEventListener(
      getMerchantProfileUpdatedEventName(),
      handleMerchantProfileUpdated,
    );

    return () => {
      window.removeEventListener(
        getMerchantProfileUpdatedEventName(),
        handleMerchantProfileUpdated,
      );
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function toggleProfileMenu() {
    setProfileMenuOpen((value) => !value);
  }

  function closeProfileMenu() {
    setProfileMenuOpen(false);
  }

  function openSidebar() {
    setIsSidebarCollapsed(false);
  }

  function closeSidebar() {
    setIsSidebarCollapsed(true);
  }

  function toggleSidebar() {
    setIsSidebarCollapsed((value) => !value);
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
      clearMerchantSession();

      const Swal = (await import("sweetalert2")).default;

      setUsername("Client");
      setProfileMenuOpen(false);

      await Swal.fire({
        icon: "success",
        title: "Deconnexion reussie",
        text: "Vous etes déconnecté avec succès.",
        timer: 4000,
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      router.replace("/");
      router.refresh();
    } catch (error) {
      const Swal = (await import("sweetalert2")).default;

      await Swal.fire({
        icon: "error",
        title: "Deconnexion impossible",
        text:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue pendant la deconnexion.",
        confirmButtonText: "Fermer",
        confirmButtonColor: "#d95757",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return {
    closeProfileMenu,
    avatarLabel,
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
  };
}
