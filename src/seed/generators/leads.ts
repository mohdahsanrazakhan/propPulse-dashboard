import mongoose from "mongoose";
import communities from "../data/communities.json";
import { weightsFor } from "./property-types-data";
import { AGENT_PERFORMANCE } from "./agents";
import {
  addMinutes,
  pad,
  pick,
  randFloat,
  randInt,
  randomDateBetween,
  shuffle,
  weightedPick,
  Weighted,
} from "./utils";

const SOURCE_DISTRIBUTION: Weighted<string>[] = [
  { item: "bayut", weight: 30 },
  { item: "property_finder", weight: 25 },
  { item: "dubizzle", weight: 15 },
  { item: "website", weight: 10 },
  { item: "referral", weight: 10 },
  { item: "walk_in", weight: 5 },
  { item: "social_media", weight: 3 },
  { item: "cold_call", weight: 2 },
];

// Conversion quality score used to skew which leads become won/lost/dead.
const SOURCE_QUALITY: Record<string, number> = {
  referral: 35,
  walk_in: 28,
  property_finder: 18,
  bayut: 15,
  website: 12,
  dubizzle: 8,
  social_media: 6,
  cold_call: 3,
};

const INQUIRY_DISTRIBUTION: Weighted<"buy" | "rent" | "off_plan">[] = [
  { item: "buy", weight: 35 },
  { item: "rent", weight: 40 },
  { item: "off_plan", weight: 25 },
];

const LOST_REASON_DISTRIBUTION: Weighted<string>[] = [
  { item: "budget_mismatch", weight: 30 },
  { item: "not_ready", weight: 25 },
  { item: "chose_competitor", weight: 20 },
  { item: "unresponsive", weight: 15 },
  { item: "left_dubai", weight: 5 },
  { item: "no_requirement", weight: 5 },
];

const FIRST_NAMES = [
  "Mohammed", "Aisha", "James", "Olga", "Wei", "Fatima", "Raj", "Emma",
  "Ali", "Sophia", "Vikram", "Layla", "Chen", "Noor", "Ivan", "Mariam",
  "David", "Zainab", "Anastasia", "Hassan", "Priyanka", "Omar", "Elena", "Yusuf",
];
const LAST_NAMES = [
  "Khan", "Petrov", "Smith", "Al Farsi", "Sharma", "Zhang", "Ibrahim", "Novak",
  "Reddy", "Al Suwaidi", "Volkov", "Nair", "Hussain", "Popov", "Menon", "Saeed",
];

const NATIONALITIES: Weighted<string>[] = [
  { item: "Indian", weight: 20 },
  { item: "British", weight: 12 },
  { item: "Pakistani", weight: 8 },
  { item: "Russian", weight: 10 },
  { item: "Chinese", weight: 8 },
  { item: "Emirati", weight: 7 },
  { item: "Egyptian", weight: 8 },
  { item: "Jordanian", weight: 7 },
  { item: "French", weight: 5 },
  { item: "German", weight: 5 },
  { item: "Filipino", weight: 10 },
];

export interface LeadSeed {
  leadId: string;
  source: string;
  sourceDetail: string;
  name: string;
  email: string;
  phone: string;
  nationality: string;
  inquiryType: "buy" | "rent" | "off_plan";
  propertyType: string;
  budgetMin: number;
  budgetMax: number;
  preferredCommunities: string[];
  bedrooms: number | null;
  isPreApproved: boolean;
  assignedAgentId: mongoose.Types.ObjectId;
  assignedAgentCode: string; // internal use for deal generation, stripped before insert if needed
  assignedAt: Date;
  status: string;
  firstResponseAt: Date | null;
  responseTimeMinutes: number | null;
  convertedToDealId: mongoose.Types.ObjectId | null;
  lostReason: string | null;
  lastActivityAt: Date;
  touchpoints: number;
  viewingsCount: number;
  createdAt: Date;
  updatedAt: Date;
  qualityScore: number; // internal, used by deals.ts to correlate agent quality
}

interface AgentRef {
  _id: mongoose.Types.ObjectId;
  agentId: string;
  communities: string[];
  joinDate: Date;
}

// Q1 & Q4 strong, Ramadan (modeled as month index for Feb-Mar) dip, summer dip,
// slight month-over-month growth trend.
function monthWeight(date: Date, startDate: Date): number {
  const month = date.getMonth(); // 0-11
  let weight = 1.0;

  if (month === 0 || month === 1 || month === 9 || month === 10 || month === 11) {
    weight *= 1.15; // Q1 / Q4 strongest
  }
  if (month === 1 || month === 2) {
    weight *= 0.75; // Ramadan-ish dip (Feb/Mar window)
  }
  if (month === 6 || month === 7) {
    weight *= 0.8; // summer dip
  }

  const monthsSinceStart =
    (date.getFullYear() - startDate.getFullYear()) * 12 + (date.getMonth() - startDate.getMonth());
  weight *= 1 + monthsSinceStart * 0.008; // slight upward trend

  // Weekend leads (Fri-Sat in the UAE) are ~40% fewer
  const day = date.getDay(); // 0=Sun..6=Sat, Fri=5, Sat=6
  if (day === 5 || day === 6) {
    weight *= 0.6;
  }

  return weight;
}

