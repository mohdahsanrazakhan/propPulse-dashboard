import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Deal from "@/models/Deal";
import Property from "@/models/Property";
import Agent from "@/models/Agent";
import { monthLabels, percentChange } from "@/lib/date-ranges";

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();
    const quarterStart = new Date(now);
    quarterStart.setMonth(quarterStart.getMonth() - 3);
    const prevQuarterStart = new Date(now);
    prevQuarterStart.setMonth(prevQuarterStart.getMonth() - 6);

    const [deals, properties, agents] = await Promise.all([
      Deal.find({ stage: "completed" }).lean(),
      Property.find({ status: "active" }).lean(),
      Agent.find().select("name").lean(),
    ]);
    const agentById = new Map(agents.map((a) => [String(a._id), a.name]));

    const communities = Array.from(new Set(deals.map((d) => d.property.community))).sort();

    const table = communities.map((community) => {
      const communityDeals = deals.filter((d) => d.property.community === community);
      const saleDeals = communityDeals.filter((d) => d.type === "sale" || d.type === "off_plan");
      const rentalDeals = communityDeals.filter((d) => d.type === "rental");
      const avgSalePrice = saleDeals.length > 0 ? saleDeals.reduce((s, d) => s + d.transactionValue, 0) / saleDeals.length : 0;
      const avgRent = rentalDeals.length > 0 ? rentalDeals.reduce((s, d) => s + d.transactionValue, 0) / rentalDeals.length : 0;
      const avgDaysToClose =
        communityDeals.length > 0 ? communityDeals.reduce((s, d) => s + (d.daysToClose ?? 0), 0) / communityDeals.length : 0;
      const activeListings = properties.filter((p) => p.community === community).length;

      const agentCounts = new Map<string, number>();
      for (const d of communityDeals) {
        const key = String(d.agentId);
        agentCounts.set(key, (agentCounts.get(key) ?? 0) + 1);
      }
      let topAgent = "N/A";
      let maxCount = 0;
      for (const [agentId, count] of agentCounts.entries()) {
        if (count > maxCount) {
          maxCount = count;
          topAgent = agentById.get(agentId) ?? "N/A";
        }
      }

      const currentQuarterCount = communityDeals.filter((d) => d.completionDate && d.completionDate >= quarterStart).length;
      const prevQuarterCount = communityDeals.filter(
        (d) => d.completionDate && d.completionDate >= prevQuarterStart && d.completionDate < quarterStart
      ).length;
      const trend = percentChange(currentQuarterCount, prevQuarterCount);

      const avgCommission = communityDeals.length > 0 ? communityDeals.reduce((s, d) => s + d.commission.grossAmount, 0) / communityDeals.length : 0;

      return {
        community,
        totalDeals: communityDeals.length,
        avgSalePrice: Math.round(avgSalePrice),
        avgRent: Math.round(avgRent),
        activeListings,
        avgDaysToClose: Math.round(avgDaysToClose),
        topAgent,
        trend,
        avgCommission: Math.round(avgCommission),
        saleCount: saleDeals.filter((d) => d.type === "sale").length,
        rentalCount: rentalDeals.length,
        offPlanCount: communityDeals.filter((d) => d.type === "off_plan").length,
      };
    });

    const heatmap = table.map((t) => ({
      community: t.community,
      deals: t.totalDeals,
      avgCommission: t.avgCommission,
    }));

    // Price trend by community (avg price per sqft over 12 months); top 6 by deal volume
    const months = monthLabels(now);
    const topCommunities = [...table].sort((a, b) => b.totalDeals - a.totalDeals).slice(0, 6).map((t) => t.community);
    const priceTrends = topCommunities.map((community) => {
      const communityDeals = deals.filter((d) => d.property.community === community && (d.type === "sale" || d.type === "off_plan"));
      const series = months.map(({ key, label, start, end }) => {
        const monthDeals = communityDeals.filter((d) => d.completionDate && d.completionDate >= start && d.completionDate < end);
        const avgPsf =
          monthDeals.length > 0
            ? monthDeals.reduce((s, d) => s + d.transactionValue / Math.max(d.property.sqft, 1), 0) / monthDeals.length
            : null;
        return { key, month: label, value: avgPsf ? Math.round(avgPsf) : null };
      });
      return { community, series };
    });

    const dealTypeByCommunity = table
      .sort((a, b) => b.totalDeals - a.totalDeals)
      .slice(0, 10)
      .map((t) => ({ community: t.community, sale: t.saleCount, rental: t.rentalCount, offPlan: t.offPlanCount }));

    return { table, heatmap, priceTrends, dealTypeByCommunity };
  });
}
