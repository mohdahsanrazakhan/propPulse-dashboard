import { withApiHandler, errorResponse } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Insight from "@/models/Insight";
import Deal from "@/models/Deal";
import Lead from "@/models/Lead";
import Agent from "@/models/Agent";
import { generateInsightsFromData } from "@/lib/openai";

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const insights = await Insight.find().sort({ createdAt: -1 }).lean();
    return {
      insights: insights.map((i) => ({
        _id: String(i._id),
        type: i.type,
        severity: i.severity,
        title: i.title,
        description: i.description,
        metric: i.metric,
        recommendation: i.recommendation,
        isRead: i.isRead,
        createdAt: i.createdAt,
      })),
    };
  });
}

export async function POST() {
  return withApiHandler(async () => {
    await connectDB();

    const [agents, deals, leads] = await Promise.all([
      Agent.find().lean(),
      Deal.find({ stage: "completed" }).lean(),
      Lead.find().select("source status responseTimeMinutes lostReason").lean(),
    ]);

    const totalCommission = deals.reduce((s, d) => s + d.commission.grossAmount, 0);
    const topAgent = [...agents]
      .map((a) => ({
        name: a.name,
        deals: deals.filter((d) => String(d.agentId) === String(a._id)).length,
      }))
      .sort((a, b) => b.deals - a.deals)[0];

    const wonLeads = leads.filter((l) => l.status === "won");
    const summary = `
Agency: ${agents.length} agents, ${deals.length} completed deals, AED ${totalCommission.toLocaleString()} total commission.
Top agent by deal count: ${topAgent?.name ?? "N/A"} (${topAgent?.deals ?? 0} deals).
Leads: ${leads.length} total, ${wonLeads.length} won (${((wonLeads.length / Math.max(leads.length, 1)) * 100).toFixed(1)}% conversion).
Avg response time: ${
      leads.filter((l) => l.responseTimeMinutes != null).length > 0
        ? Math.round(
            leads.filter((l) => l.responseTimeMinutes != null).reduce((s, l) => s + (l.responseTimeMinutes ?? 0), 0) /
              leads.filter((l) => l.responseTimeMinutes != null).length
          )
        : 0
    } minutes.
`.trim();

    let parsed: unknown[] = [];
    try {
      const raw = await generateInsightsFromData(summary);
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return errorResponse("AI insights are unavailable right now. Check the OpenAI API key configuration.", 503);
    }

    const validSeverities = ["info", "warning", "critical", "opportunity"];
    const validTypes = ["agent", "lead", "commission", "community", "pipeline", "general"];

    const toInsert = (parsed as Record<string, unknown>[])
      .filter((i) => typeof i.title === "string" && typeof i.description === "string")
      .slice(0, 5)
      .map((i) => ({
        type: validTypes.includes(String(i.type)) ? i.type : "general",
        severity: validSeverities.includes(String(i.severity)) ? i.severity : "info",
        title: String(i.title).slice(0, 200),
        description: String(i.description).slice(0, 500),
        metric: String(i.metric ?? "").slice(0, 100),
        recommendation: String(i.recommendation ?? "").slice(0, 500),
        isRead: false,
      }));

    if (toInsert.length === 0) {
      return errorResponse("The AI didn't return any usable insights. Please try again.", 502);
    }

    const created = await Insight.insertMany(toInsert);
    return {
      insights: created.map((i) => ({
        _id: String(i._id),
        type: i.type,
        severity: i.severity,
        title: i.title,
        description: i.description,
        metric: i.metric,
        recommendation: i.recommendation,
        isRead: i.isRead,
        createdAt: i.createdAt,
      })),
    };
  });
}
