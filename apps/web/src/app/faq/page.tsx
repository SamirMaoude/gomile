"use client";

import { useState } from "react";
import {
  CreditCard,
  HelpCircle,
  Package,
  Search,
  Truck,
  User,
} from "lucide-react";

import Accordion from "@/components/ui/design-system/Accordion/accordion";
import Footerlp from "@/components/ui/design-system/header_footer/footerlp";
import Title_ST from "@/components/ui/design-system/titre/title_st";
import Typography from "@/components/ui/design-system/typography";
import Container from "@/components/ui/elements/container";
import { Navigation } from "@/components/ui/navigation/navigation";

import styles from "./faq.module.css";

type FaqCategoryId =
  | "all"
  | "general"
  | "delivery"
  | "pricing"
  | "account"
  | "packages";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: FaqCategoryId;
  label: string;
  icon: typeof HelpCircle;
  items: FaqItem[];
};

const categories: FaqCategory[] = [
  {
    id: "general",
    label: "Questions générales",
    icon: HelpCircle,
    items: [
      {
        question: "Comment fonctionne GoMile ?",
        answer:
          "GoMile vous permet de programmer ou demander une livraison en quelques clics. Vous indiquez l'adresse de départ, la destination, le type de colis et nous attribuons la course au livreur disponible le plus adapté.",
      },
      {
        question: "Dans quelles villes êtes-vous disponibles ?",
        answer:
          "Le service est déployé progressivement dans plusieurs zones urbaines. La disponibilité exacte dépend de votre secteur et peut être vérifiée directement lors de la création d'une livraison.",
      },
      {
        question: "Quels sont vos horaires de service ?",
        answer:
          "La plateforme est accessible 24h/24 pour les demandes. Les créneaux de livraison dépendent ensuite de la disponibilité locale des livreurs et des horaires choisis par le commerçant ou le client.",
      },
    ],
  },
  {
    id: "delivery",
    label: "Livraison",
    icon: Truck,
    items: [
      {
        question: "Puis-je suivre ma livraison en temps réel ?",
        answer:
          "Oui. Une fois la commande prise en charge, un suivi en direct vous permet de visualiser l'avancement de la course, les étapes de prise en charge et l'heure estimée d'arrivée.",
      },
      {
        question: "Que se passe-t-il si le destinataire est absent ?",
        answer:
          "Le livreur tente de contacter le destinataire. Si la remise reste impossible, la course suit les consignes définies sur la commande: nouvelle tentative, dépôt sécurisé ou retour à l'expéditeur.",
      },
      {
        question: "Puis-je planifier une livraison à l'avance ?",
        answer:
          "Oui, vous pouvez choisir une date et un créneau horaire afin d'organiser vos expéditions à l'avance et mieux coordonner votre activité.",
      },
    ],
  },
  {
    id: "pricing",
    label: "Tarifs & Paiement",
    icon: CreditCard,
    items: [
      {
        question: "Comment les tarifs sont-ils calculés ?",
        answer:
          "Le prix dépend principalement de la distance, du type de colis, du niveau d'urgence et de la zone de livraison. Un montant estimatif est affiché avant validation.",
      },
      {
        question: "Quels moyens de paiement acceptez-vous ?",
        answer:
          "Nous prévoyons la prise en charge des paiements en ligne sécurisés ainsi que des modes de règlement adaptés aux comptes professionnels selon la configuration du service.",
      },
      {
        question: "Puis-je récupérer une facture ?",
        answer:
          "Oui. Les justificatifs et factures sont accessibles depuis votre espace de gestion afin de faciliter votre suivi comptable.",
      },
    ],
  },
  {
    id: "account",
    label: "Mon compte",
    icon: User,
    items: [
      {
        question: "Comment créer un compte GoMile ?",
        answer:
          "Depuis la page principale, choisissez votre profil, complétez vos informations et validez votre inscription. Vous pourrez ensuite accéder à votre tableau de bord.",
      },
      {
        question: "Puis-je modifier mes informations personnelles ?",
        answer:
          "Oui. Les paramètres du compte permettent de mettre à jour vos coordonnées, votre mot de passe et certaines préférences liées à vos livraisons.",
      },
      {
        question: "Comment réinitialiser mon mot de passe ?",
        answer:
          "Utilisez le lien de réinitialisation disponible sur l'écran de connexion. Un e-mail ou un code de vérification vous guidera pour définir un nouveau mot de passe.",
      },
    ],
  },
  {
    id: "packages",
    label: "Types de colis",
    icon: Package,
    items: [
      {
        question: "Quels types de colis puis-je envoyer ?",
        answer:
          "Vous pouvez expédier des documents, petits paquets et marchandises légères, tant qu'ils respectent les dimensions et restrictions prévues par le service.",
      },
      {
        question: "Y a-t-il des articles interdits ?",
        answer:
          "Oui. Les produits dangereux, illicites, périssables non autorisés ou nécessitant des conditions spéciales non prises en charge sont exclus.",
      },
      {
        question: "Le colis doit-il être emballé avant l'enlèvement ?",
        answer:
          "Oui, un emballage solide et correctement fermé est recommandé pour garantir la sécurité du transport et éviter tout refus lors de la prise en charge.",
      },
    ],
  },
];

