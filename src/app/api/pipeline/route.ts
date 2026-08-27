import { withApiHandler } from "@/lib/api-utils";
import { connectDB } from "@/lib/db";
import Deal from "@/models/Deal";
import Agent from "@/models/Agent";

export async function GET() {
  return withApiHandler(async () => {
    await connectDB();
    const now = new Date();

    const [deals, agents] = await Promise.all([Deal.find().lean(), Agent.find().select("name photo agentId").lean()]);
    const agentById = new Map(agents.map((a) => [String(a._id), a]));

    const dealsOut = deals.map((d) => {
      const agent = agentById.get(String(d.agentId));
      const daysInStage = Math.round((now.getTime() - new Date(d.stageEnteredAt).getTime()) / (24 * 60 * 60 * 1000));
      return {
        _id: String(d._id),
        dealId: d.dealId,
        type: d.type,
        property: d.property,
        transactionValue: d.transactionValue,
        commission: d.commission,
        agent: agent ? { _id: String(agent._id), name: agent.name, photo: agent.photo, agentId: agent.agentId } : null,
        clientName: d.clientName,
        clientNationality: d.clientNationality,
        clientType: d.clientType,
        stage: d.stage,
        daysInStage,
        listingDate: d.listingDate,
        viewingDate: d.viewingDate,
        offerDate: d.offerDate,
        agreedDate: d.agreedDate,
        completionDate: d.completionDate,
        daysToClose: d.daysToClose,
        isCobroker: d.isCobroker,
        cobrokerAgency: d.cobrokerAgency,
        cobrokerSplit: d.cobrokerSplit,
        notes: d.notes,
        createdAt: d.createdAt,
      };
    });

    const pipelineDeals = dealsOut.filter((d) => d.stage !== "completed" && d.stage !== "fallen_through");
    const totalPipelineValue = pipelineDeals.reduce((s, d) => s + d.transactionValue, 0);
    const expectedCommission = pipelineDeals.reduce((s, d) => s + d.commission.grossAmount, 0);
    const avgDealAge = pipelineDeals.length > 0 ? pipelineDeals.reduce((s, d) => s + d.daysInStage, 0) / pipelineDeals.length : 0;
    const dealsAtRisk = pipelineDeals.filter((d) => d.daysInStage > 14).length;

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentClosed = dealsOut.filter(
      (d) => (d.stage === "completed" || d.stage === "fallen_through") && new Date(d.createdAt) >= sixMonthsAgo
    );
    const recentWon = recentClosed.filter((d) => d.stage === "completed");
    const winRate = recentClosed.length > 0 ? (recentWon.length / recentClosed.length) * 100 : 0;

    return {
      deals: dealsOut,
      summary: {
        totalPipelineValue,
        expectedCommission,
        avgDealAge: Math.round(avgDealAge),
        dealsAtRisk,
        winRate,
      },
    };
  });
}
