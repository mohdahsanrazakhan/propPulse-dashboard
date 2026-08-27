"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AgentAssessment({ agentId }: { agentId: string }) {
  const t = useTranslations("agents.assessment");
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("genericError"));
      setText(json.assessment);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
          <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button size="sm" variant="outline" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-accent" />}
          {text ? t("regenerate") : t("generate")}
        </Button>
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-danger">{error}</p>}
        {!error && !text && !loading && (
          <p className="text-sm text-muted-foreground">{t("prompt")}</p>
        )}
        {text && <p className="text-sm leading-relaxed text-foreground">{text}</p>}
      </CardContent>
    </Card>
  );
}
