"use client";

import { cn } from "@/lib/utils";
import { useDealTypeLabel } from "@/lib/labels";

const STYLES: Record<string, string> = {
  sale: "bg-deal-sale/10 text-deal-sale border-deal-sale/20",
  rental: "bg-deal-rental/10 text-deal-rental border-deal-rental/20",
  off_plan: "bg-deal-offplan/10 text-deal-offplan border-deal-offplan/20",
};

export function DealTypeBadge({ type, className }: { type: string; className?: string }) {
  const dealTypeLabel = useDealTypeLabel();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        STYLES[type] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {dealTypeLabel(type)}
    </span>
  );
}
