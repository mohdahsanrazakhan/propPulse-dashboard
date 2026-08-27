"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import type { CommunitiesData } from "@/hooks/useCommunities";

type Row = CommunitiesData["table"][number];

export function CommunityTable({ data }: { data: Row[] }) {
  const t = useTranslations("communities.table");
  const [expanded, setExpanded] = useState<string | null>(null);

  const columns: DataTableColumn<Row>[] = [
    {
      key: "community",
      header: t("community"),
      sortValue: (r) => r.community,
      render: (r) => (
        <button
          onClick={() => setExpanded(expanded === r.community ? null : r.community)}
          className="flex items-center gap-1.5 font-medium hover:underline"
        >
          {expanded === r.community ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {r.community}
        </button>
      ),
    },
    { key: "totalDeals", header: t("totalDeals"), align: "right", sortValue: (r) => r.totalDeals, render: (r) => r.totalDeals },
    {
      key: "avgSalePrice",
      header: t("avgSalePrice"),
      align: "right",
      sortValue: (r) => r.avgSalePrice,
      render: (r) => (r.avgSalePrice > 0 ? <CurrencyDisplay value={r.avgSalePrice} compact /> : "N/A"),
    },
    {
      key: "avgRent",
      header: t("avgRent"),
      align: "right",
      sortValue: (r) => r.avgRent,
      render: (r) => (r.avgRent > 0 ? <CurrencyDisplay value={r.avgRent} compact /> : "N/A"),
    },
    { key: "activeListings", header: t("activeListings"), align: "right", sortValue: (r) => r.activeListings, render: (r) => r.activeListings },
    { key: "avgDaysToClose", header: t("avgDaysToClose"), align: "right", sortValue: (r) => r.avgDaysToClose, render: (r) => `${r.avgDaysToClose}d` },
    { key: "topAgent", header: t("topAgent"), sortValue: (r) => r.topAgent, render: (r) => r.topAgent },
    {
      key: "trend",
      header: t("trend"),
      align: "right",
      sortValue: (r) => r.trend,
      render: (r) => (
        <span className={`inline-flex items-center gap-1 font-medium ${r.trend >= 0 ? "text-success" : "text-danger"}`}>
          {r.trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {Math.abs(r.trend).toFixed(0)}%
        </span>
      ),
    },
  ];

  const row = data.find((r) => r.community === expanded);

  return (
    <div className="space-y-3">
      <DataTable columns={columns} data={data} rowKey={(r) => r.community} />
      {row && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <p className="mb-2 font-medium text-foreground">{t("dealMixTitle", { community: row.community })}</p>
          <div className="flex gap-6 text-muted-foreground">
            <span>{t("sales")}: <span className="font-medium text-foreground">{row.saleCount}</span></span>
            <span>{t("rentals")}: <span className="font-medium text-foreground">{row.rentalCount}</span></span>
            <span>{t("offPlan")}: <span className="font-medium text-foreground">{row.offPlanCount}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
