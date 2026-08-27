import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import Deal from "@/models/Deal";
import { LEAD_SOURCE_LABELS } from "@/lib/constants";
import { monthLabels } from "@/lib/date-ranges";

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

const RESPONSE_BUCKETS = [
  { label: "<5 min", min: 0, max: 5 },
  { label: "5-15 min", min: 5, max: 15 },
  { label: "15-30 min", min: 15, max: 30 },
  { label: "30-60 min", min: 30, max: 60 },
  { label: "1-4 hrs", min: 60, max: 240 },
  { label: "4-24 hrs", min: 240, max: 1440 },
  { label: ">24 hrs", min: 1440, max: Infinity },
];

const LOST_REASON_LABELS: Record<string, string> = {
  budget_mismatch: "Budget mismatch",
  not_ready: "Not ready",
  chose_competitor: "Chose competitor",
  unresponsive: "Unresponsive",
  left_dubai: "Left Dubai",
  no_requirement: "No real requirement",
};

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();

    const [leads, deals] = await Promise.all([Lead.find().lean(), Deal.find({ stage: "completed" }).lean()]);
    const dealById = new Map(deals.map((d) => [String(d._id), d]));

    const sourceKeys = Object.keys(LEAD_SOURCE_LABELS);

    const sourceOverview = sourceKeys.map((source) => ({
      source,
      label: LEAD_SOURCE_LABELS[source],
      count: leads.filter((l) => l.source === source).length,
    }));

    const sourceStats = sourceKeys.map((source) => {
      const sourceLeads = leads.filter((l) => l.source === source);
      const wonLeads = sourceLeads.filter((l) => l.status === "won");
      const wonDeals = wonLeads.map((l) => dealById.get(String(l.convertedToDealId))).filter(Boolean) as typeof deals;
      const commissionEarned = wonDeals.reduce((s, d) => s + d.commission.grossAmount, 0);
      const avgDealValue = wonDeals.length > 0 ? wonDeals.reduce((s, d) => s + d.transactionValue, 0) / wonDeals.length : 0;
      const cost = PORTAL_MONTHLY_COST[source] ?? 0;
      return {
        source,
        label: LEAD_SOURCE_LABELS[source],
        leads: sourceLeads.length,
        deals: wonLeads.length,
        conversionRate: sourceLeads.length > 0 ? (wonLeads.length / sourceLeads.length) * 100 : 0,
        avgDealValue,
        commissionEarned,
        estMonthlyCost: cost,
        roi: cost > 0 ? commissionEarned / cost : commissionEarned > 0 ? null : 0, // null = infinite ROI (zero cost)
      };
    });

    // Response time impact
    const respondedLeads = leads.filter((l) => l.responseTimeMinutes != null);
    const responseTimeImpact = RESPONSE_BUCKETS.map((bucket) => {
      const bucketLeads = respondedLeads.filter(
        (l) => (l.responseTimeMinutes ?? 0) >= bucket.min && (l.responseTimeMinutes ?? 0) < bucket.max
      );
      const won = bucketLeads.filter((l) => l.status === "won");
      return {
        label: bucket.label,
        leads: bucketLeads.length,
        conversionRate: bucketLeads.length > 0 ? (won.length / bucketLeads.length) * 100 : 0,
      };
    });

    // Lead trend over time (stacked by source)
    const months = monthLabels(now);
    const leadTrend = months.map(({ key, label, start, end }) => {
      const monthLeads = leads.filter((l) => l.createdAt >= start && l.createdAt < end);
      const row: Record<string, number | string> = { key, month: label };
      for (const source of sourceKeys) {
        row[source] = monthLeads.filter((l) => l.source === source).length;
      }
      return row;
    });

    // Lost reason analysis
    const lostLeads = leads.filter((l) => l.status === "lost" && l.lostReason);
    const lossReasons = Object.entries(LOST_REASON_LABELS).map(([key, label]) => ({
      reason: key,
      label,
      count: lostLeads.filter((l) => l.lostReason === key).length,
    }));

    return {
      sourceOverview,
      sourceStats,
      responseTimeImpact,
      leadTrend,
      lossReasons,
      sourceKeys: sourceKeys.map((s) => ({ key: s, label: LEAD_SOURCE_LABELS[s] })),
    };
  });
}
