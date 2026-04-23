"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import Typography from "@/components/ui/design-system/typography";

export type DynamicTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

type DynamicTableProps<T> = {
  columns: DynamicTableColumn<T>[];
  rows: T[];
  gridTemplateColumns: string;
  headerRowClassName: string;
  bodyClassName: string;
  rowClassName: string;
  rowKey?: (row: T, rowIndex: number) => string | number;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  isDarkMode?: boolean;
  isRowExpanded?: (row: T, rowIndex: number) => boolean;
  renderExpandedRow?: (row: T, rowIndex: number) => ReactNode;
  expandedRowClassName?: string;
};

export default function DynamicTable<T>({
  columns,
  rows,
  gridTemplateColumns,
  headerRowClassName,
  bodyClassName,
  rowClassName,
  rowKey,
  rowsPerPageOptions,
  defaultRowsPerPage,
  isDarkMode = false,
  isRowExpanded,
  renderExpandedRow,
  expandedRowClassName,
}: DynamicTableProps<T>) {
  const hasPagination = Boolean(rowsPerPageOptions?.length);
  const availableRowsPerPage = rowsPerPageOptions ?? [];
  const initialRowsPerPage = hasPagination
    ? (
      availableRowsPerPage.includes(defaultRowsPerPage ?? -1)
        ? defaultRowsPerPage
        : availableRowsPerPage[0]
    ) ?? 10
    : rows.length || 1;
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  // The component keeps pagination local so each screen can reuse the same
  // table without duplicating paging state in every page component.
  const totalPages = hasPagination
    ? Math.max(1, Math.ceil(rows.length / rowsPerPage))
    : 1;
  const currentPageInRange = hasPagination
    ? Math.min(currentPage, totalPages)
    : 1;
  const paginatedRows = hasPagination
    ? rows.slice(
      (currentPageInRange - 1) * rowsPerPage,
      currentPageInRange * rowsPerPage,
    )
    : rows;

  function handleRowsPerPageChange(value: string) {
    const nextRowsPerPage = Number.parseInt(value, 10);

    if (!Number.isFinite(nextRowsPerPage)) {
      return;
    }

    setRowsPerPage(nextRowsPerPage);
    setCurrentPage(1);
  }

  return (
    <>
      <div
        className={headerRowClassName}
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => (
          <div key={column.key} className={column.headerClassName}>
            {typeof column.header === "string" ? (
              <Typography
                variant="span"
                Component="span"
                weight="semibold"
                className="!text-inherit"
              >
                {column.header}
              </Typography>
            ) : (
              column.header
            )}
          </div>
        ))}
      </div>

      <div className={bodyClassName}>
        {paginatedRows.map((row, rowIndex) => {
          const absoluteRowIndex = hasPagination
            ? ((currentPageInRange - 1) * rowsPerPage) + rowIndex
            : rowIndex;
          const currentRowKey = rowKey
            ? rowKey(row, absoluteRowIndex)
            : absoluteRowIndex;
          const isExpanded = renderExpandedRow
            ? isRowExpanded?.(row, absoluteRowIndex) ?? false
            : false;

          return (
            <div key={currentRowKey}>
              <div
                className={rowClassName}
                style={{ gridTemplateColumns }}
              >
                {columns.map((column) => (
                  <div key={column.key} className={column.cellClassName}>
                    {column.render(row)}
                  </div>
                ))}
              </div>

              {isExpanded && renderExpandedRow ? (
                <div className={expandedRowClassName}>
                  {renderExpandedRow(row, absoluteRowIndex)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {hasPagination ? (
        <div
          className={[
            "flex flex-col gap-3 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
            isDarkMode ? "border-slate-800" : "border-slate-200",
          ].join(" ")}
        >
          <div className="flex items-center gap-3">
            <Typography
              variant="span"
              Component="span"
              className={isDarkMode ? "!text-slate-300" : "!text-slate-600"}
            >
              Lignes par page
            </Typography>

            <select
              value={rowsPerPage}
              onChange={(event) => handleRowsPerPageChange(event.target.value)}
              className={[
                "rounded-xl border px-3 py-2 text-sm outline-none transition",
                isDarkMode
                  ? "border-slate-700 bg-slate-900 text-slate-100"
                  : "border-slate-200 bg-white text-slate-700",
              ].join(" ")}
            >
              {availableRowsPerPage.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Typography
              variant="span"
              Component="span"
              className={isDarkMode ? "!text-slate-300" : "!text-slate-600"}
            >
              Page {currentPageInRange} / {totalPages}
            </Typography>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
              disabled={currentPageInRange === 1}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                isDarkMode
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              Precedent
            </button>

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
              disabled={currentPageInRange === totalPages}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                isDarkMode
                  ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              Suivant
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