function weightedDateInRange(start: Date, end: Date): Date {
  // Rejection-sample a handful of candidates and pick the highest-weighted one;
  // cheap way to bias toward higher-weight periods without building a full CDF.
  let best = randomDateBetween(start, end);
  let bestWeight = monthWeight(best, start);
  for (let i = 0; i < 4; i++) {
    const candidate = randomDateBetween(start, end);
    const w = monthWeight(candidate, start);
    if (w > bestWeight) {
      best = candidate;
      bestWeight = w;
    }
  }
  return best;
}

function communityForAgent(agentCommunities: string[]) {
  // 80% chance the lead is in one of the agent's focus communities, else any community.
  if (Math.random() < 0.8 && agentCommunities.length > 0) {
    return pick(agentCommunities);
  }
  return pick(communities).name;
}

function propertyTypeFor(inquiry: "buy" | "rent" | "off_plan") {
  const key = inquiry === "buy" ? "sale" : inquiry === "rent" ? "rental" : "off_plan";
  const weights = weightsFor(key);
  return weightedPick(weights.map((w) => ({ item: w.type, weight: w.weight })));
}

let leadCounter = 0;
function nextLeadId() {
  leadCounter += 1;
  return `LD-${pad(leadCounter, 5)}`;
}

export function generateLeadShellsForAgent(
  agent: AgentRef,
  count: number,
  startDate: Date,
  endDate: Date
): LeadSeed[] {
  const activeStart = agent.joinDate > startDate ? agent.joinDate : startDate;
  const communityRecord = new Map(communities.map((c) => [c.name, c]));

  const shells: LeadSeed[] = [];
  for (let i = 0; i < count; i++) {
    const source = weightedPick(SOURCE_DISTRIBUTION);
    const inquiryType = weightedPick(INQUIRY_DISTRIBUTION);
    const community = communityForAgent(agent.communities);
    const communityData = communityRecord.get(community);
    const propertyType = propertyTypeFor(inquiryType);

    const baseline =
      inquiryType === "rent"
        ? communityData?.avgRent ?? 60000
        : communityData?.avgSalePrice ?? 1200000;
    const budgetMin = Math.round(baseline * randFloat(0.7, 0.95));
    const budgetMax = Math.round(baseline * randFloat(1.05, 1.4));

    const createdAt = weightedDateInRange(activeStart, endDate);
    const nationality = weightedPick(NATIONALITIES);
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    const qualityScore = SOURCE_QUALITY[source] * randFloat(0.6, 1.4);

    shells.push({
      leadId: nextLeadId(),
      source,
      sourceDetail:
        source === "bayut" || source === "property_finder" || source === "dubizzle"
          ? `${source} listing #${randInt(10000, 99999)}`
          : "",
      name,
      email: `${firstName}.${lastName}${randInt(1, 999)}@example.com`.toLowerCase(),
      phone: `+971 5${randInt(0, 9)} ${randInt(1000000, 9999999)}`,
      nationality,
      inquiryType,
      propertyType,
      budgetMin,
      budgetMax,
      preferredCommunities: [community],
      bedrooms: propertyType === "land" || propertyType === "office" || propertyType === "retail" ? null : randInt(0, 5),
      isPreApproved: inquiryType === "buy" ? Math.random() < 0.4 : false,
      assignedAgentId: agent._id,
      assignedAgentCode: agent.agentId,
      assignedAt: createdAt,
      status: "new", // finalized in assignStatuses()
      firstResponseAt: null,
      responseTimeMinutes: null,
      convertedToDealId: null,
      lostReason: null,
      lastActivityAt: createdAt,
      touchpoints: 0,
      viewingsCount: 0,
      createdAt,
      updatedAt: createdAt,
      qualityScore,
    });
  }
  return shells;
}

export const ACTIVE_SUBSTATUSES = ["viewing_scheduled", "viewing_done", "offer_made", "negotiating"];

