"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyLabel,
  onRowClick,
  rowKey,
}: {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyLabel?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string;
}) {
  const t = useTranslations("table");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const col = columns.find((c) => c.key === sortKey);
    if (!col?.sortValue) return data;
    const copy = [...data];
    copy.sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortDir, columns]);

  function toggleSort(key: string) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
    } else {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    }
  }

  if (data.length === 0) {
    return <EmptyState title={emptyLabel ?? t("noRecordsFound")} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                  col.sortValue && "cursor-pointer select-none"
                )}
                onClick={() => col.sortValue && toggleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortValue &&
                    (sortKey === col.key ? (
                      sortDir === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    ))}
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow
              key={rowKey(row)}
              className={cn(onRowClick && "cursor-pointer")}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
