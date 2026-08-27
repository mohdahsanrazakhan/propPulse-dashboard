"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InsightItem } from "./InsightCard";

export function GenerateInsightsButton({ onGenerated }: { onGenerated: (insights: InsightItem[]) => void }) {
  const t = useTranslations("insights");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insights", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? t("genericError"));
      onGenerated(json.insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button onClick={handleClick} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {t("generateButton")}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
