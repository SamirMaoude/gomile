"use client";

import { cn, styles } from "@/app/merchant/dashboard/style";
import Button from "@/components/ui/design-system/button/button";
import Form from "@/components/ui/design-system/forms/form";
import Typography from "@/components/ui/design-system/typography";
import { useMerchantHandshakeCard } from "./use-merchant-handshake-card";

type MerchantHandshakeCardProps = {
  isDarkMode: boolean;
};

export default function MerchantHandshakeCard({
  isDarkMode,
}: MerchantHandshakeCardProps) {
  const {
    code,
    feedback,
    handleSubmit,
    isLoadingStores,
    isSubmitting,
    selectedStoreId,
    setCode,
    setSelectedStoreId,
    stores,
  } = useMerchantHandshakeCard();

  return (
    <section
      className={cn(
        styles.handshakeSection,
        isDarkMode
          ? styles.handshakeSectionDark
          : styles.handshakeSectionLight,
      )}
    >
      <div
        className={cn(
          styles.handshakeHeader,
          isDarkMode
            ? styles.handshakeHeaderDark
            : styles.handshakeHeaderLight,
        )}
      >
        <Typography
          variant="h3"
          Component="h3"
          theme={isDarkMode ? "white" : "heading"}
          className={styles.sectionTitle}
        >
          Handshake commande
        </Typography>
      </div>

      <Form onSubmit={handleSubmit} className={styles.handshakeForm}>
        <label className={styles.handshakeFieldGroup}>
          <span
            className={cn(
              styles.handshakeLabel,
              isDarkMode ? "!text-slate-200" : "!text-slate-700",
            )}
          >
            Boutique
          </span>
          <select
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
            disabled={isLoadingStores || isSubmitting || stores.length === 0}
            className={cn(
              styles.handshakeSelect,
              isDarkMode
                ? styles.handshakeControlDark
                : styles.handshakeControlLight,
            )}
          >
            <option value="">
              {isLoadingStores
                ? "Chargement des boutiques..."
                : "Selectionnez une boutique"}
            </option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.handshakeFieldGroup}>
          <span
            className={cn(
              styles.handshakeLabel,
              isDarkMode ? "!text-slate-200" : "!text-slate-700",
            )}
          >
            Code handshake
          </span>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Ex: 023106"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            disabled={isSubmitting}
            className={cn(
              styles.handshakeInput,
              isDarkMode
                ? styles.handshakeControlDark
                : styles.handshakeControlLight,
            )}
          />
        </label>

        {feedback ? (
          <p
            className={cn(
              styles.handshakeFeedback,
              feedback.kind === "success"
                ? isDarkMode
                  ? styles.handshakeSuccessDark
                  : styles.handshakeSuccessLight
                : isDarkMode
                  ? styles.handshakeErrorDark
                  : styles.handshakeErrorLight,
            )}
          >
            {feedback.message}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || isLoadingStores || stores.length === 0}
          className={styles.handshakeButton}
        >
          {isSubmitting ? "Verification..." : "Valider le code"}
        </Button>
      </Form>
    </section>
  );
}
