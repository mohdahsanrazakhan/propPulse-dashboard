"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/hooks/useDashboard";

const RANK_STYLES = [
  "border-gold/40 bg-gold/5",
  "border-silver/40 bg-silver/5",
  "border-bronze/40 bg-bronze/5",
];
const RANK_TEXT = ["text-gold", "text-silver", "text-bronze"];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function TopAgentsLeaderboard({ agents }: { agents: DashboardData["topAgents"] }) {
  const t = useTranslations("dashboard.topAgents");

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Trophy className="h-4 w-4 text-gold" />
      </CardHeader>
      <CardContent className="space-y-1.5">
        {agents.slice(0, 5).map((agent, i) => (
          <Link
            key={agent._id}
            href={`/agents/${agent._id}`}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors hover:bg-muted/60",
              i < 3 && RANK_STYLES[i]
            )}
          >
            <span
              className={cn(
                "w-5 shrink-0 text-center text-sm font-bold tabular-nums",
                i < 3 ? RANK_TEXT[i] : "text-muted-foreground"
              )}
            >
              {i + 1}
            </span>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-accent/15 text-xs font-semibold text-accent">
                {initials(agent.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
              <p className="text-xs text-muted-foreground">
                {t("dealsAndConversion", {
                  deals: agent.dealsCount,
                  conversion: agent.conversionRate.toFixed(0),
                })}
              </p>
            </div>
            <CurrencyDisplay value={agent.commissionEarned} compact bold className="shrink-0 text-sm" />
          </Link>
        ))}
        <Link
          href="/agents"
          className="block pt-1 text-center text-xs font-medium text-accent hover:underline"
        >
          {t("viewAll")}
        </Link>
      </CardContent>
    </Card>
  );
}
