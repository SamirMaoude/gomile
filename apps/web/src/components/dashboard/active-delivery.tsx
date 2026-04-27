import { cn, styles } from "@/app/merchant/dashboard/style";
import type {
  DeliveryStatusTone,
  MerchantDeliveryItem,
} from "@/components/dashboard/dashboard-overview.model";
import Typography from "@/components/ui/design-system/typography";
import ClockIcon from "../ui/icons/ClockIcon";
import CheckIcon from "../ui/icons/CheckIcon";
import DynamicTable, { DynamicTableColumn } from "../ui/design-system/table/dynamic-table";

type StatusBadgeProps = {
  label: string;
  tone: DeliveryStatusTone;
  isDarkMode: boolean;
};

function StatusBadge({ label, tone, isDarkMode }: StatusBadgeProps) {
  const isWarning = tone === "warning";
  const isSuccess = tone === "success";

  return (
    <span
      className={cn(
        styles.statusBadge,
        isWarning
          ? isDarkMode
            ? styles.statusLateDark
            : styles.statusLateLight
          : isSuccess
            ? isDarkMode
              ? styles.statusOnTimeDark
              : styles.statusOnTimeLight
            : isDarkMode
            ? styles.statusOnTimeDark
            : styles.statusOnTimeLight,
      )}
    >
      <span className={isWarning ? styles.statusLateIcon : styles.statusOnTimeIcon}>
        {isWarning ? (
          <ClockIcon className={styles.iconMedium} />
        ) : (
          <CheckIcon className={styles.iconMedium} />
        )}
      </span>

      <Typography
        variant="span"
        Component="span"
        weight="semibold"
        className="!text-inherit"
      >
        {label}
      </Typography>
    </span>
  );
}

type ActiveDeliveriesProps = {
  deliveries: MerchantDeliveryItem[];
  error?: string | null;
  isDarkMode: boolean;
  isLoading?: boolean;
};

export default function ActiveDeliveries({
  deliveries,
  error = null,
  isDarkMode,
  isLoading = false,
}: ActiveDeliveriesProps) {
  const columns: DynamicTableColumn<MerchantDeliveryItem>[] = [
    {
      key: "id",
      header: "ID",
      cellClassName: styles.deliveryIdentity,
      render: (delivery) => (
        <>
          <div className={cn(styles.deliveryAvatar, delivery.avatarClass)}>
            <Typography
              variant="span"
              Component="span"
              weight="bold"
              className="text-sm !text-inherit"
            >
              {delivery.initials}
            </Typography>
          </div>

          <Typography
            variant="span"
            Component="span"
            weight="bold"
            theme={isDarkMode ? "white" : "heading"}
            className={styles.deliveryId}
          >
            {delivery.id}
          </Typography>
        </>
      ),
    },
    {
      key: "destination",
      header: "Destination",
      cellClassName: styles.deliveryDestination,
      render: (delivery) => (
        <Typography
          variant="span"
          Component="span"
          weight="medium"
          theme={isDarkMode ? "white" : "black"}
          className="!text-inherit"
        >
          {delivery.destination}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Statut",
      cellClassName: styles.deliveryStatusWrap,
      render: (delivery) => (
        <StatusBadge
          label={delivery.statusLabel}
          tone={delivery.statusTone}
          isDarkMode={isDarkMode}
        />
      ),
    },
    {
      key: "time",
      header: "Creee le",
      cellClassName: styles.deliveryEtaWrap,
      render: (delivery) => (
        <div>
          <Typography
            variant="span"
            Component="span"
            weight="semibold"
            theme={isDarkMode ? "white" : "black"}
            className="!text-inherit"
          >
            {delivery.time}
          </Typography>

          {delivery.note ? (
            <Typography
              variant="span"
              Component="span"
              weight="medium"
              className={
                isDarkMode
                  ? styles.deliveryNoteDark
                  : styles.deliveryNoteLight
              }
            >
              {delivery.note}
            </Typography>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <section
      className={cn(
        styles.deliveriesSection,
        isDarkMode
          ? styles.deliveriesSectionDark
          : styles.deliveriesSectionLight,
      )}
    >
      <div
        className={cn(
          styles.deliveriesHeader,
          isDarkMode
            ? styles.deliveriesHeaderDark
            : styles.deliveriesHeaderLight,
        )}
      >
        <Typography
          variant="h3"
          Component="h3"
          theme={isDarkMode ? "white" : "heading"}
          className={styles.sectionTitle}
        >
          Liste des livraisons actives
        </Typography>
      </div>

      <div className={styles.tableOverflow}>
        {isLoading ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
            >
              Chargement des livraisons actives...
            </Typography>
          </div>
        ) : error ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(isDarkMode ? "!text-rose-300" : "!text-rose-600")}
            >
              {error}
            </Typography>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
            >
              Aucune livraison active n&apos;est en cours pour ce merchant.
            </Typography>
          </div>
        ) : (
          <div className={styles.deliveriesTableMin}>
            <DynamicTable
              columns={columns}
              rows={deliveries}
              gridTemplateColumns="9.5rem 1.4fr 1.25fr 1fr"
              headerRowClassName={cn(
                styles.deliveriesTableHead,
                isDarkMode
                  ? styles.deliveriesTableHeadDark
                  : styles.deliveriesTableHeadLight,
              )}
              bodyClassName={
                isDarkMode
                  ? styles.deliveriesDividerDark
                  : styles.deliveriesDividerLight
              }
              rowClassName={styles.deliveryRow}
            />
          </div>
        )}
      </div>
    </section>
  );
}
