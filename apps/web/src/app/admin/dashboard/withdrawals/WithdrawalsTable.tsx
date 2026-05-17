"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Mail, X } from "lucide-react";

import AdminEntityTable from "@/components/admin/dashboard/admin-entity-table";
import type { DynamicTableColumn } from "@/components/ui/design-system/table/dynamic-table";
import Typography from "@/components/ui/design-system/typography";
import {
  getWithdrawals,
  updateWithdrawal,
  type AdminWithdrawalItem,
  type WithdrawalStatus,
} from "@/lib/api-admin";

type WithdrawalStatusFilter = "all" | WithdrawalStatus;

const withdrawalStatusLabels: Record<WithdrawalStatus, string> = {
  PENDING: "En attente",
  COMPLETED: "Acceptee",
  CANCELLED: "Refusee",
};

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getWithdrawalDriverName(withdrawal: AdminWithdrawalItem) {
  const driver = withdrawal.wallet?.driver;

  return driver ? `${driver.firstName} ${driver.lastName}`.trim() : "Livreur inconnu";
}

function getWithdrawalDriverEmail(withdrawal: AdminWithdrawalItem) {
  return withdrawal.wallet?.driver?.user.email ?? "Email indisponible";
}

export default function WithdrawalsTable() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatusFilter>("PENDING");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState<string | null>(null);

  const loadWithdrawals = useCallback(() => {
    setIsLoading(true);
    setError(null);

    getWithdrawals()
      .then(setWithdrawals)
      .catch((fetchError: unknown) => {
        setError(fetchError instanceof Error ? fetchError.message : "Erreur");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadWithdrawals();
  }, [loadWithdrawals]);

  const filteredWithdrawals = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    return withdrawals.filter((withdrawal) => {
      const searchableText = [
        getWithdrawalDriverName(withdrawal),
        getWithdrawalDriverEmail(withdrawal),
        withdrawalStatusLabels[withdrawal.status],
        formatAmount(withdrawal.amount),
      ].join(" ").toLowerCase();

      return (
        (statusFilter === "all" || withdrawal.status === statusFilter) &&
        (!normalizedSearch || searchableText.includes(normalizedSearch))
      );
    });
  }, [searchQuery, statusFilter, withdrawals]);

  async function handleWithdrawalUpdate(
    withdrawal: AdminWithdrawalItem,
    status: Extract<WithdrawalStatus, "COMPLETED" | "CANCELLED">,
  ) {
    setUpdatingWithdrawalId(withdrawal.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await updateWithdrawal(withdrawal.id, { status });

      setWithdrawals((currentWithdrawals) =>
        currentWithdrawals.map((currentWithdrawal) =>
          currentWithdrawal.id === withdrawal.id ? { ...currentWithdrawal, status }: currentWithdrawal,
        ),
      );
      setSuccessMessage(response.message);
    } catch (updateError: unknown) {
      setError(updateError instanceof Error ? updateError.message : "Erreur");
    } finally {
      setUpdatingWithdrawalId(null);
    }
  }

  const columns: DynamicTableColumn<AdminWithdrawalItem>[] = [
    {
      key: "driver",
      header: "Livreur",
      render: (withdrawal) => (
        <div className="admin-data-table-stack">
          <Typography
            variant="span"
            Component="span"
            weight="semibold"
            className="admin-data-table-identity-name"
          >
            {getWithdrawalDriverName(withdrawal)}
          </Typography>
          <span className="admin-data-table-icon-text">
            <Mail className="admin-data-table-cell-icon" />
            {getWithdrawalDriverEmail(withdrawal)}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Solde",
      render: (withdrawal) => (
        <span className="admin-data-table-metric">
          {formatAmount(withdrawal.amount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (withdrawal) => (
        <span className="admin-data-table-status-text">
          {withdrawalStatusLabels[withdrawal.status]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Demande",
      render: (withdrawal) => (
        <span className="admin-data-table-primary-cell">
          {formatDate(withdrawal.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "admin-data-table-actions-header",
      cellClassName: "admin-data-table-actions-cell",
      render: (withdrawal) => {
        const isPending = withdrawal.status === "PENDING";
        const isUpdating = updatingWithdrawalId === withdrawal.id;

        return (
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="admin-data-table-details-button border-emerald-200 !text-emerald-700 hover:!bg-emerald-50"
              disabled={!isPending || isUpdating}
              onClick={() => handleWithdrawalUpdate(withdrawal, "COMPLETED")}
            >
              <Check className="admin-data-table-details-icon" />
              Accepter
            </button>
            <button
              type="button"
              className="admin-data-table-details-button border-rose-200 !text-rose-700 hover:!bg-rose-50"
              disabled={!isPending || isUpdating}
              onClick={() => handleWithdrawalUpdate(withdrawal, "CANCELLED")}
            >
              <X className="admin-data-table-details-icon" />
              Refuser
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AdminEntityTable
      title="Demandes de retrait"
      rows={filteredWithdrawals}
      columns={columns}
      rowKey={(withdrawal) => withdrawal.id}
      gridTemplateColumns="1.8fr 0.9fr 1fr 1.2fr 1.4fr"
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchAriaLabel="Rechercher une demande de retrait"
      error={error}
      isLoading={isLoading}
      loadingMessage="Chargement des demandes de retrait..."
      emptyMessage="Aucune demande de retrait ne correspond aux filtres."
      minWidthClassName="admin-data-table-min-compact"
      filters={
        <>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as WithdrawalStatusFilter)
            }
            className="admin-data-table-select"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="COMPLETED">Acceptees</option>
            <option value="CANCELLED">Refusees</option>
          </select>
        </>
      }
      feedback={
        successMessage ? (
          <Typography
            variant="span"
            Component="span"
            weight="semibold"
            className="!text-sm !text-emerald-700"
          >
            {successMessage}
          </Typography>
        ) : null
      }
    />
  );
}
