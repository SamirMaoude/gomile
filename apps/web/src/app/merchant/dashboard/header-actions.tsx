import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import {
  getCurrentMerchantProfile,
  getMerchantProfileUpdatedEventName,
} from "@/lib/merchant-session";
import ProfileSlot from "./profile-slot";
import { cn, styles } from "./style";

type HeaderActionsProps = React.ComponentProps<typeof ProfileSlot>;
type MerchantSubscription = "FREE" | "PRO" | "BUSINESS";

function getSubscriptionLabel(subscription: MerchantSubscription) {
  return subscription === "BUSINESS" ? "Business" : "Pro";
}

export default function HeaderActions(props: HeaderActionsProps) {
  const { isDarkMode } = props;
  const [subscription, setSubscription] = useState<MerchantSubscription | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;

    void getCurrentMerchantProfile()
      .then((profile) => {
        if (isActive) {
          setSubscription(profile.subscription);
        }
      })
      .catch(() => {
        if (isActive) {
          setSubscription(null);
        }
      });

    function handleMerchantProfileUpdated(event: Event) {
      const detail = (
        event as CustomEvent<{ subscription?: MerchantSubscription } | null>
      ).detail;
      setSubscription(detail?.subscription ?? null);
    }

    window.addEventListener(
      getMerchantProfileUpdatedEventName(),
      handleMerchantProfileUpdated,
    );

    return () => {
      isActive = false;
      window.removeEventListener(
        getMerchantProfileUpdatedEventName(),
        handleMerchantProfileUpdated,
      );
    };
  }, []);

  const hasPaidPlan =
    subscription === "PRO" || subscription === "BUSINESS";

  return (
    <div className={styles.headerActions}>
      {hasPaidPlan ? (
        <div
          className={cn(
            styles.subscriptionPill,
            isDarkMode
              ? styles.subscriptionPillDark
              : styles.subscriptionPillLight,
          )}
        >
          <span
            className={cn(
              styles.upgradeIconWrap,
              isDarkMode
                ? styles.upgradeIconWrapDark
                : styles.upgradeIconWrapLight,
            )}
          >
            <Crown className={styles.upgradeIcon} strokeWidth={2.1} />
          </span>

          <span className={styles.upgradeCopy}>
            <span className={styles.upgradeTitle}>
              {getSubscriptionLabel(subscription)}
            </span>
          </span>
        </div>
      ) : (
        <Link
          href="/tarifs"
          className={cn(
            styles.upgradeLink,
            isDarkMode ? styles.upgradeLinkDark : styles.upgradeLinkLight,
          )}
        >
          <span
            className={cn(
              styles.upgradeIconWrap,
              isDarkMode
                ? styles.upgradeIconWrapDark
                : styles.upgradeIconWrapLight,
            )}
          >
            <Crown className={styles.upgradeIcon} strokeWidth={2.1} />
          </span>

          <span className={styles.upgradeCopy}>
            <span className={styles.upgradeTitle}>Passer au Pro</span>
          </span>

          <ArrowRight className={styles.upgradeArrow} strokeWidth={2.2} />
        </Link>
      )}

      <ProfileSlot {...props} />
    </div>
  );
}
