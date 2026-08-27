// Shared TypeScript types for PropPulse

export type UserRole = "owner" | "manager" | "viewer";

export type Specialization =
  | "sales"
  | "rentals"
  | "off-plan"
  | "commercial"
  | "mixed";

export type LeadSource =
  | "bayut"
  | "property_finder"
  | "dubizzle"
  | "website"
  | "walk_in"
  | "referral"
  | "social_media"
  | "cold_call";

export type InquiryType = "buy" | "rent" | "off_plan";

export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "penthouse"
  | "office"
  | "retail"
  | "land";

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "viewing_scheduled"
  | "viewing_done"
  | "offer_made"
  | "negotiating"
  | "won"
  | "lost"
  | "dead";

export type LostReason =
  | "budget_mismatch"
  | "not_ready"
  | "chose_competitor"
  | "unresponsive"
  | "left_dubai"
  | "no_requirement";

export type DealType = "sale" | "rental" | "off_plan";

export type CommissionStatus = "pending" | "invoiced" | "partially_paid" | "paid";

export type ClientType = "buyer" | "seller" | "tenant" | "landlord";

export type DealStage =
  | "prospect"
  | "viewing"
  | "offer"
  | "negotiation"
  | "agreed"
  | "documentation"
  | "transfer"
  | "completed"
  | "fallen_through";

export type InsightType =
  | "agent"
  | "lead"
  | "commission"
  | "community"
  | "pipeline"
  | "general";

export type InsightSeverity = "info" | "warning" | "critical" | "opportunity";

export interface AgentTargets {
  monthlyDeals: number;
  monthlyRevenue: number;
  leadResponseMinutes: number;
}

export interface DealProperty {
  type: PropertyType;
  community: string;
  building: string;
  unitNumber: string;
  bedrooms: number;
  sqft: number;
  developer: string | null;
}

export interface DealCommission {
  rate: number;
  grossAmount: number;
  vatAmount: number;
  agentSplit: number;
  agentAmount: number;
  agencyAmount: number;
  status: CommissionStatus;
  paidDate: string | null;
  invoiceNumber: string | null;
}