export function assignStatuses(
  allLeads: LeadSeed[],
  agentAvgResponse: Map<string, number>,
  endDate: Date
): LeadSeed[] {
  // Group by agent, take the top-quality leads per agent as "won" up to
  // that agent's completed-deal count.
  const byAgent = new Map<string, LeadSeed[]>();
  for (const lead of allLeads) {
    const arr = byAgent.get(lead.assignedAgentCode) ?? [];
    arr.push(lead);
    byAgent.set(lead.assignedAgentCode, arr);
  }

  const won: LeadSeed[] = [];
  const remainderPool: LeadSeed[] = [];

  for (const [agentCode, leads] of byAgent.entries()) {
    const target = AGENT_PERFORMANCE[agentCode]?.completedDeals ?? 0;
    const sorted = [...leads].sort((a, b) => b.qualityScore - a.qualityScore);
    const wonForAgent = sorted.slice(0, target);
    const restForAgent = sorted.slice(target);
    won.push(...wonForAgent);
    remainderPool.push(...restForAgent);
  }

  won.forEach((l) => {
    l.status = "won";
  });

  const ascByQuality = [...remainderPool].sort((a, b) => a.qualityScore - b.qualityScore);
  const deadCount = Math.min(472, ascByQuality.length);
  const deadLeads = ascByQuality.slice(0, deadCount);
  deadLeads.forEach((l) => {
    l.status = "dead";
    l.lostReason = "unresponsive";
  });

  const afterDead = ascByQuality.slice(deadCount);
  const lostCount = Math.min(840, afterDead.length);
  const lostLeads = afterDead.slice(0, lostCount);
  lostLeads.forEach((l) => {
    l.status = "lost";
    l.lostReason = weightedPick(LOST_REASON_DISTRIBUTION);
  });

  const rest = shuffle(afterDead.slice(lostCount));
  const activeCount = Math.min(288, rest.length);
  const activeLeads = rest.slice(0, activeCount);
  activeLeads.forEach((l) => {
    l.status = pick(ACTIVE_SUBSTATUSES);
  });

  const afterActive = rest.slice(activeCount);
  const qualifiedCount = Math.min(168, afterActive.length);
  afterActive.slice(0, qualifiedCount).forEach((l) => {
    l.status = "qualified";
  });

  const afterQualified = afterActive.slice(qualifiedCount);
  const contactedCount = Math.min(192, afterQualified.length);
  afterQualified.slice(0, contactedCount).forEach((l) => {
    l.status = "contacted";
  });

  afterQualified.slice(contactedCount).forEach((l) => {
    l.status = "new";
  });

  // Response time + touchpoints, based on agent speed and status.
  for (const lead of allLeads) {
    if (lead.status === "new") {
      lead.firstResponseAt = null;
      lead.responseTimeMinutes = null;
      lead.touchpoints = 0;
      lead.viewingsCount = 0;
      continue;
    }
    const avg = agentAvgResponse.get(lead.assignedAgentCode) ?? 20;
    const responseMinutes = Math.max(1, Math.round(avg * randFloat(0.4, 1.8)));
    lead.responseTimeMinutes = responseMinutes;
    lead.firstResponseAt = addMinutes(lead.createdAt, responseMinutes);

    if (lead.status === "won") {
      lead.touchpoints = randInt(5, 14);
      lead.viewingsCount = randInt(1, 4);
    } else if (["negotiating", "offer_made", "viewing_done"].includes(lead.status)) {
      lead.touchpoints = randInt(4, 10);
      lead.viewingsCount = randInt(1, 3);
    } else if (lead.status === "viewing_scheduled") {
      lead.touchpoints = randInt(3, 6);
      lead.viewingsCount = 1;
    } else if (lead.status === "qualified") {
      lead.touchpoints = randInt(2, 5);
      lead.viewingsCount = 0;
    } else if (lead.status === "lost" || lead.status === "dead") {
      lead.touchpoints = randInt(1, 4);
      lead.viewingsCount = randInt(0, 1);
    } else {
      lead.touchpoints = randInt(1, 3);
      lead.viewingsCount = 0;
    }

    const lastActivityOffsetDays = randInt(0, 20);
    const candidate = new Date(lead.firstResponseAt.getTime() + lastActivityOffsetDays * 86_400_000);
    lead.lastActivityAt = candidate > endDate ? endDate : candidate;
  }

  return allLeads;
}

export function generateLeads(params: {
  agents: AgentRef[];
  startDate: Date;
  endDate: Date;
}): LeadSeed[] {
  const { agents, startDate, endDate } = params;
  const allLeads: LeadSeed[] = [];
  const agentAvgResponse = new Map<string, number>();

  for (const agent of agents) {
    const perf = AGENT_PERFORMANCE[agent.agentId];
    agentAvgResponse.set(agent.agentId, perf.avgResponseMinutes);
    const shells = generateLeadShellsForAgent(agent, perf.leadsAssigned, startDate, endDate);
    allLeads.push(...shells);
  }

  return assignStatuses(allLeads, agentAvgResponse, endDate);
}
