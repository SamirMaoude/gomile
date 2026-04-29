"use client";

import { useMemo, useState } from "react";
import {
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Store,
} from "lucide-react";

import Avatar from "@/components/ui/design-system/avatar";
import Input from "@/components/ui/design-system/input/input";
import DynamicTable, {
  type DynamicTableColumn,
} from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";

import {
  getFilteredMerchants,
  getMerchantEmail,
  getMerchantId,
  getMerchantName,
  getMerchantOrdersCount,
  getMerchantPhone,
  getMerchantProvider,
  getMerchantRegistrationDate,
  getMerchantStatusLabel,
  getMerchantStoresCount,
  type MerchantProviderOption,
  type MerchantStatusOption,
  type MerchantWithOptionalListFields,
} from "./AdminFunctions";
import "./MerchantsTable.css";

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
  const [providerFilter, setProviderFilter] = useState<MerchantProviderOption>("all");

  const filteredMerchants = useMemo(() => {
    return getFilteredMerchants(merchants, {
      searchQuery,
      statusFilter,
      providerFilter,
    });
  }, [merchants, providerFilter, searchQuery, statusFilter]);

  const columns: DynamicTableColumn<T>[] = [
    {
      key: "merchant",
      header: "Merchant",
      cellClassName: "admin-merchants-merchant-cell",
      render: (merchant) => {
        const name = getMerchantName(merchant);

        return (
          <>
            <Avatar name={name} size="sm" />
            <div className="admin-merchants-merchant-text">
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="admin-merchants-merchant-name"
              >
                {name}
              </Typography>
              <Typography
                variant="span"
                Component="span"
                className="admin-merchants-merchant-meta"
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
        <div className="admin-merchants-stack">
          <span className="admin-merchants-icon-text">
            <Mail className="admin-merchants-cell-icon" />
            {getMerchantEmail(merchant)}
          </span>
          <span className="admin-merchants-icon-text">
            <Phone className="admin-merchants-cell-icon" />
            {getMerchantPhone(merchant)}
          </span>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Provider",
      render: (merchant) => (
        <span className="admin-merchants-primary-cell">
          {getMerchantProvider(merchant)}
        </span>
      ),
    },
    {
      key: "stores",
      header: "Boutiques",
      render: (merchant) => (
        <span className="admin-merchants-icon-text">
          <Store className="admin-merchants-cell-icon" />
          {getMerchantStoresCount(merchant)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (merchant) => (
        <span className="admin-merchants-status-text">
          {getMerchantStatusLabel(merchant)}
        </span>
      ),
    },
    {
      key: "orders",
      header: "Commandes",
      render: (merchant) => (
        <span className="admin-merchants-metric">
          {getMerchantOrdersCount(merchant)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "admin-merchants-actions-header",
      cellClassName: "admin-merchants-actions-cell",
      render: () => (
        <button type="button" className="admin-merchants-action-button" aria-label="Actions merchant">
          <MoreHorizontal className="admin-merchants-action-icon" />
        </button>
      ),
    },
  ];

  return (
    <section className="admin-merchants-card">
      <div className="admin-merchants-toolbar">
        <div className="admin-merchants-title-block">
          <Typography variant="h3" Component="h3" className="admin-merchants-title">
            Liste des merchants
          </Typography>
          <Typography variant="span" Component="span" className="admin-merchants-count">
            ({filteredMerchants.length})
          </Typography>
        </div>

        <div className="admin-merchants-controls">
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Rechercher..."
            aria-label="Rechercher un merchant"
            leftIcon={<Search className="admin-merchants-search-icon" />}
            containerClassName="admin-merchants-search-container"
            inputWrapperClassName="admin-merchants-search-wrapper"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as MerchantStatusOption)}
            className="admin-merchants-select"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="locked">Bloques</option>
          </select>

          <select
            value={providerFilter}
            onChange={(event) => setProviderFilter(event.target.value as MerchantProviderOption)}
            className="admin-merchants-select"
            aria-label="Filtrer par provider"
          >
            <option value="all">Tous les providers</option>
            <option value="WOOCOMMERCE">WooCommerce</option>
            <option value="SHOPIFY">Shopify</option>
            <option value="OTHER">Autres</option>
            <option value="unknown">Non renseignes</option>
          </select>
        </div>
      </div>

      <div className="admin-merchants-table-overflow">
        {isLoading ? (
          <p className="admin-merchants-feedback">Chargement des merchants...</p>
        ) : error ? (
          <p className="admin-merchants-error">{error}</p>
        ) : filteredMerchants.length === 0 ? (
          <p className="admin-merchants-feedback">Aucun merchant ne correspond aux filtres.</p>
        ) : (
          <div className="admin-merchants-table-min">
            <DynamicTable
              columns={columns}
              rows={filteredMerchants}
              rowKey={(merchant, rowIndex) => getMerchantId(merchant) || rowIndex}
              gridTemplateColumns="1.7fr 2fr 1fr 0.8fr 0.9fr 0.8fr 0.6fr"
              headerRowClassName="admin-merchants-table-head"
              bodyClassName="admin-merchants-table-body"
              rowClassName="admin-merchants-table-row"
              rowsPerPageOptions={[5, 10, 20]}
              defaultRowsPerPage={10}
            />
          </div>
        )}
      </div>
    </section>
  );
}
