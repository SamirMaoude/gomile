"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/design-system/button/button";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";
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
import {
  buildOrderDetailItems,
  getOrderActionButtonClassName,
} from "./orders-table.helpers";
import { useOrdersTable } from "./use-orders-table";

type OrdersTableProps = {
  isDarkMode: boolean;
};

type OrderDetailFieldProps = {
  isDarkMode: boolean;
  label: string;
  value: ReactNode;
};

function OrderDetailField({
  isDarkMode,
  label,
  value,
}: OrderDetailFieldProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        isDarkMode
          ? "border-slate-800 bg-slate-950/40"
          : "border-slate-200 bg-slate-50/80",
      )}
    >
      <Typography
        variant="span"
        Component="span"
        className={cn(
          "mb-2 block text-xs font-semibold uppercase tracking-[0.08em]",
          isDarkMode ? "!text-slate-400" : "!text-slate-500",
        )}
      >
        {label}
      </Typography>

      <div className={cn("break-words", isDarkMode ? "text-slate-100" : "text-slate-800")}>
        {value}
      </div>
    </div>
  );
}

export default function OrdersTable({ isDarkMode }: OrdersTableProps) {
  const {
    expandedOrderId,
    rows,
    error,
    getOrderDetailsState,
    isCreating,
    isLoading,
    processingOrderId,
    handleCancelOrder,
    handleCreateOrder,
    handleToggleOrderDetails,
  } = useOrdersTable();

  function renderExpandedOrderDetails(order: OrderRow) {
    const orderDetailsState = getOrderDetailsState(order.id);

    return (
      <div
        className={cn(
          "mx-5 mb-5 rounded-[1.4rem] border p-5",
          isDarkMode
            ? "border-slate-800 bg-slate-900/70"
            : "border-slate-200 bg-slate-50/90",
        )}
      >
        <div className="mb-4 flex flex-col gap-1">
          <Typography
            variant="h4"
            Component="h4"
            theme={isDarkMode ? "white" : "heading"}
            className="text-lg font-bold"
          >
            Détails de la commande
          </Typography>
        </div>

        {orderDetailsState.isLoading ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Chargement des détails de la commande...
          </Typography>
        ) : orderDetailsState.error ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-rose-300" : "!text-rose-600")}
          >
            {orderDetailsState.error}
          </Typography>
        ) : orderDetailsState.order ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {buildOrderDetailItems(orderDetailsState.order, order).map((item) => (
              <OrderDetailField
                key={item.key}
                isDarkMode={isDarkMode}
                label={item.label}
                value={
                  <Typography variant="span" Component="span">
                    {item.value}
                  </Typography>
                }
              />
            ))}
          </div>
        ) : (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Aucun détail supplémentaire n&apos;est disponible pour cette commande.
          </Typography>
        )}
      </div>
    );
  }

  const columns: DynamicTableColumn<OrderRow>[] = [
    {
      key: "details",
      header: "Détail",
      render: (order) => {
        const isExpanded = expandedOrderId === order.id;

        return (
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconOnly
            icon={
              <ChevronDownIcon
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded ? "rotate-180" : "",
                )}
              />
            }
            aria-label={isExpanded ? "Masquer les détails de la commande" : "Afficher les détails de la commande"}
            aria-expanded={isExpanded}
            className={getOrderActionButtonClassName(isDarkMode, "neutral")}
            onClick={() => void handleToggleOrderDetails(order)}
          />
        );
      },
    },
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
            Créée le {formatOrderDate(order.createdAt)}
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
              title={canCancel ? "Annuler la commande" : "Cette commande ne peut plus être annulée"}
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
          {isCreating ? "Création..." : "Ajouter une commande"}
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
          <div className="lg:min-w-[92rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(order) => order.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              isRowExpanded={(order) => expandedOrderId === order.id}
              renderExpandedRow={(order) => renderExpandedOrderDetails(order)}
              expandedRowClassName="pt-0"
              gridTemplateColumns="0.7fr 1fr 1fr 1.1fr 1.8fr 1fr 0.7fr"
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
