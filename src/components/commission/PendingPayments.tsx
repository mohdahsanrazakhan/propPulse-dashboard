import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn } from "@/components/shared/DataTable";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useCommissionStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { CommissionData } from "@/hooks/useCommission";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  invoiced: "bg-secondary/15 text-secondary",
  partially_paid: "bg-warning/15 text-warning",
  overdue: "bg-danger/15 text-danger",
};

export function PendingPayments({ data }: { data: CommissionData["pendingPayments"] }) {
  const t = useTranslations("commission.pendingPayments");
  const commissionStatusLabel = useCommissionStatusLabel();
  const locale = useLocale();

  const columns: DataTableColumn<CommissionData["pendingPayments"][number]>[] = [
    { key: "dealId", header: t("dealId"), sortValue: (d) => d.dealId, render: (d) => <span className="font-medium text-accent">{d.dealId}</span> },
    {
      key: "property",
      header: t("property"),
      sortValue: (d) => d.community,
      render: (d) => (
        <span className="capitalize">
          {d.community} &middot; {d.propertyType}
        </span>
      ),
    },
    { key: "client", header: t("client"), sortValue: (d) => d.clientName, render: (d) => d.clientName },
    { key: "agent", header: t("agent"), sortValue: (d) => d.agentName, render: (d) => d.agentName },
    {
      key: "commission",
      header: t("commission"),
      align: "right",
      sortValue: (d) => d.commission,
      render: (d) => <CurrencyDisplay value={d.commission} compact />,
    },
    { key: "invoice", header: t("invoiceNumber"), sortValue: (d) => d.invoiceNumber ?? "", render: (d) => d.invoiceNumber ?? "N/A" },
    {
      key: "status",
      header: t("status"),
      sortValue: (d) => d.status,
      render: (d) => (
        <Badge className={STATUS_STYLES[d.status]} variant="outline">
          {commissionStatusLabel(d.status)}
        </Badge>
      ),
    },
    {
      key: "dueDate",
      header: t("dueDate"),
      sortValue: (d) => (d.dueDate ? new Date(d.dueDate).getTime() : 0),
      render: (d) =>
        d.dueDate ? (
          <span className={cn(d.daysOverdue > 0 && "font-medium text-danger")}>
            {new Date(d.dueDate).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB")}
            {d.daysOverdue > 0 && ` ${t("daysOverdue", { count: d.daysOverdue })}`}
          </span>
        ) : (
          "N/A"
        ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data} rowKey={(d) => d._id} />
      </CardContent>
    </Card>
  );
}
