import agentNames from "../data/agent-names.json";

export interface AgentSeed {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  reraId: string;
  photo: string;
  nationality: string;
  languages: string[];
  specialization: "sales" | "rentals" | "off-plan" | "commercial" | "mixed";
  communities: string[];
  joinDate: Date;
  isActive: boolean;
  targets: {
    monthlyDeals: number;
    monthlyRevenue: number;
    leadResponseMinutes: number;
  };
}

// Fixed per-agent performance profile; this is what makes the analytics
// pages meaningful. Deal counts sum to 320 (completed) and pipeline counts
// sum to 85, matching the seed data spec.
export const AGENT_PERFORMANCE: Record<
  string,
  {
    completedDeals: number;
    pipelineDeals: number;
    leadsAssigned: number;
    avgResponseMinutes: number;
    monthsActive: number; // how far back (out of 12) this agent has been active
  }
> = {
  "AG-001": { completedDeals: 72, pipelineDeals: 19, leadsAssigned: 260, avgResponseMinutes: 8, monthsActive: 12 },
  "AG-002": { completedDeals: 46, pipelineDeals: 12, leadsAssigned: 210, avgResponseMinutes: 12, monthsActive: 12 },
  "AG-003": { completedDeals: 92, pipelineDeals: 25, leadsAssigned: 630, avgResponseMinutes: 15, monthsActive: 12 },
  "AG-004": { completedDeals: 31, pipelineDeals: 8, leadsAssigned: 335, avgResponseMinutes: 20, monthsActive: 12 },
  "AG-005": { completedDeals: 26, pipelineDeals: 7, leadsAssigned: 110, avgResponseMinutes: 15, monthsActive: 12 },
  "AG-006": { completedDeals: 31, pipelineDeals: 8, leadsAssigned: 335, avgResponseMinutes: 18, monthsActive: 12 },
  "AG-007": { completedDeals: 15, pipelineDeals: 4, leadsAssigned: 410, avgResponseMinutes: 45, monthsActive: 12 },
  "AG-008": { completedDeals: 7, pipelineDeals: 2, leadsAssigned: 110, avgResponseMinutes: 20, monthsActive: 4 },
};

export function generateAgents(now: Date): AgentSeed[] {
  return agentNames.map((a) => {
    const perf = AGENT_PERFORMANCE[a.agentId];
    const monthlyDeals = Math.max(1, Math.round(perf.completedDeals / 12));
    // Rough avg commission per deal by specialization, used to size monthly revenue target.
    const avgCommissionByTier: Record<string, number> = {
      senior: 45000,
      mid: 28000,
      junior: 18000,
    };
    const monthlyRevenue = Math.round(monthlyDeals * avgCommissionByTier[a.tier]);

    const joinDate = new Date(now);
    joinDate.setMonth(joinDate.getMonth() - perf.monthsActive);

    return {
      agentId: a.agentId,
      name: a.name,
      email: `${a.name.toLowerCase().replace(/[^a-z]+/g, ".")}@proppulse.com`,
      phone: `+971 5${Math.floor(Math.random() * 9)} ${Math.floor(1000000 + Math.random() * 8999999)}`,
      reraId: `RERA-${Math.floor(10000 + Math.random() * 89999)}`,
      photo: "",
      nationality: a.nationality,
      languages: a.languages,
      specialization: a.specialization as AgentSeed["specialization"],
      communities: a.communities,
      joinDate,
      isActive: true,
      targets: {
        monthlyDeals,
        monthlyRevenue,
        leadResponseMinutes: a.performanceLevel === "below-average" ? 30 : 15,
      },
    };
  });
}
