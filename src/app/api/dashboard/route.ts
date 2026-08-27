import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import Deal from "@/models/Deal";
import Lead from "@/models/Lead";
import { currentAndPreviousMonth, monthLabels, percentChange } from "@/lib/date-ranges";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { getQuickAlerts } from "@/lib/alerts";

const PORTAL_MONTHLY_COST: Record<string, number> = {
  bayut: 15000,
  property_finder: 20000,
  dubizzle: 5000,
  website: 3000,
  referral: 0,
  walk_in: 0,
  social_media: 2000,
  cold_call: 500,
};

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();
    const { currentStart, currentEnd, previousStart, previousEnd } = currentAndPreviousMonth(now);

    const [
      revenueCurrentAgg,
      revenuePreviousAgg,
      dealsCurrentCount,
      dealsPreviousCount,
      pipelineValueAgg,
      leadsCurrentTotal,
      leadsCurrentWon,
      leadsPreviousTotal,
      leadsPreviousWon,
      avgDaysCurrentAgg,
      avgDaysPreviousAgg,
      dealTypeMixAgg,
      agents,
      allDeals,
      allLeads,
    ] = await Promise.all([
      Deal.aggregate([
        { $match: { stage: "completed", completionDate: { $gte: currentStart, $lte: currentEnd } } },
        { $group: { _id: null, total: { $sum: "$commission.grossAmount" } } },
      ]),
      Deal.aggregate([
        { $match: { stage: "completed", completionDate: { $gte: previousStart, $lt: previousEnd } } },
        { $group: { _id: null, total: { $sum: "$commission.grossAmount" } } },
      ]),
      Deal.countDocuments({ stage: "completed", completionDate: { $gte: currentStart, $lte: currentEnd } }),
      Deal.countDocuments({ stage: "completed", completionDate: { $gte: previousStart, $lt: previousEnd } }),
      Deal.aggregate([
        { $match: { stage: { $nin: ["completed", "fallen_through"] } } },
        { $group: { _id: null, total: { $sum: "$transactionValue" } } },
      ]),
      Lead.countDocuments({ createdAt: { $gte: currentStart, $lte: currentEnd } }),
      Lead.countDocuments({ createdAt: { $gte: currentStart, $lte: currentEnd }, status: "won" }),
      Lead.countDocuments({ createdAt: { $gte: previousStart, $lt: previousEnd } }),
      Lead.countDocuments({ createdAt: { $gte: previousStart, $lt: previousEnd }, status: "won" }),
      Deal.aggregate([
        { $match: { stage: "completed", completionDate: { $gte: currentStart, $lte: currentEnd } } },
        { $group: { _id: null, avg: { $avg: "$daysToClose" } } },
      ]),
      Deal.aggregate([
        { $match: { stage: "completed", completionDate: { $gte: previousStart, $lt: previousEnd } } },
        { $group: { _id: null, avg: { $avg: "$daysToClose" } } },
      ]),
      Deal.aggregate([
        { $match: { stage: "completed" } },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
      Agent.find().lean(),
      Deal.find().lean(),
      Lead.find().select("source status createdAt assignedAgentId convertedToDealId").lean(),
    ]);

    // ---- KPI cards ----
    const revenueCurrent = revenueCurrentAgg[0]?.total ?? 0;
    const revenuePrevious = revenuePreviousAgg[0]?.total ?? 0;
    const conversionCurrent = leadsCurrentTotal > 0 ? (leadsCurrentWon / leadsCurrentTotal) * 100 : 0;
    const conversionPrevious = leadsPreviousTotal > 0 ? (leadsPreviousWon / leadsPreviousTotal) * 100 : 0;
    const avgDaysCurrent = avgDaysCurrentAgg[0]?.avg ?? 0;
    const avgDaysPrevious = avgDaysPreviousAgg[0]?.avg ?? 0;

    const kpis = {
      totalRevenue: { value: revenueCurrent, change: percentChange(revenueCurrent, revenuePrevious) },
      dealsClosed: { value: dealsCurrentCount, change: percentChange(dealsCurrentCount, dealsPreviousCount) },
      activePipelineValue: { value: pipelineValueAgg[0]?.total ?? 0 },
      leadConversionRate: { value: conversionCurrent, change: conversionCurrent - conversionPrevious },
      avgDaysToClose: { value: Math.round(avgDaysCurrent), change: avgDaysCurrent - avgDaysPrevious },
    };

    // ---- Revenue trend (12 months) ----
    const months = monthLabels(now);
    const revenueTrend = months.map(({ key, label, start, end }) => {
      const dealsInMonth = allDeals.filter(
        (d) => d.stage === "completed" && d.completionDate && d.completionDate >= start && d.completionDate < end
      );
      const sale = dealsInMonth.filter((d) => d.type === "sale").reduce((s, d) => s + d.commission.grossAmount, 0);
      const rental = dealsInMonth.filter((d) => d.type === "rental").reduce((s, d) => s + d.commission.grossAmount, 0);
      const offPlan = dealsInMonth.filter((d) => d.type === "off_plan").reduce((s, d) => s + d.commission.grossAmount, 0);
      return { key, month: label, sale, rental, offPlan, total: sale + rental + offPlan };
    });

    // ---- Deal type mix ----
    const totalCompleted = dealTypeMixAgg.reduce((s, d) => s + d.count, 0);
    const dealTypeMix = dealTypeMixAgg.map((d) => ({
      type: d._id as string,
      count: d.count,
      percent: totalCompleted > 0 ? (d.count / totalCompleted) * 100 : 0,
    }));

    // ---- Top agents leaderboard ----
    const leadsByAgent = new Map<string, { total: number; won: number }>();
    for (const lead of allLeads) {
      const key = String(lead.assignedAgentId);
      const entry = leadsByAgent.get(key) ?? { total: 0, won: 0 };
      entry.total += 1;
      if (lead.status === "won") entry.won += 1;
      leadsByAgent.set(key, entry);
    }

    const topAgents = agents
      .map((agent) => {
        const agentDeals = allDeals.filter((d) => String(d.agentId) === String(agent._id) && d.stage === "completed");
        const commissionEarned = agentDeals.reduce((s, d) => s + d.commission.agentAmount, 0);
        const leadStats = leadsByAgent.get(String(agent._id)) ?? { total: 0, won: 0 };
        return {
          agentId: agent.agentId,
          _id: String(agent._id),
          name: agent.name,
          photo: agent.photo,
          specialization: agent.specialization,
          dealsCount: agentDeals.length,
          commissionEarned,
          conversionRate: leadStats.total > 0 ? (leadStats.won / leadStats.total) * 100 : 0,
        };
      })
      .sort((a, b) => b.commissionEarned - a.commissionEarned);

    // ---- Lead source ROI ----
    const sourceKeys = Object.keys(LEAD_SOURCE_LABELS);
    const leadSourceROI = sourceKeys.map((source) => {
      const sourceLeads = allLeads.filter((l) => l.source === source);
      const wonLeads = sourceLeads.filter((l) => l.status === "won");
      const dealIds = new Set(wonLeads.map((l) => String(l.convertedToDealId)).filter(Boolean));
      const commission = allDeals
        .filter((d) => dealIds.has(String(d._id)))
        .reduce((s, d) => s + d.commission.grossAmount, 0);
      const cost = PORTAL_MONTHLY_COST[source] ?? 0;
      return {
        source,
        label: LEAD_SOURCE_LABELS[source],
        leads: sourceLeads.length,
        deals: wonLeads.length,
        conversionRate: sourceLeads.length > 0 ? (wonLeads.length / sourceLeads.length) * 100 : 0,
        commissionEarned: commission,
        estMonthlyCost: cost,
        roi: cost > 0 ? commission / cost : commission > 0 ? Infinity : 0,
      };
    });

    // ---- Pipeline funnel ----
    const statusReached = (statuses: string[]) => allLeads.filter((l) => statuses.includes(l.status)).length;
    const contacted = allLeads.filter((l) => l.status !== "new").length;
    const qualified = statusReached(["qualified", "viewing_scheduled", "viewing_done", "offer_made", "negotiating", "won"]);
    const viewing = statusReached(["viewing_scheduled", "viewing_done", "offer_made", "negotiating", "won"]);
    const offer = statusReached(["offer_made", "negotiating", "won"]);
    const negotiation = statusReached(["negotiating", "won"]);
    const agreedOrBeyond = allDeals.filter((d) => ["agreed", "documentation", "transfer", "completed"].includes(d.stage)).length;
    const completed = allDeals.filter((d) => d.stage === "completed").length;

    const funnelStages = [
      { stage: "Leads", count: allLeads.length },
      { stage: "Contacted", count: contacted },
      { stage: "Qualified", count: qualified },
      { stage: "Viewing", count: viewing },
      { stage: "Offer", count: offer },
      { stage: "Negotiation", count: negotiation },
      { stage: "Agreed", count: agreedOrBeyond },
      { stage: "Completed", count: completed },
    ];
    const pipelineFunnel = funnelStages.map((s, i) => ({
      ...s,
      dropOffPercent: i === 0 ? 0 : funnelStages[i - 1].count > 0 ? 100 - (s.count / funnelStages[i - 1].count) * 100 : 0,
    }));

    // ---- Quick alerts (shared with the header notification bell) ----
    const alerts = await getQuickAlerts();

    return {
      kpis,
      revenueTrend,
      dealTypeMix,
      topAgents,
      leadSourceROI,
      pipelineFunnel,
      alerts,
    };
  });
}
