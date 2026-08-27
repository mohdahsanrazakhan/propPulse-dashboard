import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  title = "No data yet",
  description,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
      <Icon className="h-8 w-8" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
