"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  MoreHorizontal,
  Phone,
  Store,
} from "lucide-react";

import AdminEntityTable from "@/components/admin/dashboard/admin-entity-table";
import Avatar from "@/components/ui/design-system/avatar";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";

import {
  getFilteredMerchants,
  getMerchantEmail,
  getMerchantId,
  getMerchantName,
  getMerchantOrdersCount,
  getMerchantPhone,
  getMerchantRegistrationDate,
  getMerchantSubscriptionLabel,
  getMerchantSubscriptionStatusLabel,
  getMerchantStatusLabel,
  getMerchantStoresCount,
  type MerchantStatusOption,
  type MerchantSubscriptionOption,
  type MerchantWithOptionalListFields,
} from "./AdminFunctions";

type MerchantsTableProps<T extends MerchantWithOptionalListFields> = {
  merchants: T[];
  error?: string | null;
  isLoading?: boolean;
};

export default function MerchantsTable<T extends MerchantWithOptionalListFields>({
  merchants,
  error = null,
  isLoading = false,
}: MerchantsTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MerchantStatusOption>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<MerchantSubscriptionOption>("all");

  const filteredMerchants = useMemo(() => {
    return getFilteredMerchants(merchants, {
      searchQuery,
      statusFilter,
      subscriptionFilter,
    });
  }, [merchants, searchQuery, statusFilter, subscriptionFilter]);

  const columns: DynamicTableColumn<T>[] = [
    {
      key: "merchant",
      header: "Commerçant",
      cellClassName: "admin-data-table-identity-cell",
      render: (merchant) => {
        const name = getMerchantName(merchant);

        return (
          <>
            <Avatar name={name} size="sm" />
            <div className="admin-data-table-identity-text">
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="admin-data-table-identity-name"
              >
                {name}
              </Typography>
              <Typography
                variant="span"
                Component="span"
                className="admin-data-table-identity-meta"
              >
                Inscrit le {getMerchantRegistrationDate(merchant)}
              </Typography>
            </div>
          </>
        );
      },
    },
    {
      key: "contact",
      header: "Contact",
      render: (merchant) => (
        <div className="admin-data-table-stack">
          <span className="admin-data-table-icon-text">
            <Mail className="admin-data-table-cell-icon" />
            {getMerchantEmail(merchant)}
          </span>
          <span className="admin-data-table-icon-text">
            <Phone className="admin-data-table-cell-icon" />
            {getMerchantPhone(merchant)}
          </span>
        </div>
      ),
    },
    {
      key: "subscription",
      header: "Abonnement",
      render: (merchant) => (
        <span className="admin-data-table-primary-cell">
          {getMerchantSubscriptionLabel(merchant)}
        </span>
      ),
    },
    {
      key: "stores",
      header: "Boutiques",
      render: (merchant) => (
        <span className="admin-data-table-icon-text">
          <Store className="admin-data-table-cell-icon" />
          {getMerchantStoresCount(merchant)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (merchant) => (
        <div className="admin-data-table-stack">
          <span className="admin-data-table-status-text">
            {getMerchantStatusLabel(merchant)}
          </span>
          <span className="admin-data-table-identity-meta">
            {getMerchantSubscriptionStatusLabel(merchant)}
          </span>
        </div>
      ),
    },
    {
      key: "orders",
      header: "Commandes",
      render: (merchant) => (
        <span className="admin-data-table-metric">
          {getMerchantOrdersCount(merchant)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "admin-data-table-actions-header",
      cellClassName: "admin-data-table-actions-cell",
      render: () => (
        <button type="button" className="admin-data-table-icon-button" aria-label="Actions commerçant">
          <MoreHorizontal className="admin-data-table-action-icon" />
        </button>
      ),
    },
  ];

  return (
    <AdminEntityTable
      title="Liste des commerçants"
      rows={filteredMerchants}
      columns={columns}
      rowKey={(merchant, rowIndex) => getMerchantId(merchant) || rowIndex}
      gridTemplateColumns="1.7fr 2fr 1fr 0.8fr 0.9fr 0.8fr 0.6fr"
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchAriaLabel="Rechercher un commerçant"
      error={error}
      isLoading={isLoading}
      loadingMessage="Chargement des commerçants..."
      emptyMessage="Aucun commerçant ne correspond aux filtres."
      minWidthClassName="admin-data-table-min-compact"
      filters={
        <>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as MerchantStatusOption)}
            className="admin-data-table-select"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="locked">Bloques</option>
          </select>

          <select
            value={subscriptionFilter}
            onChange={(event) => setSubscriptionFilter(event.target.value as MerchantSubscriptionOption)}
            className="admin-data-table-select"
            aria-label="Filtrer par abonnement"
          >
            <option value="all">Tous les abonnements</option>
            <option value="FREE">Gratuit</option>
            <option value="STARTER">Starter</option>
            <option value="PRO">Pro</option>
          </select>
        </>
      }
    />
  );
}
