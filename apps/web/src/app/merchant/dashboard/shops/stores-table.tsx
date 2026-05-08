"use client";

import { useState, type ReactNode } from "react";

import Button from "@/components/ui/design-system/button/button";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";
import DeleteIcon from "@/components/ui/icons/DeleteIcon";
import DisableIcon from "@/components/ui/icons/DisableIcon";
import EditIcon from "@/components/ui/icons/EditIcon";
import EnableIcon from "@/components/ui/icons/EnableIcon";
import KeyIcon from "@/components/ui/icons/KeyIcon";
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

type StoreDetailItem =
  | {
      key: string;
      label: string;
      type: "link";
      value: string;
    }
  | {
      key: string;
      label: string;
      type: "text";
      value: string;
    };

type StoreDetailFieldProps = {
  isDarkMode: boolean;
  label: string;
  value: ReactNode;
};

function hasValue(value: string | number | boolean | null | undefined) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function buildStoreDetailItems(store: StoreListItem): StoreDetailItem[] {
  const maybeItems: Array<StoreDetailItem | null> = [
    hasValue(store.address)
      ? {
          key: "address",
          label: "Adresse",
          type: "text",
          value: store.address,
        }
      : null,
    hasValue(store.description)
      ? {
          key: "description",
          label: "Description",
          type: "text",
          value: store.description as string,
        }
      : null,
    hasValue(store.domain)
      ? {
          key: "domain",
          label: "Domaine",
          type: "text",
          value: store.domain as string,
        }
      : null,
    hasValue(store.webhookUrl)
      ? {
          key: "webhook",
          label: "URL webhook",
          type: "link",
          value: store.webhookUrl as string,
        }
      : null,
    hasValue(store.latitude) && hasValue(store.longitude)
      ? {
          key: "coordinates",
          label: "Coordonnées",
          type: "text",
          value: `${store.latitude}, ${store.longitude}`,
        }
      : null,
    {
      key: "updatedAt",
      label: "Dernière mise à jour",
      type: "text",
      value: formatStoreDate(store.updatedAt),
    },
  ];

  return maybeItems.filter((item): item is StoreDetailItem => item !== null);
}

function StoreDetailField({
  isDarkMode,
  label,
  value,
}: StoreDetailFieldProps) {
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

      <div className={cn(isDarkMode ? "text-slate-100" : "text-slate-800")}>
        {value}
      </div>
    </div>
  );
}

function renderStoreDetailValue(item: StoreDetailItem, isDarkMode: boolean) {
  if (item.type === "link") {
    return (
      <a
        href={item.value}
        target="_blank"
        rel="noreferrer"
        className={cn(
          "break-all underline underline-offset-2 hover:no-underline",
          isDarkMode ? "text-sky-300" : "text-sky-700",
        )}
      >
        {item.value}
      </a>
    );
  }

  return (
    <Typography variant="span" Component="span">
      {item.value}
    </Typography>
  );
}

export default function StoresTable({ isDarkMode }: StoresTableProps) {
  const [expandedStoreId, setExpandedStoreId] = useState<string | null>(null);
  const {
    rows,
    error,
    isCreating,
    isLoading,
    processingStoreId,
    handleCreateStore,
    handleConfigureWebhook,
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
    { label: "Désactivés", value: false },
  ];

  function getActionButtonClassName(tone: "danger" | "info" | "neutral" | "success" | "warning") {
    const shared = "!h-9 !w-9 !rounded-full !p-0 !border !shadow-none";

    if (tone === "neutral") {
      return cn(
        shared,
        isDarkMode
          ? "!border-slate-700 !text-slate-200 hover:!bg-slate-800"
          : "!border-slate-200 !text-slate-700 hover:!bg-slate-50",
      );
    }

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

  function handleToggleStoreDetails(store: StoreListItem) {
    setExpandedStoreId((currentStoreId) =>
      currentStoreId === store.id ? null : store.id,
    );
  }

  function renderExpandedStoreDetails(store: StoreListItem) {
    const details = buildStoreDetailItems(store);

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
            Détails du magasin
          </Typography>
        </div>

        {details.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {details.map((item) => (
              <StoreDetailField
                key={item.key}
                isDarkMode={isDarkMode}
                label={item.label}
                value={renderStoreDetailValue(item, isDarkMode)}
              />
            ))}
          </div>
        ) : (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Aucun détail supplémentaire n&apos;est disponible pour ce magasin.
          </Typography>
        )}
      </div>
    );
  }

  const columns: DynamicTableColumn<StoreListItem>[] = [
    {
      key: "details",
      header: "Détail",
      render: (store) => {
        const isExpanded = expandedStoreId === store.id;

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
            aria-label={isExpanded ? "Masquer les détails du magasin" : "Afficher les détails du magasin"}
            aria-expanded={isExpanded}
            className={getActionButtonClassName("neutral")}
            onClick={() => handleToggleStoreDetails(store)}
          />
        );
      },
    },
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
          {store.isActive ? "Actif" : "Désactivé"}
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
      header: "Création",
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
              icon={<KeyIcon className="h-4 w-4" />}
              aria-label={
                store.webhookUrl
                  ? "Modifier le webhook"
                  : "Ajouter un webhook"
              }
              disabled={isProcessing}
              className={getActionButtonClassName("info")}
              onClick={() => void handleConfigureWebhook(store)}
            />

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
              aria-label={store.isActive ? "Désactiver la boutique" : "Réactiver la boutique"}
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
            {isCreating ? "Création..." : "Créer une boutique"}
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
              Aucun magasin n&apos;est encore associé à ce merchant.
            </Typography>
          </div>
        ) : (
          <div className="lg:min-w-[112rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(store) => store.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              isRowExpanded={(store) => expandedStoreId === store.id}
              renderExpandedRow={(store) => renderExpandedStoreDetails(store)}
              expandedRowClassName="pt-0"
              gridTemplateColumns="0.7fr 1.35fr 1fr 0.9fr 0.8fr 1fr 1.15fr"
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
