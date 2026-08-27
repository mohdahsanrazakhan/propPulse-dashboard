import { Building2, Home, Store, Warehouse } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { cn } from "@/lib/utils";
import type { PipelineDeal } from "@/hooks/usePipeline";

const TYPE_ICON: Record<string, typeof Home> = {
  apartment: Building2,
  villa: Home,
  townhouse: Home,
  penthouse: Building2,
  office: Warehouse,
  retail: Store,
  land: Warehouse,
};

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function DealCard({ deal, onClick }: { deal: PipelineDeal; onClick: () => void }) {
  const Icon = TYPE_ICON[deal.property.type] ?? Home;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="truncate">{deal.property.community}</span>
      </div>
      <p className="mb-1 truncate text-sm font-medium text-foreground">{deal.clientName}</p>
      <CurrencyDisplay value={deal.transactionValue} compact className="text-sm font-semibold text-accent" />
      <div className="mt-2 flex items-center justify-between">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-muted text-[10px] font-medium">
            {deal.agent ? initials(deal.agent.name) : "N/A"}
          </AvatarFallback>
        </Avatar>
        <span className={cn("text-xs tabular-nums font-medium", deal.daysInStage > 14 ? "text-danger" : "text-muted-foreground")}>
          {deal.daysInStage}d
        </span>
      </div>
    </button>
  );
}
