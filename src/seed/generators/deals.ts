import mongoose from "mongoose";
import communities from "../data/communities.json";
import { weightsFor, DEVELOPERS } from "./property-types-data";
import { calculateCommission } from "@/lib/commission-calculator";
import { LeadSeed } from "./leads";
import {
  addDays,
  pad,
  pick,
  randFloat,
  randInt,
  weightedPick,
  Weighted,
} from "./utils";

export interface DealSeed {
  dealId: string;
  type: "sale" | "rental" | "off_plan";
  property: {
    type: string;
    community: string;
    building: string;
    unitNumber: string;
    bedrooms: number;
    sqft: number;
    developer: string | null;
  };
  transactionValue: number;
  commission: {
    rate: number;
    grossAmount: number;
    vatAmount: number;
    agentSplit: number;
    agentAmount: number;
    agencyAmount: number;
    status: "pending" | "invoiced" | "partially_paid" | "paid";
    paidDate: Date | null;
    invoiceNumber: string | null;
  };
  agentId: mongoose.Types.ObjectId;
  leadId: mongoose.Types.ObjectId | null;
  clientName: string;
  clientNationality: string;
  clientType: "buyer" | "seller" | "tenant" | "landlord";
  stage: string;
  listingDate: Date | null;
  viewingDate: Date | null;
  offerDate: Date | null;
  agreedDate: Date | null;
  completionDate: Date | null;
  daysToClose: number | null;
  isCobroker: boolean;
  cobrokerAgency: string | null;
  cobrokerSplit: number | null;
  notes: string;
  stageEnteredAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // internal, used to update the source lead after insertion
  _sourceLeadId?: string;
}

interface AgentRef {
  _id: mongoose.Types.ObjectId;
  agentId: string;
  name: string;
  tier: "senior" | "mid" | "junior";
  communities: string[];
}

const DEAL_TYPE_WEIGHTS: Record<string, Weighted<"sale" | "rental" | "off_plan">[]> = {
  "AG-001": [{ item: "sale", weight: 70 }, { item: "off_plan", weight: 30 }],
  "AG-002": [{ item: "sale", weight: 90 }, { item: "off_plan", weight: 10 }],
  "AG-003": [{ item: "rental", weight: 95 }, { item: "sale", weight: 5 }],
  "AG-004": [{ item: "off_plan", weight: 85 }, { item: "sale", weight: 15 }],
  "AG-005": [{ item: "sale", weight: 85 }, { item: "off_plan", weight: 15 }],
  "AG-006": [{ item: "rental", weight: 95 }, { item: "sale", weight: 5 }],
  "AG-007": [
    { item: "sale", weight: 35 },
    { item: "rental", weight: 35 },
    { item: "off_plan", weight: 30 },
  ],
  "AG-008": [{ item: "off_plan", weight: 90 }, { item: "sale", weight: 10 }],
};

const AGENT_SPLIT_RANGE: Record<string, [number, number]> = {
  senior: [65, 70],
  mid: [55, 60],
  junior: [50, 50],
};

const COBROKER_AGENCIES = [
  "Elite Homes Realty",
  "Skyline Properties",
  "Metropolitan Real Estate",
  "Prime Location Properties",
  "Gulf Coast Realty",
];

const COMMISSION_STATUS_DISTRIBUTION: Weighted<"paid" | "invoiced" | "partially_paid" | "pending">[] = [
  { item: "paid", weight: 70 },
  { item: "invoiced", weight: 15 },
  { item: "partially_paid", weight: 10 },
  { item: "pending", weight: 5 },
];

const PIPELINE_STAGE_TARGETS: { stage: string; count: number }[] = [
  { stage: "prospect", count: 20 },
  { stage: "viewing", count: 18 },
  { stage: "offer", count: 15 },
  { stage: "negotiation", count: 12 },
  { stage: "agreed", count: 8 },
  { stage: "documentation", count: 7 },
  { stage: "transfer", count: 5 },
];

let dealCounter = 0;
function nextDealId() {
  dealCounter += 1;
  return `DL-${pad(dealCounter, 4)}`;
}

const communityRecord = new Map(communities.map((c) => [c.name, c]));

