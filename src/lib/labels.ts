"use client";

import { useTranslations } from "next-intl";

// Translated display labels for the fixed vocab in constants.ts (deal types,
// deal stages, lead sources). Keep the messages/*.json "labels" namespace in
// sync with DEAL_TYPE_LABELS / DEAL_STAGE_LABELS / LEAD_SOURCE_LABELS keys.

export function useDealTypeLabel() {
  const t = useTranslations("labels.dealType");
  return (type: string) => (t.has(type) ? t(type) : type);
}

export function useDealStageLabel() {
  const t = useTranslations("labels.dealStage");
  return (stage: string) => (t.has(stage) ? t(stage) : stage);
}

export function useCommissionStatusLabel() {
  const t = useTranslations("labels.commissionStatus");
  return (status: string) => (t.has(status) ? t(status) : status);
}

export function useLossReasonLabel() {
  const t = useTranslations("labels.lossReason");
  return (reason: string) => (t.has(reason) ? t(reason) : reason);
}

export function useLeadSourceLabel() {
  const t = useTranslations("labels.leadSource");
  return (source: string) => (t.has(source) ? t(source) : source);
}

// The dashboard API returns the pipeline funnel stages as fixed, capitalized
// English strings (not the snake_case DEAL_STAGE_LABELS keys); map those
// over to the `labels.funnelStage` messages.
const FUNNEL_STAGE_TO_KEY: Record<string, string> = {
  Leads: "leads",
  Contacted: "contacted",
  Qualified: "qualified",
  Viewing: "viewing",
  Offer: "offer",
  Negotiation: "negotiation",
  Agreed: "agreed",
  Completed: "completed",
};

export function useFunnelStageLabel() {
  const t = useTranslations("labels.funnelStage");
  return (stage: string) => {
    const key = FUNNEL_STAGE_TO_KEY[stage];
    return key && t.has(key) ? t(key) : stage;
  };
}
