import { cn } from "@/lib/utils";

function formatAed(value: number, compact: boolean) {
  if (compact) {
    return new Intl.NumberFormat("en-AE", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(value);
}

export function CurrencyDisplay({
  value,
  compact = false,
  className,
  bold = false,
}: {
  value: number;
  compact?: boolean;
  className?: string;
  bold?: boolean;
}) {
  return (
    <span
      className={cn(
        "tabular-nums",
        bold && "font-bold text-accent",
        className
      )}
    >
      AED {formatAed(value, compact)}
    </span>
  );
}
