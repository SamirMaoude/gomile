import { cn, styles } from "@/app/merchant/dashboard/style";
import type {
  MerchantCreatedDeliveryItem,
  MerchantStatusChangeItem,
} from "@/components/dashboard/dashboard-overview.model";
import Typography from "@/components/ui/design-system/typography";

type DeliveryTopListProps =
  | {
      emptyLabel: string;
      error?: string | null;
      isDarkMode: boolean;
      isLoading?: boolean;
      items: MerchantCreatedDeliveryItem[];
      title: string;
      type: "created";
    }
  | {
      emptyLabel: string;
      error?: string | null;
      isDarkMode: boolean;
      isLoading?: boolean;
      items: MerchantStatusChangeItem[];
      title: string;
      type: "status";
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

export default function DeliveryTopList({
  emptyLabel,
  error = null,
  isDarkMode,
  isLoading = false,
  items,
  title,
  type,
}: DeliveryTopListProps) {
  return (
    <section>
      <div
        className={cn(
          styles.deliveriesHeader,
          isDarkMode ? styles.deliveriesHeaderDark : styles.deliveriesHeaderLight,
        )}
      >
        <Typography
          variant="h3"
          Component="h3"
          theme={isDarkMode ? "white" : "heading"}
          className={styles.activityTitle}
        >
          {title}
        </Typography>
      </div>

      <div className={styles.topListBody}>
        {isLoading ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Chargement...
          </Typography>
        ) : error ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-rose-300" : "!text-rose-600")}
          >
            {error}
          </Typography>
        ) : items.length === 0 ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-400" : "!text-slate-500")}
          >
            {emptyLabel}
          </Typography>
        ) : (
          <div className={styles.activityList}>
            {type === "created"
              ? items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    styles.activityItem,
                    isDarkMode
                      ? "border-slate-800 bg-slate-950/50 text-slate-100"
                      : "border-slate-200 bg-slate-50/80 text-slate-900",
                  )}
                >
                  <div className={styles.activityItemHeader}>
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="!text-inherit"
                    >
                      {item.id}
                    </Typography>
                    <span className={styles.activityPill}>
                      {item.statusLabel}
                    </span>
                  </div>
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
              ))
              : items.map((item) => (
                <div
                  key={`${item.id}-${item.eventLabel}-${item.time}`}
                  className={cn(
                    styles.activityItem,
                    isDarkMode
                      ? "border-slate-800 bg-slate-950/50 text-slate-100"
                      : "border-slate-200 bg-slate-50/80 text-slate-900",
                  )}
                >
                  <div className={styles.activityItemHeader}>
                    <Typography
                      variant="span"
                      Component="span"
                      weight="bold"
                      className="!text-inherit"
                    >
                      {item.id}
                    </Typography>
                    <span className={styles.activityPill}>
                      {item.eventLabel}
                    </span>
                  </div>
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
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
