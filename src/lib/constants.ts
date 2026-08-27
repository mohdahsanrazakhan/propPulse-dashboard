// Shared constants for PropPulse

export const CURRENCY = "AED";

export const VAT_RATE = 5; // % UAE standard VAT

export const DEFAULT_COMMISSION_RATES = {
  sale: 2,
  rental: 5,
  off_plan: 5, // varies 3-7%, default mid-point for calculator
};

export const LEAD_SOURCES = [
  "bayut",
  "property_finder",
  "dubizzle",
  "website",
  "walk_in",
  "referral",
  "social_media",
  "cold_call",
] as const;

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  bayut: "Bayut",
  property_finder: "Property Finder",
  dubizzle: "Dubizzle",
  website: "Website/SEO",
  walk_in: "Walk-in",
  referral: "Referral",
  social_media: "Social Media",
  cold_call: "Cold Call",
};

export const DEAL_STAGES = [
  "prospect",
  "viewing",
  "offer",
  "negotiation",
  "agreed",
  "documentation",
  "transfer",
  "completed",
  "fallen_through",
] as const;

export const DEAL_STAGE_LABELS: Record<string, string> = {
  prospect: "Prospect",
  viewing: "Viewing",
  offer: "Offer",
  negotiation: "Negotiation",
  agreed: "Agreed",
  documentation: "Documentation",
  transfer: "Transfer",
  completed: "Completed",
  fallen_through: "Fallen Through",
};

export const DEAL_TYPE_COLORS: Record<string, string> = {
  sale: "#3B82F6",
  rental: "#10B981",
  off_plan: "#8B5CF6",
};

export const DEAL_TYPE_LABELS: Record<string, string> = {
  sale: "Sale",
  rental: "Rental",
  off_plan: "Off-Plan",
};

export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_MAX_ATTEMPTS = 5;

export const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // 24 hours

export const DEMO_CREDENTIALS = {
  email: "demo@proppulse.com",
  password: "PropPulse@2026!",
};
