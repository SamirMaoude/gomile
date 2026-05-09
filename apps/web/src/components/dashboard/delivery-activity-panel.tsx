import { cn, styles } from "@/app/merchant/dashboard/style";
import type { MerchantNotificationItem } from "@/components/dashboard/dashboard-overview.model";
import { getNotificationDisplay } from "@/components/dashboard/delivery-activity-panel.helpers";
import { groupDeliveryNotifications } from "@/components/dashboard/delivery-notifications";
import Typography from "@/components/ui/design-system/typography";

type DeliveryActivityPanelProps = {
  error?: string | null;
  isDarkMode: boolean;
  isLoading?: boolean;
  notifications: MerchantNotificationItem[];
};

function ActivityMeta({
  isDarkMode,
  storeName,
  time,
}: {
  isDarkMode: boolean;
  storeName?: string;
  time: string;
}) {
  return (
    <Typography
      variant="span"
      Component="span"
      className={cn(
        styles.activityMeta,
        isDarkMode ? "!text-slate-400" : "!text-slate-500",
      )}
    >
      {storeName ? `${storeName} · ${time}` : time}
    </Typography>
  );
}

export default function DeliveryActivityPanel({
  error = null,
  isDarkMode,
  isLoading = false,
  notifications,
}: DeliveryActivityPanelProps) {
  const notificationGroups = groupDeliveryNotifications(notifications);

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
          className={styles.activityTitle}
        >
          Notifications
        </Typography>
      </div>

      <div className={styles.activityPanelBody}>
        {isLoading ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Chargement des notifications...
          </Typography>
        ) : error ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-rose-300" : "!text-rose-600")}
          >
            {error}
          </Typography>
        ) : notificationGroups.length === 0 ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-400" : "!text-slate-500")}
          >
            Aucune notification récente.
          </Typography>
        ) : (
          notificationGroups.map((group) => (
            <div key={group.title} className={styles.activityGroup}>
              <Typography
                variant="h4"
                Component="h4"
                theme={isDarkMode ? "white" : "heading"}
                className={styles.activityGroupTitle}
              >
                {group.title}
              </Typography>

              <div className={styles.activityList}>
                {group.items.map((item) => {
                  const notificationDisplay = getNotificationDisplay(
                    item.kind,
                    isDarkMode,
                  );
                  const NotificationIcon = notificationDisplay.icon;

                  return (
                    <div
                      key={`${item.id}-${item.message}-${item.timestamp}`}
                      className={cn(
                        styles.notificationItem,
                        notificationDisplay.itemClassName,
                      )}
                    >
                      <span
                        className={cn(
                          styles.notificationIcon,
                          notificationDisplay.iconClassName,
                        )}
                        aria-hidden="true"
                      >
                        <NotificationIcon className={styles.notificationIconSvg} />
                      </span>
                      <div className={styles.notificationContent}>
                        <Typography
                          variant="span"
                          Component="span"
                          weight="semibold"
                          className="!text-inherit"
                        >
                          {item.message} · {item.id}
                        </Typography>
                        <Typography
                          variant="span"
                          Component="span"
                          className={styles.activityText}
                        >
                          {item.destination}
                        </Typography>
                        <ActivityMeta
                          isDarkMode={isDarkMode}
                          storeName={item.storeName}
                          time={item.time}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
