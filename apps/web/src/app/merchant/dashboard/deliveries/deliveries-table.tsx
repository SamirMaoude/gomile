"use client";

import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import { cn, styles } from "../style";
import {
  formatDeliveryDate,
  formatDeliveryShortId,
  formatDeliveryStatus,
  getDeliveryStatusTone,
  type DeliveryRow,
} from "./delivery.model";
import { useDeliveriesTable } from "./use-deliveries-table";

type DeliveriesTableProps = {
  isDarkMode: boolean;
};

export default function DeliveriesTable({ isDarkMode }: DeliveriesTableProps) {
  const { error, isLoading, rows } = useDeliveriesTable();

  const columns: DynamicTableColumn<DeliveryRow>[] = [
    {
      key: "delivery",
      header: "Livraison",
      render: (delivery) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="bold"
            className="block truncate text-base !text-inherit"
          >
            {formatDeliveryShortId(delivery.id)}
          </Typography>
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "block truncate text-xs",
              isDarkMode ? "!text-slate-400" : "!text-slate-500",
            )}
          >
            Commande créée le {formatDeliveryDate(delivery.createdAt)}
          </Typography>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Client",
      render: (delivery) => (
        <Typography
          variant="span"
          Component="span"
          weight="medium"
          className="text-sm !text-inherit"
        >
          {delivery.customerName}
        </Typography>
      ),
    },
    {
      key: "storeName",
      header: "Magasin",
      render: (delivery) => (
        <Typography
          variant="span"
          Component="span"
          weight="medium"
          className="text-sm !text-inherit"
        >
          {delivery.storeName}
        </Typography>
      ),
    },
    {
      key: "dropOffAddress",
      header: "Adresse de livraison",
      render: (delivery) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {delivery.dropOffAddress}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (delivery) => {
        const tone = getDeliveryStatusTone(delivery.status);

        return (
          <span
            className={cn(
              "inline-flex min-w-[9rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
              tone === "success"
                ? isDarkMode
                  ? "bg-emerald-950/60 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700"
                : tone === "warning"
                  ? isDarkMode
                    ? "bg-amber-950/60 text-amber-300"
                    : "bg-amber-50 text-amber-700"
                  : tone === "danger"
                    ? isDarkMode
                      ? "bg-rose-950/60 text-rose-300"
                      : "bg-rose-50 text-rose-700"
                    : isDarkMode
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600",
            )}
          >
            {formatDeliveryStatus(delivery.status)}
          </span>
        );
      },
    },
    {
      key: "statusDate",
      header: "Date du statut",
      render: (delivery) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="medium"
            className="block text-sm !text-inherit"
          >
            {formatDeliveryDate(delivery.statusDate)}
          </Typography>
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "block text-xs",
              isDarkMode ? "!text-slate-400" : "!text-slate-500",
            )}
          >
            {delivery.statusDateLabel}
          </Typography>
        </div>
      ),
    },
  ];

  return (
    <section
      className={cn(
        styles.deliveriesSection,
        isDarkMode ? styles.deliveriesSectionDark : styles.deliveriesSectionLight,
      )}
    >
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
          className={styles.sectionTitle}
        >
          Suivi des livraisons
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
              Chargement des livraisons...
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
        ) : rows.length === 0 ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
            >
              Aucune livraison n&apos;est encore disponible.
            </Typography>
          </div>
        ) : (
          <div className="lg:min-w-[92rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(delivery) => delivery.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              gridTemplateColumns="1fr 1fr 1fr 1.8fr 1fr 1fr"
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
              rowClassName={cn(
                "grid items-center gap-3 px-5 py-4 text-[1.02rem]",
                isDarkMode ? "text-slate-100" : "text-slate-800",
              )}
            />
          </div>
        )}
      </div>
    </section>
  );
}
