import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Agent from "@/models/Agent";
import Lead from "@/models/Lead";
import Deal from "@/models/Deal";
import Property from "@/models/Property";
import Insight from "@/models/Insight";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import agentNamesData from "./data/agent-names.json";
import { generateAgents } from "./generators/agents";
import { generateLeads, ACTIVE_SUBSTATUSES, LeadSeed } from "./generators/leads";
import { generateCompletedDeals, generatePipelineDeals } from "./generators/deals";
import { generateProperties } from "./generators/properties";

const PIPELINE_TARGETS: Record<string, number> = {
  "AG-001": 19,
  "AG-002": 12,
  "AG-003": 25,
  "AG-004": 8,
  "AG-005": 7,
  "AG-006": 8,
  "AG-007": 4,
  "AG-008": 2,
};

const INSIGHTS: {
  type: "agent" | "lead" | "commission" | "community" | "pipeline" | "general";
  severity: "info" | "warning" | "critical" | "opportunity";
  title: string;
  description: string;
  metric: string;
  recommendation: string;
}[] = [
  {
    type: "agent",
    severity: "opportunity",
    title: "Ahmed Converts 85% of Downtown Leads",
    description: "Assign more Downtown leads to Ahmed. His conversion is 3x the agency average for this community.",
    metric: "85% conversion",
    recommendation: "Route new Downtown Dubai leads to Ahmed Al Mansouri first.",
  },
  {
    type: "lead",
    severity: "critical",
    title: "12 Leads Uncontacted for 24+ Hours",
    description: "Omar has 7 uncontacted leads. Average response time is 45 minutes, 3x the agency target.",
    metric: "12 leads, 24h+",
    recommendation: "Escalate uncontacted leads to a manager and coach Omar on response speed.",
  },
  {
    type: "lead",
    severity: "opportunity",
    title: "Property Finder Leads Convert 18% vs Dubizzle 8%",
    description: "Consider reallocating 30% of Dubizzle budget to Property Finder for better ROI.",
    metric: "18% vs 8%",
    recommendation: "Shift 30% of monthly Dubizzle spend to Property Finder.",
  },
  {
    type: "pipeline",
    severity: "warning",
    title: "3 Deals Stuck in Documentation 20+ Days",
    description: "Several deals are past the average documentation time. Follow up on NOC/DLD status.",
    metric: "20+ days",
    recommendation: "Follow up with the conveyancer on stalled documentation deals this week.",
  },
  {
    type: "lead",
    severity: "info",
    title: "Referral Leads Are Your Best Source",
    description: "35% conversion rate, zero acquisition cost. Implement a referral bonus program.",
    metric: "35% conversion",
    recommendation: "Launch a referral bonus program for past clients and agents.",
  },
  {
    type: "agent",
    severity: "critical",
    title: "Omar Below Target for 3 Consecutive Months",
    description: "1-2 deals/month vs target of 4. Consider mentoring, reassignment, or performance review.",
    metric: "1-2 deals/mo vs target 4",
    recommendation: "Schedule a 1:1 performance review with Omar and pair him with a mentor.",
  },
  {
    type: "community",
    severity: "opportunity",
    title: "Dubai Hills Deals Up 40% This Quarter",
    description: "Assign a dedicated agent to Dubai Hills. Currently split across 3 agents.",
    metric: "+40% QoQ",
    recommendation: "Designate a lead agent for Dubai Hills to consolidate momentum.",
  },
  {
    type: "commission",
    severity: "warning",
    title: "AED 180,000 Commission Overdue 30+ Days",
    description: "4 invoices past payment terms. Escalate collection on overdue deals.",
    metric: "AED 180,000 overdue",
    recommendation: "Escalate collection calls on invoices overdue 30+ days.",
  },
  {
    type: "community",
    severity: "info",
    title: "Russian/CIS Clients Have 2x Higher Avg Deal Value",
    description: "Dmitry's Russian-speaking advantage brings AED 5M+ deals. Consider marketing in Russian forums.",
    metric: "2x avg deal value",
    recommendation: "Invest in Russian-language marketing for luxury listings.",
  },
  {
    type: "community",
    severity: "warning",
    title: "Rental Market Softening in Sports City",
    description: "Avg rent dropped 8% over 3 months. Adjust pricing expectations with landlord clients.",
    metric: "-8% avg rent",
    recommendation: "Reset landlord pricing expectations for Sports City listings.",
  },
  {
    type: "lead",
    severity: "opportunity",
    title: "Weekend Leads Convert 15% Higher",
    description: "Leads from Fri-Sat have better quality. Ensure agents respond on weekends.",
    metric: "+15% conversion",
    recommendation: "Set up a weekend response rotation among agents.",
  },
  {
    type: "commission",
    severity: "info",
    title: "Off-Plan Commissions Are 2.5x Higher Per Deal",
    description: "Avg off-plan commission AED 78K vs AED 31K for resale. Consider shifting focus.",
    metric: "AED 78K vs 31K",
    recommendation: "Prioritize off-plan developer partnerships for higher-margin deals.",
  },
  {
    type: "lead",
    severity: "critical",
    title: "Lead Response Time Worsening",
    description: "Agency avg response went from 12 min to 22 min over 3 months. This costs deals.",
    metric: "12min -> 22min",
    recommendation: "Set a hard 15-minute response SLA and alert agents automatically.",
  },
  {
    type: "agent",
    severity: "opportunity",
    title: "Li Wei Ramping Up Well",
    description: "3 deals last month (up from 1). Strong performance for a 4-month agent. Consider bonus.",
    metric: "3 deals last month",
    recommendation: "Recognize Li Wei's ramp-up with a small performance bonus.",
  },
  {
    type: "general",
    severity: "info",
    title: "Q4 Is Your Best Quarter Historically",
    description: "42% more deals in Oct-Dec. Prepare marketing campaigns and portal budgets for Q4 push.",
    metric: "+42% in Q4",
    recommendation: "Increase Q4 portal ad spend ahead of the seasonal peak.",
  },
];

