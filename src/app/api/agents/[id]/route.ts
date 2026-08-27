import { withApiHandler, badRequestResponse, errorResponse } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Agent from "@/models/Agent";
import Deal from "@/models/Deal";
import Lead from "@/models/Lead";
import { objectIdSchema } from "@/lib/validators";
import { monthLabels } from "@/lib/date-ranges";
import { generateAgentAssessment } from "@/lib/openai";

async function loadAgentBundle(id: string) {
  await connectDB();
  const agent = await Agent.findById(id).lean();
  if (!agent) return null;

  const now = new Date();
  const idStr = String(agent._id);

  const [agentDeals, allDeals, agentLeads] = await Promise.all([
    Deal.find({ agentId: agent._id }).sort({ createdAt: -1 }).lean(),
    Deal.find({ stage: "completed" }).lean(),
    Lead.find({ assignedAgentId: agent._id }).lean(),
  ]);

  const completedDeals = agentDeals.filter((d) => d.stage === "completed");

  // Target vs actual (current month)
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthDeals = completedDeals.filter((d) => d.completionDate && d.completionDate >= currentMonthStart);
  const monthCommission = monthDeals.reduce((s, d) => s + d.commission.agentAmount, 0);
  const respondedLeads = agentLeads.filter((l) => l.responseTimeMinutes != null);
  const avgResponse =
    respondedLeads.length > 0
      ? respondedLeads.reduce((s, l) => s + (l.responseTimeMinutes ?? 0), 0) / respondedLeads.length
      : 0;

  // 12-month trend: this agent vs agency average
  const months = monthLabels(now);
  const agentIdsCount = new Set(allDeals.map((d) => String(d.agentId))).size || 1;
  const trend = months.map(({ key, label, start, end }) => {
    const agentCount = completedDeals.filter((d) => d.completionDate && d.completionDate >= start && d.completionDate < end).length;
    const agencyCount = allDeals.filter((d) => d.completionDate && d.completionDate >= start && d.completionDate < end).length;
    return { key, month: label, agentDeals: agentCount, agencyAverage: Math.round((agencyCount / agentIdsCount) * 10) / 10 };
  });

  // Lead conversion funnel: this agent vs agency
  const funnelDef = (leads: typeof agentLeads) => {
    const total = leads.length || 1;
    const contacted = leads.filter((l) => l.status !== "new").length;
    const qualified = leads.filter((l) =>
      ["qualified", "viewing_scheduled", "viewing_done", "offer_made", "negotiating", "won"].includes(l.status)
    ).length;
    const viewing = leads.filter((l) => ["viewing_scheduled", "viewing_done", "offer_made", "negotiating", "won"].includes(l.status)).length;
    const won = leads.filter((l) => l.status === "won").length;
    return {
      total: leads.length,
      contactedPct: (contacted / total) * 100,
      qualifiedPct: (qualified / total) * 100,
      viewingPct: (viewing / total) * 100,
      wonPct: (won / total) * 100,
    };
  };

  const allLeads = await Lead.find().select("status").lean();

  // Commission breakdown
  const byType = ["sale", "rental", "off_plan"].map((type) => ({
    type,
    amount: completedDeals.filter((d) => d.type === type).reduce((s, d) => s + d.commission.agentAmount, 0),
  }));
  const commissionTimeline = months.map(({ key, label, start, end }) => {
    const amount = completedDeals
      .filter((d) => d.completionDate && d.completionDate >= start && d.completionDate < end)
      .reduce((s, d) => s + d.commission.agentAmount, 0);
    return { key, month: label, amount };
  });
  const paidAmount = completedDeals
    .filter((d) => d.commission.status === "paid")
    .reduce((s, d) => s + d.commission.agentAmount, 0);
  const pendingAmount = completedDeals
    .filter((d) => d.commission.status !== "paid")
    .reduce((s, d) => s + d.commission.agentAmount, 0);

  return {
    agent: {
      _id: idStr,
      agentId: agent.agentId,
      name: agent.name,
      photo: agent.photo,
      reraId: agent.reraId,
      specialization: agent.specialization,
      languages: agent.languages,
      communities: agent.communities,
      nationality: agent.nationality,
      joinDate: agent.joinDate,
      targets: agent.targets,
      totalDeals: completedDeals.length,
      totalCommission: completedDeals.reduce((s, d) => s + d.commission.agentAmount, 0),
    },
    targetVsActual: {
      dealsActual: monthDeals.length,
      dealsTarget: agent.targets.monthlyDeals,
      commissionActual: monthCommission,
      commissionTarget: agent.targets.monthlyRevenue,
      responseActual: Math.round(avgResponse),
      responseTarget: agent.targets.leadResponseMinutes,
    },
    trend,
    funnel: {
      agent: funnelDef(agentLeads),
      agency: funnelDef(allLeads as unknown as typeof agentLeads),
    },
    deals: agentDeals.map((d) => ({
      _id: String(d._id),
      dealId: d.dealId,
      type: d.type,
      property: d.property,
      transactionValue: d.transactionValue,
      commission: d.commission,
      stage: d.stage,
      completionDate: d.completionDate,
      createdAt: d.createdAt,
    })),
    commissionBreakdown: {
      byType,
      timeline: commissionTimeline,
      paidAmount,
      pendingAmount,
    },
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await ctx.params;
    const parsed = objectIdSchema.safeParse(id);
    if (!parsed.success) return badRequestResponse("Invalid agent id");

    const bundle = await loadAgentBundle(id);
    if (!bundle) return errorResponse("Agent not found", 404);
    return bundle;
  });
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withApiHandler(async () => {
    const { id } = await ctx.params;
    const parsed = objectIdSchema.safeParse(id);
    if (!parsed.success) return badRequestResponse("Invalid agent id");

    const bundle = await loadAgentBundle(id);
    if (!bundle) return errorResponse("Agent not found", 404);

    const summary = `
Agent: ${bundle.agent.name}, specialization: ${bundle.agent.specialization}, communities: ${bundle.agent.communities.join(", ")}.
Total deals: ${bundle.agent.totalDeals}, total commission: AED ${bundle.agent.totalCommission}.
This month: ${bundle.targetVsActual.dealsActual}/${bundle.targetVsActual.dealsTarget} deals target, avg response ${bundle.targetVsActual.responseActual} min (target ${bundle.targetVsActual.responseTarget} min).
Lead conversion: ${bundle.funnel.agent.wonPct.toFixed(1)}% vs agency average ${bundle.funnel.agency.wonPct.toFixed(1)}%.
`.trim();

    try {
      const assessment = await generateAgentAssessment(summary);
      return { assessment };
    } catch {
      return errorResponse("AI insights are unavailable right now. Check the OpenAI API key configuration.", 503);
    }
  });
}
