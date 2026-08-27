import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import Deal from "@/models/Deal";
import Lead from "@/models/Lead";
import { currentAndPreviousMonth } from "@/lib/date-ranges";

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();
    const { currentStart, currentEnd } = currentAndPreviousMonth(now);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [agents, allDeals, allLeads] = await Promise.all([
      Agent.find().lean(),
      Deal.find().lean(),
      Lead.find().select("assignedAgentId status responseTimeMinutes createdAt").lean(),
    ]);

    const result = agents.map((agent) => {
      const agentIdStr = String(agent._id);
      const completedDeals = allDeals.filter((d) => String(d.agentId) === agentIdStr && d.stage === "completed");
      const monthDeals = completedDeals.filter((d) => d.completionDate && d.completionDate >= currentStart && d.completionDate <= currentEnd);
      const ytdDeals = completedDeals.filter((d) => d.completionDate && d.completionDate >= yearStart);

      const commissionMonth = monthDeals.reduce((s, d) => s + d.commission.agentAmount, 0);
      const commissionYtd = ytdDeals.reduce((s, d) => s + d.commission.agentAmount, 0);

      const agentLeads = allLeads.filter((l) => String(l.assignedAgentId) === agentIdStr);
      const wonLeads = agentLeads.filter((l) => l.status === "won");
      const conversionRate = agentLeads.length > 0 ? (wonLeads.length / agentLeads.length) * 100 : 0;

      const respondedLeads = agentLeads.filter((l) => l.responseTimeMinutes != null);
      const avgResponseTime =
        respondedLeads.length > 0
          ? respondedLeads.reduce((s, l) => s + (l.responseTimeMinutes ?? 0), 0) / respondedLeads.length
          : 0;

      const avgDaysToClose =
        completedDeals.length > 0
          ? completedDeals.reduce((s, d) => s + (d.daysToClose ?? 0), 0) / completedDeals.length
          : 0;

      const targetProgress = agent.targets.monthlyDeals > 0 ? (monthDeals.length / agent.targets.monthlyDeals) * 100 : 0;

      // Composite rating (1-5): blends target achievement, conversion, and response speed.
      const responseScore = avgResponseTime === 0 ? 3 : Math.max(0, Math.min(5, 5 - avgResponseTime / 15));
      const targetScore = Math.max(0, Math.min(5, (targetProgress / 100) * 5));
      const conversionScore = Math.max(0, Math.min(5, (conversionRate / 30) * 5));
      const rating = Math.round(((responseScore + targetScore + conversionScore) / 3) * 10) / 10;

      return {
        _id: agentIdStr,
        agentId: agent.agentId,
        name: agent.name,
        photo: agent.photo,
        specialization: agent.specialization,
        nationality: agent.nationality,
        languages: agent.languages,
        communities: agent.communities,
        isActive: agent.isActive,
        targets: agent.targets,
        dealsMonth: monthDeals.length,
        targetProgress,
        commissionMonth,
        commissionYtd,
        leadsAssigned: agentLeads.length,
        conversionRate,
        avgResponseTime: Math.round(avgResponseTime),
        avgDaysToClose: Math.round(avgDaysToClose),
        rating: Math.min(5, Math.max(1, rating)),
        totalDeals: completedDeals.length,
      };
    });

    return { agents: result };
  });
}
