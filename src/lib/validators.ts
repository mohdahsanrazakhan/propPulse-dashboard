import { z } from "zod";

// Query param validators for API routes; all inputs are validated before
// being used to build MongoDB queries (never pass raw query params through).

export const dashboardQuerySchema = z.object({
  period: z.enum(["30d", "90d", "12m", "ytd"]).optional().default("12m"),
});

export const agentsQuerySchema = z.object({
  specialization: z
    .enum(["sales", "rentals", "off-plan", "commercial", "mixed", "all"])
    .optional()
    .default("all"),
  sortBy: z
    .enum(["commission", "deals", "conversion", "responseTime", "rating"])
    .optional()
    .default("commission"),
});

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const pipelineQuerySchema = z.object({
  dealType: z.enum(["all", "sale", "rental", "off_plan"]).optional().default("all"),
  agentId: z.string().optional(),
  community: z.string().optional(),
  minValue: z.coerce.number().optional(),
  maxValue: z.coerce.number().optional(),
  stage: z.string().optional(), // comma-separated list, parsed by caller
});

export const leadsQuerySchema = z.object({
  source: z.string().optional(),
  period: z.enum(["30d", "90d", "12m", "ytd"]).optional().default("12m"),
});

export const commissionQuerySchema = z.object({
  period: z.enum(["30d", "90d", "12m", "ytd"]).optional().default("12m"),
  agentId: z.string().optional(),
});

export const communitiesQuerySchema = z.object({
  sortBy: z.enum(["deals", "price", "rent", "days"]).optional().default("deals"),
});

export const insightsGenerateSchema = z.object({
  focus: z.enum(["agent", "lead", "commission", "community", "pipeline", "general"]).optional(),
});

export const commissionCalculatorSchema = z.object({
  dealType: z.enum(["sale", "rental", "off_plan"]),
  transactionValue: z.number().positive().max(1_000_000_000),
  commissionRate: z.number().min(0).max(100),
  agentSplitPercent: z.number().min(0).max(100),
  isCoBroker: z.boolean(),
  coBrokerSplitPercent: z.number().min(0).max(100),
});
