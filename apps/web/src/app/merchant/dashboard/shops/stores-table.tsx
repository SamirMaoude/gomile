"use client";

import Button from "@/components/ui/design-system/button/button";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import DeleteIcon from "@/components/ui/icons/DeleteIcon";
import DisableIcon from "@/components/ui/icons/DisableIcon";
import EditIcon from "@/components/ui/icons/EditIcon";
import EnableIcon from "@/components/ui/icons/EnableIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import { cn, styles } from "../style";
import {
  formatStoreDate,
  formatStoreProvider,
  type StoreListItem,
} from "./store.model";
import { useStoresTable, type StoreStatusFilter } from "./use-stores-table";

type StoresTableProps = {
  isDarkMode: boolean;
};

export default function StoresTable({ isDarkMode }: StoresTableProps) {
  const {
    rows,
    error,
    isCreating,
    isLoading,
    processingStoreId,
    handleCreateStore,
    handleDeleteStore,
    handleEditStore,
    handleStatusFilterChange,
    handleToggleStoreStatus,
    statusFilter,
  } = useStoresTable();

  const statusFilterOptions: Array<{
    label: string;
    value: StoreStatusFilter;
  }> = [
    { label: "Tous", value: null },
    { label: "Actifs", value: true },
    { label: "Desactives", value: false },
  ];

  function getActionButtonClassName(tone: "danger" | "info" | "success" | "warning") {
    const shared = "!h-9 !w-9 !rounded-full !p-0 !border !shadow-none";

    if (tone === "info") {
      return cn(
        shared,
        isDarkMode
          ? "!border-sky-700 !text-sky-300 hover:!bg-sky-950/60"
          : "!border-sky-200 !text-sky-700 hover:!bg-sky-50",
      );
    }

    if (tone === "danger") {
      return cn(
        shared,
        isDarkMode
          ? "!border-rose-800 !text-rose-300 hover:!bg-rose-950/50"
          : "!border-rose-200 !text-rose-700 hover:!bg-rose-50",
      );
    }

    if (tone === "success") {
      return cn(
        shared,
        isDarkMode
          ? "!border-emerald-800 !text-emerald-300 hover:!bg-emerald-950/50"
          : "!border-emerald-200 !text-emerald-700 hover:!bg-emerald-50",
      );
    }

    return cn(
      shared,
      isDarkMode
        ? "!border-amber-800 !text-amber-300 hover:!bg-amber-950/50"
        : "!border-amber-200 !text-amber-700 hover:!bg-amber-50",
    );
  }

  const columns: DynamicTableColumn<StoreListItem>[] = [
    {
      key: "store",
      header: "Magasin",
      render: (store) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="bold"
            className="block truncate text-base !text-inherit"
          >
            {store.name}
          </Typography>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (store) => (
        <Typography
          variant="span"
          Component="span"
          className={cn(
            "text-sm",
            store.description
              ? "!text-inherit"
              : isDarkMode
                ? "!text-slate-400"
                : "!text-slate-500",
          )}
        >
          {store.description || "Pas de description"}
        </Typography>
      ),
    },
    {
      key: "address",
      header: "Adresse",
      render: (store) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {store.address}
        </Typography>
      ),
    },
    {
      key: "provider",
      header: "Plateforme",
      render: (store) => (
        <Typography
          variant="span"
          Component="span"
          weight="medium"
          className="text-sm !text-inherit"
        >
          {formatStoreProvider(store.provider)}
        </Typography>
      ),
    },
    {
      key: "webhookUrl",
      header: "URL",
      render: (store) => (
        store.webhookUrl ? (
          <a
            href={store.webhookUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "block truncate text-sm underline-offset-2 hover:underline",
              isDarkMode ? "text-sky-300" : "text-sky-700",
            )}
          >
            {store.webhookUrl}
          </a>
        ) : (
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "text-sm",
              isDarkMode ? "!text-slate-400" : "!text-slate-500",
            )}
          >
            Pas de webhook
          </Typography>
        )
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (store) => (
        <span
          className={cn(
            "inline-flex min-w-[7rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
            store.isActive
              ? isDarkMode
                ? "bg-emerald-950/60 text-emerald-300"
                : "bg-emerald-50 text-emerald-700"
              : isDarkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-600",
          )}
        >
          {store.isActive ? "Actif" : "Desactive"}
        </span>
      ),
    },
    {
      key: "orders",
      header: "Commandes",
      render: (store) => (
        <Typography
          variant="span"
          Component="span"
          weight="semibold"
          className="text-sm !text-inherit"
        >
          {store._count.orders}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Creation",
      render: (store) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {formatStoreDate(store.createdAt)}
        </Typography>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (store) => {
        const isProcessing = processingStoreId === store.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={
                store.isActive
                  ? <DisableIcon className="h-4 w-4" />
                  : <EnableIcon className="h-4 w-4" />
              }
              aria-label={store.isActive ? "Desactiver la boutique" : "Reactiver la boutique"}
              disabled={isProcessing}
              className={getActionButtonClassName(store.isActive ? "warning" : "success")}
              onClick={() => void handleToggleStoreStatus(store)}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<EditIcon className="h-4 w-4" />}
              aria-label="Modifier la boutique"
              disabled={isProcessing}
              className={getActionButtonClassName("info")}
              onClick={() => void handleEditStore(store)}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<DeleteIcon className="h-4 w-4" />}
              aria-label="Supprimer la boutique"
              disabled={isProcessing}
              className={getActionButtonClassName("danger")}
              onClick={() => void handleDeleteStore(store)}
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
          Liste des magasins
        </Typography>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div
            className={cn(
              "inline-flex w-full rounded-full border p-1 sm:w-auto",
              isDarkMode
                ? "border-slate-700 bg-slate-950"
                : "border-slate-200 bg-slate-50",
            )}
          >
            {statusFilterOptions.map((option) => {
              const isSelected = statusFilter === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => handleStatusFilterChange(option.value)}
                  className={cn(
                    "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none",
                    isSelected
                      ? isDarkMode
                        ? "bg-emerald-700 text-white"
                        : "bg-[#86ba2f] text-white"
                      : isDarkMode
                        ? "text-slate-300 hover:bg-slate-800"
                        : "text-slate-600 hover:bg-white",
                  )}
                  aria-pressed={isSelected}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <Button
            type="button"
            variant="filled"
            size="md"
            icon={<PlusIcon className="h-5 w-5" />}
            className="w-full sm:w-auto"
            disabled={isCreating || processingStoreId !== null}
            onClick={() => void handleCreateStore()}
          >
            {isCreating ? "Creation..." : "Creer une boutique"}
          </Button>
        </div>
      </div>

      <div className={styles.tableOverflow}>
        {isLoading ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(
                isDarkMode ? "!text-slate-300" : "!text-slate-600",
              )}
            >
              Chargement des magasins...
            </Typography>
          </div>
        ) : error ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(
                isDarkMode ? "!text-rose-300" : "!text-rose-600",
              )}
            >
              {error}
            </Typography>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-8">
            <Typography
              variant="p"
              Component="p"
              className={cn(
                isDarkMode ? "!text-slate-300" : "!text-slate-600",
              )}
            >
              Aucun magasin n&apos;est encore associe a ce merchant.
            </Typography>
          </div>
        ) : (
          <div className="min-w-[112rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(store) => store.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              gridTemplateColumns="1.05fr 1.3fr 1.45fr 1fr 1.45fr 0.9fr 0.8fr 1fr 1.15fr"
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
