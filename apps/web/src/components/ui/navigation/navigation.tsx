"use client";

import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { House, Menu, X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import Typography from "../design-system/typography"
import Container from "../elements/container"
import ModeToggle from "../header/mode-toggle"
import type { AuthSession } from "@/lib/auth-client"
import { buildDashboardUsername } from "@/lib/dashboard-session"

type ThemeMode = "light" | "dark";

interface Props {
  text_theme?: "white" | "black" | "grey" | "primaryG" | "primaryB"
  theme?: "landingpage" | "header"
  mode?: ThemeMode
  onModeChange?: (theme: ThemeMode) => void
  isDarkMode?: boolean
  isAuthenticated?: boolean
  username?: string
  leftSlot?: ReactNode
  rightSlot?: ReactNode
  showLogo?: boolean
  showPublicLinks?: boolean
  showAuthLinks?: boolean
  contentClassName?: string
}

const textThemeClasses = {
  white: "text-white",
  black: "text-black",
  grey: "text-gray-500",
  primaryG: "text-primary-green",
  primaryB: "text-primary-blue",
}

const headerThemeClasses = {
  landingpage: "bg-linear-to-tl from-blue-500 to-green-500",
  header: "bg-primary-green",
}

let restoredSession: AuthSession | null = null;
let restoredSessionRequest: Promise<AuthSession | null> | null = null;

async function restoreSessionSilently() {
  if (restoredSession) {
    return restoredSession;
  }

  if (restoredSessionRequest) {
    return restoredSessionRequest;
  }

  restoredSessionRequest = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  })
    .then(async (response) => {
      if (!response.ok) {
        return null;
      }

      return (await response.json()) as AuthSession;
    })
    .then((session) => {
      restoredSession = session;
      return session;
    })
    .catch(() => null)
    .finally(() => {
      restoredSessionRequest = null;
    });

  return restoredSessionRequest;
}

