import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Star } from "lucide-react";

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AgentProfileCard({
  agent,
  rating,
}: {
  agent: {
    name: string;
    reraId: string;
    specialization: string;
    languages: string[];
    communities: string[];
    joinDate: string;
    totalDeals: number;
    totalCommission: number;
  };
  rating: number;
}) {
  const t = useTranslations("agents.detail");
  const tSpec = useTranslations("agents.specializations");
  const locale = useLocale();

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar className="h-20 w-20 shrink-0">
          <AvatarFallback className="bg-accent/15 text-2xl font-bold text-accent">{initials(agent.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{agent.name}</h2>
            <Badge variant="outline">
              {tSpec.has(agent.specialization) ? tSpec(agent.specialization) : agent.specialization}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("reraId", { reraId: agent.reraId })} &middot; {agent.languages.join(", ")} &middot;{" "}
            {t("memberSince", {
              date: new Date(agent.joinDate).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-US", {
                month: "long",
                year: "numeric",
              }),
            })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {agent.communities.map((c) => (
              <Badge key={c} variant="secondary" className="text-xs">
                {c}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 sm:border-t-0 sm:border-s sm:ps-6 sm:pt-0">
          <div>
            <p className="text-xs text-muted-foreground">{t("totalDeals")}</p>
            <p className="text-lg font-bold tabular-nums text-foreground">{agent.totalDeals}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("totalCommission")}</p>
            <CurrencyDisplay value={agent.totalCommission} compact bold className="text-lg font-bold" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("avgRating")}</p>
            <p className="flex items-center gap-1 text-lg font-bold tabular-nums text-foreground">
              <Star className="h-4 w-4 fill-gold text-gold" />
              {rating.toFixed(1)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
