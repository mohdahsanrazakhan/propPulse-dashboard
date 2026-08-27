import Agent from "@/models/Agent";
import Deal from "@/models/Deal";
import Lead from "@/models/Lead";
import { currentAndPreviousMonth, percentChange } from "./date-ranges";

export interface QuickAlert {
  severity: "critical" | "warning" | "success" | "info";
  message: string;
  href: string;
}

// Shared by /api/dashboard (Quick Alerts panel) and /api/notifications
// (header bell) so both surfaces stay in sync from one source of truth.
export async function getQuickAlerts(): Promise<QuickAlert[]> {
  const now = new Date();
  const { currentStart, previousStart, previousEnd } = currentAndPreviousMonth(now);

  const [agents, allDeals, allLeads] = await Promise.all([
    Agent.find().select("agentId name targets").lean(),
    Deal.find().select("agentId stage stageEnteredAt completionDate property.community").lean(),
    Lead.find().select("status createdAt").lean(),
  ]);

  const uncontactedThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const uncontactedCount = allLeads.filter((l) => l.status === "new" && l.createdAt < uncontactedThreshold).length;

  const stuckDocsThreshold = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
  const stuckDocs = allDeals.filter((d) => d.stage === "documentation" && d.stageEnteredAt < stuckDocsThreshold);

  const alerts: QuickAlert[] = [];
  if (uncontactedCount > 0) {
    alerts.push({
      severity: "critical",
      message: `${uncontactedCount} leads uncontacted for 24+ hours`,
      href: "/leads",
    });
  }
  if (stuckDocs.length > 0) {
    alerts.push({
      severity: "warning",
      message: `${stuckDocs.length} deals stuck in documentation for 20+ days`,
      href: "/pipeline",
    });
  }

  // First agent who hit 150%+ of their monthly deal target
  for (const agent of agents) {
    const monthDeals = allDeals.filter(
      (d) =>
        String(d.agentId) === String(agent._id) &&
        d.stage === "completed" &&
        d.completionDate &&
        d.completionDate >= currentStart
    ).length;
    if (agent.targets.monthlyDeals > 0 && monthDeals / agent.targets.monthlyDeals >= 1.5) {
      alerts.push({
        severity: "success",
        message: `${agent.name.split(" ")[0]} hit ${Math.round((monthDeals / agent.targets.monthlyDeals) * 100)}% of monthly target`,
        href: `/agents/${agent._id}`,
      });
      break;
    }
  }

  // Community momentum: biggest month-over-month mover
  const communityCurrent = new Map<string, number>();
  const communityPrevious = new Map<string, number>();
  for (const d of allDeals) {
    if (d.stage !== "completed" || !d.completionDate) continue;
    if (d.completionDate >= currentStart) {
      communityCurrent.set(d.property.community, (communityCurrent.get(d.property.community) ?? 0) + 1);
    } else if (d.completionDate >= previousStart && d.completionDate < previousEnd) {
      communityPrevious.set(d.property.community, (communityPrevious.get(d.property.community) ?? 0) + 1);
    }
  }
  let bestCommunity: { name: string; change: number } | null = null;
  for (const [name, curr] of communityCurrent.entries()) {
    const prev = communityPrevious.get(name) ?? 0;
    const change = percentChange(curr, prev);
    if (curr >= 2 && (bestCommunity === null || change > bestCommunity.change)) {
      bestCommunity = { name, change };
    }
  }
  if (bestCommunity && bestCommunity.change > 0) {
    alerts.push({
      severity: "info",
      message: `${bestCommunity.name} deals up ${Math.round(bestCommunity.change)}% this month`,
      href: "/communities",
    });
  }

  return alerts;
}
