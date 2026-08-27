import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrendIndicator({
  value,
  suffix = "%",
  invertColor = false,
  className,
}: {
  value: number;
  suffix?: string;
  /** For metrics where a decrease is good (e.g. days to close) */
  invertColor?: boolean;
  className?: string;
}) {
  const isFlat = Math.abs(value) < 0.05;
  const isPositive = value > 0;
  const good = invertColor ? !isPositive : isPositive;

  const Icon = isFlat ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;
  const color = isFlat
    ? "text-muted-foreground"
    : good
    ? "text-success"
    : "text-danger";

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-sm font-medium tabular-nums", color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(value).toFixed(1)}
      {suffix}
    </span>
  );
}