const allItems = categories.flatMap((category) => category.items);

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<FaqCategoryId>("all");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const baseItems =
    activeCategory === "all"
      ? allItems
      : categories.find((category) => category.id === activeCategory)?.items ?? [];

  const filteredItems = baseItems.filter(({ question, answer }) => {
    if (!normalizedSearch) {
      return true;
    }

    return [question, answer].some((value) =>
      value.toLowerCase().includes(normalizedSearch),
    );
  });

  const displayedCategory =
    activeCategory === "all"
      ? {
          label: "Toutes les catégories",
          icon: HelpCircle,
        }
      : categories.find((category) => category.id === activeCategory) ?? {
          label: "Questions fréquentes",
          icon: HelpCircle,
        };

  const SectionIcon = displayedCategory.icon;

  return (
    <main className={`${styles.page} flex flex-col`}>
      <Navigation theme="landingpage" />

      <section className={styles.heroSection}>
        <Container size="lg" className={styles.heroContainer}>
          <div className={styles.heroBadge}>
            <HelpCircle size={30} strokeWidth={2.2} />
          </div>

          <Title_ST
            title="Questions fréquentes"
            sub_title="Trouvez rapidement les réponses à vos questions sur notre service de livraison"
          />

          <label className={styles.searchBox} htmlFor="faq-search">
            <Search size={20} className={styles.searchIcon} />
            <input
              id="faq-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une question..."
              className={styles.searchInput}
            />
          </label>
        </Container>
      </section>

      <section className={styles.filterSection}>
        <Container size="xl" className={styles.filtersContainer}>
          <button
            type="button"
            className={`${styles.filterChip} ${activeCategory === "all" ? styles.filterChipActive : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            Toutes les catégories
          </button>

          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                className={`${styles.filterChip} ${isActive ? styles.filterChipActive : ""}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon size={16} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </Container>
      </section>

      <section className={`${styles.faqSection} flex-1`}>
        <Container size="lg" className={styles.faqContainer}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionIcon}>
              <SectionIcon size={22} strokeWidth={2.2} />
            </div>
            <Typography variant="h3" weight="bold" theme="black" Component="h2">
              {displayedCategory.label}
            </Typography>
          </div>

          {filteredItems.length > 0 ? (
            <Accordion items={filteredItems} />
          ) : (
            <div className={styles.emptyState}>
              <Typography variant="h5" weight="semibold" theme="black">
                Aucun résultat trouvé
              </Typography>
              <Typography variant="p" theme="grey">
                Essayez un autre mot-clé ou changez de catégorie.
              </Typography>
            </div>
          )}
        </Container>
      </section>

      <Footerlp />
    </main>
  );
}
