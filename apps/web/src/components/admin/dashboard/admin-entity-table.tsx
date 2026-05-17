"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";

import Input from "@/components/ui/design-system/input/input";
import DynamicTable, {
  type DynamicTableColumn,
} from "@/components/ui/design-system/table/dynamic-table";

import AdminDataTableCard from "./TableCard";

type AdminEntityTableProps<T> = {
  title: string;
  rows: T[];
  columns: DynamicTableColumn<T>[];
  rowKey: (row: T, rowIndex: number) => string | number;
  gridTemplateColumns: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel: string;
  filters?: ReactNode;
  feedback?: ReactNode;
  error?: string | null;
  isLoading?: boolean;
  loadingMessage: string;
  emptyMessage: string;
  minWidthClassName?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
};

export default function AdminEntityTable<T>({
  title,
  rows,
  columns,
  rowKey,
  gridTemplateColumns,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = "Rechercher...",
  searchAriaLabel,
  filters,
  feedback,
  error = null,
  isLoading = false,
  loadingMessage,
  emptyMessage,
  minWidthClassName,
  rowsPerPageOptions = [5, 10, 20],
  defaultRowsPerPage = 10,
}: AdminEntityTableProps<T>) {
  return (
    <AdminDataTableCard
      title={title}
      count={rows.length}
      error={error}
      isEmpty={rows.length === 0}
      isLoading={isLoading}
      loadingMessage={loadingMessage}
      emptyMessage={emptyMessage}
      minWidthClassName={minWidthClassName}
      controls={
        <>
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            leftIcon={<Search className="admin-data-table-search-icon" />}
            containerClassName="admin-data-table-search-container"
            inputWrapperClassName="admin-data-table-search-wrapper"
          />
          {filters}
          {feedback}
        </>
      }
    >
      <DynamicTable
        columns={columns}
        rows={rows}
        rowKey={rowKey}
        gridTemplateColumns={gridTemplateColumns}
        headerRowClassName="admin-data-table-head"
        bodyClassName="admin-data-table-body"
        rowClassName="admin-data-table-row"
        rowsPerPageOptions={rowsPerPageOptions}
        defaultRowsPerPage={defaultRowsPerPage}
      />
    </AdminDataTableCard>
  );
}
