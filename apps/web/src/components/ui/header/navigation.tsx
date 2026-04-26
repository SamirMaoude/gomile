"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Typography from "@/components/ui/design-system/typography";
import { Logo } from "@/components/Logo/Logo";
import Container from "../elements/container";
import ModeToggle from "./mode-toggle";
import { styles } from "./styles";

type ThemeMode = "light" | "dark";

type NavigationProps = {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
  isDarkMode: boolean;
  rightSlot?: ReactNode;
};

export default function Navigation({
  theme,
  onChange,
  isDarkMode,
  rightSlot,
}: NavigationProps) {
  const pathname = usePathname();
  const hideLogo = pathname.includes("dashboard");
  const hideThemeToggle = pathname === "/";


  return (
    <header className={styles.wrapperClassName}>
      <Container fullwidth className={styles.innerClassName}>
        {!hideLogo ? (
          <div className={styles.leftClassName}>
            <Link href="/" className={styles.logoLinkClassName} aria-label="Accueil GoMile">
              <Logo size="md" />
            </Link>
          </div>
        ) : (
          <div />
        )}

        <div className={styles.rightClassName}>
          <nav className={styles.linksClassName} aria-label="Navigation principale">
            <Link href="/a-propos" className={styles.linkClassName}>
              <Typography
                variant="span"
                Component="span"
                theme="white"
                weight="medium"
              >
                À PROPOS
              </Typography>
            </Link>
            <Link href="/contact" className={styles.linkClassName}>
              <Typography
                variant="span"
                Component="span"
                theme="white"
                weight="medium"
              >
                CONTACT
              </Typography>
            </Link>
          </nav>
          <nav className={styles.mobileLinksClassName} aria-label="Navigation mobile">
            <Link href="/about" className={styles.linkClassName}>
              <Typography
                variant="span"
                Component="span"
                theme="white"
                weight="medium"
              >
                À PROPOS
              </Typography>
            </Link>
            <Link href="/contact" className={styles.linkClassName}>
              <Typography
                variant="span"
                Component="span"
                theme="white"
                weight="medium"
              >
                CONTACT
              </Typography>
            </Link>
          </nav>

          {!hideThemeToggle ? (<ModeToggle
            theme={theme}
            onChange={onChange}
            isDarkMode={isDarkMode}
          />) : (<div />)}

          {rightSlot}
        </div>
      </Container>
    </header>
  );
}