export const Navigation = ({
  text_theme = "white",
  theme = "landingpage",
  mode,
  onModeChange,
  isDarkMode = false,
  isAuthenticated = false,
  username,
  leftSlot,
  rightSlot,
  showLogo = true,
  showPublicLinks = true,
  showAuthLinks = true,
  contentClassName,
}: Props) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [restoredUsername, setRestoredUsername] = useState<string | null>(() =>
    restoredSession ? buildDashboardUsername(restoredSession.user.email) : null
  );
  const [sessionRestoreStatus, setSessionRestoreStatus] = useState<"pending" | "checked">(
    () => (isAuthenticated || !showAuthLinks || restoredSession ? "checked" : "pending")
  );
  const style1 = "hover:text-primary-green-dark transition-colors duration-200"
  const headerLinkClasses = clsx(style1, "text-sm sm:text-base lg:text-lg")
  const drawerLinkClasses =
    "rounded-xl px-4 py-3 text-sm font-semibold text-white/95 transition-colors hover:bg-white/15 sm:text-base";
  const isSessionAuthenticated = isAuthenticated || Boolean(restoredUsername)
  const displayUsername = username ?? restoredUsername
  const isRestoringSession = showAuthLinks && !isAuthenticated && sessionRestoreStatus === "pending"
  const shouldShowAuthLinks = showAuthLinks && !isSessionAuthenticated && !isRestoringSession
  const shouldShowModeToggle = Boolean(mode && onModeChange)
  const hasMobileMenuContent =
    showPublicLinks ||
    shouldShowAuthLinks ||
    Boolean(isSessionAuthenticated && displayUsername && !rightSlot)
  const isMobileMenuVisible = hasMobileMenuContent && isMobileMenuOpen

  useEffect(() => {
    if (isAuthenticated || !showAuthLinks) {
      return;
    }

    if (restoredSession) {
      return;
    }

    let isActive = true;

    void restoreSessionSilently()
      .then((session) => {
        if (!isActive) {
          return;
        }

        if (!session) {
          setRestoredUsername(null);
          return;
        }

        setRestoredUsername(buildDashboardUsername(session.user.email));
      })
      .finally(() => {
        if (!isActive) {
          return;
        }

        setSessionRestoreStatus("checked");
      });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, showAuthLinks]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Container
      Component="div"
      size="full"
      padding={false}
      className={clsx(
        "relative z-[2000] w-full px-3 py-3 sm:px-8 sm:py-4 lg:px-10",
        headerThemeClasses[theme]
      )}
    >
      <div className={clsx("mx-auto flex w-full max-w-6xl items-center justify-between gap-2 sm:gap-6", contentClassName)}>
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {showLogo ? (
            <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Accueil">
              <House className="h-8 w-8 text-white sm:hidden" aria-hidden />
              <span className="hidden sm:inline-flex">
                <Image
                  src="/images/gomile-logo.png"
                  alt="GoMile"
                  width={58}
                  height={58}
                  priority
                  className="h-[58px] w-[58px] object-contain"
                />
              </span>
            </Link>
          ) : null}
          {leftSlot}
        </div>

        {showPublicLinks ? (
          <div className={clsx("hidden lg:flex items-center gap-8 xl:gap-10", textThemeClasses[text_theme])}>
            <Typography theme={text_theme} weight="medium" variant="h6" className={headerLinkClasses}>
              <Link href="/#contact">Contact</Link>
            </Typography>
            <Typography theme={text_theme} weight="medium" variant="h6" className={headerLinkClasses}>
              <Link href="/faq">FAQ</Link>
            </Typography>
            <Typography theme={text_theme} weight="medium" variant="h6" className={headerLinkClasses}>
              <Link href="/enSavoirPlus">En savoir plus</Link>
            </Typography>
          </div>
        ) : null}

        <div className={clsx("flex min-w-0 items-center gap-2 sm:gap-4", textThemeClasses[text_theme])}>
          {shouldShowModeToggle ? (
            <ModeToggle
              theme={mode as ThemeMode}
              onChange={onModeChange as (theme: ThemeMode) => void}
              isDarkMode={isDarkMode}
            />
          ) : null}

          {shouldShowAuthLinks ? (
            <div className="hidden items-center gap-6 lg:flex xl:gap-8">
              <Typography theme={text_theme} weight="medium" variant="h6" className={headerLinkClasses}>
                <Link href="/auth">S&apos;inscrire</Link>
              </Typography>
              <Typography theme={text_theme} weight="medium" variant="h6" className={headerLinkClasses}>
                <Link href="/merchant/login">Se connecter</Link>
              </Typography>
            </div>
          ) : null}

          {isSessionAuthenticated && displayUsername && !rightSlot ? (
            <Typography
              theme={text_theme}
              weight="medium"
              variant="h6"
              className="hidden rounded-full bg-white/15 px-4 py-2 text-sm sm:text-base lg:block lg:text-lg"
            >
              {displayUsername}
            </Typography>
          ) : null}

          {rightSlot}

          {hasMobileMenuContent ? (
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:hidden"
              aria-label={isMobileMenuVisible ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={isMobileMenuVisible}
              aria-controls="main-mobile-navigation"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
            >
              {isMobileMenuVisible ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      </div>

      {hasMobileMenuContent ? (
        <>
          <button
            type="button"
            className={clsx(
              "fixed inset-0 z-[2100] bg-black/30 transition-opacity lg:hidden",
              isMobileMenuVisible ? "opacity-100" : "pointer-events-none opacity-0"
            )}
            aria-label="Fermer le menu"
            onClick={closeMobileMenu}
          />
          <nav
            id="main-mobile-navigation"
            className={clsx(
              "fixed right-0 top-0 z-[2200] flex h-dvh w-[min(20rem,88vw)] flex-col gap-2 bg-linear-to-b from-blue-600 to-green-600 px-4 py-5 text-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
              isMobileMenuVisible ? "translate-x-0" : "translate-x-full"
            )}
            aria-label="Navigation mobile"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-base font-semibold sm:text-lg">Menu</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="Fermer le menu"
                onClick={closeMobileMenu}
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {showPublicLinks ? (
              <>
                <Link href="/#contact" className={drawerLinkClasses} onClick={closeMobileMenu}>
                  Contact
                </Link>
                <Link href="/faq" className={drawerLinkClasses} onClick={closeMobileMenu}>
                  FAQ
                </Link>
                <Link href="/enSavoirPlus" className={drawerLinkClasses} onClick={closeMobileMenu}>
                  En savoir plus
                </Link>
              </>
            ) : null}

            {shouldShowAuthLinks ? (
              <>
                <Link href="/auth" className={drawerLinkClasses} onClick={closeMobileMenu}>
                  S&apos;inscrire
                </Link>
                <Link href="/merchant/login" className={drawerLinkClasses} onClick={closeMobileMenu}>
                  Se connecter
                </Link>
              </>
            ) : null}

            {isSessionAuthenticated && displayUsername ? (
              <span className="mt-2 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white sm:text-base">
                {displayUsername}
              </span>
            ) : null}
          </nav>
        </>
      ) : null}
    </Container>
  )
}