export async function runSeed() {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Agent.deleteMany({}),
    Lead.deleteMany({}),
    Deal.deleteMany({}),
    Property.deleteMany({}),
    Insight.deleteMany({}),
  ]);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setFullYear(startDate.getFullYear() - 1);

  console.log("Creating demo user...");
  const passwordHash = await bcrypt.hash(DEMO_CREDENTIALS.password, 12);
  await User.create({
    name: "Khalid Al Marri",
    email: DEMO_CREDENTIALS.email,
    passwordHash,
    company: "Desert View Properties LLC",
    reraBrn: "12345",
    role: "owner",
  });

  console.log("Creating agents...");
  const agentSeeds = generateAgents(now);
  const agentDocs = await Agent.insertMany(agentSeeds);

  const tierByAgentId = new Map(agentNamesData.map((a) => [a.agentId, a.tier as "senior" | "mid" | "junior"]));
  const agentRefs = agentDocs.map((doc) => ({
    _id: doc._id,
    agentId: doc.agentId,
    name: doc.name,
    tier: tierByAgentId.get(doc.agentId) ?? "mid",
    communities: doc.communities,
    joinDate: doc.joinDate,
  }));

  console.log("Generating leads...");
  const leadSeeds = generateLeads({ agents: agentRefs, startDate, endDate: now });

  console.log(`Inserting ${leadSeeds.length} leads...`);
  const leadInsertDocs = leadSeeds.map((l) => ({
    leadId: l.leadId,
    source: l.source,
    sourceDetail: l.sourceDetail,
    name: l.name,
    email: l.email,
    phone: l.phone,
    nationality: l.nationality,
    inquiryType: l.inquiryType,
    propertyType: l.propertyType,
    budgetMin: l.budgetMin,
    budgetMax: l.budgetMax,
    preferredCommunities: l.preferredCommunities,
    bedrooms: l.bedrooms,
    isPreApproved: l.isPreApproved,
    assignedAgentId: l.assignedAgentId,
    assignedAt: l.assignedAt,
    status: l.status,
    firstResponseAt: l.firstResponseAt,
    responseTimeMinutes: l.responseTimeMinutes,
    convertedToDealId: null,
    lostReason: l.lostReason,
    lastActivityAt: l.lastActivityAt,
    touchpoints: l.touchpoints,
    viewingsCount: l.viewingsCount,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  }));
  const leadDocs = await Lead.insertMany(leadInsertDocs);
  const leadIdToDoc = new Map(leadDocs.map((d) => [d.leadId, d]));

  const wonLeadsByAgent = new Map<string, LeadSeed[]>();
  const activeLeadsByAgent = new Map<string, LeadSeed[]>();
  for (const lead of leadSeeds) {
    if (lead.status === "won") {
      const arr = wonLeadsByAgent.get(lead.assignedAgentCode) ?? [];
      arr.push(lead);
      wonLeadsByAgent.set(lead.assignedAgentCode, arr);
    } else if (ACTIVE_SUBSTATUSES.includes(lead.status)) {
      const arr = activeLeadsByAgent.get(lead.assignedAgentCode) ?? [];
      arr.push(lead);
      activeLeadsByAgent.set(lead.assignedAgentCode, arr);
    }
  }

  console.log("Generating deals...");
  const completedDeals = generateCompletedDeals({ agents: agentRefs, wonLeadsByAgent, endDate: now });
  const pipelineDeals = generatePipelineDeals({
    agents: agentRefs,
    pipelineCountsByAgent: PIPELINE_TARGETS,
    activeLeadsByAgent,
    now,
  });
  const allDeals = [...completedDeals, ...pipelineDeals];

  const dealInsertDocs = allDeals.map((d) => ({
    dealId: d.dealId,
    type: d.type,
    property: d.property,
    transactionValue: d.transactionValue,
    commission: d.commission,
    agentId: d.agentId,
    leadId: d._sourceLeadId ? leadIdToDoc.get(d._sourceLeadId)?._id ?? null : null,
    clientName: d.clientName,
    clientNationality: d.clientNationality,
    clientType: d.clientType,
    stage: d.stage,
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
    stageEnteredAt: d.stageEnteredAt,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));

  console.log(`Inserting ${dealInsertDocs.length} deals...`);
  const dealDocs = await Deal.insertMany(dealInsertDocs);

  console.log("Linking converted leads to deals...");
  const bulkLeadOps = [];
  for (let i = 0; i < allDeals.length; i++) {
    const source = allDeals[i]._sourceLeadId;
    if (!source) continue;
    const leadDoc = leadIdToDoc.get(source);
    if (!leadDoc) continue;
    bulkLeadOps.push({
      updateOne: {
        filter: { _id: leadDoc._id },
        update: { $set: { convertedToDealId: dealDocs[i]._id } },
      },
    });
  }
  if (bulkLeadOps.length > 0) {
    await Lead.bulkWrite(bulkLeadOps);
  }

  console.log("Generating active property listings...");
  const propertySeeds = generateProperties(agentRefs, now, 58);
  await Property.insertMany(propertySeeds);

  console.log("Seeding AI insights...");
  await Insight.insertMany(
    INSIGHTS.map((i, idx) => ({
      ...i,
      isRead: false,
      createdAt: new Date(now.getTime() - idx * 3600_000),
    }))
  );

  console.log("Seed complete.");
  console.log(`  Users: 1`);
  console.log(`  Agents: ${agentDocs.length}`);
  console.log(`  Leads: ${leadDocs.length}`);
  console.log(`  Deals: ${dealDocs.length} (${completedDeals.length} completed, ${pipelineDeals.length} pipeline)`);
  console.log(`  Properties: ${propertySeeds.length}`);
  console.log(`  Insights: ${INSIGHTS.length}`);

  return {
    users: 1,
    agents: agentDocs.length,
    leads: leadDocs.length,
    deals: dealDocs.length,
    properties: propertySeeds.length,
    insights: INSIGHTS.length,
  };
}

export async function disconnectAfterSeed() {
  await mongoose.connection.close();
}
