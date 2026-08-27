import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Deal from "@/models/Deal";
import Agent from "@/models/Agent";
import { monthLabels } from "@/lib/date-ranges";

const PAYMENT_TERMS_DAYS = 30;

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [deals, agents] = await Promise.all([Deal.find({ stage: "completed" }).lean(), Agent.find().lean()]);

    const ytdDeals = deals.filter((d) => d.completionDate && d.completionDate >= yearStart);
    const monthDeals = ytdDeals.filter((d) => d.completionDate && d.completionDate >= monthStart);

    const totalCommissionYtd = ytdDeals.reduce((s, d) => s + d.commission.grossAmount, 0);
    const thisMonthCommission = monthDeals.reduce((s, d) => s + d.commission.grossAmount, 0);
    const annualTarget = agents.reduce((s, a) => s + a.targets.monthlyRevenue * 12, 0);

    const pendingCollection = deals
      .filter((d) => d.commission.status !== "paid")
      .reduce((s, d) => s + (d.commission.status === "partially_paid" ? d.commission.grossAmount / 2 : d.commission.grossAmount), 0);

    const overdueDeals = deals.filter((d) => {
      if (d.commission.status === "paid" || !d.completionDate) return false;
      const dueDate = new Date(d.completionDate);
      dueDate.setDate(dueDate.getDate() + PAYMENT_TERMS_DAYS);
      return dueDate < now;
    });
    const overdueAmount = overdueDeals.reduce((s, d) => s + d.commission.grossAmount, 0);

    // Commission by agent (paid vs pending vs overdue), YTD
    const commissionByAgent = agents.map((agent) => {
      const agentDeals = ytdDeals.filter((d) => String(d.agentId) === String(agent._id));
      const paid = agentDeals.filter((d) => d.commission.status === "paid").reduce((s, d) => s + d.commission.agentAmount, 0);
      const overdue = agentDeals
        .filter((d) => overdueDeals.some((od) => String(od._id) === String(d._id)))
        .reduce((s, d) => s + d.commission.agentAmount, 0);
      const pending = agentDeals
        .filter((d) => d.commission.status !== "paid" && !overdueDeals.some((od) => String(od._id) === String(d._id)))
        .reduce((s, d) => s + d.commission.agentAmount, 0);
      return { agentId: agent.agentId, name: agent.name, paid, pending, overdue, total: paid + pending + overdue };
    });

    // 12-month timeline stacked by type
    const months = monthLabels(now);
    const timeline = months.map(({ key, label, start, end }) => {
      const monthDealsForTimeline = deals.filter((d) => d.completionDate && d.completionDate >= start && d.completionDate < end);
      const sale = monthDealsForTimeline.filter((d) => d.type === "sale").reduce((s, d) => s + d.commission.grossAmount, 0);
      const rental = monthDealsForTimeline.filter((d) => d.type === "rental").reduce((s, d) => s + d.commission.grossAmount, 0);
      const offPlan = monthDealsForTimeline.filter((d) => d.type === "off_plan").reduce((s, d) => s + d.commission.grossAmount, 0);
      return { key, month: label, sale, rental, offPlan, total: sale + rental + offPlan };
    });

    // Pending payments table
    const agentById = new Map(agents.map((a) => [String(a._id), a]));
    const pendingPayments = deals
      .filter((d) => d.commission.status !== "paid")
      .map((d) => {
        const dueDate = d.completionDate ? new Date(d.completionDate) : null;
        if (dueDate) dueDate.setDate(dueDate.getDate() + PAYMENT_TERMS_DAYS);
        const daysOverdue = dueDate ? Math.max(0, Math.round((now.getTime() - dueDate.getTime()) / 86_400_000)) : 0;
        return {
          _id: String(d._id),
          dealId: d.dealId,
          community: d.property.community,
          propertyType: d.property.type,
          clientName: d.clientName,
          agentName: agentById.get(String(d.agentId))?.name ?? "Unknown",
          commission: d.commission.grossAmount,
          invoiceNumber: d.commission.invoiceNumber,
          status: daysOverdue > 0 ? "overdue" : d.commission.status,
          dueDate,
          daysOverdue,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    return {
      summary: {
        totalCommissionYtd,
        thisMonthCommission,
        annualTarget,
        pendingCollection: Math.round(pendingCollection),
        overdueAmount,
      },
      commissionByAgent,
      timeline,
      pendingPayments,
    };
  });
}
