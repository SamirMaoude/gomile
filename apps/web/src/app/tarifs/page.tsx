"use client";

import { useMemo, useState } from "react";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

import Button from "@/components/ui/design-system/button/button";
import Card from "@/components/ui/design-system/cards/card";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";

import styles from "./tarifs.module.css";

type BillingMode = "monthly" | "annual";

type Plan = {
  name: string;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  suffix: string;
  cta: string;
  href: string;
  icon: typeof Zap;
  accent: "slate" | "green" | "pink";
  featured?: boolean;
  features: string[];
};

const plans: Plan[] = [
  {
    name: "Occasionnel",
    description: "Parfait pour une utilisation ponctuelle",
    monthlyPrice: "0EUR",
    annualPrice: "0EUR",
    suffix: "Gratuit",
    cta: "Commencer",
    href: "/auth",
    icon: Zap,
    accent: "slate",
    features: [
      "Paiement a la livraison",
      "Tracking GPS en temps reel",
      "Support 7j/7",
      "Livraison standard (30-120 min)",
      "Assurance jusqu'a 100EUR",
    ],
  },
  {
    name: "Premium",
    description: "Ideal pour les utilisateurs reguliers",
    monthlyPrice: "19.90EUR",
    annualPrice: "15.90EUR",
    suffix: "/mois",
    cta: "Commencer",
    href: "/auth",
    icon: Sparkles,
    accent: "green",
    featured: true,
    features: [
      "Livraisons illimitees incluses",
      "Tracking GPS en temps reel",
      "Livraison express (sous 30 min)",
      "Programmation de livraison",
      "Support prioritaire",
    ],
  },
  {
    name: "Business",
    description: "Solution personnalisee pour entreprises",
    monthlyPrice: "Sur mesure",
    annualPrice: "Sur mesure",
    suffix: "",
    cta: "Nous contacter",
    href: "/auth",
    icon: Crown,
    accent: "pink",
    features: [
      "Volume de livraisons personnalise",
      "Gestionnaire de compte dedie",
      "API complete pour integration",
      "Facturation mensuelle centralisee",
      "Reporting et analytics avances",
    ],
  },
];

const accentClassNames: Record<Plan["accent"], string> = {
  slate: styles.accentSlate,
  green: styles.accentGreen,
  pink: styles.accentPink,
};

const iconClassNames: Record<Plan["accent"], string> = {
  slate: styles.iconSlate,
  green: styles.iconGreen,
  pink: styles.iconPink,
};

export default function TarifsPage() {
  const [billingMode, setBillingMode] = useState<BillingMode>("monthly");

  const displayedPlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        price:
          billingMode === "annual" ? plan.annualPrice : plan.monthlyPrice,
      })),
    [billingMode],
  );

  return (
    <main className={`${styles.page} flex flex-col`}>
      <Navigation theme="landingpage" />

      <section className={styles.heroSection}>
        <Container size="xl" className={styles.heroContainer}>
          <div className={styles.heroCopy}>
            <Typography
              variant="h1"
              Component="h1"
              theme="heading"
              className={styles.heroTitle}
            >
              Des tarifs <span className={styles.highlight}>simples et transparents</span>
            </Typography>

            <Typography
              variant="h6"
              Component="p"
              theme="body"
              className={styles.heroSubtitle}
            >
              Choisissez la formule qui correspond a vos besoins. Sans frais
              caches, sans mauvaise surprise.
            </Typography>
          </div>

          <div className={styles.billingSwitchWrapper}>
            <div className={styles.billingSwitch} aria-label="Facturation">
              <button
                type="button"
                className={`${styles.billingOption} ${billingMode === "monthly" ? styles.billingOptionActive : ""}`}
                onClick={() => setBillingMode("monthly")}
                aria-pressed={billingMode === "monthly"}
              >
                Mensuel
              </button>
              <button
                type="button"
                className={`${styles.billingOption} ${billingMode === "annual" ? styles.billingOptionActive : ""}`}
                onClick={() => setBillingMode("annual")}
                aria-pressed={billingMode === "annual"}
              >
                Annuel
              </button>
              <span className={styles.discountBadge}>-20%</span>
            </div>
          </div>
        </Container>
      </section>

      <section className={`${styles.pricingSection} flex-1`}>
        <Container size="xl" className={styles.cardsGrid}>
          {displayedPlans.map((plan) => {
            const Icon = plan.icon;
            const isCustomPrice = plan.suffix === "";

            return (
              <Card
                key={plan.name}
                icon={<Icon size={22} strokeWidth={2.2} />}
                iconTheme="white"
                title={plan.name}
                description={plan.description}
                size="lg"
                className={`${styles.planCard} ${accentClassNames[plan.accent]} ${plan.featured ? styles.planCardFeatured : ""}`}
                iconClassName={`${styles.iconWrap} ${iconClassNames[plan.accent]}`}
                titleClassName={styles.planCardTitle}
                descriptionClassName={styles.planCardDescription}
              >
                {plan.featured ? (
                  <div className={styles.featuredBadge}>Le plus populaire</div>
                ) : null}

                <div className={styles.priceBlock}>
                  <Typography
                    variant="h2"
                    Component="p"
                    theme="heading"
                    className={styles.priceValue}
                  >
                    {plan.price}
                  </Typography>
                  {plan.suffix ? (
                    <Typography
                      variant="span"
                      Component="span"
                      theme="body"
                      className={styles.priceSuffix}
                    >
                      {plan.suffix}
                    </Typography>
                  ) : null}
                </div>

                <Button
                  href={plan.href}
                  fullWidth
                  variant={plan.accent === "green" ? "filled" : "outline"}
                  className={`${styles.planButton} ${plan.accent === "slate" ? styles.buttonSlate : ""} ${plan.accent === "pink" ? styles.buttonPink : ""}`}
                >
                  {plan.cta}
                </Button>

                <ul className={styles.featureList}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      <span className={styles.checkWrap}>
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <Typography variant="p" Component="span" theme="bodyStrong">
                        {feature}
                      </Typography>
                    </li>
                  ))}
                </ul>

                {plan.featured && !isCustomPrice ? (
                  <Typography
                    variant="p"
                    Component="p"
                    theme="success"
                    className={styles.planNote}
                  >
                    Economisez encore plus avec la facturation annuelle.
                  </Typography>
                ) : null}
              </Card>
            );
          })}
        </Container>
      </section>

      <Footerlp />
    </main>
  );
}
