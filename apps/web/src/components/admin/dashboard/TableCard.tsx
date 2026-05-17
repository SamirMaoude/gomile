"use client";

import type { ReactNode } from "react";

import Typography from "@/components/ui/design-system/typography";

import "./TableCard.css";

type AdminDataTableCardProps = {
  title: string;
  count: number;
  controls: ReactNode;
  children: ReactNode;
  error?: string | null;
  isEmpty: boolean;
  isLoading?: boolean;
  loadingMessage: string;
  emptyMessage: string;
  minWidthClassName?: string;
};

export default function AdminDataTableCard({
  title,
  count,
  controls,
  children,
  error = null,
  isEmpty,
  isLoading = false,
  loadingMessage,
  emptyMessage,
  minWidthClassName = "admin-data-table-min",
}: AdminDataTableCardProps) {
  return (
    <section className="admin-data-table-card">
      <div className="admin-data-table-toolbar">
        <div className="admin-data-table-title-block">
          <Typography variant="h3" Component="h3" className="admin-data-table-title">
            {title}
          </Typography>
          <Typography variant="span" Component="span" className="admin-data-table-count">
            ({count})
          </Typography>
        </div>

        <div className="admin-data-table-controls">{controls}</div>
      </div>

      <div className="admin-data-table-overflow">
        {isLoading ? (
          <p className="admin-data-table-feedback">{loadingMessage}</p>
        ) : error ? (
          <p className="admin-data-table-error">{error}</p>
        ) : isEmpty ? (
          <p className="admin-data-table-feedback">{emptyMessage}</p>
        ) : (
          <div className={minWidthClassName}>{children}</div>
        )}
      </div>
    </section>
  );
}
