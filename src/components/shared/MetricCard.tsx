import { Card, CardContent } from "@/components/ui/card";
import { TrendIndicator } from "./TrendIndicator";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  trend,
  invertTrendColor = false,
  icon: Icon,
  className,
}: {
  label: string;
  value: React.ReactNode;
  trend?: number;
  invertTrendColor?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Card className={cn("gap-2", className)}>
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
        {trend !== undefined && <TrendIndicator value={trend} invertColor={invertTrendColor} />}
      </CardContent>
    </Card>
  );
}