function randomProperty(dealType: "sale" | "rental" | "off_plan", community: string) {
  const key = dealType === "sale" ? "sale" : dealType === "rental" ? "rental" : "off_plan";
  const weights = weightsFor(key);
  const type = weightedPick(weights.map((w) => ({ item: w.type, weight: w.weight })));
  const bedrooms = type === "office" || type === "retail" || type === "land" ? 0 : randInt(0, 5);
  const sqftBase = type === "villa" || type === "townhouse" ? randInt(2200, 5500) : randInt(650, 2200);
  const developers = DEVELOPERS;
  return {
    type,
    community,
    building: `${community.split(" ")[0]} ${pick(["Tower", "Residence", "Heights", "Gardens", "Court"])} ${randInt(1, 12)}`,
    unitNumber: `${randInt(1, 40)}${pad(randInt(1, 12), 2)}`,
    bedrooms,
    sqft: sqftBase,
    developer: dealType === "off_plan" ? pick(developers) : null,
  };
}

function transactionValueFor(dealType: "sale" | "rental" | "off_plan", community: string) {
  const data = communityRecord.get(community);
  if (dealType === "rental") {
    const base = data?.avgRent ?? 60000;
    return Math.round(base * randFloat(0.75, 1.35));
  }
  const base = data?.avgSalePrice ?? (dealType === "off_plan" ? 1300000 : 1500000);
  const scale = dealType === "off_plan" ? randFloat(0.6, 1.0) : randFloat(0.8, 1.3);
  return Math.round(base * scale);
}

function commissionRateFor(dealType: "sale" | "rental" | "off_plan") {
  if (dealType === "sale") return 2;
  if (dealType === "rental") return 5;
  return Math.round(randFloat(3, 7) * 10) / 10;
}

function durationDaysFor(dealType: "sale" | "rental" | "off_plan") {
  if (dealType === "rental") return { listing: 0, viewing: 1, offer: 2, agreed: 3, completion: 14 };
  return { listing: 0, viewing: 3, offer: 10, agreed: 15, completion: 39 };
}

function buildFinancials(
  dealType: "sale" | "rental" | "off_plan",
  transactionValue: number,
  tier: "senior" | "mid" | "junior"
) {
  const rate = commissionRateFor(dealType);
  const [minSplit, maxSplit] = AGENT_SPLIT_RANGE[tier];
  const agentSplit = randInt(minSplit, maxSplit);
  const isCobroker = Math.random() < 0.15;
  const cobrokerSplit = isCobroker ? 50 : null;

  const result = calculateCommission({
    dealType,
    transactionValue,
    commissionRate: rate,
    agentSplitPercent: agentSplit,
    isCoBroker: isCobroker,
    coBrokerSplitPercent: cobrokerSplit ?? 0,
    vatRate: 5,
  });

  return {
    rate,
    agentSplit,
    isCobroker,
    cobrokerAgency: isCobroker ? pick(COBROKER_AGENCIES) : null,
    cobrokerSplit,
    grossAmount: result.grossCommission,
    vatAmount: result.vatAmount,
    agentAmount: result.agentAmount,
    agencyAmount: result.agencyAmount,
  };
}

export function generateCompletedDeals(params: {
  agents: AgentRef[];
  wonLeadsByAgent: Map<string, LeadSeed[]>;
  endDate: Date;
}): DealSeed[] {
  const { agents, wonLeadsByAgent, endDate } = params;
  const deals: DealSeed[] = [];

  for (const agent of agents) {
    const wonLeads = wonLeadsByAgent.get(agent.agentId) ?? [];
    const typeWeights = DEAL_TYPE_WEIGHTS[agent.agentId];

    for (const lead of wonLeads) {
      const dealType = weightedPick(typeWeights);
      const community = lead.preferredCommunities[0] ?? pick(agent.communities);
      const transactionValue = transactionValueFor(dealType, community);
      const financials = buildFinancials(dealType, transactionValue, agent.tier);
      const durations = durationDaysFor(dealType);

      const listingDate = lead.createdAt;
      const viewingDate = addDays(listingDate, durations.viewing);
      const offerDate = addDays(listingDate, durations.offer);
      const agreedDate = addDays(listingDate, durations.agreed);
      let completionDate = addDays(listingDate, durations.completion);
      if (completionDate > endDate) completionDate = endDate;

      const commissionStatus = weightedPick(COMMISSION_STATUS_DISTRIBUTION);
      const paidDate =
        commissionStatus === "paid" || commissionStatus === "partially_paid"
          ? addDays(completionDate, randInt(3, 30))
          : null;
      const invoiceNumber =
        commissionStatus !== "pending" ? `INV-${randInt(10000, 99999)}` : null;

      const clientTypePool: DealSeed["clientType"][] =
        dealType === "rental" ? ["tenant", "landlord"] : ["buyer", "seller"];

      deals.push({
        dealId: nextDealId(),
        type: dealType,
        property: randomProperty(dealType, community),
        transactionValue,
        commission: {
          rate: financials.rate,
          grossAmount: financials.grossAmount,
          vatAmount: financials.vatAmount,
          agentSplit: financials.agentSplit,
          agentAmount: financials.agentAmount,
          agencyAmount: financials.agencyAmount,
          status: commissionStatus,
          paidDate,
          invoiceNumber,
        },
        agentId: agent._id,
        leadId: null, // filled in by seed.ts after lead insertion
        clientName: lead.name,
        clientNationality: lead.nationality,
        clientType: pick(clientTypePool),
        stage: "completed",
        listingDate,
        viewingDate,
        offerDate,
        agreedDate,
        completionDate,
        daysToClose: durations.completion,
        isCobroker: financials.isCobroker,
        cobrokerAgency: financials.cobrokerAgency,
        cobrokerSplit: financials.cobrokerSplit,
        notes: "",
        stageEnteredAt: completionDate,
        createdAt: listingDate,
        updatedAt: completionDate,
        _sourceLeadId: lead.leadId,
      });
    }
  }

  return deals;
}

