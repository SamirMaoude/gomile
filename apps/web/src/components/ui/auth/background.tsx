import type { ElementType, ReactNode } from "react";
import Link from "next/link";

import Container from "@/components/ui/elements/container";
import Typography from "@/components/ui/design-system/typography";
import HomeIcon from "@/components/ui/icons/HomeIcon";
import { backgroundImageStyle, styles } from "./styles";


type BackgroundProps = {
  as?: ElementType;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  containerClassName?: string;
};

export default function Background({
  as: Component = "main",
  children,
  backHref,
  backLabel = "Retour a l'accueil",
  containerClassName = "",
}: BackgroundProps) {
  return (
    <Component className={styles.page} style={backgroundImageStyle}>
      <div className={styles.overlay} />

      <Container
        fullwidth
        className={[styles.container, containerClassName].filter(Boolean).join(" ")}
      >
        {backHref ? (
          <Link href={backHref} className={styles.backLink} aria-label={backLabel}>
            <HomeIcon className={styles.backLinkIcon} />
            <Typography
              variant="span"
              Component="span"
              weight="medium"
              className={styles.backLinkText}
            >
              {backLabel}
            </Typography>
          </Link>
        ) : null}

        {children}
      </Container>
    </Component>
  );
}
