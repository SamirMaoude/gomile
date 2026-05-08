"use client";

import type { ReactNode } from "react";

import Button from "@/components/ui/design-system/button/button";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import DynamicTable from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import ChevronDownIcon from "@/components/ui/icons/ChevronDownIcon";
import DisableIcon from "@/components/ui/icons/DisableIcon";
import EditIcon from "@/components/ui/icons/EditIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import { cn, styles } from "../style";
import {
  formatApiKeyDate,
  getApiKeyStatus,
  type ApiKeyRow,
} from "./api-key.model";
import {
  buildStoreDetailItems,
  getApiKeyActionButtonClassName,
  getApiKeyDetailsToggleLabel,
  type StoreDetailItem,
} from "./api-keys-table.helpers";
import { useApiKeysTable } from "./use-api-keys-table";

type ApiKeysTableProps = {
  isDarkMode: boolean;
};

type StoreDetailFieldProps = {
  isDarkMode: boolean;
  label: string;
  value: ReactNode;
};

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

export default function ApiKeysTable({ isDarkMode }: ApiKeysTableProps) {
  const {
    expandedApiKeyId,
    rows,
    error,
    getStoreDetailsState,
    isCreating,
    isLoading,
    processingApiKeyId,
    handleCreateApiKey,
    handleEditApiKey,
    handleRevokeApiKey,
    handleToggleStoreDetails,
  } = useApiKeysTable();

  function renderExpandedStoreDetails(apiKey: ApiKeyRow) {
    const storeDetailsState = getStoreDetailsState(apiKey.storeId);

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
            Détails de la boutique liée à cette API key
          </Typography>
        </div>

        {storeDetailsState.isLoading ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-slate-300" : "!text-slate-600")}
          >
            Chargement des détails du magasin...
          </Typography>
        ) : storeDetailsState.error ? (
          <Typography
            variant="p"
            Component="p"
            className={cn(isDarkMode ? "!text-rose-300" : "!text-rose-600")}
          >
            {storeDetailsState.error}
          </Typography>
        ) : storeDetailsState.store ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {buildStoreDetailItems(storeDetailsState.store).map((item) => (
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

  const columns: DynamicTableColumn<ApiKeyRow>[] = [
    {
      key: "details",
      header: "Détail",
      render: (apiKey) => {
        const isExpanded = expandedApiKeyId === apiKey.id;

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
            aria-label={
              getApiKeyDetailsToggleLabel(isExpanded)
            }
            aria-expanded={isExpanded}
            className={getApiKeyActionButtonClassName(isDarkMode, "neutral")}
            onClick={() => void handleToggleStoreDetails(apiKey)}
          />
        );
      },
    },
    {
      key: "name",
      header: "Nom",
      render: (apiKey) => (
        <Typography
          variant="span"
          Component="span"
          weight="bold"
          className="block truncate text-base !text-inherit"
        >
          {apiKey.name}
        </Typography>
      ),
    },
    {
      key: "storeName",
      header: "Magasin",
      render: (apiKey) => (
        <div className="min-w-0">
          <Typography
            variant="span"
            Component="span"
            weight="medium"
            className="block truncate text-sm !text-inherit"
          >
            {apiKey.storeName}
          </Typography>
          <Typography
            variant="span"
            Component="span"
            className={cn(
              "block truncate text-xs",
              apiKey.storeDomain
                ? isDarkMode
                  ? "!text-slate-400"
                  : "!text-slate-500"
                : isDarkMode
                  ? "!text-slate-500"
                  : "!text-slate-400",
            )}
          >
            {apiKey.storeDomain || "Pas de domaine"}
          </Typography>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Création",
      render: (apiKey) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {formatApiKeyDate(apiKey.createdAt)}
        </Typography>
      ),
    },
    {
      key: "expiresAt",
      header: "Expiration",
      render: (apiKey) => (
        <Typography
          variant="span"
          Component="span"
          className="text-sm !text-inherit"
        >
          {formatApiKeyDate(apiKey.expiresAt)}
        </Typography>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (apiKey) => {
        const status = getApiKeyStatus(apiKey);

        return (
          <span
            className={cn(
              "inline-flex min-w-[7rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
              status === "ACTIVE"
                ? isDarkMode
                  ? "bg-emerald-950/60 text-emerald-300"
                  : "bg-emerald-50 text-emerald-700"
                : status === "EXPIRED"
                  ? isDarkMode
                    ? "bg-amber-950/60 text-amber-300"
                    : "bg-amber-50 text-amber-700"
                  : isDarkMode
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600",
            )}
          >
            {status === "ACTIVE"
              ? "Active"
              : status === "EXPIRED"
                ? "Expirée"
                : "Révoquée"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (apiKey) => {
        const isProcessing = processingApiKeyId === apiKey.id;
        const isRevoked = Boolean(apiKey.revokedAt);

        return (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<EditIcon className="h-4 w-4" />}
              aria-label="Modifier l'API key"
              disabled={isProcessing || isRevoked}
              className={getApiKeyActionButtonClassName(isDarkMode, "info")}
              onClick={() => void handleEditApiKey(apiKey)}
            />

            <Button
              type="button"
              variant="outline"
              size="sm"
              iconOnly
              icon={<DisableIcon className="h-4 w-4" />}
              aria-label="Révoquer l'API key"
              disabled={isProcessing || isRevoked}
              className={getApiKeyActionButtonClassName(isDarkMode, "danger")}
              onClick={() => void handleRevokeApiKey(apiKey)}
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
          Liste des API keys
        </Typography>

        <Button
          type="button"
          variant="filled"
          size="md"
          icon={<PlusIcon className="h-5 w-5" />}
          className="w-full sm:w-auto"
          disabled={isLoading || isCreating || processingApiKeyId !== null}
          onClick={() => void handleCreateApiKey()}
        >
          {isCreating ? "Création..." : "Créer une API key"}
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
              Chargement des API keys...
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
              Aucune API key n&apos;est encore créée pour ce merchant.
            </Typography>
          </div>
        ) : (
          <div className="lg:min-w-[98rem]">
            <DynamicTable
              columns={columns}
              rows={rows}
              rowKey={(apiKey) => apiKey.id}
              rowsPerPageOptions={[10, 20, 50]}
              defaultRowsPerPage={10}
              isDarkMode={isDarkMode}
              isRowExpanded={(apiKey) => expandedApiKeyId === apiKey.id}
              renderExpandedRow={(apiKey) => renderExpandedStoreDetails(apiKey)}
              expandedRowClassName="pt-0"
              gridTemplateColumns="0.7fr 1.2fr 1.35fr 1fr 1fr 0.9fr 0.95fr"
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