export function generatePipelineDeals(params: {
  agents: AgentRef[];
  pipelineCountsByAgent: Record<string, number>;
  activeLeadsByAgent: Map<string, LeadSeed[]>;
  now: Date;
}): DealSeed[] {
  const { agents, pipelineCountsByAgent, activeLeadsByAgent, now } = params;

  // Build a flat, shuffled stage list matching the global target distribution.
  const stagePool: string[] = [];
  for (const target of PIPELINE_STAGE_TARGETS) {
    for (let i = 0; i < target.count; i++) stagePool.push(target.stage);
  }
  for (let i = stagePool.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [stagePool[i], stagePool[j]] = [stagePool[j], stagePool[i]];
  }

  const deals: DealSeed[] = [];
  let stageIdx = 0;

  for (const agent of agents) {
    const count = pipelineCountsByAgent[agent.agentId] ?? 0;
    const typeWeights = DEAL_TYPE_WEIGHTS[agent.agentId];
    const candidateLeads = [...(activeLeadsByAgent.get(agent.agentId) ?? [])];

    for (let i = 0; i < count; i++) {
      const stage = stagePool[stageIdx % stagePool.length];
      stageIdx += 1;

      const lead = candidateLeads.length > 0 ? candidateLeads.pop() : undefined;
      const dealType = weightedPick(typeWeights);
      const community = lead?.preferredCommunities[0] ?? pick(agent.communities);
      const transactionValue = transactionValueFor(dealType, community);
      const financials = buildFinancials(dealType, transactionValue, agent.tier);

      const daysInStage = Math.random() < 0.18 ? randInt(15, 35) : randInt(1, 13);
      const stageEnteredAt = addDays(now, -daysInStage);
      const createdAt = addDays(stageEnteredAt, -randInt(5, 30));

      const clientTypePool: DealSeed["clientType"][] =
        dealType === "rental" ? ["tenant", "landlord"] : ["buyer", "seller"];

      deals.push({
        dealId: nextDealId(),
        type: dealType,
        property: randomProperty(dealType, community),
        transactionValue,
        commission: {
          rate: financials.rate,
          grossAmount: financials.grossAmount,
          vatAmount: financials.vatAmount,
          agentSplit: financials.agentSplit,
          agentAmount: financials.agentAmount,
          agencyAmount: financials.agencyAmount,
          status: "pending",
          paidDate: null,
          invoiceNumber: null,
        },
        agentId: agent._id,
        leadId: null,
        clientName: lead?.name ?? `${pick(["Alex", "Sam", "Maria", "Karim", "Tariq"])} ${pick(["Reddy", "Novak", "Al Balushi", "Chen"])}`,
        clientNationality: lead?.nationality ?? "Indian",
        clientType: pick(clientTypePool),
        stage,
        listingDate: createdAt,
        viewingDate: ["viewing", "offer", "negotiation", "agreed", "documentation", "transfer"].includes(stage)
          ? addDays(createdAt, 3)
          : null,
        offerDate: ["offer", "negotiation", "agreed", "documentation", "transfer"].includes(stage)
          ? addDays(createdAt, 10)
          : null,
        agreedDate: ["agreed", "documentation", "transfer"].includes(stage)
          ? addDays(createdAt, 15)
          : null,
        completionDate: null,
        daysToClose: null,
        isCobroker: financials.isCobroker,
        cobrokerAgency: financials.cobrokerAgency,
        cobrokerSplit: financials.cobrokerSplit,
        notes: "",
        stageEnteredAt,
        createdAt,
        updatedAt: stageEnteredAt,
        _sourceLeadId: lead?.leadId,
      });
    }
  }

  return deals;
}
