"use client";

import Button from "@/components/ui/design-system/button/button";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import DisableIcon from "@/components/ui/icons/DisableIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import { cn, styles } from "../style";
import {
  formatOrderDate,
  formatOrderShortId,
  formatOrderStatus,
  getOrderStatusTone,
  isOrderCancellable,
  type OrderRow,
} from "./order.model";
import { getOrderActionButtonClassName } from "./orders-table.helpers";
import { useOrdersTable } from "./use-orders-table";

type OrdersTableProps = {
  isDarkMode: boolean;
};

export default function OrdersTable({ isDarkMode }: OrdersTableProps) {
  const {
    rows,
    error,
    isCreating,
    isLoading,
    processingOrderId,
    handleCancelOrder,
    handleCreateOrder,
  } = useOrdersTable();

  const columns: DynamicTableColumn<OrderRow>[] = [
    {
      key: "id",
      header: "Commande",
      render: (order) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="bold"
            className="block truncate text-base !text-inherit"
          >
            {formatOrderShortId(order.id)}
          </Typography>
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "block truncate text-xs",
              isDarkMode ? "!text-slate-400" : "!text-slate-500",
            )}
          >
            Creee le {formatOrderDate(order.createdAt)}
          </Typography>
        </div>
      ),
    },
    {
      key: "customerName",
      header: "Client",
      render: (order) => (
        <Typography
          variant="span"
          Component="span"
          weight="medium"
          className="text-sm !text-inherit"
        >
          {order.customerName}
        </Typography>
      ),
    },
    {
      key: "store",
      header: "Magasin",
      render: (order) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="medium"
            className="block truncate text-sm !text-inherit"
          >
            {order.storeName}
          </Typography>
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "block truncate text-xs",
              order.storeDomain
                ? isDarkMode
                  ? "!text-slate-400"
                  : "!text-slate-500"
                : isDarkMode
                  ? "!text-slate-500"
                  : "!text-slate-400",
            )}
          >
            {order.storeDomain || "Pas de domaine"}
          </Typography>
        </div>
      ),
    },
    {
      key: "dropOffAddress",
      header: "Adresse de livraison",
      render: (order) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {order.dropOffAddress}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (order) => {
        const tone = getOrderStatusTone(order.status);

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
                  : isDarkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600",
            )}
          >
            {formatOrderStatus(order.status)}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => {
        const isProcessing = processingOrderId === order.id;
        const canCancel = isOrderCancellable(order.status);

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<DisableIcon className="h-4 w-4" />}
              aria-label="Annuler la commande"
              title={canCancel ? "Annuler la commande" : "Cette commande ne peut plus etre annulee"}
              disabled={isProcessing || !canCancel}
              className={getOrderActionButtonClassName(isDarkMode, "danger")}
              onClick={() => void handleCancelOrder(order)}
            />
          </div>
        );
      },
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
          "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
          isDarkMode ? styles.deliveriesHeaderDark : styles.deliveriesHeaderLight,
        )}
      >
        <Typography
          variant="h3"
          Component="h3"
          theme={isDarkMode ? "white" : "heading"}
          className={styles.sectionTitle}
        >
          Liste des commandes
        </Typography>

        <Button
          type="button"
          variant="filled"
          size="md"
          icon={<PlusIcon className="h-5 w-5" />}
          className="w-full sm:w-auto"
          disabled={isLoading || isCreating || processingOrderId !== null}
          onClick={() => void handleCreateOrder()}
        >
          {isCreating ? "Creation..." : "Ajouter une commande"}
        </Button>
      </div>

      <div className={styles.tableOverflow}>
        {isLoading ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
            >
              Chargement des commandes...
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
              Aucune commande n&apos;est encore disponible pour ce merchant.
            </Typography>
          </div>
        ) : (
          <div className="min-w-[92rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(order) => order.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              gridTemplateColumns="1fr 1fr 1.1fr 1.8fr 1fr 0.7fr"
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
